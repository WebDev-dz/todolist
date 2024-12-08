// (drawers)/stores.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCalendarStore } from '@/store/calendarStore';
import * as Calendar from 'expo-calendar';
import { addDays, format } from 'date-fns';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

const StoresPage: React.FC = () => {
  const router = useRouter();
  const taskStore = useTaskStore();
  const notificationStore = useNotificationStore();
  const calendarStore = useCalendarStore();
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);
  const [loading, setLoading] = useState(false);

 const {isDarkMode } = useTheme()
  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const events = await Calendar.getEventsAsync(
        [calendarStore.defaultCalendarId || "349"],
        new Date(),
        addDays(new Date(), 7)
      );
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, eventId: string) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This will also remove the calendar event.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Delete calendar event
              await calendarStore.deleteTaskEvent(taskId);
              // Delete task
              await taskStore.deleteTask(taskId);
              // Refresh calendar events
              await loadCalendarEvents();
              Alert.alert("Success", "Task and calendar event deleted successfully");
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert("Error", "Failed to delete task and calendar event");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to format store data for display
  const formatStoreData = (data: any): string => {
    return JSON.stringify(data, null, 2);
  };

  // Format date for better readability
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEventData = (event: Calendar.Event) => {
    const taskId = Object.entries(calendarStore.calendarEvents)
      .find(([_, eventId]) => eventId === event.id)?.[0];
    const task = taskId ? taskStore.tasks.find(t => t.id === taskId) : null;

    return {
      title: event.title,
      start: format(new Date(event.startDate), 'MMM dd, yyyy HH:mm'),
      end: format(new Date(event.endDate), 'MMM dd, yyyy HH:mm'),
      notes: event.notes,
      taskId,
      hasTask: !!task
    };
  };

  // Format calendar data for display
  const formatCalendarData = () => {
    const { defaultCalendarId, calendarEvents } = calendarStore;
    
    // Convert calendarEvents to a more readable format
    const formattedEvents = Object.entries(calendarEvents).map(([taskId, eventId]) => ({
      taskId,
      eventId,
      task: taskStore.tasks.find(task => task.id === taskId),
    }));

    return {
      defaultCalendarId: defaultCalendarId || 'Not set',
      totalEvents: Object.keys(calendarEvents).length,
      events: formattedEvents,
    };
  };

  return (
    <SafeAreaView  className={cn(
      'mt-11 pb-6 h-screen',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-blue-500 pt-12 pb-6 px-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Zustand Stores</Text>
      </View>

      {/* Calendar Store Section */}
      <View className="bg-white mt-4 p-4 mx-4 rounded-xl shadow">
        <View className="flex-row items-center mb-4">
          <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
          <Text className="text-xl font-bold ml-2">Calendar Store</Text>
        </View>

       {/* Calendar Store Section */}
      <View className="bg-white mt-4 p-4 mx-4 rounded-xl shadow">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
            <Text className="text-xl font-bold ml-2">Calendar Store</Text>
          </View>
          <TouchableOpacity 
            onPress={loadCalendarEvents}
            className="bg-blue-500 px-3 py-1 rounded-xl"
          >
            <Text className="text-white">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Events */}
        <View>
          <Text className="text-lg font-semibold mb-2">Upcoming Events</Text>
          {loading ? (
            <Text className="text-gray-500 italic p-4">Loading...</Text>
          ) : calendarEvents.length === 0 ? (
            <Text className="text-gray-500 italic p-4">No upcoming events</Text>
          ) : (
            calendarEvents.map((event) => {
              const eventData = formatEventData(event);
              return (
                <View key={event.id} className="bg-gray-50 p-4 rounded-xl mb-2">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-bold">{event.title}</Text>
                      <Text className="text-gray-600 text-sm">
                        {eventData.start}
                      </Text>
                      {event.notes && (
                        <Text className="text-gray-500 mt-1">{event.notes}</Text>
                      )}
                    </View>
                    {eventData.taskId && (
                      <TouchableOpacity 
                        onPress={() => handleDeleteTask(eventData.taskId, event.id)}
                        className="bg-red-100 p-2 rounded-full"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Task Store Section */}
      <View className="bg-white mt-4 p-4 mx-4 rounded-xl shadow">
        <View className="flex-row items-center mb-4">
          <Ionicons name="list-outline" size={24} color="#8B5CF6" />
          <Text className="text-xl font-bold ml-2">Task Store</Text>
        </View>
        <View className="bg-gray-50 p-4 rounded-xl">
          {taskStore.tasks.map(task => (
            <View key={task.id} className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-200">
              <View>
                <Text className="font-semibold">{task.title}</Text>
                <Text className="text-gray-500 text-sm">
                  Due: {format(new Date(task.startDate), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteTask(task.id, calendarStore.calendarEvents[task.id])}
                className="bg-red-100 p-2 rounded-full"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Notification Store Section */}
      <View className="bg-white mt-4 p-4 mx-4 rounded-xl shadow mb-6">
        <View className="flex-row items-center mb-4">
          <Ionicons name="notifications-outline" size={24} color="#8B5CF6" />
          <Text className="text-xl font-bold ml-2">Notification Store</Text>
        </View>
        
        {/* Preferences Subsection */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Preferences</Text>
          <View className="bg-gray-50 p-4 rounded-xl">
            <Text className="font-mono">{formatStoreData(notificationStore.preferences)}</Text>
          </View>
        </View>

        
      </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default StoresPage;



