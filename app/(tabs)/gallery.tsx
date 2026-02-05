import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhotos } from '@/context/PhotoContext';
import { COLORS, FONT } from '@/lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const GAP = 3;
const TILE_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function GalleryScreen() {
  const { photos } = usePhotos();
  const router = useRouter();

  const handlePhotoPress = (index: number) => {
    router.push({ pathname: '/result', params: { photoIndex: String(index) } });
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="scan-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>No Captures Yet</Text>
        <Text style={styles.emptySubtitle}>
          Use the scanner to capture your environment
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        numColumns={NUM_COLUMNS}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const isDone = item.analysisStatus === 'done';
          const isAnalyzing = item.analysisStatus === 'analyzing';
          const isError = item.analysisStatus === 'error';

          return (
            <TouchableOpacity
              style={[
                styles.tile,
                isDone && styles.tileDone,
              ]}
              onPress={() => handlePhotoPress(index)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />

              {/* Status badge */}
              {isAnalyzing && (
                <View style={styles.statusBadge}>
                  <ActivityIndicator size={14} color={COLORS.accent} />
                </View>
              )}
              {isDone && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                </View>
              )}
              {isError && (
                <View style={styles.statusBadge}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                </View>
              )}

              {/* Timestamp gradient bar */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.timestampBar}
              >
                <Text style={styles.timestampText}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    fontFamily: FONT.mono,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    padding: GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: GAP / 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tileDone: {
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
  },
  timestampBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: 3,
    paddingHorizontal: 4,
  },
  timestampText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: FONT.mono,
  },
});
