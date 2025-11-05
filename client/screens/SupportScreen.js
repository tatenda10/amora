import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      question: 'How do I match with a companion?',
      answer: 'After completing your profile and preferences, you will be presented with potential companions. Swipe right or tap the heart icon for companions you are interested in connecting with.',
    },
    {
      question: 'Can I change my companion?',
      answer: 'Yes! You can return to the companion matching screen at any time to find a new companion that better suits your needs.',
    },
    {
      question: 'Is my conversation data private?',
      answer: 'Absolutely. Your privacy is our top priority. All conversations are encrypted and strictly confidential between you and your companion.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time through your profile settings. Your premium features will remain active until the end of your billing period.',
    },
    {
      question: 'What happens if I need immediate support?',
      answer: 'While we aim to provide emotional support, we are not a crisis service. If you need immediate help, please contact your local emergency services or crisis hotline.',
    },
  ];

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    Alert.alert('Message Sent', 'Thank you for contacting us. We will get back to you soon.');
    setMessage('');
  }, [message]);

  const toggleFaq = useCallback((index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  }, [expandedFaq]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-purple-800 border-b border-purple-300">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Help & Support</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* FAQ Section */}
          <View className="bg-white mb-5 px-5 py-5 mt-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Frequently Asked Questions</Text>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                className="mb-4 bg-gray-50 rounded-lg p-4 border border-pink-200"
                onPress={() => toggleFaq(index)}
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="flex-1 text-base font-semibold text-purple-800 pr-2">
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#5F4B8B" 
                  />
                </View>
                {expandedFaq === index && (
                  <Text className="mt-3 text-sm text-gray-600 leading-5">
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Support Section */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Contact Support</Text>
            <TouchableOpacity 
              className="flex-row justify-between items-center bg-gray-50 rounded-lg p-4 mb-3 border border-pink-200"
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-purple-800 mb-1">Email Support</Text>
                <Text className="text-sm text-gray-600">Get help via email within 24 hours</Text>
              </View>
              <Text className="text-sm font-semibold text-purple-800">support@amora.com</Text>
            </TouchableOpacity>
          </View>

          {/* Send Message Section */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Send us a Message</Text>
            <TextInput
              className="text-base text-purple-800 py-3 px-4 bg-gray-50 rounded-lg border border-pink-300 mb-4"
              placeholder="Type your message here..."
              placeholderTextColor="#C7C9F9"
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              keyboardShouldPersistTaps="handled"
            />
            <TouchableOpacity 
              className="bg-pink-300 py-3 px-6 rounded-lg items-center"
              onPress={handleSendMessage}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-purple-800">Send Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SupportScreen; 