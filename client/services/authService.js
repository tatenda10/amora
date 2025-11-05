import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import config from '../config/environment';
import BASE_URL from '../context/Api';

// Network helpers
const DEFAULT_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Configure WebBrowser for Google OAuth
WebBrowser.maybeCompleteAuthSession();

class AuthService {
  
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Read response as text first to handle both JSON and HTML responses
      const responseText = await response.text();
      let data;
      
      // Try to parse as JSON
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Response is not valid JSON (likely HTML error page)
        console.error('Non-JSON response received:', responseText.substring(0, 200));
        console.error('Response status:', response.status);
        console.error('Content-Type:', response.headers.get('content-type'));
        
        // Provide helpful error messages based on status code
        if (response.status === 404) {
          throw new Error('Server endpoint not found. Please check your server configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Server returned invalid response (${response.status}). Please check your connection.`);
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Email login error:', error);
      // Normalize common network errors for immediate UI feedback
      let message = error.message || 'Login failed';
      if (message === 'Network request failed') {
        message = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      if (message === 'Request timed out') {
        message = 'Request timed out. Please try again.';
      }
      // Handle JSON parse errors specifically
      if (message.includes('JSON Parse error') || message.includes('Unexpected character')) {
        message = 'Server returned an invalid response. Please check your server is running and accessible.';
      }
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Register with email and password
   */
  async signUpWithEmail(email, password, name) {
    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      console.log('Backend registration response:', response.status, data);

      if (!response.ok) {
        // Provide more specific error messages based on status codes
        let errorMessage = data.message || 'Registration failed';
        
        if (response.status === 400) {
          if (data.message && data.message.includes('Email already exists')) {
            errorMessage = 'Email already exists';
          } else if (data.message && data.message.includes('validation')) {
            errorMessage = data.message;
          } else {
            errorMessage = 'Invalid registration data. Please check your information.';
          }
        } else if (response.status === 409) {
          errorMessage = 'Email already exists';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Email registration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with Google using Expo WebBrowser
   */
  async signInWithGoogle() {
    try {
      console.log('Google Web Client ID:', config.GOOGLE_WEB_CLIENT_ID);
      console.log('Config object:', config);
      
        // Create the Google OAuth request with a proper redirect URI
        // For Expo development, we need to use the proxy redirect URI
        const redirectUri = 'https://auth.expo.io/@anonymous/amora-ai-companion';
        
        console.log('Redirect URI:', redirectUri);
        console.log('Using hardcoded redirect URI for testing');
      console.log('Client ID being used:', config.GOOGLE_WEB_CLIENT_ID);
      
      // Create a more standard OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: config.GOOGLE_WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
        extraParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        additionalParameters: {
          'app_name': 'Amora AI Companion',
          'app_package_name': 'com.amora.companion',
        },
      });

          // Start the authentication flow
          const result = await request.promptAsync({
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          });

          console.log('OAuth result:', result);
          console.log('Result type:', result.type);
          console.log('Result params:', result.params);

          if (result.type === 'success') {
        // Exchange authorization code for access token
        console.log('Exchanging authorization code for access token...');
        console.log('Authorization code:', result.params.code);
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: config.GOOGLE_WEB_CLIENT_ID,
            code: result.params.code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri, // Use the same redirect URI we used for the auth request
          }).toString(),
        });

        console.log('Token response status:', tokenResponse.status);
        const tokenData = await tokenResponse.json();
        console.log('Token response data:', tokenData);

        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
        }

        console.log('Token exchange successful:', tokenData);

        // Get user info from Google
        console.log('Getting user info from Google...');
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
        );
        console.log('User info response status:', userInfoResponse.status);
        const userInfo = await userInfoResponse.json();
        console.log('User info response data:', userInfo);

        if (!userInfoResponse.ok) {
          throw new Error(`Failed to get user info: ${userInfo.error_description || userInfo.error}`);
        }

        console.log('Google Sign-In successful:', userInfo);

        // Send user info to your backend
        const requestBody = {
          accessToken: tokenData.access_token,
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
        };

        console.log('Sending Google login request:', {
          url: `${BASE_URL}/user/google`,
          body: requestBody
        });

        const response = await fetch(`${BASE_URL}/user/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        console.log('Google login response:', {
          status: response.status,
          ok: response.ok,
          data: data
        });

        if (!response.ok) {
          throw new Error(data.message || `Google login failed with status ${response.status}`);
        }

        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else if (result.type === 'dismiss') {
        // User cancelled the authentication
        return {
          success: false,
          error: 'Authentication was cancelled by user',
        };
      } else {
        throw new Error('Google authentication was cancelled or failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      // Clear local storage
      // You might want to clear AsyncStorage or other local storage here
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

}

export default new AuthService();
