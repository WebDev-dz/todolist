import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Pressable, Modal } from 'react-native';
import { Href, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/ThemeProvider';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';


const tabItems: { href: Href<string>; icon: string; label: string }[] = [
  { href: '/' as Href<string>, icon: 'home', label: 'Home' },
  { href: '/calendar' as Href<string>, icon: 'calendar', label: 'Calendar' },
  { href: '/(tabs)/addTask' as Href<string>, icon: 'add-circle', label: 'Add Task' },
  { href: '/(drawers)/profile' as Href<string>, icon: 'person', label: 'Profile' },

  
];


const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);


const TabBar: React.FC<ViewProps> = ({ children }) => {
  const router = useRouter();
  const sv = useSharedValue(1);
  const currentPath = usePathname();
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const { isDarkMode } = useTheme()
  const handleNavigateToAddTask = () => {
    setIsAddMenuVisible(false);
    router.push('/addTask');
  };

  const handleNavigateToGenerateTask = () => {
    setIsAddMenuVisible(false);
    router.push('/ai');
  };

  useEffect(() => {
    sv.value = withRepeat(
      withTiming(2, {
        duration: 2000, // 1 second
        easing: Easing.bezier(0, 0, 0.2, 1),
      }),
      -1, // infinite repeat
    );

    return () => {};
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sv.value }],
      opacity: 2 - sv.value, // Fade out as it scales up
    };
  });

  const renderTabItem = (item: { href: Href<string>; icon: string; label: string }, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => router.push(item.href)}
      className={cn("items-center p-2 rounded-full", {"bg-blue-100": currentPath === item.href })}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={currentPath === item.href ? '#3b82f6' : '#4B5563'}
      />
    
        
      
    </TouchableOpacity>
  );

  return (
    <View className={cn("flex-row py-3 px-5 justify-between items-center", isDarkMode ? "bg-gray-800": "bg-white")}>
      <View className="flex-row justify-between flex-1">
        {tabItems.slice(0, 2).map(renderTabItem)}
      </View>

      {children}

      {/* <View className="items-center flex-1 justify-center relative mx-5">
        <TouchableOpacity
          onPress={() => setIsAddMenuVisible(true)}
          className="absolute bottom-0 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          
            <Animated.View style={[animatedStyle]} className="w-full absolute inline-flex h-full  rounded-full bg-blue-500 opacity-75"/>
          
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View> */}

      <View className="flex-row justify-between flex-1">
        {tabItems.slice(2, 4).map(renderTabItem)}
      </View>
      <Modal
          animationType="fade"
          transparent={true}
          visible={isAddMenuVisible}
          onRequestClose={() => setIsAddMenuVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setIsAddMenuVisible(false)}
          >
            <Pressable className="bg-white rounded-t-3xl p-6">
              <View className="items-center mb-6">
                <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-xl font-bold text-gray-800">Create New Task</Text>
              </View>

              <TouchableOpacity
                onPress={handleNavigateToAddTask}
                className="flex-row items-center bg-blue-50 p-4 rounded-2xl mb-3"
              >
                <View className="bg-blue-500 w-12 h-12 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="create-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 text-lg font-semibold mb-1">
                    Create Manually
                  </Text>
                  <Text className="text-gray-600">
                    Add a new task with custom details
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNavigateToGenerateTask}
                className="flex-row items-center bg-blue-50 p-4 rounded-2xl mb-6"
              >
                <View className="bg-blue-500 w-12 h-12 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="flash-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 text-lg font-semibold mb-1">
                    Generate with AI
                  </Text>
                  <Text className="text-gray-600">
                    Let AI help you create a task
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsAddMenuVisible(false)}
                className="bg-gray-100 p-4 rounded-2xl"
              >
                <Text className="text-gray-600 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
    </View>
  );
};

export default TabBar;