import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task, useTaskStore } from "./taskStore";
import { format } from "date-fns";
import { useCalendarStore } from "./calendarStore";




export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  notificationType: "alarm" | "notification"
}

// Define types for notifications
export type NotificationPreferences = {
  enabled: boolean;
  soundEnabled: boolean;
  reminderTime: number; // minutes before task
  dailyDigest: boolean;
  dailyDigestTime: string; // HH:mm format
};

export type ScheduledNotification = {
  id: string;
  taskId: string;
  scheduledTime: string;
  title: string;
  body: string;
  data?: any;
};

export type NotificationStore = {
  // State
  preferences: NotificationPreferences;
  scheduledNotifications: ScheduledNotification[];
  pushToken: string | null;
  notificationPermission: boolean;
  notifications: Notification[],
  // Actions
  initialize: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  scheduleTaskNotification: (task: Task) => Promise<string | null>;
  cancelTaskNotification: (taskId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  rescheduleAllNotifications: () => Promise<void>;
  getPushToken: () => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
};

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      preferences: {
        enabled: true,
        soundEnabled: true,
        reminderTime: 5, // 15 minutes before task
        dailyDigest: false,
        dailyDigestTime: "09:00",
      },
      scheduledNotifications: [],
      pushToken: null,
      notificationPermission: false,

      // Initialize the notification system
      initialize: async () => {
        const { requestPermissions, getPushToken } = get();
        
        // Request permissions first
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          set({ notificationPermission: false });
          return;
        }

        // Get push token
        const token = await getPushToken();
        set({ 
          pushToken: token,
          notificationPermission: true
        });

        // Set up notification received handler
        Notifications.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification);
        });

        // Set up notification response handler
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log('Notification response:', response);
          // Handle notification interaction here
          const data = response.notification.request.content.data;
          if (data?.taskId) {
            // Navigate to task details or handle accordingly
          }
        });
      },

      // Update notification preferences
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },

      // Schedule a notification for a task
      scheduleTaskNotification: async (task: Task) => {
        const { preferences, scheduledNotifications } = get();
        
        if (!preferences.enabled || !task.alertTime) {
          return null;
        }

       
        const taskDateTime = new Date(task.alertTime);
        const notificationTime = new Date(taskDateTime.getTime() - (preferences.reminderTime * 60 * 1000));
       
        if (notificationTime <= new Date()) {
          return null;
        }

        try {
          // Cancel any existing notification for this task
          await get().cancelTaskNotification(task.id);

          // Schedule the new notification
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: task.title,
              body: `Starting in ${preferences.reminderTime} minutes`,
              sound: preferences.soundEnabled,
              
              data: { taskId: task.id },
            },
            trigger: {
              date: notificationTime,
            },
          });

          // Store the scheduled notification
          const newNotification: ScheduledNotification = {
            id: notificationId,
            taskId: task.id,
            scheduledTime: notificationTime.toISOString(),
            title: task.title,
            body: `Starting in ${preferences.reminderTime} minutes`,
          };

          

          set({
            scheduledNotifications: [...scheduledNotifications, newNotification],
          });
          const notifications = get().notifications;
          set({notifications: [...notifications]});
        

          return notificationId;
        } catch (error) {
          console.error('Error scheduling notification:', error);
          return null;
        }
      },

      // Cancel a specific task's notification
      cancelTaskNotification: async (taskId: string) => {
        const { scheduledNotifications } = get();
        const notification = scheduledNotifications.find(n => n.taskId === taskId);
        
        if (notification) {
          await useCalendarStore().deleteTaskEvent(taskId)
          await Notifications.cancelScheduledNotificationAsync(notification.id);
          set({
            scheduledNotifications: scheduledNotifications.filter(n => n.taskId !== taskId),
          });
        }
      },
      scheduleTaskAlarm: async (task: Task) => {
        if (task.reminderType === "alarm" && task.alertTime) {
          const alertDate = new Date(task.alertTime);

          // Schedule notification as alarm
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Task Reminder",
              body: `Reminder: ${task.title}`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: alertDate,
          });

          // Also add an alarm to the calendar if the task is linked to a calendar event
          const calendarStore = useCalendarStore();
          const eventId = calendarStore.calendarEvents[task.id];
          if (eventId) {
            await calendarStore.addAlarmToEvent(eventId, 15);
          }

          // Track scheduled notification
          set((state) => ({
            scheduledNotifications: [
              ...state.scheduledNotifications,
              {
                id: notificationId,
                taskId: task.id,
                scheduledTime: alertDate.toISOString(),

                title: task.title,
                body: `Reminder: ${task.title}`,
              },
            ],
          }));

          return notificationId;
        }
        return null;
      },
    

      // Cancel all scheduled notifications
      cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        set({ scheduledNotifications: [] });
      },

      // Reschedule all notifications (useful after preference changes)
      rescheduleAllNotifications: async () => {
        const { cancelAllNotifications, scheduleTaskNotification } = get();
        await cancelAllNotifications();
        
        // You'll need to access TaskStore here to get all tasks
        const tasks = useTaskStore.getState().tasks;
        
        for (const task of tasks) {
          if (!task.completed) {
            await scheduleTaskNotification(task);
          }
        }
      },

      // Get push notification token
      getPushToken: async () => {
        if (!Device.isDevice) {
          return null;
        }

        try {
          const token = (await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Add this to your env variables
          })).data;
          return token;
        } catch (error) {
          console.error('Error getting push token:', error);
          return null;
        }
      },

      // Request notification permissions
      requestPermissions: async () => {
        if (!Device.isDevice) {
          return false;
        }

        try {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }

          const { status } = await Notifications.requestPermissionsAsync();
          return status === 'granted';
        } catch (error) {
          console.error('Error requesting notification permissions:', error);
          return false;
        }
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);