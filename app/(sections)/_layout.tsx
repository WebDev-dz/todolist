import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import "@/global.css";
import { AntDesign } from '@expo/vector-icons';
// import styled from 'styled-components/native';

import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useSession } from '@clerk/clerk-expo';
import { useSupabaseClient } from '@/db';
import { useTaskStore } from '@/store/taskStore';
import { Text } from 'react-native';

export default function () {
  const { user } = useUser()
  const { session } = useSession();
  const supabase = useSupabaseClient();
  const { setUserId } = useTaskStore();
  useEffect(() => {
    if (session) {
      setUserId(user?.id)
      // Example of making an authenticated query
      const fetchUserData = async () => {
        const { data: tasksData, error: tasksError,  } = await supabase
        .from('tasks')
        .select(`*`)
        .order('createdAt', { ascending: false });

      if (tasksError) {
        throw tasksError;
      }
      tasksData.forEach((task) => {
          useTaskStore.getState().addTask(task)
        })
        console.log('User data:', );
      };

      fetchUserData();
    } else {
      setUserId(undefined)
    }
  }, [session]);

  

  if (!session?.user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  


  

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "",
        headerShown: false,
        tabBarStyle: {
          display: "none"
        }
      }}>
      <Tabs.Screen
        name="habits"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          headerShown: false,
          
        }}
      />
    </Tabs>
  );
}
