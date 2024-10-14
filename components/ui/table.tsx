import React from 'react';
import { View, Text, ScrollView, ScrollViewProps, ViewProps, TextProps } from 'react-native';

const Table = React.forwardRef<ScrollView, ScrollViewProps>(({ className, ...props }, ref) => (
  <ScrollView horizontal className="w-full" ref={ref}>
    <View className={`w-full ${className || ''}`} {...props} />
  </ScrollView>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={`flex-row border-b border-gray-200 ${className || ''}`} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={className} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={`flex-row border-t border-gray-200 bg-gray-50 ${className || ''}`} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View 
    ref={ref} 
    className={`flex-row border-b border-gray-200 ${className || ''}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View 
    ref={ref} 
    className={`p-4 flex-1 justify-center ${className || ''}`}
    {...props}
  >
    <Text className="font-medium text-gray-500 text-sm">
      {props.children}
    </Text>
  </View>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View 
    ref={ref} 
    className={`p-4 flex-1 justify-center ${className || ''}`}
    {...props}
  >
    <Text className="text-sm">
      {props.children}
    </Text>
  </View>
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<Text, TextProps>(({ className, ...props }, ref) => (
  <Text 
    ref={ref} 
    className={`mt-4 text-sm text-gray-500 ${className || ''}`}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
