# GrowthTrack Mobile App

A React Native Expo app for teen health tracking with parent oversight.

## Setup Instructions

### 1. Create a New Replit Project

1. Go to [replit.com](https://replit.com) and click "Create Repl"
2. Choose "React Native" or "Expo" template
3. Delete the default files

### 2. Copy Files

Copy all files from this `mobile/` folder to your new Replit project root:
- `app/` - All screens and navigation
- `assets/` - App icons and images
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `services/` - API and storage services
- `types/` - TypeScript definitions
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration

### 3. Configure Environment

Create a `.env` file in the project root:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.replit.app
```

Replace `your-backend-url.replit.app` with your published GrowthTrack backend URL.

### 4. Install Dependencies

In the Replit shell, run:
```bash
npm install
```

### 5. Start Development

```bash
npx expo start
```

Scan the QR code with Expo Go app on your iPhone to preview.

## Publishing to TestFlight

1. In the Replit Publishing pane, click "Publish to Expo Go" first
2. After that completes, "Publish to App Store" option will appear
3. Connect your Apple Developer account when prompted
4. Replit will build and submit to TestFlight automatically

## Required for App Store Submission

- Apple Developer Program membership ($99/year)
- App icons and splash screens (already in `assets/`)
- Privacy Policy URL (configured in app.json)
- HealthKit usage descriptions (configured in app.json)

## Backend API

This mobile app connects to the GrowthTrack Express backend. Make sure your backend is published and running before testing the mobile app.

The API URL is configured via the `EXPO_PUBLIC_API_URL` environment variable.
