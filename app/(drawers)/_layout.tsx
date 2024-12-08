import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';

import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";


export default function  TabLayout() {
  const colorScheme = useColorScheme();

  const { isSignedIn } = useAuth();

  if (!isSignedIn) return  <Redirect href="/(auth)/sign-in" />;

 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "",
        headerShown: false,
        tabBarStyle: {
          display: "none"
        }
      }}>
      
     
    </Tabs>
  );
}
