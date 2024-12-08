import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  badge?: number;
  isDarkMode?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  badge,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={toggleExpand}
        className={cn(
          "flex-row items-center justify-between p-4 rounded-t-xl",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}
      >
        <View className="flex-row items-center">
          <Text className={cn(
            "text-lg font-semibold",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {title}
          </Text>
          {badge !== undefined && badge > 0 && (
            <View className={cn(
              "ml-2 px-2 py-0.5 rounded-full",
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            )}>
              <Text className={cn(
                "text-sm",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDarkMode ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View className={cn(
          "px-2 py-1 rounded-b-xl",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          {children}
        </View>
      )}
    </View>
  );
};

export default Accordion;
