import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const HelpAndSupportPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login screen and click on "Forgot Password". Follow the instructions sent to your email to create a new password.'
    },
    {
      id: '2',
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Go to Settings > Edit Profile to update your personal information, including your name, email, and profile picture.'
    },
    {
      id: '3',
      category: 'Tasks',
      question: 'How do I create a new task?',
      answer: 'Tap the "+" button on the home screen to create a new task. Fill in the task details and tap "Save" to add it to your list.'
    },
    {
      id: '4',
      category: 'Tasks',
      question: 'Can I set reminders for my tasks?',
      answer: 'Yes! When creating or editing a task, you can set a reminder by tapping the bell icon and selecting your preferred date and time.'
    },
    {
      id: '5',
      category: 'Premium',
      question: 'What features are included in Premium?',
      answer: 'Premium includes ad-free experience, unlimited tasks, advanced categorization, priority support, and more customization options.'
    }
  ];

  const contactOptions: ContactOption[] = [
    {
      id: '1',
      title: 'Email Support',
      description: 'Get help via email. We typically respond within 24 hours.',
      icon: 'mail-outline',
      action: () => console.log('Open email support')
    },
    {
      id: '2',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      icon: 'chatbubbles-outline',
      action: () => console.log('Open live chat')
    },
    {
      id: '3',
      title: 'Community Forum',
      description: 'Connect with other users and share tips.',
      icon: 'people-outline',
      action: () => console.log('Open community forum')
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqData.map(faq => faq.category)));

  return (
    <SafeAreaView  className={cn(
      'mt-11 pb-6 h-screen',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
    <ScrollView className={cn(
      "flex-1",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      <View className={cn(
        "pt-12 pb-6 px-4",
        isDarkMode ? "bg-gray-800" : "bg-blue-500"
      )}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Help & Support</Text>
        <Text className="text-white text-sm mt-2">
          How can we help you today?
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4">
        <View className={cn(
          "rounded-xl flex-row items-center px-4 py-2 shadow-sm",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={isDarkMode ? "#9CA3AF" : "#6B7280"} 
          />
          <TextInput
            className={cn(
              "flex-1 ml-2",
              isDarkMode ? "text-white" : "text-gray-800"
            )}
            placeholder="Search for help..."
            placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={isDarkMode ? "#9CA3AF" : "#6B7280"} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contact Options */}
      <View className="px-4 mb-6">
        <Text className={cn(
          "text-lg font-bold mb-4",
          isDarkMode ? "text-white" : "text-gray-800"
        )}>Contact Us</Text>
        {contactOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={option.action}
            className={cn(
              "rounded-xl shadow-sm p-4 mb-3 flex-row items-center",
              isDarkMode ? "bg-gray-800" : "bg-white"
            )}
          >
            <View className={isDarkMode ? "bg-gray-700" : "bg-blue-100"}>
              <Ionicons 
                name={option.icon as "push"} 
                size={24} 
                color={isDarkMode ? "#A78BFA" : "#8B5CF6"} 
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className={isDarkMode ? "text-white" : "text-gray-800"}>
                {option.title}
              </Text>
              <Text className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                {option.description}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ Sections */}
      <View className="px-4 mb-6">
        <Text className={cn(
          "text-lg font-bold mb-4",
          isDarkMode ? "text-white" : "text-gray-800"
        )}>Frequently Asked Questions</Text>
        {categories.map((category) => (
          <View key={category} className="mb-4">
            <Text className={cn(
              "text-md font-semibold mb-2",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>{category}</Text>
            {filteredFAQs
              .filter(faq => faq.category === category)
              .map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className={cn(
                    "rounded-xl shadow-sm mb-2 overflow-hidden",
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  )}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-center">
                      <Text className={cn(
                        "font-medium flex-1 pr-4",
                        isDarkMode ? "text-white" : "text-gray-800"
                      )}>
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      />
                    </View>
                    {expandedFAQ === faq.id && (
                      <Text className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        {faq.answer}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </View>

      {/* Quick Links */}
      <View className="px-4 mb-8">
        <Text className={cn(
          "text-lg font-bold mb-4",
          isDarkMode ? "text-white" : "text-gray-800"
        )}>Quick Links</Text>
        <View className={cn(
          "rounded-xl shadow-sm overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <TouchableOpacity className={cn(
            "p-4 flex-row justify-between items-center border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>
              User Guide
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
            />
          </TouchableOpacity>
          <TouchableOpacity className={cn(
            "p-4 flex-row justify-between items-center border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>
              Video Tutorials
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
            />
          </TouchableOpacity>
          <TouchableOpacity className="p-4 flex-row justify-between items-center">
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>
              Release Notes
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default HelpAndSupportPage;