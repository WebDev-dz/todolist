import React from 'react';
import { View, Text } from 'react-native';



type CardProps = React.ComponentProps<typeof View> & {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <View
    className={`rounded-xl border bg-card shadow ${className}`}
    {...props}
  />
);

const CardHeader: React.FC<CardProps> = ({ className, ...props }) => (
  <View
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
);

const CardTitle: React.FC<React.ComponentProps<typeof Text>> = ({ className, ...props }) => (
  <Text
    className={`font-semibold text-lg ${className}`}
    {...props}
  />
);

const CardDescription: React.FC<React.ComponentProps<typeof Text>> = ({ className, ...props }) => (
  <Text
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
);

const CardContent: React.FC<CardProps> = ({ className, ...props }) => (
  <View className={`p-6 pt-0 ${className}`} {...props} />
);

const CardFooter: React.FC<CardProps> = ({ className, ...props }) => (
  <View
    className={`flex flex-row items-center p-6 pt-0 ${className}`}
    {...props}
  />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
