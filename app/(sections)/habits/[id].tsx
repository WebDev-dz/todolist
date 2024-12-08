import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { useHabitStore, Habit } from '@/store/habitStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const frequencies = ['daily', 'weekly', 'monthly'] as const;
const timeOfDayOptions = ['morning', 'afternoon', 'evening', 'anytime'] as const;
const categories = ['Health', 'Productivity', 'Learning', 'Fitness', 'Mindfulness', 'Other'];
const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];
const icons = ['🏃‍♂️', '📚', '🧘‍♂️', '💪', '🎯', '✍️', '💡', '🎨'];

export default function HabitDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { habits, updateHabit, deleteHabit } = useHabitStore();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [category, setCategory] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<Habit['timeOfDay']>('anytime');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  useEffect(() => {
    const foundHabit = habits.find(h => h.id === id);
    if (foundHabit) {
      setHabit(foundHabit);
      setTitle(foundHabit.title);
      setDescription(foundHabit.description);
      setFrequency(foundHabit.frequency);
      setCategory(foundHabit.category);
      setTimeOfDay(foundHabit.timeOfDay || 'anytime');
      setReminderTime(foundHabit.reminderTime ? new Date(foundHabit.reminderTime) : undefined);
      setSelectedColor(foundHabit.color);
      setSelectedIcon(foundHabit.icon);
    }
  }, [id, habits]);

  const handleSave = async () => {
    if (!habit) return;

    const updatedHabit: Habit = {
      ...habit,
      title: title.trim(),
      description: description.trim(),
      frequency,
      category,
      timeOfDay,
      reminderTime: reminderTime?.toISOString(),
      color: selectedColor,
      icon: selectedIcon,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateHabit(updatedHabit);
      Alert.alert('Success', 'Habit updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(id);
              Alert.alert('Success', 'Habit deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          }
        },
      ]
    );
  };

  if (!habit) {
    return (
      <SafeAreaView className={cn(
        "flex-1 justify-center items-center",
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      )}>
        <Text className={cn(
          "text-lg",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          Habit not found
        </Text>
      </SafeAreaView>
    );
  }

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
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <Text className={cn(
          "text-lg font-bold",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          Edit Habit
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
            placeholder="Enter habit title"
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

        {/* Frequency Selection */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Frequency
          </Text>
          <View className="flex-row flex-wrap">
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => setFrequency(freq)}
                className={cn(
                  "px-4 py-2 rounded-full mr-2 mb-2",
                  frequency === freq
                    ? "bg-blue-500"
                    : isDarkMode
                    ? "bg-gray-800"
                    : "bg-white"
                )}
              >
                <Text
                  className={cn(
                    "capitalize",
                    frequency === freq
                      ? "text-white"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-900"
                  )}
                >
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time of Day */}
        <View className="mb-4">
          <Text className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Time of Day
          </Text>
          <View className="flex-row flex-wrap">
            {timeOfDayOptions.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setTimeOfDay(time)}
                className={cn(
                  "px-4 py-2 rounded-full mr-2 mb-2",
                  timeOfDay === time
                    ? "bg-blue-500"
                    : isDarkMode
                    ? "bg-gray-800"
                    : "bg-white"
                )}
              >
                <Text
                  className={cn(
                    "capitalize",
                    timeOfDay === time
                      ? "text-white"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-900"
                  )}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder Time */}
        <TouchableOpacity
          onPress={() => setShowReminderPicker(true)}
          className={cn(
            "mb-4 p-3 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
        >
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Reminder Time
          </Text>
          <Text className={cn(
            "text-base mt-1",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {reminderTime ? format(reminderTime, 'h:mm a') : 'Set reminder time'}
          </Text>
        </TouchableOpacity>

        {showReminderPicker && (
          <DateTimePicker
            value={reminderTime || new Date()}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => {
              setShowReminderPicker(false);
              if (date) setReminderTime(date);
            }}
          />
        )}

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

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-500 p-3 rounded-xl mt-4"
        >
          <Text className="text-white text-center font-semibold">Delete Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}