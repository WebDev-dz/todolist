import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { usePlanStore } from '@/store/planStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const categories = ['Personal', 'Work', 'Health', 'Education', 'Finance', 'Other'];
const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];
const icons = ['📝', '💼', '🎯', '📚', '💰', '✨', '📅', '⭐'];

const AddPlanPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const addPlan = usePlanStore(state => state.addPlan);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a plan title');
      return;
    }

    try {
      await addPlan({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        color: selectedColor,
        icon: selectedIcon,
        tasks: [],
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create plan');
    }
  };

  return (
    <SafeAreaView className={cn(
      "flex-1 mt-11",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      {/* Header */}
      <View className={cn(
        "p-4 flex-row items-center justify-between",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons 
            name="close" 
            size={24} 
            color={isDarkMode ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <Text className={cn(
          "text-lg font-bold",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          New Plan
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-blue-500 font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Title Input */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-1",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter plan title"
            placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
            className={cn(
              "p-3 rounded-xl",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            )}
          />
        </View>

        {/* Description Input */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-1",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
            className={cn(
              "p-3 rounded-xl",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            )}
          />
        </View>

        {/* Due Date */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className={cn(
            "mb-4 p-3 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
        >
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Due Date
          </Text>
          <Text className={cn(
            "text-base mt-1",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {format(dueDate, 'MMM d, yyyy')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Category Selection */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Category
          </Text>
          <View className="flex-row flex-wrap">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full mr-2 mb-2",
                  category === cat
                    ? "bg-blue-500"
                    : isDarkMode
                    ? "bg-gray-800"
                    : "bg-white"
                )}
              >
                <Text
                  className={cn(
                    category === cat
                      ? "text-white"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-900"
                  )}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Color
          </Text>
          <View className="flex-row flex-wrap">
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={cn(
                  "w-10 h-10 rounded-full mr-2 mb-2",
                  selectedColor === color ? "border-2 border-white" : ""
                )}
              />
            ))}
          </View>
        </View>

        {/* Icon Selection */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Icon
          </Text>
          <View className="flex-row flex-wrap">
            {icons.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={cn(
                  "w-10 h-10 rounded-xl mr-2 mb-2 items-center justify-center",
                  selectedIcon === icon
                    ? "bg-blue-500"
                    : isDarkMode
                    ? "bg-gray-800"
                    : "bg-white"
                )}
              >
                <Text className="text-2xl">{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPlanPage;
