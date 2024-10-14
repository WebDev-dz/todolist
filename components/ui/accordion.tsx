import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo-vector-icons
import { styled } from 'nativewind';


const Accordion = ({ children }) => {
  return <View className="w-full">{children}</View>;
};

const AccordionItem = ({ children }) => {
  return <View className="border-b border-gray-200">{children}</View>;
};

const AccordionTrigger = ({ children, onPress, isOpen }) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center py-4"
      onPress={onPress}
    >
      <Text className="text-sm font-medium">{children}</Text>
      <Animated.View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
        <Ionicons name="chevron-down" size={24} color="#666" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const AccordionContent = ({ children, isOpen }) => {
  const [height] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(height, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  return (
    <Animated.View
      className="overflow-hidden"
      style={{
        opacity: height,
        height: height.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100], // Adjust this value based on your content
        }),
      }}
    >
      <View className="pb-4">{children}</View>
    </Animated.View>
  );
};

const AccordionExample = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Accordion>
      {[0, 1, 2].map((index) => (
        <AccordionItem key={index}>
          <AccordionTrigger
            onPress={() => toggleAccordion(index)}
            isOpen={openIndex === index}
          >
            Accordion Item {index + 1}
          </AccordionTrigger>
          <AccordionContent isOpen={openIndex === index}>
            <Text className="text-sm text-gray-600">
              This is the content for accordion item {index + 1}. You can put any components or text here.
            </Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionExample };
