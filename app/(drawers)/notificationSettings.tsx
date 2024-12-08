import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotificationStore } from '@/store/notificationStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/ThemeProvider';

const NotificationSettings = () => {
  const { preferences, updatePreferences, rescheduleAllNotifications } = useNotificationStore();
  const { isDarkMode, toggleTheme } = useTheme();

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
    rescheduleAllNotifications();
  };

  return (    <SafeAreaView  className={cn(
    'mt-11 pb-6 h-screen',
    isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
  )}>
    
    <ScrollView className={cn("pt-4", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
      {/* <View className="p-2"> */}
        <View className={cn("rounded-xl p-4 mb-4", isDarkMode ? "bg-gray-800" : "bg-white")}>
        <Text className={cn(
              "text-lg font-semibold",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>Notification Settings</Text>
          
          {/* Enable/Disable Notifications */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className={cn(isDarkMode ? "text-white" : "text-gray-800")}>Enable Notifications</Text>
            <Switch
              value={preferences.enabled}
              onValueChange={(value) => handlePreferenceChange('enabled', value)}
            />
          </View>

          {/* Sound Settings */}
          <View className={cn(
            "flex-row justify-between items-center border-b",
            isDarkMode ? "border-gray-700" : "border-gray-200"
          )}>
            <Text className={cn(isDarkMode ? "text-white" : "text-gray-800")}>Enable Sound</Text>
            <Switch
              value={preferences.soundEnabled}
              onValueChange={(value) => handlePreferenceChange('soundEnabled', value)}
            />
          </View>

          {/* Reminder Time */}
          {/* <View className="mb-4">
            <Text className={cn("mb-2",isDarkMode ? "text-white" : "text-gray-800")}>Default Reminder Time</Text>
            <TouchableOpacity 
              className="bg-gray-100 p-2 rounded"
              onPress={() => {
                // Show a picker or modal for selecting minutes
                // This is simplified - implement a proper time picker
                handlePreferenceChange('reminderTime', 15);
              }}
            >
              <Text>{preferences.reminderTime} minutes before</Text>
            </TouchableOpacity>
          </View> */}

          {/* Daily Digest */}
          {/* <View className="flex-row justify-between items-center mb-4">
            <Text>Daily Task Digest</Text>
            <Switch
              value={preferences.dailyDigest}
              onValueChange={(value) => handlePreferenceChange('dailyDigest', value)}
            />
          </View> */}

          {/* Daily Digest Time */}
          {/* {preferences.dailyDigest && (
            <View className="mb-4">
              <Text className="mb-2">Daily Digest Time</Text>
              <TouchableOpacity 
                className="bg-gray-100 p-2 rounded"
                onPress={() => {
                  // Show time picker
                  // This is simplified - implement a proper time picker
                  handlePreferenceChange('dailyDigestTime', '09:00');
                }}
              >
                <Text>{preferences.dailyDigestTime}</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>
      {/* </View> */}
    </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;