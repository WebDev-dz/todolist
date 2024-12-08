import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category, Task, useTaskStore } from '@/store/taskStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/ThemeProvider';
// import { categories } from '@/constants';



const AddTaskPage: React.FC = () => {
  const router = useRouter();
  const { addTask , categories} = useTaskStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [hasReminder, setHasReminder] = useState(false);
  const { isDarkMode } = useTheme();
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      category: selectedCategory ,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startTime.toISOString().split('T')[1],
      alertTime: hasReminder ? `${startDate.toISOString().split('T')[0]}T${startTime.toISOString().split('T')[1]}` : null,
      subtasks: subtasks.map(task => ({
        id: Date.now().toString() + Math.random(),
        title: task,
        completed: false
      })),
      attachments: [],
      notes: '',
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
    };

    addTask(newTask);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 pt-11">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-500 p-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Add New Task</Text>
        </View>

        {/* Form */}
        <View className="p-4 space-y-4">
          {/* Title Input */}
          <View className="bg-white p-4 rounded-xl">
            <Text className="text-gray-600 mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              className="border-b border-gray-200 py-2"
            />
          </View>

          {/* Description Input */}
          <View className="bg-white p-4 rounded-xl">
            <Text className="text-gray-600 mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
              className="border border-gray-200 p-2 rounded"
            />
          </View>

          {/* Categories */}
          <View className="bg-white p-4 rounded-xl">
            <View className='flex-row items-center mb-4'>
              <Text className="text-gray-600 mb-2">Category: {"    "}</Text>
              <TouchableOpacity
                  key={selectedCategory?.label}
                  // onPress={() => setSelectedCategory(selectedCategory?.label)}
                  style = {{backgroundColor: selectedCategory?.theme}}
                  className={`mr-2 px-4 py-2 rounded-full text-white `}
                >
                  <Text className='text-white' >
                    {`${selectedCategory?.icon} ${selectedCategory?.label}`}
                  </Text>
                </TouchableOpacity>

            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.label}
                  onPress={() => setSelectedCategory(category)}
                  style = {{backgroundColor: category.theme}}
                  className={`mr-2 px-4 py-2 rounded-full text-white ${
                    selectedCategory?.label === category.label && 'bg-blue-500' 
                  }`}
                >
                  <Text className='text-white' >
                    {`${category.icon} ${category.label}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View className="bg-white p-4 rounded-xl space-y-4">
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-gray-600">Start Date</Text>
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-gray-600">Start Time</Text>
              <Text>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setStartTime(date);
                }}
              />
            )}
          </View>

          {/* Subtasks */}
          <View className="bg-white p-4 rounded-xl">
            <Text className="text-gray-600 mb-2">Subtasks</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Add subtask"
                className="flex-1 border border-gray-200 p-2 rounded mr-2"
              />
              <TouchableOpacity 
                onPress={handleAddSubtask}
                className="bg-blue-500 p-2 rounded"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {subtasks.map((subtask, index) => (
              <View key={index} className="flex-row items-center justify-between py-2">
                <Text>{subtask}</Text>
                <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Reminder Switch */}
          <View className="bg-white p-4 rounded-xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Set Reminder</Text>
              <Switch
                value={hasReminder}
                onValueChange={setHasReminder}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-500 p-4 rounded-xl"
        >
          <Text className="text-white text-center font-bold">Create Task</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddTaskPage;