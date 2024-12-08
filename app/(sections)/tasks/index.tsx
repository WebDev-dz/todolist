import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Alert, useWindowDimensions, RefreshControl, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category, Task, useTaskStore } from '@/store/taskStore';
import TabBar from '@/components/TabBar';

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { cn } from '@/lib/utils';
import { TaskItem } from '@/components/TaskItem';
// import { categories } from '@/constants';
type TimeFrame = 'all' | 'today' | 'previous' | 'future';
import EmojiPicker, { EmojiKeyboard } from 'rn-emoji-keyboard'
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/hooks/ThemeProvider';
import WavesButton from '@/components/ui/waves-button';
import { format } from 'date-fns';
import Accordion from '@/components/ui/accordion';


const HomePage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const { tasks, updateTask, deleteTask, addCategory, categories } = useTaskStore(t => t);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const { isDarkMode } = useTheme()
  // const { tasks: loadedTasks, loading, error, refreshTasks } = useTasks();


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // await refreshTasks();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      Alert.alert('Refresh Failed', 'Failed to refresh tasks');
    } finally {
      setRefreshing(false);
    }
  };


  const getFilteredTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(task => task.category?.label === selectedCategory);
    }

    return filtered;
  };

  const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
    addCategory({
      ...newCategory,
      // @ts-ignore
      id: Date.now().toString(),
    });
  };



  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);

    // If no tasks are selected, exit selection mode
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };


  useEffect(() => {
    console.log({ tasks })
  }, [])


  const handleBulkComplete = () => {
    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        updateTask({
          ...task,
          completed: true,
          subtasks: task?.subtasks?.map(st => ({ ...st, completed: true }))
        });
      }
    });
    setSelectedTasks(new Set());
    setIsSelectionMode(false);
  };


  const handleDeleteConfirm = async () => {
    try {

      selectedTasks.forEach(async (taskId) => {
        await deleteTask(taskId as string);

      })
      // Close the modal
      setIsDeleteModalVisible(false);
      setSelectedTasks(new Set());

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

  const groupTasks = (tasks: Task[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timedTasks = tasks.filter(task => task.startDate)
    return {
      completed: tasks.filter(task => task.completed),
      notTimed: tasks.filter(t => !t.startDate),
      today: timedTasks.filter(task => {
        const taskDate = new Date(task.startDate!);
        taskDate.setHours(0, 0, 0, 0);
        return !task.completed && taskDate.getTime() === today.getTime();
      }),
      future: timedTasks.filter(task => {
        const taskDate = new Date(task.startDate!);
        taskDate.setHours(0, 0, 0, 0);
        return !task.completed && taskDate.getTime() > today.getTime();
      })
    };
  };

  return (
    <SafeAreaView style={{ height: height }} className={cn(
      'pt-11',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    )}>
      <View className="h-screen">
        {/* Header */}
        <View className={cn(
          "pt-11 pb-6 px-4",
          isDarkMode ? "bg-gray-800" : "bg-blue-500"
        )}>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons name="person-circle-outline" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold mb-4">My Tasks</Text>

          {/* Search Bar */}
          <View className={cn(
            "rounded-xl flex-row items-center px-4 py-2",
            isDarkMode ? "bg-gray-700" : "bg-white/20"
          )}>
            <Ionicons name="search-outline" size={20} color="white" />
            <TextInput
              className="flex-1 ml-2 text-white placeholder:text-white/70"
              placeholder="Search tasks..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Time Frame Selector */}
        <View className={cn(
          "flex-row justify-around py-2 mb-2",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          {(['all', 'today', 'previous', 'future'] as TimeFrame[]).map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => setTimeFrame(tf)}
              className={cn(
                'px-4 py-2 rounded-full',
                timeFrame === tf ?
                  (isDarkMode ? 'bg-blue-600' : 'bg-blue-500') :
                  'bg-transparent'
              )}
            >
              <Text className={cn(
                timeFrame === tf ? 'text-white' :
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}>
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className='overflow-hidden flex-1'>
          <View className={cn('h-14', { "mt-20": isSelectionMode })}>
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 mb-2 h-10"
              contentContainerStyle={{ alignItems: "center", height: 40, marginBottom: 2 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.label}
                  style={{ backgroundColor: category.theme }}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.label ? null : category.label
                  )}
                  className="mr-2 px-4 py-2 rounded-full"
                >
                  <Text className="text-white">
                    {category.icon + " " + category.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setIsAddCategoryModalVisible(true)}
                className={cn(
                  "mr-2 px-4 py-2 rounded-full",
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                )}
              >
                <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  + Add Category
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tasks List */}
          <View className='flex-1 mb-auto'>
            <ScrollView
              className="px-4 mt-2"
              contentContainerStyle={{ flex: 0 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[isDarkMode ? '#60A5FA' : '#3B82F6']}
                  tintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
                  title="Pull to refresh"
                  titleColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
                />
              }
            >
              {/* Group tasks and render in accordions */}
              {(() => {
                const groupedTasks = groupTasks(getFilteredTasks());

                return (
                  <>
                    <Accordion
                      title="Today"
                      badge={groupedTasks.today.length}
                      isDarkMode={isDarkMode}
                    >
                      {groupedTasks.today.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isSelectionMode={isSelectionMode}
                          selectedTasks={selectedTasks}
                          toggleTaskSelection={toggleTaskSelection}
                          setIsSelectionMode={setIsSelectionMode}
                          setSelectedTasks={setSelectedTasks}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </Accordion>

                    <Accordion
                      title="Future Tasks"
                      badge={groupedTasks.future.length}
                      isDarkMode={isDarkMode}
                    >
                      {groupedTasks.future.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isSelectionMode={isSelectionMode}
                          selectedTasks={selectedTasks}
                          toggleTaskSelection={toggleTaskSelection}
                          setIsSelectionMode={setIsSelectionMode}
                          setSelectedTasks={setSelectedTasks}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </Accordion>

                    <Accordion
                      title="Completed"
                      badge={groupedTasks.completed.length}
                      isDarkMode={isDarkMode}
                    >
                      {groupedTasks.completed.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isSelectionMode={isSelectionMode}
                          selectedTasks={selectedTasks}
                          toggleTaskSelection={toggleTaskSelection}
                          setIsSelectionMode={setIsSelectionMode}
                          setSelectedTasks={setSelectedTasks}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </Accordion>
                  </>
                );
              })()}
            </ScrollView>
          </View>

          {/* Selection Mode Actions */}
          {isSelectionMode && (
            <View className={cn(
              "absolute top-0 left-0 right-0 p-4 flex-row justify-around border-t",
              isDarkMode ?
                "bg-gray-800 border-gray-700" :
                "bg-white border-gray-200"
            )}>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedTasks(new Set());
                  }}
                  className="mr-4"
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDarkMode ? "white" : "black"}
                  />
                </TouchableOpacity>
                <Text className={isDarkMode ? "text-white" : "text-black"}>
                  {selectedTasks.size} selected
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleBulkComplete}
                className={cn(
                  "px-6 py-2 rounded-full",
                  isDarkMode ? "bg-blue-600" : "bg-blue-500"
                )}
              >
                <Text className="text-white">Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsSelectionMode(false);
                  setIsDeleteModalVisible(true)
                }}
                className="bg-red-500 px-6 py-2 rounded-full"
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <TabBar>
            {/* Add Goal Button */}
            <View className="items-center flex-1 justify-center relative mx-5">

              <WavesButton
                onPress={() => { router.push('/(sections)/goals/addGoal') }}
                className={cn(
                  "w-14 h-14 rounded-full justify-center items-center",
                  isDarkMode ? "bg-blue-600" : "bg-blue-500"
                )}
              >
                <Ionicons name="add" size={30} color="white" />
              </WavesButton>
            </View>
          </TabBar>
        </View>

        {/* Modals */}
        <DeleteConfirmationModal
          isVisible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete these ${selectedTasks.size} tasks? This action cannot be undone.`}
          isDarkMode={isDarkMode}
        />

        <AddCategoryModal
          visible={isAddCategoryModalVisible}
          onClose={() => setIsAddCategoryModalVisible(false)}
          onAdd={handleAddCategory}
          isDarkMode={isDarkMode}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomePage;





// Expanded theme colors with varying shades and modern palette
const themeColors = {
  blue: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
  green: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
  yellow: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D'],
  red: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
  purple: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'],
  pink: ['#DB2777', '#EC4899', '#F472B6', '#F9A8D4'],
  orange: ['#EA580C', '#F97316', '#FB923C', '#FDBA74'],
  teal: ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4'],
  indigo: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'],
  gray: ['#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'],
};

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
  isDarkMode: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ visible, onClose, onAdd, isDarkMode }) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');
  const [theme, setTheme] = useState('#3B82F6');
  const [error, setError] = useState<{ label: string } | undefined>()
  const [selectedColorGroup, setSelectedColorGroup] = useState<keyof typeof themeColors>('blue');
  const windowWidth = useWindowDimensions().width;

  const handleAdd = () => {
    if (!label.trim()) {
      setError({ label: "min label is 3 characters" })
      return;
    }
    if (!icon) {
      Alert.alert('Error', 'Please select an emoji icon');
      return;
    }
    onAdd({ label, icon, theme });
    setLabel('');
    setIcon('');
    setTheme('#3B82F6');
    setSelectedColorGroup('blue');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={cn(
          "rounded-2xl p-6 w-11/12 max-h-[90%]",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Add New Category</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className={cn(
                "text-xl",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Category Name Input */}
          <View className="mb-4">
            <Text className={cn(
              "text-sm font-medium mb-1",
              error?.label ? "text-red-500" : isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>Category Name</Text>
            <TextInput
              className={cn(
                "rounded-xl p-3 text-base border",
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900",
                error?.label && "border-red-500"
              )}
              placeholder="Enter category name..."
              value={label}
              onChangeText={setLabel}
              placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            {error?.label && (
              <Text className="text-sm font-medium text-red-500">{error.label}</Text>
            )}
          </View>

          {/* Emoji Selector */}
          <View className="mb-4">
            <Text className={cn(
              "text-sm font-medium mb-1",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>Select Icon</Text>
            <View className={cn(
              "h-52 rounded-xl overflow-hidden border",
              isDarkMode ? "border-gray-600" : "border-gray-200"
            )}>
              <EmojiKeyboard
                hideHeader
                styles={{
                  container: {
                    paddingHorizontal: 0,
                    width: windowWidth * 0.85,
                    shadowColor: "transparent",
                    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                    borderRadius: 12,
                  },

                }}
                onEmojiSelected={(emoji) => setIcon(emoji.emoji)}
              />
            </View>
          </View>

          {/* Selected Emoji Preview */}
          {icon && (
            <View className={cn(
              "mb-4 p-3 rounded-xl flex-row items-center",
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            )}>
              <Text className="text-2xl mr-2">{icon}</Text>
              <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Selected Icon
              </Text>
            </View>
          )}

          {/* Color Groups */}
          <Text className={cn(
            "text-sm font-medium mb-1",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}>Color Palette</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {Object.entries(themeColors).map(([colorName, shades]) => (
              <TouchableOpacity
                key={colorName}
                onPress={() => setSelectedColorGroup(colorName as keyof typeof themeColors)}
                className={cn(
                  "mr-3 p-2 rounded-xl",
                  selectedColorGroup === colorName
                    ? isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    : ""
                )}
              >
                <View className="flex-row">
                  {shades.map((color) => (
                    <View
                      key={color}
                      style={{ backgroundColor: color }}
                      className="w-4 h-4 rounded-full mr-1"
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Color Shades */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {themeColors[selectedColorGroup].map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setTheme(color)}
                className={`mr-3 ${theme === color ? 'scale-110' : ''}`}
              >
                <View
                  style={{ backgroundColor: color }}
                  className={cn(
                    "w-10 h-10 rounded-xl",
                    theme === color && "border-2",
                    theme === color && (isDarkMode ? "border-white" : "border-gray-800")
                  )}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className={cn(
                "px-6 py-3 rounded-xl border",
                isDarkMode ? "border-gray-600" : "border-gray-300"
              )}
            >
              <Text className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={{ backgroundColor: theme }}
              className="px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
