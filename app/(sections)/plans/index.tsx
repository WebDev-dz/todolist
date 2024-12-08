import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, useWindowDimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { Plan, usePlanStore } from '@/store/planStore';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import TabBar from '@/components/TabBar';
import WavableButton from '@/components/ui/waves-button';

const PlansPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { height } = useWindowDimensions();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed'>('all');
  const { plans, togglePlanStatus } = usePlanStore(state => state);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = plans.filter(plan => {
    if (selectedStatus === 'all') return true;
    return plan.status === selectedStatus;
  });

  const renderPlanCard = (plan: Plan) => {
    const progress = plan.tasks.length > 0 
      ? (plan.tasks.filter(task => task.completed).length / plan.tasks.length) * 100 
      : 0;

    return (
      <TouchableOpacity
        key={plan.id}
        onPress={() => router.push(`/(sections)/plans/${plan.id}`)}
        className={cn(
          "p-4 rounded-xl mb-4",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}
      >
        <View className="flex-row justify-between items-center mb-3">
          {/* Plan Icon and Title */}
          <View className="flex-row items-center flex-1">
            <View 
              style={{ backgroundColor: plan.color }}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Text className="text-xl">{plan.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className={cn(
                "text-lg font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                {plan.title}
              </Text>
              <Text className={cn(
                "text-sm",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Due {format(new Date(plan.dueDate), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className={cn(
            "px-3 py-1 rounded-full",
            plan.status === 'completed' ? "bg-green-500/20" : "bg-blue-500/20"
          )}>
            <Text className={
              plan.status === 'completed' ? "text-green-500" : "text-blue-500"
            }>
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className={cn(
          "h-2 rounded-full mt-2",
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        )}>
          <View 
            style={{ width: `${progress}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
        </View>

        {/* Tasks Summary */}
        <View className="flex-row justify-between mt-3">
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {plan.tasks.filter(task => task.completed).length}/{plan.tasks.length} Tasks
          </Text>
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {progress.toFixed(0)}% Complete
          </Text>
        </View>

        {/* Toggle Status Button */}
        <TouchableOpacity
          onPress={() => {
            togglePlanStatus(plan.id);
            Toast.show({
              text1: `Plan marked as ${plan.status === 'completed' ? 'active' : 'completed'}`,
              type: 'success',
            });
          }}
          className={cn(
            "mt-3 p-2 rounded-xl flex-row items-center justify-center",
            plan.status === 'completed' ? 
              "bg-green-500/20" : 
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
          )}
        >
          <Ionicons 
            name={plan.status === 'completed' ? "checkmark-circle" : "circle-outline" as any} 
            size={20} 
            color={plan.status === 'completed' ? "#22C55E" : "#6B7280"} 
          />
          <Text className={cn(
            "ml-2",
            plan.status === 'completed' ? "text-green-500" : isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {plan.status === 'completed' ? "Completed" : "Mark as Complete"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={cn(
      'h-screen mt-11',
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
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold mb-4">My Plans</Text>

          {/* Search Bar */}
          <View className={cn(
            "rounded-xl flex-row items-center px-4 py-2",
            isDarkMode ? "bg-gray-700" : "bg-white/20"
          )}>
            <Ionicons name="search-outline" size={20} color="white" />
            <TextInput
              className="flex-1 ml-2 text-white placeholder:text-white/70"
              placeholder="Search tasks..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

      {/* Plans List */}
      <ScrollView className="flex-1 px-4 mt-4">
        {filteredPlans.map(renderPlanCard)}
      </ScrollView>

      {/* Add Plan Button */}
      <WavableButton
        onPress={() => router.push('/(sections)/plans/addPlan')}
        className={cn(
          "absolute bottom-6 right-6 w-14 h-14 rounded-full justify-center items-center",
          isDarkMode ? "bg-blue-600" : "bg-blue-500"
        )}
      >
        <Ionicons name="add" size={30} color="white" />
      </WavableButton>
      <TabBar />
    </SafeAreaView>
  );
};

export default PlansPage;
