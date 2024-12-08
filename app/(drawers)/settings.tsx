import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import NotificationSettings from './notificationSettings';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminderTime, setTaskReminderTime] = useState('09:00');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

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
        <TouchableOpacity onPress={() => router.push("/(drawers)/profile")} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Settings</Text>
      </View>

      <View className="mt-4 mx-4">
        {/* Account Section */}
        <View className={cn(
          "rounded-xl shadow-sm overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <View className={cn(
            "p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>Account</Text>
          </View>

          <TouchableOpacity
            className={cn(
              "flex-row justify-between items-center p-4 border-b",
              isDarkMode ? "border-gray-700" : "border-gray-200"
            )}
            onPress={() => router.push('/(drawers)/edit-profile')}
          >
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Edit Profile</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#9CA3AF" : "#CBD5E0"} 
            />
          </TouchableOpacity>

          <TouchableOpacity className={cn(
            "flex-row justify-between items-center p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Change Password</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#9CA3AF" : "#CBD5E0"} 
            />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className={cn(
          "mt-4 rounded-xl shadow-sm overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <View className={cn(
            "p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>Preferences</Text>
          </View>

          <View className={cn(
            "flex-row justify-between items-center p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Other preference switches */}
          <View className={cn(
            "flex-row justify-between items-center p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Push Notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={pushNotifications ? "#fff" : "#f4f3f4"}
            />
          </View>

          <NotificationSettings />

          <View className={cn(
            "flex-row justify-between items-center p-4 border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={emailNotifications ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View className="flex-row justify-between items-center p-4">
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Task Reminder Time</Text>
            <TextInput
              value={taskReminderTime}
              onChangeText={setTaskReminderTime}
              placeholder="HH:MM"
              keyboardType="numbers-and-punctuation"
              className={cn(
                "border rounded px-2 py-1 w-20 text-right",
                isDarkMode 
                  ? "border-gray-600 bg-gray-700 text-white" 
                  : "border-gray-300 bg-white text-gray-800"
              )}
              placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        </View>

        {/* Links Section */}
        <View className={cn(
          "mt-4 rounded-xl shadow-sm overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <TouchableOpacity
            className={cn(
              "p-4 border-b",
              isDarkMode ? "border-gray-700" : "border-gray-200"
            )}
            onPress={() => console.log('Navigate to Help & Support')}
          >
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={cn(
              "p-4 border-b",
              isDarkMode ? "border-gray-700" : "border-gray-200"
            )}
            onPress={() => console.log('Navigate to Privacy Policy')}
          >
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4"
            onPress={() => console.log('Navigate to Terms of Service')}
          >
            <Text className={isDarkMode ? "text-white" : "text-gray-800"}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="mt-4 bg-red-500 p-4 rounded-xl"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;