import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Navigator } from 'expo-router';
import { Attachment, Subtask, Task, useTaskStore } from '@/store/taskStore';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Checkbox from 'expo-checkbox';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

const TaskDetailsPage: React.FC = () => {
    const router = useRouter();
    const { taskId } = useLocalSearchParams();
    console.log({ taskId })
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);


    const { tasks, deleteTask, updateSubtask, addSubtask, updateTask } = useTaskStore();
    const [task, setTask] = useState<Task | undefined>()

    // ... (keep your existing state and helper functions)

    const handleDeleteConfirm = async () => {
        try {
            // Add your delete logic here
            // Example:
            await deleteTask(taskId as string);
            // Close the modal
            setIsDeleteModalVisible(false);

            // Show success message or handle any cleanup
            Alert.alert("Deleted Successfully", "the task has been deleted successfully")
            // Navigate back
            router.back();
        } catch (error) {
            console.error('Error deleting task:', error);
            // Handle error (show error message, etc.)
            Alert.alert("Deleted Failed", "Failed to delete the task")
        }
    };
    // Mock function to get task by ID - replace with your actual data fetching logic
    const getTaskById = (id: string): Task => {
        return tasks?.find(task => task?.id === id)!
    };

    useEffect(() => {
        setTask(getTaskById(taskId as string))
    }, [taskId])

    const handleToggleSubtask = (subtask: Subtask) => {
        // Implement subtask toggle logic
        const updatedSubtasks = {


            subtasks: task?.subtasks?.map((sub) =>
                sub.id == subtask.id ? { ...subtask, completed: true } : subtask
            ),

        }
        updateSubtask(task?.id!, { ...subtask, completed: true })
        // updateTask({...task, subtasks: updatedSubtasks.subtasks})
        console.log({ updatedSubtasks: updatedSubtasks.subtasks })
        console.log({ subtasks: task?.subtasks })
        setTask(getTaskById(taskId as string))
    };

    const handleAddSubtask = () => {
        if (newSubtask?.trim() && task) {
            // Implement add subtask logic
            console.log('Add subtask:', newSubtask);
            addSubtask(task.id, { id: (new Date()).toString(), title: newSubtask, completed: false, })
            setNewSubtask('');
        }
    };


    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all file types
                multiple: true,
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

            const newAttachments: Attachment[] = await Promise.all(
                result.assets.map(async (file) => {
                    // Get file info using FileSystem
                    const fileInfo = await FileSystem.getInfoAsync(file.uri);
                    console.log({fileInfo})
                    return {
                        id: Math.random().toString(36).substring(2, 9),
                        name: file.name,
                        size: file ? file?.size : 0,
                        uri: file.uri,
                        type: file.mimeType || 'application/octet-stream'
                    };
                })
            );

            if (task) {
                const updatedTask = {
                    ...task,
                    attachments: [...(task.attachments || []), ...newAttachments]
                };
                setTask(updatedTask);
                updateTask(updatedTask);
                Alert.alert('Success', 'Files attached successfully');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to attach files');
        }
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        if (task) {
            const updatedAttachments = task?.attachments?.filter(
                attachment => attachment.id !== attachmentId
            );
            const updatedTask = { ...task, attachments: updatedAttachments };
            setTask(updatedTask);
            updateTask(updatedTask);
        }
    };

    const handleOpenFile = async (attachment: Attachment) => {
        try {
            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(attachment.uri);
            if (!fileInfo.exists) {
                Alert.alert('Error', 'File not found');
                return;
            }

            // Open file using the device's default app
            await FileSystem.getInfoAsync(attachment.uri) ;
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', 'Unable to open file');
        }
    };



    const formatFileSize = (bytes?: number): string => {
        if (bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';}
        return "";
    };

    const { isDarkMode } = useTheme();
    console.log({date: task?.startDate})
    return (
        <SafeAreaView className={cn(
            "h-screen mt-11",
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
        )}>
            {/* Header */}
            <View className={cn(
                "py-8 px-4",
                isDarkMode ? "bg-blue-600" : "bg-blue-500"
            )}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold flex-1">Task Details</Text>
                    <TouchableOpacity onPress={() => {
                        if (isEditing && task) {
                            updateTask(task)
                        }
                        setIsEditing(prev => !prev)
                    }}>
                        <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {/* Task Header */}
                <View className={cn(
                    "rounded-xl p-4 mb-4 shadow-sm",
                    isDarkMode ? "bg-gray-800" : "bg-white"
                )}>
                    <View className="flex-row items-center mb-3">
                        <TouchableOpacity
                            onPress={() => console.log('Toggle completion')}
                            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                                task?.completed ? 'bg-blue-500 border-blue-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}
                        >
                            {task?.completed && <Ionicons name="checkmark" size={16} color="white" />}
                        </TouchableOpacity>
                        {isEditing ? (
                            <TextInput
                                className={cn(
                                    "flex-1 text-lg font-semibold",
                                    isDarkMode ? "text-white" : "text-gray-800"
                                )}
                                value={task?.title}
                                onChangeText={(text) => task && setTask({ ...task, title: text })}
                                placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                            />
                        ) : (
                            <Text className={cn(
                                "flex-1 text-lg font-semibold",
                                isDarkMode ? "text-white" : "text-gray-800"
                            )}>{task?.title}</Text>
                        )}
                    </View>

                    {/* Category Badge */}
                    <View className={cn(
                        "self-start px-3 py-1 rounded-full mb-3",
                        isDarkMode ? "bg-blue-900/50" : "bg-blue-100"
                    )}>
                        <Text className={cn(
                            "text-sm",
                            isDarkMode ? "text-blue-300" : "text-blue-800"
                        )}>{task?.category?.label}</Text>
                    </View>

                    {/* Description */}
                    {isEditing ? (
                        <TextInput
                            className={cn(
                                "mb-3",
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            )}
                            multiline
                            value={task?.description}
                            onChangeText={(text) => task && setTask({ ...task, description: text })}
                            placeholder="Add description..."
                            placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                        />
                    ) : (
                        <Text className={cn(
                            "mb-3",
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                        )}>{task?.description}</Text>
                    )}

                    {/* Date and Time */}
                    <View className="flex-row flex-wrap gap-4 mb-3">
                        <TouchableOpacity
                            disabled={!isEditing}
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center justify-between"
                        >
                            <Ionicons 
                                name="calendar-outline" 
                                size={20} 
                                color={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                            />
                            <Text className={cn(
                                "ml-2",
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            )}>{task?.startDate ? format(task?.startDate, "yyyy-MM-dd") : (new Date()).toDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            className="flex-row items-center"
                            disabled={!isEditing}
                        >
                            <Ionicons 
                                name="time-outline" 
                                size={20} 
                                color={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                            />
                            <Text className={cn(
                                "ml-2",
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            )}>{(new Date(task?.startTime || "")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subtasks */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm h-auto">
                    <Text className="font-semibold text-lg mb-3">Subtasks</Text>
                    {task?.subtasks?.map((subtask) => (
                        <TouchableOpacity
                            key={subtask?.id}
                            onPress={() => handleToggleSubtask(subtask)}
                            className="flex-row items-center py-2"
                        >
                            <Checkbox value={subtask.completed} disabled={subtask?.completed} onValueChange={(e) => { updateSubtask(subtask.id, { ...subtask, "completed": e }) }} className={`w-5 h-5 rounded border ${subtask?.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                } mr-3 items-center justify-center`} />
                            {/* <View className={`w-5 h-5 rounded border ${subtask?.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                } mr-3 items-center justify-center`}>
                                {subtask?.completed && <Ionicons name="checkmark" size={14} color="white" />}
                            </View> */}
                            <Text className={`flex-1 ${subtask?.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {subtask?.title}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Add Subtask Input */}
                    <View className="flex-row items-center mt-3">
                        <TextInput
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 mr-2"
                            placeholder="Add new subtask?..."
                            value={newSubtask}
                            onChangeText={setNewSubtask}
                        />
                        <TouchableOpacity
                            onPress={handleAddSubtask}
                            className="bg-blue-500 p-2 rounded-xl"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Attachments */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <Text className="font-semibold text-lg mb-3">Attachments</Text>
                    {task?.attachments?.map((attachment) => (
                        <View
                            key={attachment.id}
                            className="flex-row items-center py-2 border-b border-gray-100"
                        >
                            <TouchableOpacity
                                onPress={() => handleOpenFile(attachment)}
                                className="flex-row items-center flex-1"
                            >
                                <View className="bg-gray-100 p-2 rounded mr-3">
                                    <Ionicons
                                        name={getFileIcon(attachment.type)as "push"}
                                        size={24}
                                        color="#6B7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800">{attachment.name}</Text>
                                    <Text className="text-gray-500 text-sm">
                                        {formatFileSize(attachment.size)}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDeleteAttachment(attachment.id)}
                                className="p-2"
                            >
                                <Ionicons name="trash-outline" size={20} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {isEditing ?<TouchableOpacity
                        onPress={handlePickDocument}
                        className="flex-row items-center justify-center mt-3 py-2 border border-blue-500 rounded-xl"
                    >
                        <Ionicons name="add" size={24} color="#7C3AED" />
                        <Text className="text-blue-500 ml-2">Add Attachment</Text>
                    </TouchableOpacity>: <></>}
                </View>

                {/* Notes */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <Text className="font-semibold text-lg mb-3">Notes</Text>
                    {isEditing ? (
                        <TextInput
                            className="text-gray-600"
                            multiline
                            aria-disabled={!task}
                            value={task?.notes}
                            onChangeText={(text) => task && setTask({ ...task, notes: text || "" })}
                            placeholder="Add notes..."
                        />
                    ) : (
                        <Text className="text-gray-600">{task?.notes}</Text>
                    )}
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                    onPress={() => setIsDeleteModalVisible(true)}
                    className={cn(
                        "rounded-xl p-4 mb-6 flex-row items-center justify-center",
                        isDarkMode ? "bg-red-900/30" : "bg-red-100"
                    )}
                >
                    <Ionicons name="trash-outline" size={24} color={isDarkMode ? "#ef4444" : "#DC2626"} />
                    <Text className={cn(
                        "ml-2 font-semibold",
                        isDarkMode ? "text-red-400" : "text-red-600"
                    )}>Delete Task</Text>
                </TouchableOpacity>
                {showDatePicker && task && (
                    <DateTimePicker
                        value={task.startDate  ? new Date(task?.startDate) : new Date()}
                        mode="date"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) updateTask({ ...task, startDate: date.toISOString() });
                        }}
                    />
                )}

                {showTimePicker && task && (
                    <DateTimePicker
                    style ={{}}
                    value={task.startTime  ? new Date(task?.startTime) : new Date()}
                        mode="time"
                        onChange={(event, date) => {
                            setShowTimePicker(false);
                            if (date) updateTask({ ...task, startTime: date.toISOString() });
                        }}
                    />
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default TaskDetailsPage;


const getFileIcon = (mimeType?: string): string => {
    if (mimeType?.startsWith('image/')) return 'image-outline';
    if (mimeType?.startsWith('video/')) return 'videocam-outline';
    if (mimeType?.startsWith('audio/')) return 'musical-notes-outline';
    if (mimeType?.includes('pdf')) return 'document-text-outline';
    if (mimeType?.includes('word')) return 'document-outline';
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return 'grid-outline';
    return 'document-outline';
};
