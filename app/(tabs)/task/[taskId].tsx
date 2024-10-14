import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Attachment, useTaskStore } from '@/store/taskStore';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNavigationConfig } from 'expo-router/build/getLinkingConfig';

const TaskDetailsScreen = () => {
  const { taskId } = useLocalSearchParams() ;
  const { tasks, updateTask, deleteTask, addSubtask, addAttachment } = useTaskStore();
  const task = tasks.find(t => t.id === taskId);

  const [title, setTitle] = useState(task?.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const router = useRouter()

  

  const showOptions = () => {
    // Implement the options menu here
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate && task) {
      updateTask({ ...task, startDate: selectedDate });
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime && task) {
      updateTask({ ...task, startTime: selectedTime.toTimeString().slice(0, 5) });
    }
  };

  const handleAddSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      title: '',
      completed: false,
    };
    addSubtask(taskId as string, newSubtask);
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.assets?.length !== 0) {
        result.assets?.forEach(asset => {
            const newAttachment : Attachment = {
              id: Date.now().toString(),
              url: asset.uri,
              type: 'document',
              name: asset.name,
            };
            addAttachment(taskId as string, newAttachment);

        })
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <TextInput
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (task) updateTask({ ...task, title: text });
        }}
        className="text-xl font-bold mb-4 p-2 border-b border-gray-200"
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center mb-4">
        <Ionicons name="calendar-outline" size={24} color="black" className="mr-2" />
        <Text className="text-base">
          {task?.startDate ? new Date(task.startDate).toLocaleDateString() : 'Set due date'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-row items-center mb-4">
        <Ionicons name="time-outline" size={24} color="black" className="mr-2" />
        <Text className="text-base">{task?.startTime || 'Set time & reminder'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center mb-4">
        <Ionicons name="repeat" size={24} color="black" className="mr-2" />
        <Text className="text-base">Repeat Task</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAddSubtask} className="flex-row items-center mb-4">
        <Ionicons name="add-circle-outline" size={24} color="blue" className="mr-2" />
        <Text className="text-base text-blue-500">Add Sub-task</Text>
      </TouchableOpacity>

      {task?.subtasks.map((subtask) => (
        <View key={subtask.id} className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => {/* Toggle subtask completion */}}>
            <Ionicons
              name={subtask.completed ? "checkbox-outline" : "square-outline"}
              size={24}
              color="black"
              className="mr-2"
            />
          </TouchableOpacity>
          <TextInput
            value={subtask.title}
            onChangeText={(text) => {/* Update subtask title */}}
            className="flex-1 text-base"
          />
        </View>
      ))}

      <TouchableOpacity onPress={handleAttachment} className="flex-row items-center mb-4">
        <Ionicons name="attach" size={24} color="black" className="mr-2" />
        <Text className="text-base">Add Attachment</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={task?.startDate ? new Date(task.startDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={task?.startTime ? new Date(`2000-01-01T${task.startTime}`) : new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

export default TaskDetailsScreen;
