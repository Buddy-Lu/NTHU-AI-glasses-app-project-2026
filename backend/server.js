const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Pool of mock scenarios
const MOCK_SCENARIOS = [
  {
    detectedObjects: [
      { label: 'person', confidence: 0.95 },
      { label: 'laptop', confidence: 0.87 },
      { label: 'coffee cup', confidence: 0.72 },
      { label: 'desk', confidence: 0.68 },
    ],
    sceneDescription:
      'An indoor office environment with a person working at a desk. Natural lighting from a window on the left side. The scene suggests a productive workspace with modern equipment.',
    overallConfidence: 0.84,
  },
  {
    detectedObjects: [
      { label: 'tree', confidence: 0.97 },
      { label: 'sky', confidence: 0.94 },
      { label: 'grass', confidence: 0.91 },
      { label: 'bird', confidence: 0.63 },
    ],
    sceneDescription:
      'A lush outdoor park scene with tall trees and a clear blue sky. Green grass covers the foreground, and a small bird is perched on a branch. Pleasant daytime conditions.',
    overallConfidence: 0.88,
  },
  {
    detectedObjects: [
      { label: 'car', confidence: 0.93 },
      { label: 'traffic light', confidence: 0.89 },
      { label: 'building', confidence: 0.85 },
      { label: 'pedestrian', confidence: 0.74 },
      { label: 'street sign', confidence: 0.61 },
    ],
    sceneDescription:
      'A busy urban street with vehicles and pedestrians. Traffic lights are visible at an intersection. Multi-story buildings line both sides of the road. Typical city environment during the day.',
    overallConfidence: 0.81,
  },
  {
    detectedObjects: [
      { label: 'plate', confidence: 0.96 },
      { label: 'food', confidence: 0.92 },
      { label: 'glass', confidence: 0.88 },
      { label: 'table', confidence: 0.84 },
      { label: 'fork', confidence: 0.79 },
    ],
    sceneDescription:
      'A restaurant dining setup with a well-presented meal on a white plate. A glass of water and silverware are arranged neatly on the table. Warm indoor lighting creates an inviting atmosphere.',
    overallConfidence: 0.89,
  },
  {
    detectedObjects: [
      { label: 'sofa', confidence: 0.94 },
      { label: 'television', confidence: 0.91 },
      { label: 'bookshelf', confidence: 0.78 },
      { label: 'lamp', confidence: 0.73 },
    ],
    sceneDescription:
      'A cozy living room interior with a large sofa facing a wall-mounted television. A bookshelf filled with books stands in the corner, and a floor lamp provides soft ambient lighting.',
    overallConfidence: 0.85,
  },
  {
    detectedObjects: [
      { label: 'whiteboard', confidence: 0.93 },
      { label: 'person', confidence: 0.90 },
      { label: 'chair', confidence: 0.86 },
      { label: 'projector', confidence: 0.71 },
    ],
    sceneDescription:
      'A classroom or meeting room setting with a whiteboard at the front. Several chairs are arranged facing the board. A ceiling-mounted projector is visible. The environment suggests an educational or corporate context.',
    overallConfidence: 0.83,
  },
];

app.post('/api/analyze', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  console.log(`Received image: ${req.file.originalname} (${req.file.size} bytes)`);

  // Random delay between 500-2000ms to simulate processing
  const delay = Math.floor(Math.random() * 1500) + 500;

  setTimeout(() => {
    const scenario = MOCK_SCENARIOS[Math.floor(Math.random() * MOCK_SCENARIOS.length)];

    const result = {
      id: `analysis_${Date.now()}`,
      detectedObjects: scenario.detectedObjects,
      sceneDescription: scenario.sceneDescription,
      overallConfidence: scenario.overallConfidence,
      processingTimeMs: delay,
      analyzedAt: new Date().toISOString(),
    };

    console.log(`Analysis complete: ${result.id} (${delay}ms)`);
    res.json(result);
  }, delay);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AI Glasses dummy backend running on http://localhost:${PORT}`);
  console.log(`POST /api/analyze  - Send an image for analysis`);
  console.log(`GET  /health       - Health check`);
});
