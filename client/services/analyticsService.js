import { analytics } from '../config/firebase';

class AnalyticsService {
  constructor() {
    this.isEnabled = true;
    this.isInitialized = false;
  }

  // Initialize analytics
  async initialize() {
    try {
      console.log('📊 Initializing Analytics...');
      
      // Test if analytics is working
      await this.trackEvent('analytics_initialized', {
        timestamp: new Date().toISOString(),
        platform: 'react-native'
      });
      
      this.isInitialized = true;
      console.log('✅ Analytics initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
      return false;
    }
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Track screen views
  trackScreenView(screenName, screenClass = null) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    
    console.log(`📊 Analytics: Screen view - ${screenName}`);
  }

  // Track user login
  trackLogin(method = 'email') {
    if (!this.isEnabled) return;
    
    analytics.logEvent('login', {
      method: method,
    });
    
    console.log(`📊 Analytics: User login - ${method}`);
  }

  // Track user signup
  trackSignUp(method = 'email') {
    if (!this.isEnabled) return;
    
    analytics.logEvent('sign_up', {
      method: method,
    });
    
    console.log(`📊 Analytics: User signup - ${method}`);
  }

  // Track onboarding completion
  trackOnboardingComplete(stepCount, timeSpent) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('onboarding_complete', {
      step_count: stepCount,
      time_spent_seconds: timeSpent,
    });
    
    console.log(`📊 Analytics: Onboarding complete - ${stepCount} steps, ${timeSpent}s`);
  }

  // Track companion selection
  trackCompanionSelect(companionId, companionName, companionGender) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('companion_select', {
      companion_id: companionId,
      companion_name: companionName,
      companion_gender: companionGender,
    });
    
    console.log(`📊 Analytics: Companion selected - ${companionName} (${companionGender})`);
  }

  // Track companion swipe actions
  trackCompanionSwipe(action, companionId, companionName) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('companion_swipe', {
      action: action, // 'like' or 'pass'
      companion_id: companionId,
      companion_name: companionName,
    });
    
    console.log(`📊 Analytics: Companion ${action} - ${companionName}`);
  }

  // Track chat messages
  trackChatMessage(messageLength, companionId) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('chat_message', {
      message_length: messageLength,
      companion_id: companionId,
    });
    
    console.log(`📊 Analytics: Chat message sent - ${messageLength} chars`);
  }

  // Track profile updates
  trackProfileUpdate(fieldUpdated) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('profile_update', {
      field_updated: fieldUpdated,
    });
    
    console.log(`📊 Analytics: Profile updated - ${fieldUpdated}`);
  }

  // Track app errors
  trackError(errorType, errorMessage, screenName) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      screen_name: screenName,
    });
    
    console.log(`📊 Analytics: Error tracked - ${errorType} on ${screenName}`);
  }

  // Set user properties
  setUserProperty(property, value) {
    if (!this.isEnabled) return;
    
    analytics.setUserProperties({
      [property]: value
    });
    console.log(`📊 Analytics: User property set - ${property}: ${value}`);
  }

  // Set user ID
  setUserId(userId) {
    if (!this.isEnabled) return;
    
    analytics.setUserId(userId);
    console.log(`📊 Analytics: User ID set - ${userId}`);
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;
    
    analytics.logEvent(eventName, parameters);
    console.log(`📊 Analytics: Custom event - ${eventName}`, parameters);
  }

  // Track purchase events (for future monetization)
  trackPurchase(transactionId, value, currency = 'USD', items = []) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
    
    console.log(`📊 Analytics: Purchase tracked - $${value} ${currency}`);
  }

  // Track app open
  trackAppOpen() {
    if (!this.isEnabled) return;
    
    analytics.logEvent('app_open');
    console.log(`📊 Analytics: App opened`);
  }

  // Track search events
  trackSearch(searchTerm, resultsCount) {
    if (!this.isEnabled) return;
    
    analytics.logEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
    
    console.log(`📊 Analytics: Search - "${searchTerm}" (${resultsCount} results)`);
  }
}

// Export singleton instance
export default new AnalyticsService();