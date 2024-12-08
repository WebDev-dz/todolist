import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Switch,
  Alert,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category, Task, Attachment, useTaskStore } from '@/store/taskStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/ThemeProvider';

const AddTaskPage: React.FC = () => {
  const router = useRouter();
  const { addTask, categories } = useTaskStore();
  const { isDarkMode } = useTheme();
  
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        const asset = result.assets.at(0)!
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
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
      category: selectedCategory,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startTime.toISOString().split('T')[1],
      alertTime: hasReminder ? `${startDate.toISOString().split('T')[0]}T${startTime.toISOString().split('T')[1]}` : null,
      subtasks: subtasks.map(task => ({
        id: Date.now().toString() + Math.random(),
        title: task,
        completed: false
      })),
      attachments: attachments,
      notes: '',
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
    };

    addTask(newTask);
    router.back();
  };

  // Dynamic styling based on dark mode
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <SafeAreaView className={`flex-1 ${bgColor} pt-11`}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`bg-blue-500 p-4 flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Add New Task</Text>
        </View>

        {/* Form */}
        <View className="p-4 space-y-4">
          {/* Title Input */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <Text className={`${textColor} mb-2`}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              className={`border-b ${borderColor} py-2 ${textColor}`}
            />
          </View>

          {/* Description Input */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <Text className={`${textColor} mb-2`}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              multiline
              numberOfLines={4}
              className={`border ${borderColor} p-2 rounded ${textColor}`}
            />
          </View>

          {/* Categories */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <View className='flex-row items-center mb-4'>
              <Text className={`${textColor} mb-2`}>Category: {"    "}</Text>
              {selectedCategory && (
                <TouchableOpacity
                  style={{ backgroundColor: selectedCategory.theme }}
                  className={`mr-2 px-4 py-2 rounded-full text-white`}
                >
                  <Text className='text-white'>
                    {`${selectedCategory.icon} ${selectedCategory.label}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.label}
                  onPress={() => setSelectedCategory(category)}
                  style={{ backgroundColor: category.theme }}
                  className={`mr-2 px-4 py-2 rounded-full text-white ${
                    selectedCategory?.label === category.label && 'bg-blue-500' 
                  }`}
                >
                  <Text className='text-white'>
                    {`${category.icon} ${category.label}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View className={`${cardBgColor} p-4 rounded-xl space-y-4`}>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between"
            >
              <Text className={`${textColor}`}>Start Date</Text>
              <Text className={textColor}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between"
            >
              <Text className={`${textColor}`}>Start Time</Text>
              <Text className={textColor}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {Platform.OS === 'ios' && showTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setStartTime(date);
                }}
              />
            )}

            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setStartTime(date);
                }}
              />
            )}
          </View>

          {/* Subtasks */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <Text className={`${textColor} mb-2`}>Subtasks</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Add subtask"
                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                className={`flex-1 border ${borderColor} p-2 rounded mr-2 ${textColor}`}
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
                <Text className={textColor}>{subtask}</Text>
                <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Attachments */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`${textColor}`}>Attachments</Text>
              <TouchableOpacity 
                onPress={handleAddAttachment}
                className="bg-blue-500 p-2 rounded"
              >
                <Ionicons name="attach" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {attachments.map((attachment, index) => (
              <View key={index} className="flex-row items-center justify-between py-2">
                <Text 
                  className={`${textColor} flex-1 mr-2`} 
                  numberOfLines={1} 
                  ellipsizeMode="middle"
                >
                  {attachment.name}
                </Text>
                <Text className={`${textColor} text-xs mr-2`}>
                  {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : ''}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveAttachment(attachment.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Reminder Switch */}
          <View className={`${cardBgColor} p-4 rounded-xl`}>
            <View className="flex-row items-center justify-between">
              <Text className={`${textColor}`}>Set Reminder</Text>
              <Switch
                value={hasReminder}
                onValueChange={setHasReminder}
                trackColor={{ 
                  false: isDarkMode ? '#444' : '#ccc', 
                  true: '#blue-500' 
                }}
                thumbColor={hasReminder ? '#2563EB' : isDarkMode ? '#666' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className={`p-4 ${cardBgColor} border-t ${borderColor}`}>
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