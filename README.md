# NTHU AI Glasses App Project 2026

A React Native mobile application built with Expo for capturing and processing images through AI-powered smart glasses. This app provides a camera interface for taking photos and sending them to a backend AI service for processing.

## Related Projects

| Project | Description |
|---------|-------------|
| **[MyCyanGlasses](https://github.com/Buddy-Lu/MyCyanGlasses)** | Android implementation using HeyCyan glasses SDK - the working app with Bluetooth control, camera, and media management |

> This React Native app serves as a UI mockup/prototype. The actual glasses integration is in [MyCyanGlasses](https://github.com/Buddy-Lu/MyCyanGlasses).

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

## Quick Start

```bash
git clone https://github.com/Buddy-Lu/NTHU-AI-glasses-app-project-2026.git
cd NTHU-AI-glasses-app-project-2026
npm install
npx expo start
```

See full documentation below for configuration and platform-specific commands.

---

<details>
<summary>Full Documentation (click to expand)</summary>

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS: [Xcode](https://developer.apple.com/xcode/) (macOS only)
- For Android: [Android Studio](https://developer.android.com/studio)

## Configuration

Before running the app, configure the backend URL in [app/index.tsx](app/index.tsx) line 92:
```typescript
const BACKEND_URL = 'http://YOUR_BACKEND_URL/api/upload';
```

## Running the App

```bash
npx expo start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with [Expo Go](https://expo.dev/go) on your device

## Project Structure

```
├── app/                    # Main application code (Expo Router)
│   └── index.tsx          # Camera screen with image capture
├── assets/                # Static files
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Troubleshooting

- **Camera not working**: Check permissions in device settings
- **Upload failing**: Verify backend URL and server status
- **Dev server issues**: Run `npx expo start -c` to clear cache

</details>

## License

NTHU AI Glasses Project 2026
