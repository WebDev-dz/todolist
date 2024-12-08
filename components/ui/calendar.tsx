import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { addWeeks, addMonths, isSameMonth, isSunday, previousSunday } from 'date-fns';
import { Task, useTaskStore } from '@/store/taskStore';
import { DayCell } from './calendar/DayCell';

interface CalendarProps {
  isDarkMode: boolean;
  view: 'week' | 'month';
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasTasksOnDate: (tasks: Task[], date: Date) => boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
}



export const Calendar: React.FC<CalendarProps> = ({
  isDarkMode,
  view,
  selectedDate,
  onSelectDate,
  hasTasksOnDate,
  onNavigate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { tasks } = useTaskStore();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDays = (date: Date) => {
    let start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getMonthWeeks = (date: Date) => {
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    start = isSunday(start) ? start : previousSunday(start);
    return Array.from({ length: 5 }, (_, w) => {
      const newWeek = getWeekDays(start);
      start.setDate(start.getDate() + 7);
      return newWeek;
    });
  };

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
    
    if (onNavigate) {
      onNavigate(direction);
    }
  }, [currentMonth, currentWeek, view, onNavigate]);

  const renderSwiperMonth = (monthDate: Date) => (
    <View className="flex-col">
      {getMonthWeeks(monthDate)?.map((week, index) => (
        <View key={index} className="flex-row justify-between">
          {week.map((date, dayIndex) => (
            <DayCell
              key={dayIndex}
              date={date}
              sameMonth={isSameMonth(date, monthDate)}
              isDarkMode={isDarkMode}
              isSelected={date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]}
              currentMonth={currentMonth}
              hasTask={hasTasksOnDate(tasks, date)}
              onSelect={() => onSelectDate(date)}
            />
          ))}
        </View>
      ))}
    </View>
  );

  const renderSwiperWeek = (weekDate: Date) => (
    <View className="flex-row justify-between h-10">
      {getWeekDays(weekDate).map((date, index) => (
        <DayCell
          key={index}
          date={date}
          sameMonth={isSameMonth(date, currentMonth)}
          isDarkMode={isDarkMode}
          isSelected={date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]}
          currentMonth={currentMonth}
          hasTask={hasTasksOnDate(tasks, date)}
          onSelect={() => onSelectDate(date)}
        />
      ))}
    </View>
  );

  return (
    <View className="px-4 py-4 h-96" style={{ height: view === 'month' ? 300 : 120 }}>
       <View className="flex-row justify-between mb-4">
        {weekDays.map((day) => (
          <Text key={day} className={`w-12 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {day}
          </Text>
        ))}
      </View>

      <View className="flex-1 h-auto">
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={false}
          onIndexChanged={handleIndexChanged}
          
          index={1}
          style={{ height: 300 }}
        >
          {view === 'month' && currentMonth ? (
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
  );
};
