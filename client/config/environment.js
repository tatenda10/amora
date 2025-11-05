import Constants from 'expo-constants';
import BASE_URL from '../context/Api';

// Environment configuration
const config = {
  // API Configuration
  API_URL: BASE_URL,
  
  // Google OAuth Configuration
  GOOGLE_WEB_CLIENT_ID: '361569775776-746ckv1qh0k8rqhhept05vc5shv2qh8e.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URI: 'https://auth.expo.io/@anonymous/amora-ai-companion/redirect',
  
  // Development settings
  IS_DEVELOPMENT: __DEV__,
};

export default config;
