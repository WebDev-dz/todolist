import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, useWindowDimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { Habit, useHabitStore } from '@/store/habitStore';
import Toast from 'react-native-toast-message';
import { addDays, differenceInBusinessDays, differenceInDays, differenceInWeeks, formatDate, isPast, isSameDay } from 'date-fns';
import TabBar from '@/components/TabBar';
import { Audio } from 'expo-av';



import WavableButton from '@/components/ui/waves-button';


const HabitsPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { height } = useWindowDimensions();
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/success.mp3')
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const { habits, markHabitAsComplete } = useHabitStore(h => h)
  const filteredHabits = habits.filter(habit => {
    if (selectedFrequency === 'all') return true;
    return habit.frequency === selectedFrequency;
  });


  const renderHabitCard = (habit: Habit) => {
    switch (habit.frequency) {
      case 'daily':
        return <DailyHabitCard {...habit} />;
      case 'weekly':
        return <WeeklyHabitCard {...habit} />;
      case 'monthly':
        return <MonthlyHabitCard {...habit} />;
      default:
        return <DailyHabitCard {...habit} />;
    }
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
        <Text className="text-white text-2xl font-bold mb-4">My Habits</Text>

        {/* Search Bar */}
        <View className={cn(
          "rounded-xl flex-row items-center px-4 py-2",
          isDarkMode ? "bg-gray-700" : "bg-white/20"
        )}>
          <Ionicons name="search-outline" size={20} color="white" />
          <TextInput
            className="flex-1 ml-2 text-white placeholder:text-white/70"
            placeholder="Search habits..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Habits List */}
      <ScrollView className="flex-1 px-4 mt-4">
        {filteredHabits.map(renderHabitCard)}
      </ScrollView>

      {/* Add Habit Button */}
      <TabBar >
        <View className="items-center flex-1 justify-center relative mx-5">
          <WavableButton
            className={cn(
              isDarkMode ? "bg-blue-600" : "bg-blue-500"
            )}
            onPress={() => router.push('/(sections)/habits/addHabit')} >
            <Ionicons name="add" size={30} color="white" />
          </WavableButton>
        </View>
      </TabBar>

      {/* <TabBar /> */}
    </SafeAreaView>
  );
};

const DailyHabitCard = (habit: Habit) => {
  const { isDarkMode } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const { markHabitAsComplete } = useHabitStore(h => h);

  const isCompletedToday = habit.completedDates.some(com =>
    isSameDay(new Date(com), new Date())
  );

  const renderCardCircles = () => {
    const datesNumber = differenceInDays(addDays(new Date(), 1).toDateString(), new Date(habit.createdAt).toDateString());

    console.log({ datesNumber })
    return (
      <View className="flex-row mt-2">
        {[...Array(Math.max(7, datesNumber))].map((_, index) => {
          const date = new Date(habit.createdAt);
          date.setDate(date.getDate() + index);
          const isCompleted = habit.completedDates.some(
            completedDate => isSameDay(new Date(completedDate), date)
          );

          return (
            <View key={index} className='flex-1'>
              <View
                className={cn(
                  "flex-1 aspect-square rounded-full mx-1 flex justify-center items-center",
                  isCompleted ? "bg-green-500" : isPast(date) ? "bg-red-500" : isDarkMode ? "bg-gray-700" : "bg-gray-200",
                )}
              >
                {isCompleted ? <Ionicons name="checkmark" size={30} color={"white"} /> : null}
              </View>
              <Text className={cn(isDarkMode ? "text-gray-300" : "text-gray-600")}>{formatDate(date, "MM-dd")}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Reuse the common card layout
  return <HabitCardLayout
    habit={habit}
    isCompleted={isCompletedToday}
    renderCircles={renderCardCircles}
  />;
};

const MonthlyHabitCard = (habit: Habit) => {
  const { isDarkMode } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const { markHabitAsComplete } = useHabitStore(h => h);

  const isCompletedThisMonth = habit.completedDates.some(com => {
    const completedDate = new Date(com);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() &&
      completedDate.getFullYear() === now.getFullYear();
  });

  const renderCardCircles = () => {
    const monthsNumber = differenceInDays(new Date(), habit.createdAt) / 30;
    return (
      <View className="flex-row mt-2">
        {[...Array(Math.max(7, Math.floor(monthsNumber)))].map((_, index) => {
          const date = new Date(habit.createdAt);
          date.setMonth(date.getMonth() + index);
          const isCompleted = habit.completedDates.some(completedDate => {
            const compDate = new Date(completedDate);
            return compDate.getMonth() === date.getMonth() &&
              compDate.getFullYear() === date.getFullYear();
          });

          return (
            <View key={index} className='flex-1'>
              <View
                className={cn(
                  "flex-1 aspect-square rounded-full mx-1 flex justify-center items-center",
                  isCompleted ? "bg-green-500" : isPast(date) ? "bg-red-500" : isDarkMode ? "bg-gray-700" : "bg-gray-200",
                )}
              >
                {isCompleted ? <Ionicons name="checkmark" size={30} color={"white"} /> : null}
              </View>
              <Text className={cn(isDarkMode ? "text-gray-300" : "text-gray-600")}>{formatDate(date, "MM-yy")}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return <HabitCardLayout
    habit={habit}
    isCompleted={isCompletedThisMonth}
    renderCircles={renderCardCircles}
  />;
};

// Common layout component to reduce code duplication
const HabitCardLayout = ({
  habit,
  isCompleted,
  renderCircles
}: {
  habit: Habit;
  isCompleted: boolean;
  renderCircles: () => JSX.Element;
}) => {
  const { isDarkMode } = useTheme();
  const { markHabitAsComplete } = useHabitStore(h => h);

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/success.mp3'));
      await sound.playAsync();
      await sound.unloadAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  return (
    <View
      key={habit.id}
      className={cn(
        "p-4 rounded-xl mb-4",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}
    >
      <View className="flex-row mb-3 gap-2">
        <View
          style={{ backgroundColor: habit.color }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
        >
          <Text className="text-xl">{habit.icon}</Text>
        </View>

        <View className="flex-1">
          <Text className={cn(
            "text-lg font-bold",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {habit.title}
          </Text>
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} • {habit.timeOfDay}
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center bg-orange-500/20 px-2 py-1 rounded-full">
            <Ionicons name="flame" size={16} color="#F97316" />
            <Text className="text-orange-500 ml-1 font-medium">
              {habit.streak}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className='w-full' horizontal={true}>
        {renderCircles()}
      </ScrollView>

      <TouchableOpacity
        disabled={isCompleted}
        onPress={async () => {
          Toast.show({
            text1: 'Habit marked as complete',
            type: 'success',
          });
          markHabitAsComplete(habit.id);
          await playSound();
        }}
        className={cn(
          "mt-3 p-2 rounded-xl flex-row items-center justify-center",
          isCompleted ?
            "bg-green-500/20" :
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
        )}
      >
        <Ionicons
          name={isCompleted ? "checkmark-circle" : "at-circle-outline"}
          size={20}
          color={isCompleted ? "#22C55E" : "#6B7280"}
        />
        <Text className={cn(
          "ml-2",
          isCompleted ? "text-green-500" : isDarkMode ? "text-gray-300" : "text-gray-600"
        )}>
          {isCompleted ? "Completed" : "Mark as Complete"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HabitsPage;






const WeeklyHabitCard = (habit: Habit) => {

  const { isDarkMode } = useTheme()
  const [sound, setSound] = useState<Audio.Sound | undefined>();

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/success.mp3')
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const { habits, markHabitAsComplete } = useHabitStore(h => h)

  const isCompletedThisWeek = habit.completedDates.some(com => (
    Math.abs(differenceInWeeks(new Date(), com)) < 1
  ))

  const renderCardCircles = (habit: Habit) => {


    const weeksNumber = differenceInWeeks(new Date(), habit.createdAt)

    return (<View className="flex-row mt-2">
      {[...Array(Math.max(7, weeksNumber))].map((_, index) => {
        const date = new Date(habit.createdAt);
        date.setDate(date.getDate() + (7 * index));

        const isCompleted = habit.completedDates.some(
          completedDate => Math.abs(differenceInDays(completedDate, date)) < 7
        );

        return (
          <View className='flex-1'>
            <View
              key={index}
              className={cn(
                "flex-1 aspect-square rounded-full mx-1 flex justify-center items-center",
                isCompleted ? "bg-green-500" : isPast(date) ? "bg-red-500" : isDarkMode ? "bg-gray-700" : "bg-gray-200",
              )}
            >
              {isCompleted ? <Ionicons name="checkmark" size={30} color={"white"} /> : <></>}
            </View>
            <Text className={cn(isDarkMode ? "text-gray-300" : "text-gray-600")}> {formatDate(date, "MM-dd")}</Text>
          </View>
        );
      })}
    </View>

    )
  }

  return (
    <View
      key={habit.id}
      // onPress={() => router.push(`/(sections)/habits/${habit.id}`)}
      className={cn(
        "p-4 rounded-xl mb-4",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}
    >
      <View className="flex-row  mb-3 gap-2">
        {/* Habit Icon */}
        <View
          style={{ backgroundColor: habit.color }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
        >
          <Text className="text-xl">{habit.icon}</Text>
        </View>

        {/* Habit Info */}
        <View className="flex-1">
          <Text className={cn(
            "text-lg font-bold",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {habit.title}
          </Text>
          <Text className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} • {habit.timeOfDay}
          </Text>
        </View>

        {/* Streak Badge */}
        <View className="items-end">
          <View className="flex-row items-center bg-orange-500/20 px-2 py-1 rounded-full">
            <Ionicons name="flame" size={16} color="#F97316" />
            <Text className="text-orange-500 ml-1 font-medium">
              {habit.streak}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Indicators */}
      <View className='w-full overflow-hidden'>

        <ScrollView showsHorizontalScrollIndicator={true} horizontal={true}>

          {renderCardCircles(habit)}
        </ScrollView>
      </View>


      {/* Today's Action */}
      <TouchableOpacity
        disabled={isCompletedThisWeek}
        onPress={async () => {
          Toast.show({
            text1: 'Habit marked as complete',
            type: 'success',
          });
          markHabitAsComplete(habit.id);


          try {
            await playSound()
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        }}
        className={cn(
          "mt-3 p-2 rounded-xl flex-row items-center justify-center",
          isCompletedThisWeek ?
            "bg-green-500/20" :
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
        )}
      >
        <Ionicons
          name={isCompletedThisWeek ? "checkmark-circle" : "circle-outline" as any}
          size={20}
          color={isCompletedThisWeek ? "#22C55E" : "#6B7280"}
        />
        <Text className={cn(
          "ml-2",
          isCompletedThisWeek ? "text-green-500" : isDarkMode ? "text-gray-300" : "text-gray-600"
        )}>
          {isCompletedThisWeek ? "Completed Today" : "Mark as Complete"}
        </Text>
      </TouchableOpacity>
    </View>

  )
}




