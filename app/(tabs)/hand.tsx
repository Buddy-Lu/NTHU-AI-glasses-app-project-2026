import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { COLORS, FONT } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Self-contained HTML page that runs MediaPipe Hand Landmarker in the browser
// context of the WebView.
//
// CDN loads:
//   @mediapipe/tasks-vision  — the WASM-based inference library (~4 MB)
//   hand_landmarker.task     — the model file from Google Storage (~8 MB)
// Both are one-time downloads; inference runs fully on-device after that.
// ---------------------------------------------------------------------------
const HAND_TRACKER_HTML = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;background:#000;overflow:hidden}

    /* video + canvas scale together so landmarks stay aligned */
    #view{
      position:absolute;top:0;left:0;width:100%;height:100%;
      transform-origin:center center;
    }
    #video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
    #canvas{position:absolute;top:0;left:0}

    /* HUD elements sit outside #view so they are never scaled */
    #status{
      position:absolute;top:72px;left:12px;
      color:#00D4FF;font-family:monospace;font-size:13px;
      background:rgba(0,0,0,0.65);padding:5px 12px;border-radius:6px;
      border:1px solid rgba(0,212,255,0.3);z-index:10;
    }
    #zoom-controls{
      position:absolute;right:14px;top:50%;transform:translateY(-50%);
      display:flex;flex-direction:column;align-items:center;gap:8px;z-index:10;
    }
    .zoom-btn{
      width:40px;height:40px;border-radius:20px;
      background:rgba(0,0,0,0.65);border:1px solid rgba(0,212,255,0.4);
      color:#00D4FF;font-size:22px;line-height:40px;text-align:center;
      cursor:pointer;user-select:none;-webkit-user-select:none;
    }
    #zoom-label{
      color:#00D4FF;font-family:monospace;font-size:12px;
      background:rgba(0,0,0,0.55);padding:3px 6px;border-radius:4px;
    }
  </style>
</head><body>
<div id="view">
  <video id="video" playsinline autoplay muted></video>
  <canvas id="canvas"></canvas>
</div>
<div id="status">Loading model...</div>
<div id="zoom-controls">
  <div class="zoom-btn" id="btn-in">+</div>
  <div id="zoom-label">1.0x</div>
  <div class="zoom-btn" id="btn-out">−</div>
</div>
<script type="module">
import { HandLandmarker, FilesetResolver }
  from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs';

const video    = document.getElementById('video');
const canvas   = document.getElementById('canvas');
const statusEl = document.getElementById('status');
const ctx      = canvas.getContext('2d');

// 21-point hand skeleton connections
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

let landmarker   = null;
let lastTime     = -1;
let running      = false;

// ── Zoom ─────────────────────────────────────────────────────────────────────
const view      = document.getElementById('view');
const zoomLabel = document.getElementById('zoom-label');
let zoom = 1.0;
const ZOOM_MIN = 1.0, ZOOM_MAX = 4.0, ZOOM_STEP = 0.5;

function applyZoom() {
  view.style.transform = zoom === 1 ? '' : 'scale(' + zoom + ')';
  zoomLabel.textContent = zoom.toFixed(1) + 'x';
}
document.getElementById('btn-in').addEventListener('click', () => {
  zoom = Math.min(ZOOM_MAX, parseFloat((zoom + ZOOM_STEP).toFixed(1)));
  applyZoom();
});
document.getElementById('btn-out').addEventListener('click', () => {
  zoom = Math.max(ZOOM_MIN, parseFloat((zoom - ZOOM_STEP).toFixed(1)));
  applyZoom();
});

// ── Init ────────────────────────────────────────────────────────────────────
async function init() {
  try {
    statusEl.textContent = 'Loading model...';
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );

    // Try GPU first, fall back to CPU
    const makeOptions = (delegate) => ({
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate,
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence:  0.5,
      minTrackingConfidence:      0.5,
    });

    try {
      landmarker = await HandLandmarker.createFromOptions(vision, makeOptions('GPU'));
    } catch (_) {
      landmarker = await HandLandmarker.createFromOptions(vision, makeOptions('CPU'));
    }

    statusEl.textContent = 'Starting camera...';
    await startCamera();
  } catch (e) {
    statusEl.textContent = 'Error: ' + e.message;
  }
}

// ── Camera ──────────────────────────────────────────────────────────────────
async function startCamera() {
  const constraints = [
    { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: true, audio: false },
  ];
  for (const c of constraints) {
    try {
      video.srcObject = await navigator.mediaDevices.getUserMedia(c);
      await new Promise((res) => video.addEventListener('loadeddata', res, { once: true }));
      statusEl.textContent = 'No hands detected';
      running = true;
      requestAnimationFrame(detect);
      return;
    } catch (_) {}
  }
  statusEl.textContent = 'Camera unavailable';
}

// ── Object-fit:cover landmark mapping ───────────────────────────────────────
// Maps a normalised landmark [0,1] to actual canvas pixel coords,
// accounting for the video being rendered with object-fit:cover.
function toScreen(nx, ny) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const dw = canvas.width,     dh = canvas.height;
  if (!vw || !vh) return { x: nx * dw, y: ny * dh };
  const scale = Math.max(dw / vw, dh / vh);
  const ox = (dw - vw * scale) / 2;
  const oy = (dh - vh * scale) / 2;
  return { x: nx * vw * scale + ox, y: ny * vh * scale + oy };
}

// ── Draw skeleton ────────────────────────────────────────────────────────────
function drawHand(landmarks) {
  // Connections
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth   = 2;
  ctx.globalAlpha = 0.85;
  for (const [a, b] of CONNECTIONS) {
    const p1 = toScreen(landmarks[a].x, landmarks[a].y);
    const p2 = toScreen(landmarks[b].x, landmarks[b].y);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  // Dots
  ctx.globalAlpha = 1;
  for (let i = 0; i < landmarks.length; i++) {
    const { x, y } = toScreen(landmarks[i].x, landmarks[i].y);
    ctx.beginPath();
    ctx.arc(x, y, i === 0 ? 5 : 3, 0, 2 * Math.PI);
    ctx.fillStyle = i === 0 ? '#ffffff' : '#00D4FF';
    ctx.fill();
  }
}

// ── Detection loop ────────────────────────────────────────────────────────────
function detect() {
  if (!running) return;

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (video.currentTime !== lastTime && video.videoWidth) {
    lastTime = video.currentTime;
    const results = landmarker.detectForVideo(video, Date.now());

    if (results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach(drawHand);

      const names = (results.handednesses || []).map((h) => h[0]?.categoryName ?? '');
      statusEl.textContent = names.join(' & ') + (names.length > 1 ? ' hands' : ' hand');

      // Send landmark data to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'landmarks',
          count: results.landmarks.length,
          handedness: names,
        }));
      }
    } else {
      statusEl.textContent = 'No hands detected';
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'landmarks', count: 0, handedness: [] }));
      }
    }
  }

  requestAnimationFrame(detect);
}

init();
</script>
</body></html>`;

// ---------------------------------------------------------------------------
// React Native screen
// ---------------------------------------------------------------------------
type LandmarkMsg = { type: 'landmarks'; count: number; handedness: string[] };

export default function HandTrackerScreen() {
  const webViewRef = useRef<WebView>(null);
  const [handCount, setHandCount] = useState(0);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data: LandmarkMsg = JSON.parse(event.nativeEvent.data);
      if (data.type === 'landmarks') setHandCount(data.count);
    } catch (_) {}
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.unsupported}>
        <Text style={styles.unsupportedText}>Open on a mobile device to use Hand Tracker.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: HAND_TRACKER_HTML, baseUrl: 'http://localhost' }}
        style={styles.webview}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsFullscreenVideo
        mediaCapturePermissionGrantType="grant"
        onMessage={handleMessage}
      />

      {/* Thin RN badge showing live hand count */}
      {handCount > 0 && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>
            {handCount} {handCount === 1 ? 'hand' : 'hands'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  badge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  badgeText: {
    color: COLORS.accent,
    fontFamily: FONT.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  unsupported: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unsupportedText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.mono,
    fontSize: 14,
    textAlign: 'center',
  },
});
