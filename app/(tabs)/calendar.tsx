import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDays, addWeeks, format, getDay, getDaysInMonth, getMonth, getTime, getWeekOfMonth, getYear, isSameMonth, isSunday, previousSunday } from 'date-fns';
import { Task, useTaskStore } from '@/store/taskStore';
import Swiper from 'react-native-swiper';
import TabBar from '@/components/TabBar';
import testIDs from '@/lib/testIDs';
import { Agenda, AgendaSchedule } from 'react-native-calendars';
import { AgendaItem, agendaItems } from '@/mocks/agendaItems';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useTheme } from '@/hooks/ThemeProvider';
import { hasTasksOnDate } from '@/lib/utils';



interface DayProps {
  date: Date;
  isSelected: boolean;
  hasTask: boolean;
  sameMonth: boolean;
  onSelect: () => void;
  currentMonth?: Date;
  isDarkMode: boolean
}

const DayCell: React.FC<DayProps> = ({ date, isSelected, currentMonth, sameMonth, hasTask, onSelect, isDarkMode }) => (
  <TouchableOpacity
    onPress={onSelect}
    className={`items-center justify-center w-12 h-12 rounded-full mx-0.5 
      ${isSelected ? 'bg-blue-500' : hasTask ? 'bg-blue-100/50' : 'bg-transparent'}`}
  >
    <Text className={`text-sm ${isSelected ? 'text-white font-bold' : sameMonth ? (isDarkMode ? 'text-gray-100' : 'text-gray-800') : 'text-gray-400'}`}>
      {date.getDate()}
    </Text>
    {hasTask && !isSelected && (
      <View className="w-1 h-1 bg-blue-500 rounded-full mt-1" />
    )}
  </TouchableOpacity>
);

const CalendarViewPage: React.FC = () => {
  const { tasks, updateTask } = useTaskStore();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const { isDarkMode } = useTheme()
  const handleDragEnd = ({ data }: { data: Task[] }) => {
    setDayTasks(data);
    data.forEach((task) => updateTask(task));
  };

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');




  const getWeekDays = (date: Date) => {
    let start = new Date(date);
    console.log({ start })
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };


  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'next' ? 1 : -1);
    setSelectedDate(newDate);
  };

  const getMonthWeeks = (date: Date) => {
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    start = isSunday(start) ? start : previousSunday(start);

    console.log({ WeekStart: start })
    getDaysInMonth(currentMonth)
    return Array.from({ length: 5 }, (_, w) => {
      const newWeek = getWeekDays(start)
      start.setDate(start.getDate() + 7)

      return newWeek
    })

  }



  

  const getTasksForDate = (date: Date) => {
    console.log(date)
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task?.startDate === dateString);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const renderSwiperMonth = (monthDate: Date) => (
    <View className="">
      <View className="flex-col">
        {getMonthWeeks(monthDate)?.map((week, index) => (
          <View key={index} className="flex-row justify-between">
            {week.map((date, dayIndex) => (
              <DayCell
                key={dayIndex}
                date={date}
                sameMonth={isSameMonth(date, monthDate)}
                isDarkMode={isDarkMode}
                isSelected={
                  date.toISOString().split('T')[0] ===
                  selectedDate.toISOString().split('T')[0]
                }
                currentMonth={currentMonth}
                hasTask={hasTasksOnDate(tasks, date)}
                onSelect={() => setSelectedDate(date)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSwiperWeek = (weekDate: Date) => (
    <View className="">
      <View className="flex-row justify-between">
        {getWeekDays(weekDate).map((date, index) => (
          <DayCell
            key={index}
            date={date}
            sameMonth={isSameMonth(date, currentMonth)}
            isDarkMode={isDarkMode}
            isSelected={
              date.toISOString().split('T')[0] ===
              selectedDate.toISOString().split('T')[0]
            }
            currentMonth={currentMonth}
            hasTask={hasTasksOnDate(tasks, date)}
            onSelect={() => setSelectedDate(date)}
          />
        ))}
      </View>
    </View>
  );

  const handleIndexChanged = useCallback((index: number) => {
    const direction = index > activeIndex ? 'next' : 'prev';
    setActiveIndex(index);
    
    if (view === 'month') {
      const newDate = addMonths(currentMonth, direction === 'next' ? 1 : -1);
      setCurrentMonth(newDate);
    } else if (view === 'week') {
      const newDate = addWeeks(currentWeek, direction === 'next' ? 1 : -1);
      setCurrentWeek(newDate);
    }
  }, [activeIndex, currentMonth, currentWeek, view]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(direction === 'next' ? 1 : -1);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(direction === 'next' ? 1 : -1);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const WeeksView = (currentMonth: Date) => {

    return [addWeeks(currentMonth, -1), currentMonth, addWeeks(currentMonth, 1)]
  }



  return (
    <SafeAreaView className={`flex-1 mt-11 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className={`${isDarkMode ? 'bg-blue-900' : 'bg-blue-500'} pt-12 pb-6 px-4`}>
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => { setView('day'); router.push("/(tabs)/timeline") }}
              className={`px-4 py-1 rounded-full ${view === 'day' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'day' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('week')}
              className={`px-4 py-1 rounded-full ${view === 'week' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'week' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('month')}
              className={`px-4 py-1 rounded-full ${view === 'month' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text className={view === 'month' ? (isDarkMode ? 'text-blue-900' : 'text-blue-500') : 'text-white'}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => view === "month" ? navigateMonth('prev') : navigateWeek('prev')}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => view === "month" ? navigateMonth('next') : navigateWeek('next')}>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <View className="flex-row justify-between mb-4">
          {weekDays.map((day) => (
            <Text key={day} className={`w-12 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {day}
            </Text>
          ))}
        </View>

        <View className="flex-1 h-96">
          <Swiper
            ref={swiperRef}
            loop={false}
            showsPagination={false}
            onIndexChanged={handleIndexChanged}
            // className='h-96'
            index={1}
            style={{ height: '100%' }}
          >
            {view === 'month' ? (
              [
                renderSwiperMonth(addMonths(currentMonth, -1)),
                renderSwiperMonth(currentMonth),
                renderSwiperMonth(addMonths(currentMonth, 1))
              ]
            ) : (
              [
                renderSwiperWeek(addWeeks(currentWeek, -1)),
                renderSwiperWeek(currentWeek),
                renderSwiperWeek(addWeeks(currentWeek, 1))
              ]
            )}
          </Swiper>
        </View>
      </View>

      <View className="flex-1 px-4 h-20 overflow-hidden">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Tasks for {selectedDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity
            onPress={() => console.log('Add task')}
            className={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} p-2 rounded-full`}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView className="overflow-hidden" showsVerticalScrollIndicator={false}>
          <DraggableFlatList
            data={getTasksForDate(selectedDate)}
            onDragEnd={handleDragEnd}
            keyExtractor={(task) => task.id}
            renderItem={(item) => renderTaskItem({ task: item.item, isDarkMode })}
            horizontal={false}
          />

          {getTasksForDate(selectedDate).length === 0 && (
            <View className="items-center justify-center py-8">
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tasks for this date</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <TabBar />
    </SafeAreaView>
  );
};

const renderTaskItem = ({ task, isDarkMode }: { task: Task; isDarkMode: boolean }) => {
  const taskStartTime = task.startTime ? new Date(`${task.startDate}T${task.startTime}`) : new Date();

  return (
    <TouchableOpacity
      key={task.id}
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 mb-3 border-l-4`}
      style={{ borderLeftColor: task.category?.theme || "" }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {task?.title}
          </Text>
          {task.alertTime && (
            <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {format(task.alertTime!, "HH:mm") || 'No time set'}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {task.category && (
            <View className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {task?.category.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
};

export default CalendarViewPage;



