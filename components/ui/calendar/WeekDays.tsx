import { hasTasksOnDate } from "@/lib/utils";
import { isSameMonth } from "date-fns";
import { View } from "react-native";
import { DayCell } from "./DayCell";
import { Task } from "@/store/taskStore";



const getWeekDays = (date: Date) => {
    let start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };







export const WeekDays = (weekDate: Date, currentMonth: Date, selectedDate: Date, isDarkMode: boolean, tasks: Task[], onSelectDate: (date: Date) => void) => (
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