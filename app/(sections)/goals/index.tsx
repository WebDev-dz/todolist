// app/(sections)/goals/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { Milestone, useGoalStore } from '@/store/goalStore';
import TabBar from '@/components/TabBar';
import WavableButton from '@/components/ui/waves-button';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

// You might want to move this to a store like your tasks
interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  progress: number;
  category: string;
  status: 'not-started' | 'in-progress' | 'completed';
  milestones: Milestone[];
}

const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Learn React Native',
    description: 'Master React Native development including navigation and state management',
    deadline: new Date('2024-12-31'),
    progress: 65,
    category: 'Career',
    status: 'in-progress',
    milestones: []
  },
  {
    id: '2',
    title: 'Run a Marathon',
    description: 'Train and complete a full marathon',
    deadline: new Date('2024-06-30'),
    progress: 30,
    category: 'Health',
    status: 'in-progress',
    milestones: []
  },
  // Add more sample goals as needed
];

const GoalsPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { height } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const { goals } = useGoalStore()
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'not-started':
        return '#6B7280';
      case 'in-progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (selectedFilter === 'all') return true;
    return goal.status === selectedFilter;
  });

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);

    // If no goals are selected, exit selection mode
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleBulkComplete = () => {
    selectedGoals.forEach(goalId => {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        useGoalStore.getState().markGoalAsComplete(goal.id)
        setSelectedGoals(new Set());
        setIsSelectionMode(false);
      }
    })
  };

  const handleDeleteConfirm = () => {
    selectedGoals.forEach(goalId => {
      useGoalStore.getState().deleteGoal(goalId);
    });
    setIsDeleteModalVisible(false);
    setSelectedGoals(new Set());
    setIsSelectionMode(false);
  };

  return (
    <SafeAreaView style={{ height }} className={cn(
      'mt-11',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      {/* Header */}
      <View className={cn(
        "pt-11 pb-6 px-4",
        isDarkMode ? "bg-gray-800" : "bg-blue-500"
      )}>
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Goals</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <View className="flex-row justify-around mt-4">
          {['all', 'in-progress', 'completed'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter as any)}
              className={cn(
                "px-4 py-2 rounded-full",
                selectedFilter === filter ?
                  (isDarkMode ? "bg-blue-600" : "bg-blue-600") :
                  "bg-transparent"
              )}
            >
              <Text className={cn(
                "capitalize",
                selectedFilter === filter ? "text-white" : "text-white/70"
              )}>
                {filter.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goals List */}
      <ScrollView className="flex-1 px-4 mt-4">
        {filteredGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            onPress={() => {
              if (isSelectionMode) {
                toggleGoalSelection(goal.id);
              } else {
                router.push(`/(sections)/goals/${goal.id}`);
              }
            }}
            onLongPress={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                toggleGoalSelection(goal.id);
              }
            }}
            className={cn(
              "p-4 rounded-xl mb-4",
              isDarkMode ? "bg-gray-800" : "bg-white",
              selectedGoals.has(goal.id) && (isDarkMode ? "border-2 border-blue-500" : "border-2 border-blue-500")
            )}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className={cn(
                  "text-lg font-bold mb-1",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  {goal.title}
                </Text>
                <Text className={cn(
                  "text-sm mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  {goal.description}
                </Text>
              </View>
              <View
                style={{ backgroundColor: getStatusColor(goal.status) }}
                className="px-3 py-1 rounded-full ml-2"
              >
                <Text className="text-white text-xs capitalize">
                  {goal.status.replace('-', ' ')}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-2">
              <View className="flex-row justify-between mb-1">
                <Text className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Progress
                </Text>
                <Text className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  {goal.progress}%
                </Text>
              </View>
              <View className={cn(
                "h-2 rounded-full",
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              )}>
                <View
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: getStatusColor(goal.status)
                  }}
                  className="h-full rounded-full"
                />
              </View>
            </View>

            {/* Deadline */}
            <View className="flex-row items-center mt-3">
              <Ionicons
                name="calendar-outline"
                size={16}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
              />
              <Text className={cn(
                "ml-1 text-sm",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Due {new Date(goal.deadline).toLocaleDateString()}
              </Text>
            </View>

            {/* Milestones */}
            <View className="mt-3">
              {goal.milestones.length > 0 && (
                <>
                  <Text className={cn(
                    "text-sm font-semibold mb-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Milestones ({goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length})
                  </Text>
                  {goal.milestones.map((milestone) => (
                    <View key={milestone.id} className="flex-row items-center mb-2">
                      <TouchableOpacity
                        onPress={() => useGoalStore.getState().toggleMilestone(goal.id, milestone.id)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 mr-2 items-center justify-center",
                          milestone.isCompleted
                            ? (isDarkMode ? "bg-blue-600 border-blue-600" : "bg-blue-500 border-blue-500")
                            : (isDarkMode ? "border-gray-600" : "border-gray-400")
                        )}
                      >
                        {milestone.isCompleted && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </TouchableOpacity>
                      <Text className={cn(
                        "text-sm flex-1",
                        milestone.isCompleted
                          ? (isDarkMode ? "text-gray-500 line-through" : "text-gray-400 line-through")
                          : (isDarkMode ? "text-gray-300" : "text-gray-700")
                      )}>
                        {milestone.title}
                      </Text>
                      {milestone.dueDate && (
                        <Text className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        )}>
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>



      {isSelectionMode && (
        <View className={cn(
          "absolute top-0 left-0 right-0 p-4 flex-row justify-around border-t",
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedGoals(new Set());
              }}
              className="mr-4"
            >
              <Ionicons name="close" size={24} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
            <Text className={isDarkMode ? "text-white" : "text-black"}>
              {selectedGoals.size} selected
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleBulkComplete}
            className={cn(
              "px-6 py-2 rounded-full",
              isDarkMode ? "bg-blue-600" : "bg-blue-500"
            )}
          >
            <Text className="text-white">Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsDeleteModalVisible(true);
            }}
            className="bg-red-500 px-6 py-2 rounded-full"
          >
            <Text className="text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <TabBar>
        {/* Add Goal Button */}
        <View className="items-center flex-1 justify-center relative mx-5">

        <WavableButton
          onPress={() => { router.push('/(sections)/goals/addGoal') }}
          className={cn(
            "w-14 h-14 rounded-full justify-center items-center",
            isDarkMode ? "bg-blue-600" : "bg-blue-500"
          )}
        >
          <Ionicons name="add" size={30} color="white" />
        </WavableButton>
        </View>
      </TabBar>

      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goals"
        message={`Are you sure you want to delete these ${selectedGoals.size} goals? This action cannot be undone.`}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

export default GoalsPage;
