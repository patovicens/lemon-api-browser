# 🍋 Lemon API-Browser

A React Native cryptocurrency trading and management application with a modern, lemon-themed design. Built with TypeScript and featuring real-time crypto data, QR code scanning, and Google authentication.

## 📱 Features

- **Cryptocurrency Management**: View and track crypto prices, market data, and portfolio
- **Exchange Functionality**: Convert between different cryptocurrencies and fiat currencies
- **QR Code Scanner**: Scan crypto addresses
- **Dark/Light Theme**: Toggle between themes with smooth animations
- **Google Authentication**: Secure login with Google accounts
- **Real-time Data**: Live cryptocurrency prices and exchange rates via CoinGecko API
- **Responsive Design**: Optimized for both iOS and Android platforms

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** >= 18.0.0
- **Yarn** package manager
- **React Native CLI** (latest version)
- **Xcode** (for iOS development)
- **Android Studio** (for Android development)
- **Java Development Kit (JDK)** 17 or higher

### Environment Setup Notes

If you're new to React Native Android development (not required if you already have Android Studio set up), you'll need to configure your environment:

```bash
# These environment variables are needed for general React Native Android development
# If you already have Android Studio installed and working, you likely have this configured
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Note: Android SDK paths vary by OS:
- macOS: `$HOME/Library/Android/sdk`
- Windows: `%LOCALAPPDATA%\Android\Sdk`
- Linux: `$HOME/Android/Sdk`

These variables are typically set up during Android Studio installation. They're not specific to this project but are required for React Native Android development in general.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lemon-api-browser
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```
   
   **Note**: This project uses patch-package to fix some issues with dependencies. The patches will be automatically applied after yarn install.

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Environment Configuration**
   Create a new `.env` file in the project root and add:
   ```bash
   # CoinGecko API Configuration
   COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
   COINGECKO_API_KEY=your_api_key_here  # Get from https://www.coingecko.com/en/api

   # Google Auth Configuration
   # To get this:
   # 1. Go to Google Cloud Console (https://console.cloud.google.com)
   # 2. Create a project or select an existing one
   # 3. Enable Google Sign-In API
   # 4. Go to Credentials
   # 5. Create an OAuth 2.0 Client ID (type: Web application)
   # 6. Copy the Client ID here
   GOOGLE_WEB_CLIENT_ID=your_google_web_client_id_here
   ```
   
   **Note**: The `.env` file contains sensitive information and is automatically ignored by git. Never commit your actual API keys.

5. **Run the application**
   ```bash
   # Run on iOS (automatically starts Metro bundler)
   yarn ios
   
   # Run on Android (automatically starts Metro bundler)
   yarn android
   ```

## 📚 Libraries & Dependencies

### Core Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `react-native` | 0.81.0 | Core React Native framework |
| `react` | 19.1.0 | React library |
| `typescript` | 5.8.3 | Type safety and development experience |
| `@react-native/new-app-screen` | 0.81.0 | Default React Native app screen |
| `react-native-dotenv` | ^3.4.9 | Environment variable management |

### Navigation & UI

| Library | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | 7.1.17 | Navigation framework |
| `@react-navigation/stack` | 7.4.7 | Stack navigation |
| `@react-navigation/bottom-tabs` | 7.4.6 | Bottom tab navigation |
| `react-native-screens` | 4.13.1 | Native screen components |
| `react-native-safe-area-context` | 5.6.0 | Safe area handling |

### State Management & Data Fetching

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.85.0 | Server state management |
| `@react-native-async-storage/async-storage` | 2.2.0 | Local data persistence |
| `@react-native-clipboard/clipboard` | ^1.16.3 | Clipboard functionality |

### Authentication & Security

| Library | Version | Purpose |
|---------|---------|---------|
| `@react-native-google-signin/google-signin` | 15.0.0 | Google OAuth integration |

### UI Components & Animations

| Library | Version | Purpose |
|---------|---------|---------|
| `@fortawesome/fontawesome-svg-core` | ^7.0.0 | FontAwesome core library |
| `@fortawesome/free-solid-svg-icons` | ^7.0.0 | FontAwesome solid icons |
| `@fortawesome/react-native-fontawesome` | 0.3.2 | FontAwesome React Native component |
| `react-native-reanimated` | 4.0.2 | Smooth animations |
| `react-native-gesture-handler` | 2.28.0 | Gesture handling |
| `@gorhom/bottom-sheet` | 5.x | Bottom sheet modals |
| `react-native-svg` | 15.12.1 | SVG support for React Native |
| `react-native-splash-screen` | ^3.3.0 | Custom splash screen handling |

### Camera & Scanning

| Library | Version | Purpose |
|---------|---------|---------|
| `react-native-camera-kit` | 15.1.0 | Camera functionality |
| `react-native-permissions` | 5.4.2 | Permission handling |

### Performance & Optimization

| Library | Version | Purpose |
|---------|---------|---------|
| `@shopify/flash-list` | 2.0.2 | High-performance list rendering |
| `react-native-worklets` | 0.4.1 | Background processing and worklets |

## ⚠️ Caveats & Important Notes

### Platform-Specific Considerations

#### iOS
- **Minimum iOS Version**: iOS 12.0+
- **Camera Permissions**: Requires camera access for QR scanning
- **Google Sign-In**: Needs proper URL scheme configuration in Info.plist
- **Splash Screen**: Custom launch screen with lemon icon and dark theme

#### Android
- **Minimum SDK**: API level 24 (Android 7.0)
- **Target SDK**: API level 36 (Android 14)
- **Permissions**: Camera and storage permissions required
- **Navigation Bar**: Custom themed navigation bar matching app theme
- **Splash Screen**: Custom launch screen with vector lemon icon

### API Limitations

- **CoinGecko API**: Free tier has rate limits (50 calls/minute)
- **Rate Limiting**: App includes rate limit handling and user feedback
- **API Key**: Demo API key included, but production should use registered key
- **Environment Setup**: API configuration is managed via `.env` file (see Setup Instructions)

### Performance Considerations

- **Hermes Engine**: Enabled by default for better performance
- **Image Optimization**: Uses vector icons where possible
- **List Rendering**: FlashList for large data sets


## 🎨 Theme System

The app features a comprehensive theme system with:
- **Dark Theme**: Primary theme with dark backgrounds and lemon accents
- **Light Theme**: Alternative theme with light backgrounds
- **Dynamic Switching**: Real-time theme changes
- **Consistent Colors**: Lemon (#FFC107) as primary accent color
- **Platform Integration**: Native status bar and navigation bar theming

## 🔐 Authentication

- **Google OAuth**: Secure authentication via Google accounts
- **Token Management**: Automatic token refresh and validation
- **Secure Storage**: Encrypted local storage for sensitive data
- **Session Persistence**: Maintains login state across app restarts

## 📊 Data Management

- **React Query**: Efficient server state management
- **Caching**: Intelligent caching for API responses
- **Offline Support**: Graceful handling of network issues
- **Real-time Updates**: Live data refresh capabilities

## 🚨 Troubleshooting

### Critical iOS Camera Fix (React Native 0.80+ with New Architecture)

If you're experiencing a **blank/white screen** when using the camera on iOS with React Native 0.80+ and New Architecture enabled, this is a known issue with `react-native-camera-kit` and the new Fabric renderer.

#### The Problem
- Camera preview shows as blank/white screen on iOS
- Not a permissions issue - camera permissions work correctly
- Caused by missing layout constraints in the new Fabric architecture
- Affects `react-native-camera-kit` version 15.1.0 and below

#### The Solution
This project automatically applies the necessary fix using **patch-package**. The fix is applied automatically when you run `yarn install`.

**What the fix does:**
- Adds Auto Layout constraints for Fabric 0.80.0 compatibility
- Replaces frame-based layout with constraint-based layout
- Ensures camera preview, scanner interface, and focus interface are properly positioned

**How it works:**
1. The fix is stored in `patches/react-native-camera-kit+15.1.0.patch`
2. When you run `yarn install`, patch-package automatically applies the fix
3. No manual file editing required
4. The fix persists across dependency reinstalls

**If you need to manually apply the fix elsewhere:**
The patch modifies `CameraView.swift` to add a helper function and update the view initialization method. You can view the exact changes in the patch file.

**Rebuild after installation:**
```bash
cd ios && pod install
yarn ios
```

#### Why This Fix Works
The new Fabric architecture requires explicit Auto Layout constraints. Without them, UIKit reports "ambiguous layout" causing views to be present but never rendered (hence the blank screen).

#### Official Fix Status
**Good news!** This issue has been officially fixed in [PR #731](https://github.com/teslamotors/react-native-camera-kit/pull/731) and is awaiting merge. The PR introduces the exact same solution we've implemented:

- Adds Auto Layout constraints for Fabric 0.80.0 compatibility
- Replaces frame-based layout with constraint-based layout
- Ensures proper view rendering under the new architecture

**Current status**: The PR has been approved by multiple reviewers and is ready for merge. Once merged, you can:
1. Remove the patch file: `rm patches/react-native-camera-kit+15.1.0.patch`
2. Update to the latest version: `yarn upgrade react-native-camera-kit`

#### Alternative Solutions
- **Wait for official fix**: The fix is ready and should be merged soon
- **Disable New Architecture**: Set `RCTNewArchEnabled` to `false` in `Info.plist` (temporary workaround)

### Common Issues

1. **Metro Bundler Issues**
   ```bash
   yarn start --reset-cache
   ```

2. **iOS Build Issues**
   ```bash
   cd ios && pod deintegrate && pod install
   ```

3. **Android Build Issues**
   ```bash
   cd android && ./gradlew clean
   ```

4. **Permission Issues**
   - Ensure camera permissions are granted
   - Check Info.plist and AndroidManifest.xml configurations

### Getting Help

- Check the React Native documentation
- Review platform-specific setup guides
- Ensure all dependencies are properly linked
- Verify environment variables and API keys

## 📄 License

This project is private and proprietary. All rights reserved.

## 🤝 Contributing

This is a private project. For internal development, please follow the established coding standards and review process.

---

**Built with ❤️ using React Native and TypeScript**
