import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { usePhotos } from '@/context/PhotoContext';
import { COLORS, FONT } from '@/lib/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BRACKET_SIZE = 28;
const BRACKET_THICKNESS = 2.5;
const VIEWFINDER_MARGIN = 0.15;

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [clock, setClock] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const { photos, addPhotoAndAnalyze } = usePhotos();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scanning line animation
  const scanY = useSharedValue(0);
  useEffect(() => {
    scanY.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      true,
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanY.value * 100}%` as any,
  }));

  // Pulsing status dot
  const dotOpacity = useSharedValue(1);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  // Permission: loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission: not granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="eye-outline" size={64} color={COLORS.accent} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            AI Vision needs camera access to scan and analyze your environment.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          addPhotoAndAnalyze(photo.uri);
          setCapturedImage(photo.uri);
          dismissTimer.current = setTimeout(() => setCapturedImage(null), 1800);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Brief auto-dismissing preview overlay
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: capturedImage }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={styles.previewOverlay}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.previewStatus}>
            <View style={styles.previewPulseRing}>
              <ActivityIndicator size="small" color={COLORS.accent} />
            </View>
            <Text style={styles.previewStatusText}>Saved & Analyzing...</Text>
            <Text style={styles.previewSubText}>Sending to AI Vision</Text>
          </Animated.View>
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.previewBottomGradient}
        >
          <TouchableOpacity
            style={styles.previewRetakeButton}
            onPress={() => {
              if (dismissTimer.current) clearTimeout(dismissTimer.current);
              setCapturedImage(null);
            }}
          >
            <Text style={styles.previewRetakeText}>Tap to dismiss</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Live camera with HUD
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Top gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.topGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.topBar}>
              <View style={styles.titleRow}>
                <Animated.View style={[styles.statusDot, dotStyle]} />
                <Text style={styles.appTitle}>AI VISION</Text>
              </View>
              <Text style={styles.clock}>{clock}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Viewfinder brackets */}
        <View style={styles.viewfinder}>
          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />

          {/* Scanning line */}
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <LinearGradient
              colors={['transparent', COLORS.accent, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLineGradient}
            />
          </Animated.View>
        </View>

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.bottomGradient}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={styles.bottomBar}>
              {/* Flip button */}
              <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse-outline" size={24} color={COLORS.accent} />
              </TouchableOpacity>

              {/* Capture button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                activeOpacity={0.7}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {/* Gallery preview */}
              <TouchableOpacity style={styles.sideButton}>
                {photos.length > 0 ? (
                  <Image source={{ uri: photos[0].uri }} style={styles.galleryThumb} />
                ) : (
                  <Ionicons name="grid-outline" size={22} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 14,
    fontFamily: FONT.mono,
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  permissionButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },

  // Camera
  camera: {
    flex: 1,
    width: '100%',
  },

  // Top overlay
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 20,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  appTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: FONT.mono,
  },
  clock: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONT.mono,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Viewfinder
  viewfinder: {
    position: 'absolute',
    top: SCREEN_H * VIEWFINDER_MARGIN,
    left: SCREEN_W * VIEWFINDER_MARGIN,
    right: SCREEN_W * VIEWFINDER_MARGIN,
    bottom: SCREEN_H * VIEWFINDER_MARGIN,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  },
  bracketTL: {
    top: 0,
    left: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.accent,
  },
  bracketTR: {
    top: 0,
    right: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.accent,
  },
  bracketBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.accent,
  },
  bracketBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.accent,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
  scanLineGradient: {
    flex: 1,
  },

  // Bottom overlay
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  galleryThumb: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  // Preview overlay
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewStatus: {
    alignItems: 'center',
  },
  previewPulseRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewStatusText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONT.mono,
    letterSpacing: 1,
  },
  previewSubText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    fontFamily: FONT.mono,
  },
  previewBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: 32,
    alignItems: 'center',
  },
  previewRetakeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  previewRetakeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONT.mono,
  },
});
