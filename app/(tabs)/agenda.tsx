import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addDays, addWeeks, format, isSameMonth, parseISO, subDays } from 'date-fns';
import { Task, useTaskStore } from '@/store/taskStore';
import Swiper from 'react-native-swiper';
import { useTheme } from '@/hooks/ThemeProvider';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TabBar from '@/components/TabBar';
import { Calendar } from '@/components/ui/calendar';
import { Agenda } from 'react-native-calendars';
import { hasTasksOnDate } from '@/lib/utils';

const HOUR_HEIGHT = 64;
const TIME_COLUMN_WIDTH = 64;
const windowWidth = Dimensions.get('window').width;

const AgendaPage: React.FC = () => {
  const { tasks, updateTask } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const { isDarkMode } = useTheme();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(direction === 'next' ? 1 : -1);
    }
  };


  console.log({tasks: tasks.filter(task => task.startDate === selectedDate.toISOString().split('T')[0]), selectedDate})

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(direction === 'next' ? 1 : -1);
    }
  };

  const hours = Array.from({ length: 24 }, (_, index) => ({
    hour: index,
    label: `${index.toString().padStart(2, '0')}:00`,
  }));

  const handleDragEnd = ({ data }: { data: Task[] }) => {
    setDayTasks(data);
    data.forEach((task) => updateTask(task));
  };

  const getTaskPosition = (task: Task): number => {
    if (!task.startTime) return 0;
    const taskTime = new Date(`${task.startDate}T${task.startTime}`);
    return (taskTime.getHours() * HOUR_HEIGHT) + ((taskTime.getMinutes() / 60) * HOUR_HEIGHT);
  };

  const renderTimelineTask = ({ item, drag, isActive }: any) => {
    const topPosition = getTaskPosition(item);

    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={{
          position: 'absolute',
          top: 1000,
          // left: 0,
          width: windowWidth - TIME_COLUMN_WIDTH - 32,
          height: HOUR_HEIGHT - 4,
          zIndex: 9999
        }}
        className={`p-2 rounded-xl shadow-md mx-2 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
      >
        <Text className="font-bold text-white">{item.title}</Text>
        {item.startTime && (
          <Text className="text-white">{format(parseISO(`${item.startDate}T${item.startTime}`), 'HH:mm')}</Text>
        )}
      </TouchableOpacity>
    );
  };

  

  return (
    <SafeAreaView className={`flex-1 mt-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className={`${isDarkMode ? 'bg-blue-900' : 'bg-blue-500'} pt-12 pb-6 px-4`}>
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setView('day')}
              className={`px-4 py-1 rounded-full ${view === 'day' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'day' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setView('week'); router.push("/(tabs)/calendar") }}
              className={`px-4 py-1 rounded-full ${view === 'week' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'week' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setView('month'); router.push("/(tabs)/calendar") }}
              className={`px-4 py-1 rounded-full ${view === 'month' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'month' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setSelectedDate(subDays(selectedDate, 1))}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedDate(addDays(selectedDate, 1))}>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Calendar
        isDarkMode={isDarkMode}
        view={view}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasTasksOnDate={hasTasksOnDate}
        onNavigate={(direction) => {
          if (view === 'month') {
            navigateMonth(direction);
          } else {
            navigateWeek(direction);
          }
        }}
      />

      <ScrollView className="">
        {/* Timeline Section */}
        <View className="flex-row flex-1">
          {/* Time Column */}
          <View style={{ width: TIME_COLUMN_WIDTH }} className="pt-5">
            {hours.map(({ hour, label }) => (
              <View 
                key={hour} 
                style={{ height: HOUR_HEIGHT }} 
                className={`justify-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Tasks Column */}
          <View 
            className={`flex-1 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} 
            style={{ height: hours.length * HOUR_HEIGHT }}
          >
            {/* Hour Grid Lines */}
            {/* {hours.map(({ hour }) => (
              <View
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className={`border-b w-full ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              />
            ))} */}

            {/* Tasks */}
            <DraggableFlatList
              data={tasks}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderTimelineTask}
            //   containerStyle={{
            //     position: 'absolute',
            //     top: 0,
            //     left: 0,
            //     right: 0,
            //     bottom: 0,
            //   }}
            />
          </View>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
};

export default AgendaPage;