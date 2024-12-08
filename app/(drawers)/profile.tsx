import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useTaskStore } from '@/store/taskStore';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [imageUser, setImageUser] = useState<DocumentPicker.DocumentPickerAsset | undefined>();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { isDarkMode } = useTheme();
  
  if (!user) return <Redirect href={"/(auth)/sign-in"} />;

  const { imageUrl } = user;
  const { tasks, getCompletedTasks } = useTaskStore();

  const { height } = useWindowDimensions()
  const profileSections = [
    { 
      icon: 'settings-outline', 
      title: 'Settings', 
      onPress: () => router.push('/(drawers)/settings')
    },
    { 
      icon: 'heart-outline', 
      title: 'Support Us', 
      onPress: () => router.push('/(drawers)/donate')
    },
    { 
      icon: 'notifications-outline', 
      title: 'Notifications', 
      onPress: () => router.push('/(drawers)/notifications')
    },
    { 
      icon: 'help-circle-outline', 
      title: 'Help & Support', 
      onPress: () => router.push('/(drawers)/help')
    },
    { 
      icon: 'log-out-outline', 
      title: 'Log Out', 
      onPress: () => signOut() 
    },
    {
      icon: 'cube-outline',
      title: 'View Stores',
      onPress: () => router.push('/(drawers)/stores')
    },
  ];

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
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        <View className="items-center">
          <TouchableOpacity 
            onPress={async () => {
              const image = await DocumentPicker.getDocumentAsync({type: '**/image'});
              setImageUser(image.assets?.at(0));
            }}
          >
            <Image
              source={{ uri: imageUser?.uri || 'https://via.placeholder.com/100' }}
              className="w-24 h-24 rounded-full mb-4"
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            {user?.fullName}
          </Text>
          <Text className="text-white text-sm">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      <View className={cn(
        "mt-4 p-4 mx-4 rounded-xl shadow",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <Text className={cn(
          "text-sm mb-2",
          isDarkMode ? "text-gray-300" : "text-gray-600"
        )}>
          {user?.publicMetadata?.bio || 'No bio available'}
        </Text>
        <View className="flex-row justify-between mt-4">
          <View className="items-center">
            <Text className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-blue-400" : "text-blue-500"
            )}>
              {getCompletedTasks() || 0}
            </Text>
            <Text className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Tasks Completed
            </Text>
          </View>
          <View className="items-center">
            <Text className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-blue-400" : "text-blue-500"
            )}>
              {new Date(user?.createdAt!).toLocaleDateString()}
            </Text>
            <Text className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Join Date
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6 rounded-xl px-4 overflow-hidden ml-4">
        {profileSections.map((section, index) => (
          <TouchableOpacity
            key={index}
            onPress={section.onPress}
            className={cn(
              "flex-row items-center gap-3 py-4 px-6 border-b",
              isDarkMode ? [
                "bg-gray-800",
                index === profileSections.length - 1 ? "" : "border-gray-700"
              ] : [
                "bg-white",
                index === profileSections.length - 1 ? "" : "border-gray-200"
              ]
            )}
          >
            <Ionicons 
              name={section.icon as any}
              size={24} 
              color={isDarkMode ? "#A78BFA" : "#8B5CF6"} 
              className="mr-4" 
            />
            <Text className={cn(
              "flex-1",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              {section.title}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? "#9CA3AF" : "#CBD5E0"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;