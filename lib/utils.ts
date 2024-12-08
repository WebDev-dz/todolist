import { Task } from "@/store/taskStore"
import { clsx, type ClassValue } from "clsx"
import { differenceInDays, format, isValid, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type GroupedTasks = {
  [key: string]: Task[];
};

export const hasTasksOnDate = (tasks: Task[], date: Date) => {
  const dateString = date.toISOString().split('T')[0];
  return tasks.some(task => task.startDate === dateString);
};




export const extractDays = (tasks: Task[]): [string, Task[]][] => {


  const map = new Map<string, Task[]>()


  tasks?.forEach((task) => {

    const newDay = task?.startDate || "No Date";
    const dayslist = map.get(newDay) || []

    map.set(newDay!, [...dayslist!, task])


  })

  const sortedGroupedTasks = Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return sortedGroupedTasks

}


export const sortTasksByDate = (tasks: Task[]) => {
  const sorted = tasks.sort((task1, taskb) => {
    if (task1.startDate == null) {
      return -1
    }
    if (taskb.startDate == null) {
      return 1;
    }
    return (differenceInDays(task1.startDate, taskb.startDate)) > 0 ? 1 : -1
  })

  return sorted

}

export const groupTasksByExactDate = (tasks: Task[]): GroupedTasks => {
  const grouped: GroupedTasks = {};



  tasks?.forEach(task => {
    if (task.startDate && isValid(task.startDate)) {
      const dateKey = task.startDate
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    } else {
      // Handle tasks without a valid start date
      if (!grouped['No Date']) {
        grouped['No Date'] = [];
      }
      grouped['No Date'].push(task);
    }
  });

  // Sort tasks within each group by startTime
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  });



  return grouped;
};
