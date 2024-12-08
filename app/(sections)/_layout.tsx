import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type DrawerIconProps = {
  color: string;
  size: number;
};

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerType: "front"
      }}
    >
      {/* Main Screens */}
      <Drawer.Screen
        name="goals"
        options={{
          drawerLabel: 'Goals',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="flag-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="habits"
        options={{
          drawerLabel: 'Habits',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="notes"
        options={{
          drawerLabel: 'Notes',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Drawer Screens */}
      <Drawer.Screen
        name="(drawers)/profile"
        options={{
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(drawers)/notifications"
        options={{
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(drawers)/settings"
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }: DrawerIconProps) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
