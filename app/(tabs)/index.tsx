import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListItem = ({ text }) => (
  <View className="flex-row items-center px-4 py-3">
    <View className="w-8 h-8 bg-purple-200 rounded-full mr-3 items-center justify-center">
      <Text className="text-purple-700 font-semibold">A</Text>
    </View>
    <Text className="flex-1 text-gray-800">{text}</Text>
    <TouchableOpacity>
      <Ionicons name="checkmark-circle-outline" size={24} color="#8B5CF6" />
    </TouchableOpacity>
  </View>
);

const ListView = () => {
  return (
    
    <SafeAreaView className="flex-1 bg-gray-100 pt-10">
      <View className="bg-white px-4 py-3 flex-row items-center">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2"
          placeholder="Search"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        {[...Array(12)].map((_, index) => (
          <ListItem key={index} text={`List item ${index + 1}`} />
        ))}
      </ScrollView>
      
      <View className="bg-white px-4 py-3 flex-row justify-between items-center">
      <TouchableOpacity>
          <Ionicons name="person" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Title</Text>
        <TouchableOpacity>
          <Ionicons name="refresh" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
   
  );
};

export default ListView;