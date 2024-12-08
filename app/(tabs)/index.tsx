import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useHabitStore } from '@/store/habitStore';
import { useGoalStore } from '@/store/goalStore';
import { useTaskStore } from '@/store/taskStore';
import TabBar from '@/components/TabBar';

const SectionsPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const habits = useHabitStore(state => state.habits);
  const goals = useGoalStore(state => state.goals);
  const tasks = useTaskStore(state => state.tasks);
  const screenWidth = Dimensions.get('window').width;

  // Calculate statistics
  const getHabitStats = () => {
    const totalHabits = habits.length;
    const completedDays = habits.map(h => h.completedDates.map(d => d.split("T")[0]))

    console.log({completedDays})
    const completedToday = completedDays.filter(habit => 
      habit.includes((new Date().toISOString()).split("T")[0])
    ).length;
    const incompletedToday = totalHabits - completedToday;
    
    return [
      {
        name: "Completed",
        population: completedToday,
        color: isDarkMode ? "#8B5CF6" : "#6D28D9",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      },
      {
        name: "Remaining",
        population: incompletedToday,
        color: isDarkMode ? "#374151" : "#E5E7EB",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      }
    ];
  };

  const getGoalStats = () => {
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const inProgressGoals = goals.filter(goal => goal.status === 'in-progress').length;
    const notStartedGoals = goals.filter(goal => goal.status === 'not-started').length;
    
    return [
      {
        name: "Completed",
        population: completedGoals,
        color: "#10B981",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      },
      {
        name: "In Progress",
        population: inProgressGoals,
        color: "#3B82F6",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      },
      {
        name: "Not Started",
        population: notStartedGoals,
        color: "#6B7280",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      }
    ];
  };

  // Data for category chart
  const getCategoryData = () => {
    const categories = goals.reduce((acc, goal) => {
      acc[goal.category.label] = (acc[goal.category.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    };
  };

  const getTaskStats = () => {
    const completedTasks = tasks.filter(task => task.completed ).length;
    const inProgressTasks = tasks.filter(task => !task.completed ).length;
    // const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    
    return [
      {
        name: "Completed",
        population: completedTasks,
        color: "#10B981",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      },
      {
        name: "In Progress",
        population: inProgressTasks,
        color: "#3B82F6",
        legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      },
      // {
      //   name: "Pending",
      //   population: pendingTasks,
      //   color: "#F59E0B",
      //   legendFontColor: isDarkMode ? "#D1D5DB" : "#4B5563",
      // }
    ];
  };

  const getTaskPriorityData = () => {
    const priorities = tasks.reduce((acc, task) => {
      const key = task.category?.label || "Not Categorized"
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(priorities),
      datasets: [{
        data: Object.values(priorities)
      }]
    };
  };

  const chartConfig = {
    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
    backgroundGradientFrom: isDarkMode ? "#1F2937" : "#FFFFFF",
    backgroundGradientTo: isDarkMode ? "#1F2937" : "#FFFFFF",
    color: (opacity = 1) => isDarkMode ? `rgba(209, 213, 219, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(209, 213, 219, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  const sections = [
    {
      id: 'tasks',
      title: 'Tasks',
      icon: 'checkbox-outline',
      color: '#3B82F6',
      count: 12
    },
    {
      id: 'goals',
      title: 'Goals',
      icon: 'flag-outline',
      color: '#10B981',
      count: goals.length
    },
    {
      id: 'habits',
      title: 'Habits',
      icon: 'repeat-outline',
      color: '#8B5CF6',
      count: habits.length
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: 'calendar-outline',
      color: '#F59E0B',
      count: 3
    }
  ];

  return (
    <SafeAreaView className={cn(
      'flex-1 pt-11',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      {/* Header */}
      <View className={cn(
        "pt-11 pb-6 px-4",
        isDarkMode ? "bg-gray-800" : "bg-blue-500"
      )}>
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Overview</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="p-4">
        {/* Quick Actions */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {sections.map(section => (
            <TouchableOpacity
              key={section.id}
              onPress={() => router.push(`/(sections)/${section.id}` as Href<string>)}
              className={cn(
                "w-[48%] p-4 rounded-xl mb-4",
                isDarkMode ? "bg-gray-800" : "bg-white"
              )}
            >
              <View className="flex-row justify-between items-center mb-2">
                <View
                  style={{ backgroundColor: section.color }}
                  className="p-2 rounded-full"
                >
                  <Ionicons name={section.icon as any} size={24} color="white" />
                </View>
                <Text className={cn(
                  "text-2xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-800"
                )}>
                  {section.count}
                </Text>
              </View>
              <Text className={cn(
                "text-lg font-semibold",
                isDarkMode ? "text-gray-200" : "text-gray-800"
              )}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Charts Row */}
        <View className="mb-6 space-y-4">
          {/* Habits Progress */}
          <View className={cn(
            "p-4 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Habits Today
            </Text>
            <PieChart
              data={getHabitStats()}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Goals Progress */}
          <View className={cn(
            "p-4 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Goals Status
            </Text>
            <PieChart
              data={getGoalStats()}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Tasks Progress */}
          <View className={cn(
            "p-4 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Tasks Status
            </Text>
            <PieChart
              data={getTaskStats()}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Tasks by Priority */}
          <View className={cn(
            "p-4 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <Text className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Tasks by Priority
            </Text>
            <BarChart
              data={getTaskPriorityData()}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              yAxisLabel=""
              yAxisSuffix=""
              verticalLabelRotation={30}
              showValuesOnTopOfBars
              fromZero
            />
          </View>
        </View>

        {/* Category Chart */}
        <View className={cn(
          "p-4 rounded-xl mb-6",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <Text className={cn(
            "text-lg font-semibold mb-4",
            isDarkMode ? "text-gray-200" : "text-gray-800"
          )}>
            Goals by Category
          </Text>
          <BarChart
            data={getCategoryData()}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            verticalLabelRotation={30}
            showValuesOnTopOfBars
            fromZero
          />
        </View>

        
      </ScrollView>
      <TabBar />

    </SafeAreaView>
  );
};

export default SectionsPage;
