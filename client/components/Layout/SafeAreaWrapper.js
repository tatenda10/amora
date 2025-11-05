import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

const SafeAreaWrapper = ({ 
  children, 
  navigation, 
  title, 
  hideBackButton = false,
  rightComponent,
  titleAlign = 'center',
}) => {
  const handleBackPress = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const isLeftAligned = titleAlign === 'left';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, isLeftAligned && { paddingHorizontal: 8 }]}>
        <View style={[styles.headerLeft, isLeftAligned && { width: 0, flex: 0 }]}>
          {!hideBackButton && navigation && navigation.canGoBack() && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[
          styles.headerCenter,
          isLeftAligned && { alignItems: 'flex-start', flex: 3 }
        ]}>
          {title && (
            <Text style={[styles.headerTitle, isLeftAligned && { textAlign: 'left', width: '100%' }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
        
        <View style={[styles.headerRight, isLeftAligned && { flex: 0 }] }>
          {rightComponent}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 112, 219, 0.1)',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.deepPlum,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.deepPlum,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
