import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { CheckBox } from '@/components/ui/checkbox';
import { AVPlaybackSource, Audio } from 'expo-av';
import { cn } from '@/lib/utils';
import DropdownComponent from './TaskItemDropdown';









export const TaskItem = ({ task }: { task: Task }) => {

    const { updateTask, addTask, deleteTask } = useTaskStore(t => t)
    const {
        title,
        startDate,
        startTime,
        completed,
        description,
        attachments,
        subtasks,

    } = task;


    const [sound, setSound] = useState<Audio.Sound | undefined>();
    const [itemDisabled, setItemDisabled] = useState(false)


    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);




    const playSound = async (soundFile: AVPlaybackSource) => {
        if (sound) {
            await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
        setSound(newSound);
        return await newSound.playAsync();
    }

    // const formattedDate = startDate ? format(new Date(startDate), 'MMM d') : null;
    const initial = title.charAt(0).toUpperCase();

    const handleDublicate = () => {
        const newTask: Task = {
            ...task,
            id: Date.now().toString(),

        };
        addTask(newTask);

    };
    const handleDelete = () => {

        deleteTask(task.id)
    };


    return (
        <View className={cn("flex-row items-center px-4 py-3 border-b border-gray-200 gap-2 max-h-36 overflow-hidden")}>
            <CheckBox value={completed} disabled={itemDisabled || completed} onCheckedChange={async (e) => {
                setItemDisabled(true)
                await (await playSound(require("@/assets/sounds/success.mp3")));
                updateTask({ ...task, completed: true })
                setItemDisabled(false)
            }} />
            <View className='flex-col items-center justify-center border-r-2 h-full border-blue-800'>
                <View className=" bg-purple-200 rounded-md mr-3 p-2">
                    <Text className="text-purple-700 font-semibold text-lg">
                        {(new Date(startTime || initial)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {/* {formattedDate && (
            <Text className="text-xs text-gray-500 mr-2">{formattedDate}</Text>
          )} */}
            </View>


            <View className="flex-1">
                <Text className="text-gray-800 font-semibold">{title}</Text>
                {description && (
                    <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
                        {description}
                    </Text>
                )}
                <View className="flex-row items-center mt-2">

                    {attachments?.length > 0 && (
                        <View className="flex-row items-center mr-2">
                            <Ionicons name="attach" size={12} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">{attachments?.length}</Text>
                        </View>
                    )}
                    {subtasks?.length > 0 && (
                        <View className="flex-row items-center">
                            <Ionicons name="list" size={12} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">{subtasks?.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            <DropdownComponent onDublicate={handleDublicate} onDelete={handleDelete} />

        </View>
    );
};



