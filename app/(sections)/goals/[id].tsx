// app/(sections)/goals/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, useWindowDimensions, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { Goal, useGoalStore } from '@/store/goalStore';
import DateTimePicker from '@react-native-community/datetimepicker';
// import ProgressCircle from '@/components/ProgressCircle';

// Types (consider moving to a separate types file)
interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: Date;
}



// Mock data (replace with actual data fetching)


const GoalDetailsPage: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { height } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const { getGoalById, refreshGoals, updateGoal, deleteGoal } = useGoalStore();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGoals();
    } catch (error) {
      console.error('Error refreshing goals:', error);
      Alert.alert('Refresh Failed', 'Failed to refresh goals');
    } finally {
      setRefreshing(false);
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Goal | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const foundGoal = await getGoalById(id);

        if (!foundGoal) {
          throw new Error('Goal not found');
        }

        setGoal(foundGoal);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoal();
  }, [id, getGoalById]);

  useEffect(() => {
    if (goal) {
      setEditedGoal(goal);
    }
  }, [goal]);

  const handleSave = () => {
    if (editedGoal) {
      updateGoal(editedGoal);
      setIsEditing(false);
      setGoal(editedGoal);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteGoal(goal!.id);
            router.back();
          }
        }
      ]
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className={cn(
        'flex-1 justify-center items-center',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      )}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#60A5FA' : '#3B82F6'}
        />
        <Text className={cn(
          'mt-4 text-base',
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        )}>
          Loading goal...
        </Text>
      </SafeAreaView>
    );
  }

  // Error State
  if (error || !goal) {
    return (
      <SafeAreaView className={cn(
        'flex-1 pt-11',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      )}>
        <View className={cn(
          "pt-11 pb-6 px-4",
          isDarkMode ? "bg-gray-800" : "bg-blue-500"
        )}>
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              Goal Not Found
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-4">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDarkMode ? '#60A5FA' : '#3B82F6'}
          />
          <Text className={cn(
            'text-xl font-bold mt-4 mb-2 text-center',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Oops! Goal Not Found
          </Text>
          <Text className={cn(
            'text-base mb-8 text-center',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}>
            {error || "The goal you're looking for doesn't exist or was deleted."}
          </Text>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className={cn(
                'px-6 py-3 rounded-xl',
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              )}
            >
              <Text className={cn(
                'font-medium',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}>
                Go Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(sections)/goals')}
              className="bg-blue-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">
                View All Goals
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render goal details if everything is OK
  return (
    <SafeAreaView className={cn(
      'mt-11 h-screen',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      {/* Header */}
      <View className={cn(
        "pt-8 pb-3 px-4",
        isDarkMode ? "bg-blue-600" : "bg-blue-500"
      )}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                value={editedGoal?.title}
                onChangeText={(text) => setEditedGoal(prev => prev ? {...prev, title: text} : prev)}
                className="text-white text-2xl font-bold"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            ) : (
              <Text className="text-white text-2xl font-bold">{goal.title}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            className="ml-4"
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[isDarkMode ? '#60A5FA' : '#3B82F6']}
          tintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
          title="Pull to refresh"
          titleColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
        />
      }>


        {/* Goal Details */}
        <View className="px-4 py-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              {isEditing ? (
                <TextInput
                  value={editedGoal?.category.label}
                  onChangeText={(text) => setEditedGoal(prev => 
                    prev ? {...prev, category: {...prev.category, label: text}} : prev
                  )}
                  className={cn(
                    "text-lg font-semibold mb-1",
                    isDarkMode ? "text-white" : "text-gray-800"
                  )}
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              ) : (
                <Text className={cn(
                  "text-lg font-semibold mb-1",
                  isDarkMode ? "text-white" : "text-gray-800"
                )}>
                  {goal.category.label}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => isEditing && setShowDatePicker(true)}
                disabled={!isEditing}
              >
                <Text className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Due: {new Date(editedGoal?.deadline || goal.deadline).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              Description
            </Text>
            {isEditing ? (
              <TextInput
                value={editedGoal?.description}
                onChangeText={(text) => setEditedGoal(prev => 
                  prev ? {...prev, description: text} : prev
                )}
                multiline
                className={cn(
                  "text-base",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}
                placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <Text className={cn(
                "text-base",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                {goal.description}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              Milestones
            </Text>
            {editedGoal?.milestones.map((milestone, index) => (
              <View key={milestone.id} className="flex-row items-center mb-2">
                <TouchableOpacity
                  onPress={() => {
                    if (isEditing) {
                      setEditedGoal(prev => {
                        if (!prev) return prev;
                        const newMilestones = [...prev.milestones];
                        newMilestones[index] = {
                          ...newMilestones[index],
                          isCompleted: !newMilestones[index].isCompleted
                        };
                        return {...prev, milestones: newMilestones};
                      });
                    }
                  }}
                  disabled={!isEditing}
                  className={cn(
                    "w-6 h-6 rounded-full mr-3 items-center justify-center",
                    milestone.isCompleted ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  {milestone.isCompleted && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  {isEditing ? (
                    <TextInput
                      value={milestone.title}
                      onChangeText={(text) => {
                        setEditedGoal(prev => {
                          if (!prev) return prev;
                          const newMilestones = [...prev.milestones];
                          newMilestones[index] = {...newMilestones[index], title: text};
                          return {...prev, milestones: newMilestones};
                        });
                      }}
                      className={cn(
                        "text-base",
                        isDarkMode ? "text-white" : "text-gray-800"
                      )}
                    />
                  ) : (
                    <Text className={cn(
                      "text-base",
                      isDarkMode ? "text-white" : "text-gray-800",
                      milestone.isCompleted && "line-through"
                    )}>
                      {milestone.title}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-white" : "text-gray-800"
            )}>
              Notes
            </Text>
            {isEditing ? (
              <TextInput
                value={editedGoal?.notes}
                onChangeText={(text) => setEditedGoal(prev => 
                  prev ? {...prev, notes: text} : prev
                )}
                multiline
                className={cn(
                  "text-base",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}
                placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <Text className={cn(
                "text-base",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                {goal.notes}
              </Text>
            )}
          </View>


        </View>
      </ScrollView>
      <View className="flex-row justify-between py-3 px-4">
        <TouchableOpacity
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          className={cn(
            "px-6 py-3 rounded-xl flex-1 mr-2",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
        >
          <Text className={cn(
            "text-center font-medium",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {isEditing ? "Save Changes" : "Edit Goal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-500 px-6 py-3 rounded-xl flex-1 ml-2"
        >
          <Text className="text-white text-center font-medium">
            Delete Goal
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(editedGoal?.deadline || Date.now())}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setEditedGoal(prev => 
                prev ? {...prev, deadline: selectedDate.toISOString()} : prev
              );
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default GoalDetailsPage;