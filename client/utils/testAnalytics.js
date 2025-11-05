// Test Firebase Analytics Integration
// Run this in your app to verify analytics is working

import analyticsService from './services/analyticsService';

export const testAnalytics = () => {
  console.log('🧪 Testing Firebase Analytics...');
  
  // Test basic events
  analyticsService.trackAppOpen();
  analyticsService.trackScreenView('TestScreen', 'TestScreen');
  analyticsService.trackEvent('test_event', { 
    test_parameter: 'test_value',
    timestamp: new Date().toISOString()
  });
  
  // Test user properties
  analyticsService.setUserProperty('test_property', 'test_value');
  analyticsService.setUserId('test-user-123');
  
  console.log('✅ Analytics test events sent!');
  console.log('📊 Check Firebase Console → Analytics → Events to see the data');
};

export default testAnalytics;
