import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import find from 'lodash/find';

import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView, TouchableOpacity, Text, View } from 'react-native';
import {
    ExpandableCalendar,
    TimelineEventProps,
    TimelineList,
    TimelineListRenderItemInfo,
    CalendarProvider,
    TimelineProps,
    CalendarUtils,
    Timeline
} from 'react-native-calendars';

import { timelineEvents, getDate,  } from '@/mocks/timelineEvent';
import AgendarItem from '@/mocks/AgendaItem';
import { addHours, format } from 'date-fns';
import { Task, useTaskStore } from '@/store/taskStore';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';


const INITIAL_TIME = { hour: 9, minutes: 0 };

const TimelineCalendarScreen: React.FC = () => {
    const { tasks } = useTaskStore();  // Access tasks using the hook
    const [currentDate, setCurrentDate] = useState(getDate());
    const [eventsByDate, setEventsByDate] = useState(() => groupBy(TasksToTimeLineEvents(tasks), e => CalendarUtils.getCalendarDateString(e.start)));

    console.log({timelineEvents})
    const marked = {
        [`${getDate(-1)}`]: { marked: true },
        [`${getDate()}`]: { marked: true },
        [`${getDate(1)}`]: { marked: true },
        [`${getDate(2)}`]: { marked: true },
        [`${getDate(4)}`]: { marked: true }
    };

    console.log({events: TasksToTimeLineEvents(tasks)})
    const onDateChanged = (date: string, source: string) => {
        console.log('TimelineCalendarScreen onDateChanged: ', date, source);
        setCurrentDate(date);
    };

    const onMonthChange = (month: any, updateSource: any) => {
        console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
    };

    const createNewEvent: TimelineProps['onBackgroundLongPress'] = (timeString, timeObject) => {
        const hourString = `${(timeObject.hour + 1).toString().padStart(2, '0')}`;
        const minutesString = `${timeObject.minutes.toString().padStart(2, '0')}`;

        const newEvent = {
            id: 'draft',
            start: `${timeString}`,
            end: `${timeObject.date} ${hourString}:${minutesString}:00`,
            title: 'New Event',
            color: 'white'
        };

        setEventsByDate(prevEvents => {
            const updatedEvents = { ...prevEvents };
            if (timeObject.date) {
                if (updatedEvents[timeObject.date]) {
                    updatedEvents[timeObject.date] = [...updatedEvents[timeObject.date], newEvent];
                } else {
                    updatedEvents[timeObject.date] = [newEvent];
                }
            }
            return updatedEvents;
        });
    };

    const approveNewEvent: TimelineProps['onBackgroundLongPressOut'] = (_timeString, timeObject) => {
        Alert.prompt('New Event', 'Enter event title', [
            {
                text: 'Cancel',
                onPress: () => {
                    if (timeObject.date) {
                        setEventsByDate(prevEvents => ({
                            ...prevEvents,
                            [timeObject.date]: filter(prevEvents[timeObject.date], e => e.id !== 'draft')
                        }));
                    }
                }
            },
            {
                text: 'Create',
                onPress: eventTitle => {
                    if (timeObject.date) {
                        setEventsByDate(prevEvents => {
                            const updatedEvents = { ...prevEvents };
                            const draftEvent = find(updatedEvents[timeObject.date], { id: 'draft' });
                            if (draftEvent) {
                                draftEvent.id = undefined;
                                draftEvent.title = eventTitle ?? 'New Event';
                                draftEvent.color = 'lightgreen';
                            }
                            return updatedEvents;
                        });
                    }
                }
            }
        ]);
    };

    const timelineProps: Partial<TimelineProps> = {
        format24h: true,
        onBackgroundLongPress: createNewEvent,
        onBackgroundLongPressOut: approveNewEvent,
        unavailableHours: [{ start: 0, end: 6 }, { start: 22, end: 24 }],
        overlapEventsSpacing: 8,
        rightEdgeSpacing: 24,
    };

    return (
        <SafeAreaView className="h-screen mt-11">
        <CalendarProvider
            date={currentDate}
            onDateChanged={onDateChanged}
            onMonthChange={onMonthChange}
            showTodayButton
            disabledOpacity={0.6}
        >
           
                <ExpandableCalendar
                    firstDay={1}
                    markedDates={marked}
                />
                <TimelineList
                    events={eventsByDate}
                    timelineProps={timelineProps}
                    scrollToFirst
                    initialTime={INITIAL_TIME}
                    renderItem={renderAgendaItem}
                    showNowIndicator
                />

           
        </CalendarProvider>
        </SafeAreaView>
    );
};

// Helper function to map tasks to timeline events
const TasksToTimeLineEvents = (tasks: Task[]): TimelineEventProps[] => {
    const endDate = (task: Task) => addHours(new Date(`${task.startDate}T${task.startTime}`), 1);
    return tasks.map(task => ({
        start: `${task.startDate}TS${task.startTime}`!,
        title: task.title,
        end: endDate(task).toISOString(),
        color: task.category?.theme || 'lightgray'
    }));
};

const AgendaItem: React.FC<{ event: TimelineEventProps }> = ({ event }) => {
  const { isDarkMode } = useTheme();
  
  console.log({event})
  return (
    <TouchableOpacity
      className={cn(
        "rounded-lg p-2 flex-1",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: event.color || '#3B82F6'
      }}
    >
      <Text className={cn(
        "font-semibold mb-1",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>
        {event.title}
      </Text>
      <Text className={cn(
        "text-xs",
        isDarkMode ? "text-gray-400" : "text-gray-600"
      )}>
        {/* {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')} */}
      </Text>
    </TouchableOpacity>
  );
};

const renderAgendaItem = (item: TimelineEventProps) => {
  return (
    <View className="flex-1">
      <AgendaItem event={item} />
    </View>
  );
};

export default TimelineCalendarScreen;
