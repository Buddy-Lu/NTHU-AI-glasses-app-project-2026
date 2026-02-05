import React, { createContext, useContext, useState, useCallback } from 'react';
import { Photo, AnalysisResult, AnalysisStatus } from '@/types/photo';
import { analyzePhoto } from '@/lib/api';

interface PhotoContextValue {
  photos: Photo[];
  addPhoto: (uri: string) => void;
  addPhotoAndAnalyze: (uri: string) => void;
  updatePhotoAnalysis: (index: number, result: AnalysisResult) => void;
  updatePhotoStatus: (index: number, status: AnalysisStatus, error?: string) => void;
}

const PhotoContext = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const addPhoto = useCallback((uri: string) => {
    setPhotos((prev) => [
      { uri, timestamp: Date.now(), analysisStatus: 'pending' },
      ...prev,
    ]);
  }, []);

  const updatePhotoAnalysis = useCallback((index: number, result: AnalysisResult) => {
    setPhotos((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          analysisResult: result,
          analysisStatus: 'done',
          analysisError: undefined,
        };
      }
      return updated;
    });
  }, []);

  const updatePhotoStatus = useCallback(
    (index: number, status: AnalysisStatus, error?: string) => {
      setPhotos((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            analysisStatus: status,
            analysisError: error,
          };
        }
        return updated;
      });
    },
    [],
  );

  const addPhotoAndAnalyze = useCallback((uri: string) => {
    setPhotos((prev) => [
      { uri, timestamp: Date.now(), analysisStatus: 'analyzing' },
      ...prev,
    ]);

    (async () => {
      try {
        const result = await analyzePhoto(uri);
        setPhotos((prev) => {
          const idx = prev.findIndex((p) => p.uri === uri);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            analysisResult: result,
            analysisStatus: 'done',
            analysisError: undefined,
          };
          return updated;
        });
      } catch (err: any) {
        setPhotos((prev) => {
          const idx = prev.findIndex((p) => p.uri === uri);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            analysisStatus: 'error',
            analysisError: err.message || 'Analysis failed',
          };
          return updated;
        });
      }
    })();
  }, []);

  return (
    <PhotoContext.Provider
      value={{
        photos,
        addPhoto,
        addPhotoAndAnalyze,
        updatePhotoAnalysis,
        updatePhotoStatus,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
}
