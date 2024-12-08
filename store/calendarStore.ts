import { create } from 'zustand';
import * as Calendar from 'expo-calendar';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Task } from "./taskStore"
import { useNotificationStore } from './notificationStore';
interface CalendarStore {
  defaultCalendarId: string | null;
  calendarEvents: { [taskId: string]: string }; // Maps taskId to eventId
  
  // Calendar Operations
  initializeCalendar: () => Promise<void>;
  requestCalendarPermissions: () => Promise<boolean>;
  createTaskEvent: (task: Task) => Promise<string | null>;
  updateTaskEvent: (task: Task) => Promise<void>;
  deleteTaskEvent: (taskId: string) => Promise<void>;
  
  // Alarm Operations
  addAlarmToEvent: (eventId: string, minutes: number) => Promise<void>;
  removeAlarmFromEvent: (eventId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      defaultCalendarId: null,
      calendarEvents: {},

      initializeCalendar: async () => {
        const hasPermission = await get().requestCalendarPermissions();
        if (!hasPermission) return;

        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find(calendar => 
            Platform.OS === 'ios' 
              ? calendar.source.name === 'Default'
              : calendar.accessLevel === 'owner'
          );

          if (!defaultCalendar) {
            // Create a new calendar if none exists
            const newCalendarId = await Calendar.createCalendarAsync({
              title: 'Task Manager',
              color: '#2196F3',
              entityType: Calendar.EntityTypes.EVENT,
              source: {
                isLocalAccount: true,
                name: 'Task Manager',
                type: Calendar.SourceType.LOCAL,
              },
              name: 'TaskManagerCalendar',
              ownerAccount: 'personal',
              accessLevel: Calendar.CalendarAccessLevel.OWNER,
            });
            set({ defaultCalendarId: newCalendarId });
          } else {
            set({ defaultCalendarId: defaultCalendar.id });
          }
        } catch (error) {
          console.error('Error initializing calendar:', error);
        }
      },

      requestCalendarPermissions: async () => {
        try {
          const { status } = await Calendar.requestCalendarPermissionsAsync();
          if (status === 'granted') {
            const status = await Calendar.PermissionStatus;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error requesting calendar permissions:', error);
          return false;
        }
      },

      createTaskEvent: async (task: Task) => {
        const { defaultCalendarId, calendarEvents } = get();
        if (!defaultCalendarId || !task.startDate) return null;

        try {
          // Create event details
          const startDate = new Date(task.startDate);
          if (task.startTime) {
            const [hours, minutes] = task.startTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes));
          }

          const endDate = new Date(startDate);
          endDate.setHours(startDate.getHours() + 1); // Default 1-hour duration

          const eventDetails = {
            title: task.title,
            notes: task.description,
            startDate: startDate,
            endDate: endDate,
            calendarId: defaultCalendarId,
            alarms: [{ relativeOffset: - useNotificationStore.getState().preferences.reminderTime }], // Default 15-minute reminder
          };

          const eventId = await Calendar.createEventAsync(defaultCalendarId, eventDetails);
          
          // Store the mapping
          set({ calendarEvents: { ...calendarEvents, [task.id]: eventId } });
          
          return eventId;
        } catch (error) {
          console.error('Error creating calendar event:', error);
          return null;
        }
      },

      updateTaskEvent: async (task: Task) => {
        const { calendarEvents, defaultCalendarId } = get();
        const eventId = calendarEvents[task.id];
        
        if (!eventId || !defaultCalendarId || !task.startDate) return;

        try {
          const startDate = new Date(task.startDate);
          if (task.startTime) {
            const [hours, minutes] = task.startTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes));
          }

          const endDate = new Date(startDate);
          endDate.setHours(startDate.getHours() + 1);

          await Calendar.updateEventAsync(eventId, {
            title: task.title,
            notes: task.description,
            startDate: startDate,
            endDate: endDate,
          });
        } catch (error) {
          console.error('Error updating calendar event:', error);
        }
      },

      deleteTaskEvent: async (taskId: string) => {
        const { calendarEvents } = get();
        const eventId = calendarEvents[taskId];
        
        if (!eventId) return;

        try {
          await Calendar.deleteEventAsync(eventId);
          const updatedEvents = { ...calendarEvents };
          delete updatedEvents[taskId];
          set({ calendarEvents: updatedEvents });
        } catch (error) {
          console.error('Error deleting calendar event:', error);
        }
      },

      addAlarmToEvent: async (eventId: string, minutes: number) => {
        try {
          const event = await Calendar.getEventAsync(eventId);
          const alarms = event.alarms || [];
          
          alarms.push({"relativeOffset": -minutes})
          await Calendar.updateEventAsync(eventId, {
            alarms: [...alarms],
          });
        } catch (error) {
          console.error('Error adding alarm to event:', error);
        }
      },

      removeAlarmFromEvent: async (eventId: string) => {
        try {
          await Calendar.updateEventAsync(eventId, {
            alarms: [],
          });
        } catch (error) {
          console.error('Error removing alarm from event:', error);
        }
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);