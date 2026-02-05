import { Platform } from 'react-native';
import { AnalysisResult } from '@/types/photo';

// Physical devices need the computer's LAN IP.
// Android emulator uses 10.0.2.2 to reach host localhost.
// iOS simulator and web can use localhost directly.
const LAN_IP = '192.168.0.33';

const BASE_URL = Platform.select({
  android: __DEV__ ? `http://${LAN_IP}:3000` : `http://${LAN_IP}:3000`,
  default: __DEV__ ? `http://${LAN_IP}:3000` : `http://${LAN_IP}:3000`,
});

export async function analyzePhoto(uri: string): Promise<AnalysisResult> {
  const formData = new FormData();

  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  if (Platform.OS === 'web') {
    // On web, fetch the image as a blob and append it properly
    const blob = await fetch(uri).then((r) => r.blob());
    formData.append('image', blob, filename);
  } else {
    // React Native specific FormData format
    formData.append('image', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);
  }

  // Don't set Content-Type manually — fetch will set it with the correct
  // multipart boundary when given a FormData body.
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed with status: ${response.status}`);
  }

  return (await response.json()) as AnalysisResult;
}
