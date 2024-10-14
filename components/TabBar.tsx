import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Href, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const tabItems = [
  { href: '/(tabs)/', icon: 'home', label: 'Home' },
  { href: '/calendar', icon: 'calendar', label: 'Calendar' },
  { href: '/(tabs)/addTask', icon: 'add-circle', label: 'Add Task' },
  { href: '/(tabs)/profile', icon: 'person', label: 'Profile' },
];

const TabBar: React.FC = ({ }) => {
  const router = useRouter();
  const currentPath = usePathname();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const renderTabItem = (item: TabItem, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => router.push(item.href)}
      className="items-center"
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={currentPath === item.href ? '#8B5CF6' : '#4B5563'}
      />
      {item.label && (
        <Animated.Text
          className={`text-xs mt-1 ${currentPath === item.href ? 'text-purple-600' : 'text-gray-600'
            }`}
        >
          {item.label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-row bg-white py-3 px-5 justify-between items-center">
      <View className="flex-row justify-between flex-1">
        {tabItems.slice(0, 2).map(renderTabItem)}
      </View>

      <View className="items-center rel justify-center mx-5">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/addTask')}
          className="bg-purple-600 relative w-15 h-15 rounded-full justify-center items-center shadow-md"
        >
          
            <View className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></View>
          
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between flex-1">
        {tabItems.slice(2, 4).map(renderTabItem)}
      </View>
    </View>
  );
};

export default TabBar;