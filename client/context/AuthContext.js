import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import BASE_URL from './Api';
import analyticsService from '../services/analyticsService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      
      // Check for stored token
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔐 Checking auth state, token exists:', !!token);
      
      if (token) {
        try {
          // Verify token with backend
          console.log('🔐 Verifying token with backend...');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`${BASE_URL}/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          console.log('🔐 Auth check response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth check successful, user:', data.user?.email);
            setUser(data.user);
            
            // Set user ID for analytics
            if (data.user?.id) {
              analyticsService.setUserId(data.user.id);
            }
          } else {
            console.log('❌ Token invalid, clearing storage');
            // Token is invalid, clear it
            await AsyncStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (networkError) {
          console.log('⚠️ Network error during auth check, keeping user logged in:', networkError.message);
          // On network error, don't clear the user - they might still be valid
          // This prevents users from being logged out due to temporary network issues
        }
      } else {
        console.log('🔐 No token found, user not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth state check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setError(null);

      // Starting login process
      const result = await authService.signInWithEmail(email, password);
      // Login result received
      
      if (result.success) {
        // Login successful
        setUser(result.user);
        await AsyncStorage.setItem('authToken', result.token);
        return true;
      } else {
        // Login failed
        // Provide more user-friendly error messages
        let errorMessage = result.error;
        if (result.error === 'Network request failed') {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (result.error.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (result.error.includes('Email already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        setError(errorMessage);
        // Login failed, user state should remain null
        return false;
      }
    } catch (error) {
      // Login error occurred
      let errorMessage = error.message;
      if (error.message === 'Network request failed') {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      setError(errorMessage);
      return false;
    } finally {
      // Do not toggle global loading here to avoid navigator changes during login
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      // Don't set loading to true here - it causes AppNavigator to show SplashScreen
      // and unmounts the SignupScreen, preventing modals from showing
      setError(null);

      const result = await authService.signUpWithEmail(email, password, name);
      console.log('AuthContext signUp result:', result);
      
      if (result.success) {
        // Do not auto-login after signup; require explicit login
        return { success: true };
      } else {
        // Return the error from the service
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log('AuthContext signUp error:', error);
      // Return the error message
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        setUser(result.user);
        await AsyncStorage.setItem('authToken', result.token);
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      await authService.signOut();
      setUser(null);
      await AsyncStorage.removeItem('authToken');
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${BASE_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          return data.user;
        } else {
          console.error('Refresh user data failed:', response.status, response.statusText);
        }
      } else {
        console.error('No auth token found for refresh');
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
    return null;
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isOnboardingCompleted: user?.onboarding_completed || false,
    hasSelectedCompanion: user?.has_selected_companion || false,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    clearError,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
