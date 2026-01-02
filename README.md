# NTHU AI Glasses App Project 2026

A React Native mobile application built with Expo for capturing and processing images through AI-powered smart glasses. This app provides a camera interface for taking photos and sending them to a backend AI service for processing.

## Features

- **Camera Integration**: Access device camera with front/back camera switching
- **Image Capture**: High-quality photo capture with preview
- **Backend Upload**: Send captured images to backend API for AI processing
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Modern UI**: Clean, intuitive camera interface with permission handling
- **Expo Router**: File-based routing for easy navigation

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev)
- **Navigation**: Expo Router (file-based routing)
- **Camera**: expo-camera
- **Language**: TypeScript
- **React**: 19.1.0
- **React Native**: 0.81.5

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS: [Xcode](https://developer.apple.com/xcode/) (macOS only)
- For Android: [Android Studio](https://developer.android.com/studio)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Buddy-Lu/NTHU-AI-glasses-app-project-2026.git
   cd NTHU-AI-glasses-app-project-2026
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Before running the app, you need to configure the backend URL:

1. Open [app/index.tsx](app/index.tsx)
2. Locate line 92 and replace the placeholder with your actual backend URL:
   ```typescript
   const BACKEND_URL = 'http://YOUR_BACKEND_URL/api/upload';
   ```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

This will open the Expo developer tools. You can then:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with [Expo Go](https://expo.dev/go) app on your physical device

### Platform-Specific Commands

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
NTHU-AI-glasses-app-project-2026/
├── app/                    # Main application code (Expo Router)
│   └── index.tsx          # Camera screen with image capture and upload
├── assets/                # Images, fonts, and other static files
├── app-example/           # Example/starter code
├── scripts/               # Build and utility scripts
├── app.json              # Expo configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Features in Detail

### Camera Functionality
- Request and handle camera permissions
- Switch between front and back cameras
- Capture high-quality images (0.8 quality setting)
- Preview captured images before sending

### Image Upload
- Form data preparation for backend API
- Cross-platform file handling (iOS/Android)
- Error handling with user feedback
- Retry mechanism on upload failure
- Loading states during upload

### UI/UX
- Safe area handling for modern devices
- Permission request screen with clear messaging
- Loading indicators for async operations
- Alert dialogs for user feedback

## API Integration

The app sends images to a backend API using multipart/form-data. Expected backend endpoint:

```
POST /api/upload
Content-Type: multipart/form-data

Body:
- image: File (JPEG/PNG)
```

## Development

### Linting
```bash
npm run lint
```

### TypeScript
The project uses TypeScript with typed routes enabled. Type checking is automatic during development.

### Expo Configuration
Key features enabled in [app.json](app.json):
- New Architecture enabled
- Typed routes
- React Compiler
- Camera permissions configured
- Custom splash screen and icons

## Building for Production

### Create a development build
```bash
npx expo run:ios
npx expo run:android
```

### Create a production build
Refer to [Expo's build documentation](https://docs.expo.dev/build/introduction/) for creating production builds with EAS Build.

## Permissions

The app requires the following permissions:
- **Camera**: To capture photos
- **Microphone** (Android): For video recording capability

Permissions are requested at runtime when the app first launches.

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted in device settings
- Check that you're testing on a physical device or simulator with camera support

### Upload failing
- Verify backend URL is correct in [app/index.tsx:92](app/index.tsx#L92)
- Ensure backend server is running and accessible
- Check network connectivity

### Development server issues
```bash
# Clear cache and restart
npx expo start -c
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the NTHU AI Glasses Project 2026.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/Buddy-Lu/NTHU-AI-glasses-app-project-2026/issues).
