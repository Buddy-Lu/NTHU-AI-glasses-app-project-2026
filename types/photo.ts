export interface DetectedObject {
  label: string;
  confidence: number;
}

export interface AnalysisResult {
  id: string;
  detectedObjects: DetectedObject[];
  sceneDescription: string;
  overallConfidence: number;
  processingTimeMs: number;
  analyzedAt: string;
}

export type AnalysisStatus = 'pending' | 'analyzing' | 'done' | 'error';

export interface Photo {
  uri: string;
  timestamp: number;
  analysisResult?: AnalysisResult;
  analysisStatus?: AnalysisStatus;
  analysisError?: string;
}
