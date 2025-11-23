module.exports = ({ config }) => ({
  ...config,
  name: "Amora AI Companion",
  slug: "amora-ai-companion",
  version: "2.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/logo.png",
    resizeMode: "contain",
    backgroundColor: "#5F4B8B"  
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.amora.companion",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "This app needs access to photo library to select profile pictures.",
      NSCameraUsageDescription: "This app needs access to camera to take profile pictures.",
      NSUserNotificationsUsageDescription: "This app needs permission to send you notifications for new messages and matches."
    },
    googleServicesFile: "./GoogleService-Info.plist",
    podfileProperties: {
      RNFirebaseAnalyticsWithoutAdIdSupport: true,
      RNFirebaseAsStaticFramework: true
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo.png",
      backgroundColor: "#5F4B8B"
    },
    package: "com.amora.companion",
    googleServicesFile: "./google-services.json",
    usesCleartextTraffic: true,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.VIBRATE",
      "android.permission.WAKE_LOCK"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  scheme: "amora",
  redirectUri: "https://auth.expo.io/@anonymous/com.amora.companion",
  extra: {
    googleWebClientId: "361569775776-746ckv1qh0k8rqhhept05vc5shv2qh8e.apps.googleusercontent.com",
    eas: {
      projectId: "d7e9c639-457e-4e50-a0c6-276d7cd696ba"
    }
  },
  plugins: [
    "@react-native-firebase/app",
    "@react-native-firebase/analytics",
    "@react-native-firebase/messaging",
    "expo-web-browser",
    "expo-dev-client",
    "expo-font",
    "expo-notifications",
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos to let you select a profile picture.",
        cameraPermission: "The app accesses your camera to let you take a profile picture."
      }
    ],
    [
      "expo-build-properties",
      {
        "ios": {
    "useFrameworks": "static",
    "buildReactNativeFromSource": true
  }
      }
    ]
  ],
  owner: "tatenda10"
});
