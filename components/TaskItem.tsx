import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { CheckBox } from '@/components/ui/checkbox';
import { AVPlaybackSource, Audio } from 'expo-av';
import { cn } from '@/lib/utils';
import DropdownComponent from './TaskItemDropdown';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';




type TaskProps = {
    task: Task,
    isSelectionMode: boolean,
    selectedTasks: Set<string>,
    isDarkMode: boolean,
    toggleTaskSelection: (task: string) => void
    setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedTasks: React.Dispatch<React.SetStateAction<Set<string>>>
}




export const TaskItem = ({ task, isSelectionMode, isDarkMode, selectedTasks, toggleTaskSelection, setIsSelectionMode, setSelectedTasks }: TaskProps) => {

    const { updateTask, addTask, deleteTask, selectedTask, setSelectedTask, getExpired } = useTaskStore(t => t)



    const [sound, setSound] = useState<Audio.Sound | undefined>();
    const [itemDisabled, setItemDisabled] = useState(false);

    const handleTaskPress = (taskId: string) => {
        if (isSelectionMode) {
            toggleTaskSelection(taskId);
        } else {
            // @ts-ignore
            router.push(`/(sections)/tasks/task?taskId=${task.id}`);
        }
    };

    const getTaskProgress = (task: Task) => {
        const subtasks = task.subtasks
        if (!subtasks) return 0;
        if (task?.subtasks?.length === 0) return 0;
        const completed = subtasks.filter(subtask => subtask.completed).length;
        return (completed / subtasks.length) * 100;
    };
    const handleTaskLongPress = (taskId: string) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedTasks(new Set([taskId]));
        }
    };


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
        <View className={cn('flex-row justify-between ',)} >
            {isSelectionMode && <Checkbox
                value={selectedTasks.has(task.id)}
                // disabled={!isSelectionMode && task.completed}
                onValueChange={() => {
                    Vibration.vibrate([1, 1, 1, 1, 1])

                    toggleTaskSelection(task.id);

                }}
                className={`w-5 h-5 rounded-md mt-3 border-2 mr-3 items-center justify-center ${(selectedTasks.has(task.id))
                    ? 'bg-gray-300 border-blue-500'
                    : 'border-gray-300'
                    }`}
            />}
            <TouchableOpacity
                style={{ borderColor: task?.category?.theme }}
                key={task.id}
                onPress={() => handleTaskPress(task.id)}
                onLongPress={() => handleTaskLongPress(task.id)}
                className={cn(`flex-1 rounded-xl border-l-4 shadow-sm p-4 mb-3 ${selectedTasks.has(task.id) ? 'bg-blue-50' : ''
                    }`, isDarkMode ? "bg-gray-700" : "bg-white/20")}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                        {!isSelectionMode && <Checkbox
                            value={isSelectionMode ? selectedTasks.has(task.id) : task.completed}
                            disabled={!isSelectionMode && task.completed}
                            onValueChange={() => {
                                if (isSelectionMode) {
                                    toggleTaskSelection(task.id);
                                } else {
                                    updateTask({
                                        ...task,
                                        completed: true,
                                        subtasks: task?.subtasks?.map(st => ({ ...st, completed: true }))
                                    });
                                }
                            }}
                            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${(isSelectionMode && selectedTasks.has(task.id)) || task.completed
                                ? 'bg-blue-500 border-blue-500'
                                : isDarkMode ? "border-gray-300" : "border-white/25"
                                }`}
                        />}
                        <View className="flex-1">
                            <Text className={cn("font-semibold", isDarkMode ? 'text-white' : "text-gray-800", { "text-red-500": getExpired(task) && !task.completed, 'text-gray-400 line-through': task.completed })}>
                                {task.title}
                            </Text>
                            {task.description && (
                                <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                                    {task.description}
                                </Text>
                            )}
                        </View>
                    </View>
                    {task.category && (
                        <TouchableOpacity
                            key={task.category.label}
                            style={{ backgroundColor: task.category.theme }}

                            className={`px-2 py-1 ml-2 rounded`}
                        >
                            <Text className={'text-white text-xs'}>
                                {task.category.icon + " " + task.category.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Subtasks Progress */}
                {task?.subtasks?.length && task?.subtasks?.length > 0 ? (
                    <View className="mt-2">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-600 text-xs">
                                Subtasks: {task?.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </Text>
                            <Text className="text-gray-600 text-xs">
                                {Math.round(getTaskProgress(task))}%
                            </Text>
                        </View>
                        <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-blue-500"
                                style={{ width: `${getTaskProgress(task)}%` }}
                            />
                        </View>
                    </View>
                ) : <></>}

                {/* Task Details */}
                <View className="flex-row mt-3 items-center">
                    {task.startDate ? (
                        <View className="flex-row items-center mr-4">
                            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                            <Text className={cn("text-xs ml-1", isDarkMode ? "text-white/70" : "text-gray-500")}>
                                {new Date(task.startDate).toLocaleDateString()}
                            </Text>
                        </View>
                    ) : <></>}
                    {task.startTime ? (
                        <View className="flex-row items-center mr-4">
                            <Ionicons name="time-outline" size={16} color="#6B7280" />
                            <Text className={cn("text-xs ml-1", isDarkMode ? "text-white/70" : "text-gray-500")}>{new Date(`${task.startDate}T${task.startTime}`).toLocaleTimeString()}</Text>
                        </View>
                    ) : <></>}
                    {task?.attachments?.length && task?.attachments?.length > 0 ? (
                        <View className="flex-row items-center">
                            <Ionicons name="attach-outline" size={16} color="#6B7280" />
                            <Text className={cn("text-xs ml-1", isDarkMode ? "text-white/70" : "text-gray-500")}>
                                {`${task.attachments.length} files`}
                            </Text>
                        </View>
                    ) : <></>}
                </View>
                {/* Task Progress and Details sections remain the same */}
                {/* ... existing code ... */}
            </TouchableOpacity>
        </View>
    );
};



