import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { CustomInput, Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import { router } from 'expo-router';
import { Task, useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { StyledRecorder, ThemedRecorderSheet } from '@/components/Recorder';
import { usePermissions } from 'expo-av/build/Audio';
import { CheckBox } from '@/components/ui/checkbox';
import { extractDays, groupTasksByExactDate, sortTasksByDate } from '@/lib/utils';
import { TaskItem } from '@/components/TaskItem';
import BottomSheetInput from '@/components/BottomSheetInput';
import BottomModal from '@/components/BottomModal';
import TabBar from '@/components/TabBar';



const ListView = () => {

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { tasks, setTasks } = useTaskStore(t => t)

  const recorderRef = useRef<any>(null)
  const [permissionStatus, permissionRequest] = usePermissions()

  const openRecorder = async () => {

    if (!permissionStatus?.granted) permissionRequest();

    recorderRef?.current?.present()
  }

  return (

    <SafeAreaView className="flex-1 bg-gray-100 pt-10">
      <View className="bg-white px-4 py-3 flex-row items-center">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2"
          placeholder="Search"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity className='bg-red-500 rounded-lg p-2 flex-row gap-1' onPress={(e) => {
            setTasks([])
          }}>
          <Ionicons name="trash" size={24} color="#8B5CF6" />
          <Text className='text-white' >Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-2 bg-white">


        <FlatList data={extractDays(tasks)} renderItem={(taskList) => (

          <View>
            <Text className='text-xl font-semibold'> {(new Date(taskList.item[0])).toDateString()} </Text>
            <FlatList  className='rounded-lg my-2' data={taskList.item[1]} renderItem={(item) => <TaskItem task={item.item} />} keyExtractor={(i) => i.id} />

          </View>


        )} />
          <BottomModal>
            <StyledRecorder className='p-4' ref={recorderRef} />
          </BottomModal>

        <BottomSheetInput />

      </ScrollView>
      

        <TouchableOpacity onPress={(e) => {
          router.push("/(tabs)/ai/generated")
        }}>
          <Text>Ai</Text>
        </TouchableOpacity>

      <TabBar />
    </SafeAreaView>

  );
};

export default ListView;