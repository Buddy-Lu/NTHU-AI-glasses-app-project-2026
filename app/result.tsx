import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePhotos } from '@/context/PhotoContext';
import { analyzePhoto } from '@/lib/api';
import { AnalysisResult } from '@/types/photo';
import { COLORS, FONT, RADIUS } from '@/lib/theme';

export default function ResultScreen() {
  const { photoIndex } = useLocalSearchParams<{ photoIndex: string }>();
  const { photos, updatePhotoAnalysis } = usePhotos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const index = Number(photoIndex);
  const photo = photos[index];

  const runAnalysis = async () => {
    if (!photo) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePhoto(photo.uri);
      updatePhotoAnalysis(index, result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (photo && !photo.analysisResult) {
      runAnalysis();
    }
  }, []);

  if (!photo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Photo not found.</Text>
      </View>
    );
  }

  const result: AnalysisResult | undefined = photo.analysisResult;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return COLORS.success;
    if (confidence >= 0.5) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo with gradient fade */}
      <View style={styles.photoWrapper}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        <LinearGradient
          colors={['transparent', COLORS.bg]}
          style={styles.photoGradient}
        />
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>ANALYZING...</Text>
          <Text style={styles.loadingSubText}>Processing with AI Vision</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={28} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {result && (
        <>
          {/* Scene Description */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.card}>
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={styles.cardAccentBar}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Scene Description</Text>
                <Text style={styles.description}>{result.sceneDescription}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Detected Objects */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.card}>
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={styles.cardAccentBar}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Detected Objects</Text>
                {result.detectedObjects.map((obj, i) => (
                  <View key={i} style={styles.objectRow}>
                    <Text style={styles.objectLabel}>{obj.label}</Text>
                    <View style={styles.barBackground}>
                      <LinearGradient
                        colors={[getConfidenceColor(obj.confidence), COLORS.accentDim]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.barFill, { width: `${obj.confidence * 100}%` }]}
                      />
                    </View>
                    <Text style={styles.objectPercent}>
                      {Math.round(obj.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Analysis Stats */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.card}>
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={styles.cardAccentBar}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Analysis Stats</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {Math.round(result.overallConfidence * 100)}%
                    </Text>
                    <Text style={styles.statLabel}>Confidence</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{result.processingTimeMs}ms</Text>
                    <Text style={styles.statLabel}>Processing</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {result.detectedObjects.length}
                    </Text>
                    <Text style={styles.statLabel}>Objects</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Re-analyze button */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <TouchableOpacity
              onPress={runAnalysis}
              disabled={loading}
              style={styles.analyzeAgainWrapper}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeAgainButton}
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.analyzeAgainText}>Re-analyze</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Photo
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  // Loading
  loadingCard: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONT.mono,
    letterSpacing: 2,
    marginTop: 16,
  },
  loadingSubText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  // Error
  errorCard: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Cards
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardAccentBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  description: {
    color: '#e6e6e6',
    fontSize: 15,
    lineHeight: 22,
  },

  // Object rows
  objectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  objectLabel: {
    color: '#ddd',
    fontSize: 14,
    width: 100,
    textTransform: 'capitalize',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  objectPercent: {
    color: COLORS.textSecondary,
    fontSize: 13,
    width: 40,
    textAlign: 'right',
    fontFamily: FONT.mono,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    borderRadius: RADIUS.md,
    marginHorizontal: 4,
    backgroundColor: COLORS.bgElevated,
  },
  statValue: {
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONT.mono,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Re-analyze
  analyzeAgainWrapper: {
    margin: 16,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  analyzeAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.lg,
  },
  analyzeAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
