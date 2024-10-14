import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { router, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent, DatePickerOptions } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Attachment, Task, useTaskStore } from '@/store/taskStore';
import { Audio, AVPlaybackSource } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Sound } from 'expo-av/build/Audio';
import { CustomInput, Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { add, format } from 'date-fns';
import { defaultTask, TaskSchema } from '@/lib/schema';
import BottomModalDocumentPicker from '@/components/BottomModalDocumentPicker';
import Feather from '@expo/vector-icons/Feather';



const alertSounds = [
  { id: '1', name: 'Classic Alarm', file: require('@/assets/sounds/classic-alarm.wav') },
  { id: '2', name: 'Digital Beep', file: require('@/assets/sounds/digital-beep.wav') },
  { id: '3', name: 'Gentle Chime', file: require('@/assets/sounds/sound.wav') },
  // Add more sounds as needed
];

type AlertSound = typeof alertSounds[0]

const AddTaskScreen = ({ task }: { task: Task }) => {
  const router = useRouter();
  const addTask = useTaskStore((state) => state.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [isEditingNotes, setEditingNotes] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [selectedSound, setSelectedSound] = useState<null | AlertSound>(null);
  const [priority, setPriority] = useState('Medium');
  const [sound, setSound] = useState<Audio.Sound | undefined>();

  const form = useForm<typeof TaskSchema._output>({
    defaultValues: defaultTask
  })
  const alertTime = form.watch("alertTime");

  useEffect(() => {

    console.log(defaultTask)
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (typeof selectedDate === "string") {
        setDueDate(new Date(selectedDate))
        return
      }
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      if (typeof selectedTime === "string") {
        form.setValue("startTime", selectedTime)
        return
      }
      form.setValue("startTime", selectedTime.toString())
    }
  };

  const handleReminderChange = (event: DateTimePickerEvent, selectedTime?: Date | string | undefined) => {
    setShowReminderPicker(false);
    if (selectedTime) {
      if (typeof selectedTime === "string") {
        form.setValue("alertTime", selectedTime)
        return
      }
      form.setValue("alertTime", selectedTime.toString())
    }
  };

  const playSound = async (soundFile: AVPlaybackSource) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
    setSound(newSound);
    await newSound.playAsync();
  };

  const handleSoundSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {

        setSound(result.assets.at(0)?.uri);

      }
    } catch (error) {
      console.error('Error selecting sound:', error);
    }
  };

  const handleSelectSound = (soundItem: AlertSound) => {
    setSelectedSound(soundItem);
    playSound(soundItem.file);
  };

  const handleAddTask = () => {
    addTask(form.getValues());
    router.back();
  };

  const renderSoundItem = ({ item }: { item: AlertSound }) => (
    <TouchableOpacity
      onPress={() => handleSelectSound(item)}
      className={`flex-row items-center justify-between p-3 mb-2 rounded-lg ${selectedSound && selectedSound.id === item.id ? 'bg-blue-100' : 'bg-gray-100'
        }`}
    >
      <Text className="text-base">{item.name}</Text>
      <Ionicons
        name={selectedSound && selectedSound.id === item.id ? 'checkmark-circle' : 'play-circle'}
        size={24}
        color={selectedSound && selectedSound.id === item.id ? 'blue' : 'black'}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-white p-3 pt-10">

      { }
      <Form {...form}>
        {/*       Header           */}

        <View className='flex-row justify-between p-3 border-b'>
          <View className='flex-row gap-2 items-center'>
            <TouchableOpacity onPress={(e) => {
              router.back()
            }}>
              <Ionicons name="arrow-back" size={20} />
            </TouchableOpacity>
            <Text>
              Add Task
            </Text>
          </View>

          <TouchableOpacity onPress={handleAddTask} className="bg-blue-500 px-4 py-2 rounded-full">
            <Text className="text-white font-medium">Send</Text>
          </TouchableOpacity>

        </View>

        {/*     Add Title */}
        <View className="mb-4 flex-row gap-3 items-center m mt-2">
          <Text className="text-lg font-semibold mb-2 mr-3">Task Title</Text>
          <Input containerClassName='flex-1'  value= {form.watch("title")} onChangeText={(e) => {
              form.setValue("title", e)
          }} />
        </View>

        {/*     Add Description */}

       

        <View className="mb-4 flex-row gap-3 items-center">
          <Ionicons name="calendar-outline" size={20} color="gray" className="mr-2" />
          <Text className="text-base font-semibold  mr-auto">Due Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden "
          >
            <Text className="text-base">{dueDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>


        <View className="mb-4 flex-row gap-3 items-center">
          <Ionicons name="time-outline" size={24} color="gray" className="mr-2" />
          <Text className="text-base font-semibold  mr-auto">Due Time</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden "
          >
            <Text className="text-base">{(new Date(form.watch("startTime")!)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4 flex-row gap-3 items-center">
          <Ionicons name="notifications-outline" size={24} color="gray" className="mr-2" />
          <Text className="text-base font-semibold  mr-auto">Reminder</Text>
          {form.watch("startTime") ? <TouchableOpacity
            onPress={() => setShowReminderPicker(true)}
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden"
          >
            <Text className="text-base">{(new Date(form.watch("startTime")!)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity> : <TouchableOpacity
            onPress={() => setShowReminderPicker(true)}
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden"
          >
            <Ionicons size={24} name="add" />
          </TouchableOpacity> }
        </View>

        <View className="mb-4 flex-row gap-3 items-center">
        <Feather name="file-text" size={24} color="black" />
          <Text className="text-base font-semibold  mr-auto">Notes</Text>
          <TouchableOpacity
            onPress={() => setEditingNotes(true)}
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden"
          >
            <Ionicons size={24} name="pencil-outline" />
          </TouchableOpacity>
          
        </View>
        <View>
            {!isEditingNotes ?  <Text className='text-sm'>
              {form.watch("notes")}
            </Text> : <TextInput
            value={form.watch("notes")}
            onChangeText={(text) => {form.setValue("notes", text)}}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            className=" border-gray-300 rounded-lg p-1 text-base flex-1"
          /> } 
           
        </View>

        <View className="mb-4 flex-row gap-3 items-center">
          <Ionicons name="file-tray-full" size={24} color="gray" className="mr-2" />
          <Text className="text-base font-semibold  mr-auto">Attachments</Text>
          <BottomModalDocumentPicker form  = {form}  />
        </View>
        <View className='flex-row gap-2 my-3'>
            {form.watch("attachments").map((att, id) => (
              <Image key={id} src= {att.uri} width={100} height={100} />
            ))}
        </View>

        <View className="mb-4 flex-row gap-3 items-center">
        <Ionicons name="flag" size={24} color="gray" className="mr-2" />
          <Text className="text-lg font-semibold mb-2">Priority</Text>
          <View className="flex-row justify-between">
            {pririties.map((p) => (
              <TouchableOpacity
                key={p.priority}
                onPress={() => setPriority(p.priority)}
                className={` py-2 px-3 rounded-full flex-row gap-1 items-center  mr-2 ${p.className}`}
              >
                {priority == p.priority && <Ionicons name="checkmark" className={p.className} size={16} />}
                <Text className={`text-center text-sm ${ p.className }`}>
                  {p.priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Alert Sound</Text>
          <FlatList
            data={alertSounds}
            renderItem={renderSoundItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View> */}

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
        {showReminderPicker && (
          <DateTimePicker
            value= { alertTime ? new Date(alertTime): new Date(dueDate)}
            mode="time"
            display="default"
            onChange={handleReminderChange}

          />
        )}
      </Form>
    </ScrollView>
  );
};

export default AddTaskScreen;






const pririties = [
  { priority: "Low", className: "bg-green-100 text-green-500" },
  { priority: "Medium", className: "bg-blue-100 text-blue-500" },
  { priority: "High", className: "bg-red-100 text-red-500" },
]