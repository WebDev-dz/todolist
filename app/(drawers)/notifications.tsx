import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotificationStore, Notification } from '@/store/notificationStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/ThemeProvider';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', notificationType: "alarm", title: 'New Task Added', description: 'You have added a new task to your list.', date: '2024-10-16', read: false },
    { id: '2', notificationType: "alarm", title: 'Task Completed', description: 'Congratulations! You have completed a task.', date: '2024-10-15', read: true },
    { id: '3', notificationType: "alarm", title: 'Reminder', description: 'Don\'t forget to complete your pending tasks.', date: '2024-10-14', read: false },
  ]);

  const { scheduledNotifications } = useNotificationStore();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: !notif.read } : notif
    ));
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(notif => !notif.read)
    : notifications;

  return (
    <SafeAreaView className={cn(
      'mt-11 pb-6 h-screen',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      <ScrollView className={cn(
        "flex-1",
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      )}>
        <View className={cn(
          "pt-12 pb-6 px-4",
          isDarkMode ? "bg-gray-800" : "bg-blue-500"
        )}>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className='flex flex-row justify-between'>
            <Text className="text-white text-2xl font-bold">Notifications</Text>
            <TouchableOpacity onPress={() => router.push("/(drawers)/notificationSettings")} className="mb-4">
              <Ionicons name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className={cn(
          "flex-row justify-between items-center p-4 mx-4 mt-4 rounded-xl shadow",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <Text className={cn(
            "font-medium",
            isDarkMode ? "text-gray-300" : "text-gray-800"
          )}>
            Show unread only
          </Text>
          <Switch
            value={showUnreadOnly}
            onValueChange={setShowUnreadOnly}
            trackColor={{ 
              false: isDarkMode ? "#374151" : "#D1D5DB", 
              true: isDarkMode ? "#4F46E5" : "#8B5CF6" 
            }}
            thumbColor={showUnreadOnly ? "#fff" : isDarkMode ? "#9CA3AF" : "#f4f3f4"}
          />
        </View>

        <View className="mt-4">
          {filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification?.id}
              onPress={() => toggleRead(notification?.id)}
              className={cn(
                "flex-row items-center p-4 mx-4 mb-2 rounded-xl shadow",
                isDarkMode ? "bg-gray-800" : "bg-white",
                notification?.read && "opacity-50"
              )}
            >
              <View className="flex-1">
                <Text className={cn(
                  "font-bold",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )}>
                  {notification?.title}
                </Text>
                <Text className={cn(
                  "text-sm mt-1",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  {notification?.description || ""}
                </Text>
                <Text className={cn(
                  "text-xs mt-2",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {notification?.date || ""}
                </Text>
              </View>
              <Ionicons
                name={notification?.read ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={notification?.read 
                  ? (isDarkMode ? "#6366F1" : "#8B5CF6") 
                  : (isDarkMode ? "#4B5563" : "#CBD5E0")
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsPage;