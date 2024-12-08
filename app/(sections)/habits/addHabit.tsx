import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
const daysOfWeek = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
] as const;

const AddHabitPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const addHabit = useHabitStore(state => state.addHabit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [category, setCategory] = useState(categories[0]);
  const [timeOfDay, setTimeOfDay] = useState<Habit['timeOfDay']>('anytime');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week');
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(), // In production, use UUID
      title: title.trim(),
      description: description.trim(),
      frequency,
      category,
      streak: 0,
      completedDates: [],
      timeOfDay,
      reminderTime: reminderTime?.toISOString(),
      startDate: new Date().toISOString(),
      color: selectedColor,
      icon: selectedIcon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weeklyDays: frequency === 'weekly' ? selectedDays : undefined,
    };

    try {
      await addHabit(newHabit);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
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
          New Habit
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

        {/* Weekly Days Selection - Only show when frequency is weekly */}
        {frequency === 'weekly' && (
          <View className="mb-4">
            <Text className={cn(
              "text-sm mb-2",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Days of Week
            </Text>
            <View className="flex-row justify-between">
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  className={cn(
                    "w-10 h-10 rounded-full items-center justify-center",
                    selectedDays.includes(day.id)
                      ? "bg-blue-500"
                      : isDarkMode
                        ? "bg-gray-800"
                        : "bg-white",
                    "border",
                    selectedDays.includes(day.id)
                      ? "border-blue-500"
                      : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                  )}
                >
                  <Text className={cn(
                    "text-sm font-medium",
                    selectedDays.includes(day.id)
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-900"
                  )}>
                    {day.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddHabitPage;
