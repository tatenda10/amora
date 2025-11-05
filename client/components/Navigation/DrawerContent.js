import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const DrawerContent = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const menuItems = [
    { label: 'Chats', screen: 'Chats', icon: 'chatbubble-ellipses-outline' },
    { label: 'Profile', screen: 'Profile', icon: 'person-circle-outline' },
    { label: 'Subscription', screen: 'Billing', icon: 'card-outline' },
    { label: 'Notifications', screen: 'TestNotifications', icon: 'notifications-outline' },
    { label: 'Settings', screen: 'Settings', icon: 'settings-outline' },
    { label: 'Help & Support', screen: 'Support', icon: 'help-circle-outline' },
  ];

  return (
    <SafeAreaView className="bg-white w-full flex-1">
      <View className="px-6 py-6 border-b border-gray-200">
        <Text className="text-[18px] font-extrabold text-[#5F4B8B]">
          {user?.name || 'Guest'}
        </Text>
      </View>

      <View className="px-5 pt-4 flex-1">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="py-4 px-4 flex-row items-center gap-4 border-b border-gray-200"
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={22} color="#5F4B8B" />
            <Text className="ml-3 text-[#5F4B8B] text-[16px] font-medium">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        className="mx-5 mb-6 p-4 rounded-md bg-[#F4C2C2]"
        onPress={async () => {
          await signOut();
          // AuthContext will set isAuthenticated=false and AppNavigator will
          // switch to the unauthenticated stack automatically.
          if (navigation?.closeDrawer) {
            navigation.closeDrawer();
          }
        }}
      >
        <Text className="text-[#5F4B8B] text-[16px] font-semibold text-center">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DrawerContent; 