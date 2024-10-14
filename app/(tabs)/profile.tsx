import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const profileSections = [
    { icon: 'settings-outline', title: 'Settings', onPress: () => console.log('Navigate to Settings') },
    { icon: 'notifications-outline', title: 'Notifications', onPress: () => console.log('Navigate to Notifications') },
    { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => console.log('Navigate to Help & Support') },
    { icon: 'log-out-outline', title: 'Log Out', onPress: () => signOut() },
  ];

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-purple-600 pt-12 pb-6 px-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <Image
            source={{ uri: user.imageUrl || 'https://via.placeholder.com/100' }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Text className="text-white text-2xl font-bold">{user?.fullName}</Text>
          <Text className="text-white text-sm">{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      <View className="bg-white mt-4 p-4 mx-4 rounded-lg shadow">
        <Text className="text-gray-600 text-sm mb-2">{user.publicMetadata?.bio || 'No bio available'}</Text>
        <View className="flex-row justify-between mt-4">
          <View className="items-center">
            <Text className="text-purple-600 font-bold text-lg">{user?.publicMetadata?.tasksCompleted || 0}</Text>
            <Text className="text-gray-500 text-xs">Tasks Completed</Text>
          </View>
          <View className="items-center">
            <Text className="text-purple-600 font-bold text-lg">{new Date(user?.createdAt!).toLocaleDateString()}</Text>
            <Text className="text-gray-500 text-xs">Join Date</Text>
          </View>
        </View>
      </View>

      <View className="mt-6">
        {profileSections.map((section, index) => (
          <TouchableOpacity
            key={index}
            onPress={section.onPress}
            className="flex-row items-center gap-3 bg-white py-4 px-6 border-b border-gray-200"
          >
            <Ionicons name={section.icon} size={24} color="#8B5CF6" className="mr-4" />
            <Text className="text-gray-800 flex-1">{section.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfilePage;