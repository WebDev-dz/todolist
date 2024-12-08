import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTaskStore } from '@/store/taskStore';

const alertSounds = [
  { id: '1', name: 'Classic Alarm', file: require('?.?./assets/sounds/classic-alarm?.mp3') },
  { id: '2', name: 'Digital Beep', file: require('?.?./assets/sounds/digital-beep?.mp3') },
  { id: '3', name: 'Gentle Chime', file: require('?.?./assets/sounds/gentle-chime?.mp3') },
  // Add more sounds as needed
];

const AddTaskScreen = () => {
  const router = useRouter();
  const addTask = useTaskStore((state) => state?.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [selectedSound, setSelectedSound] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    return sound
      ? () => {
          sound?.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDueDate = new Date(dueDate);
      newDueDate?.setHours(selectedTime?.getHours());
      newDueDate?.setMinutes(selectedTime?.getMinutes());
      setDueDate(newDueDate);
    }
  };

  const playSound = async (soundFile) => {
    if (sound) {
      await sound?.unloadAsync();
    }
    const { sound: newSound } = await Audio?.Sound?.createAsync(soundFile);
    setSound(newSound);
    await newSound?.playAsync();
  };

  const handleSelectSound = (soundItem) => {
    setSelectedSound(soundItem);
    playSound(soundItem?.file);
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date?.now()?.toString(),
      title,
      description,
      completed: false,
      startDate: dueDate,
      startTime: dueDate?.toTimeString()?.slice(0, 5),
      priority,
      alertSound: selectedSound ? selectedSound?.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addTask(newTask);
    router?.back();
  };

  const renderSoundItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectSound(item)}
      className={`flex-row items-center justify-between p-3 mb-2 rounded-xl ${
        selectedSound && selectedSound?.id === item?.id ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      <Text className="text-base">{item?.name}</Text>
      <Ionicons
        name={selectedSound && selectedSound?.id === item?.id ? 'checkmark-circle' : 'play-circle'}
        size={24}
        color={selectedSound && selectedSound?.id === item?.id ? 'blue' : 'black'}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Task Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          className="border border-gray-300 rounded-xl p-3 text-base"
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
          className="border border-gray-300 rounded-xl p-3 text-base"
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Due Date</Text>
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center border border-gray-300 rounded-xl p-3"
        >
          <Ionicons name="calendar-outline" size={24} color="gray" className="mr-2" />
          <Text className="text-base">{dueDate?.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Due Time</Text>
        <TouchableOpacity 
          onPress={() => setShowTimePicker(true)}
          className="flex-row items-center border border-gray-300 rounded-xl p-3"
        >
          <Ionicons name="time-outline" size={24} color="gray" className="mr-2" />
          <Text className="text-base">{dueDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Priority</Text>
        <View className="flex-row justify-between">
          {['low', 'medium', 'high']?.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              className={`flex-1 py-2 px-4 rounded-full mr-2 ${priority === p ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <Text className={`text-center ${priority === p ? 'text-white' : 'text-gray-700'}`}>
                {p?.charAt(0)?.toUpperCase() + p?.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Alert Sound</Text>
        <FlatList
          data={alertSounds}
          renderItem={renderSoundItem}
          keyExtractor={(item) => item?.id}
          scrollEnabled={false}
        />
      </View>

      <TouchableOpacity
        onPress={handleAddTask}
        className="bg-blue-500 py-3 px-4 rounded-xl mb-4"
      >
        <Text className="text-white text-center text-lg font-semibold">Add Task</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

export default AddTaskScreen;
