// app/(sections)/goals/addGoal.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGoalStore, Goal, Milestone } from '@/store/goalStore';
import { Category, useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/ThemeProvider';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import crypto from"crypto"
const AddGoalPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | undefined>();
  const [deadline, setDeadline] = useState(new Date());
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id'>[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(false);
  const [currentMilestoneDate, setCurrentMilestoneDate] = useState<Date | undefined>();
  const categories = useTaskStore(state => state.categories);

  // Get addGoal function from store
  const addGoal = (goal: Omit<Goal, 'id' | 'progress'>) =>
    useGoalStore.setState((state) => ({
      goals: [...state.goals, {
        ...goal,
        id: (new Date().getTime()).toString(),
        progress: 0,
      }]
    }));

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) {
      Alert.alert('Error', 'Please enter a milestone title');
      return;
    }

    setMilestones([
      ...milestones,
      {
        title: newMilestone,
        isCompleted: false,
        dueDate: currentMilestoneDate,
      }
    ]);
    setNewMilestone('');
    setCurrentMilestoneDate(undefined);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !description || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addGoal({
      title,
      description,
      createdAt: new Date().toISOString(),
      notes: "",
      category,
      deadline: deadline.toISOString(),
      status: 'not-started',
      milestones: milestones.map(m => ({ ...m, id: `${(new Date()).getTime()}` })),
    });

    router.back();
  };

  return (
    <View className={cn(
      'flex-1',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      {/* Header */}
      <View className={cn(
        "pt-11 pb-6 px-4",
        isDarkMode ? "bg-gray-800" : "bg-blue-500"
      )}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Add New Goal</Text>
          <View style={{ width: 24 }} /> 
        </View>
      </View>

      <ScrollView className="p-4">
        <View className="space-y-4">
          <View>
            <Text className={cn(
              'text-sm mb-1',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              className={cn(
                'p-3 rounded-xl',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
              )}
              placeholder="Enter goal title"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
          </View>

          <View>
            {/* <Text className={cn(
              'text-sm mb-1',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              Description
            </Text> */}
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className={cn(
                'p-3 rounded-xl',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
              )}
              placeholder="Enter goal description"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
          </View>

          <View>
            <Text className={cn(
              'text-sm mb-1',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              Category
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-2"
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    category === cat 
                      ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500')
                      : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                  )}
                >
                  <Text className={cn(
                    category === cat ? 'text-white' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  )}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
              {deadline ? format(deadline, 'h:mm a') : 'Set reminder time'}
            </Text>
          </TouchableOpacity>

          {/* {showReminderPicker ? (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time"
              is24Hour={false}
              onChange={(event, date) => {
                setShowReminderPicker(false);
                if (date) setDeadline(date);
              }}
            />
          ) : <></>} */}

          {/* Milestones Section */}
          <View>
            <Text className={cn(
              'text-lg font-semibold mb-2',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              Milestones
            </Text>

            {/* Add Milestone Input */}
            <View className="flex-row items-center mb-2">
              <TextInput
                value={newMilestone}
                onChangeText={setNewMilestone}
                placeholder="Add a milestone"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                className={cn(
                  'flex-1 p-3 rounded-xl mr-2',
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                )}
              />
              <TouchableOpacity
                onPress={() => setShowMilestoneDatePicker(true)}
                className="p-3 rounded-xl mr-2 bg-gray-700"
              >
                <Ionicons name="calendar-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMilestone}
                className="bg-blue-500 p-3 rounded-xl"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Milestones List */}
            {milestones.map((milestone, index) => (
              <View key={index} className={cn(
                "flex-row items-center justify-between p-3 rounded-xl mb-2",
                isDarkMode ? "bg-gray-800" : "bg-white"
              )}>
                <View className="flex-1">
                  <Text className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {milestone.title}
                  </Text>
                  {milestone.dueDate ? (
                    <Text className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Due: {format(milestone.dueDate, 'MMM d, yyyy')}
                    </Text>
                  ) : <></>}
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMilestone(index)}
                  className="ml-2"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {showMilestoneDatePicker ? (
            <View>
              <Text>
                <DateTimePicker
                  value={currentMilestoneDate || new Date()}
                  mode="date"
                  onChange={(event, date) => {
                    setShowMilestoneDatePicker(false);
                    if (date) setCurrentMilestoneDate(date);
                  }}
                  minimumDate={new Date()}
                />
              </Text>
            </View>
          ) : <></>}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className={cn(
              'mt-6 p-4 rounded-xl',
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            )}
          >
            <Text className="text-white text-center font-semibold">
              Create Goal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddGoalPage;
