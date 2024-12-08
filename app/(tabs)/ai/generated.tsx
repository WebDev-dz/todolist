import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, useTaskStore } from '@/store/taskStore';
import { fetchChatCompletion, useFetchAi } from '@/hooks/useCustomAi';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { StyledRecorder } from '@/components/Recorder';
const examplePrompts = [
  "Create tasks for planning a birthday party next weekend",
  "Generate a weekly workout routine with daily exercises",
  "Make a project timeline for website redesign",
  "Create a moving preparation checklist for next month",
];


interface GeneratedTask extends Task {
  selected: boolean;
}

const GenerateTaskWithAIPage: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const { addTask } = useTaskStore();

  const parseAIResponse = (tasks: Task[]): GeneratedTask[] => {
    try {
      // Attempt to parse JSON from the response
      
      // If it's an array, process each task
      let parsed = tasks
      const generated =  parsed.map(task => ({
          ...task,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          selected: true, // Default to selected
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      return generated
      
      // If it's a single task, wrap it in an array
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  };


  const generateTaskWithAI = async (userPrompt: string) => {
    setIsGenerating(true);
    
    try {
      // Modify the prompt to specifically request JSON format
     

      const response = await useFetchAi(userPrompt);
      console.log({response})
      if (response.success == "false") {
        Alert.alert('Error', response.error);
        return;
      }
      if (response.success === "true") {

        const tasks = response?.data?.tasks?.map(task => ({...task,selected: false}))
        if (tasks.length > 0) {
          setGeneratedTasks(parseAIResponse(tasks));
          setRecentPrompts(prev => [userPrompt, ...prev.slice(0, 4)]);
        } else {
          Alert.alert('Error', 'Could not parse the AI response into tasks');
        }
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate tasks');
      console.error('Error generating tasks:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  // Handle audio recording submission
  const handleAudioSubmit = async (audioUri: string) => {
    try {
      setIsGenerating(true);
      // Here you would typically:
      // 1. Upload the audio file or convert it to base64
      // 2. Send it to your speech-to-text service
      // 3. Generate tasks based on the transcribed text
      
      // Mock implementation - replace with your actual API call
      const transcribedText = "Tasks transcribed from audio";
      await generateTaskWithAI(transcribedText);
      
      setShowRecorder(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process audio recording');
    } finally {
      setIsGenerating(false);
    }
  };

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setIsGenerating(true);
      // Mock implementation - replace with your actual API call
      const imageAnalysisText = "Generated tasks from image analysis";
      await generateTaskWithAI(imageAnalysisText);
    }
  };

  // Take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setIsGenerating(true);
      // Mock implementation - replace with your actual API call
      const imageAnalysisText = "Generated tasks from camera capture";
      await generateTaskWithAI(imageAnalysisText);
    }
  };

  // ... (keep your existing methods like parseAIResponse, generateTaskWithAI, etc.)

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Generate Tasks with AI</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Input Methods Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2">Create Tasks Using</Text>
          
          {/* Input Methods Grid */}
          <View className="flex-row flex-wrap justify-between mb-4">
            {/* Text Input Button */}
            <TouchableOpacity 
              className="w-[48%] aspect-square bg-blue-50 rounded-xl p-4 mb-4 items-center justify-center"
              onPress={() => {/* Handle text input focus */}}>
              <Ionicons name="create-outline" size={32} color="#3B82F6" />
              <Text className="text-blue-500 mt-2 font-medium">Text</Text>
            </TouchableOpacity>

            {/* Voice Input Button */}
            <TouchableOpacity 
              className="w-[48%] aspect-square bg-red-50 rounded-xl p-4 mb-4 items-center justify-center"
              onPress={() => setShowRecorder(true)}>
              <Ionicons name="mic-outline" size={32} color="#EF4444" />
              <Text className="text-red-500 mt-2 font-medium">Voice</Text>
            </TouchableOpacity>

            {/* Camera Button */}
            <TouchableOpacity 
              className="w-[48%] aspect-square bg-green-50 rounded-xl p-4 items-center justify-center"
              onPress={takePhoto}>
              <Ionicons name="camera-outline" size={32} color="#10B981" />
              <Text className="text-green-500 mt-2 font-medium">Camera</Text>
            </TouchableOpacity>

            {/* Gallery Button */}
            <TouchableOpacity 
              className="w-[48%] aspect-square bg-purple-50 rounded-xl p-4 items-center justify-center"
              onPress={pickImage}>
              <Ionicons name="images-outline" size={32} color="#8B5CF6" />
              <Text className="text-purple-500 mt-2 font-medium">Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Recording Interface */}
          {showRecorder && (
            <View className="mb-4">
              <StyledRecorder
                onDelete={async () => setShowRecorder(false)}
                onReset={async() => {/* Handle reset */}}
                onSend={handleAudioSubmit}
              />
            </View>
          )}

          {/* Selected Image Preview */}
          {selectedImage && (
            <View className="mb-4">
              <Image 
                source={{ uri: selectedImage }} 
                className="w-full h-40 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity 
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                onPress={() => setSelectedImage(null)}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Text Input Area */}
          <View className="border border-gray-200 rounded-xl mb-4">
            <TextInput
              className="p-3 min-h-[100px] text-gray-800"
              multiline
              placeholder="Type or speak to create tasks..."
              value={prompt}
              onChangeText={setPrompt}
              textAlignVertical="top"
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handlePromptSubmit}
            disabled={isGenerating || (!prompt.trim() && !selectedImage)}
            className={`flex-row items-center justify-center p-3 rounded-xl ${
              isGenerating || (!prompt.trim() && !selectedImage) ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Ionicons name="flash-outline" size={24} color="white" className="mr-2" />
            )}
            <Text className="text-white font-semibold ml-2">
              {isGenerating ? 'Generating...' : 'Generate Tasks'}
            </Text>
          </TouchableOpacity>
        </View>

         {/* Generated Tasks Preview */}
         {generatedTasks.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Generated Tasks</Text>
            
            {generatedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => toggleTaskSelection(task.id)}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  task.selected ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-gray-800 flex-1">{task.title}</Text>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    task.selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {task.selected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                </View>

                <Text className="text-gray-600 mb-3">{task.description}</Text>

                {task.subtasks.length > 0 && (
                  <View className="mb-3">
                    <Text className="font-semibold mb-2">Subtasks:</Text>
                    {task.subtasks.map((subtask, index) => (
                      <View key={subtask.id} className="flex-row items-center mb-1">
                        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        <Text className="text-gray-600">{subtask.title}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="flex-row items-center">
                  <View className="bg-purple-100 px-2 py-1 rounded mr-3">
                    <Text className="text-purple-800 text-xs">{task.category?.label}</Text>
                  </View>
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">{task.startDate}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">{task.startTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleSaveTasks}
              className="bg-blue-500 p-3 rounded-xl flex-row items-center justify-center mt-4"
            >
              <Ionicons name="save-outline" size={24} color="white" />
              <Text className="text-white font-semibold ml-2">
                Save Selected Tasks ({generatedTasks.filter(t => t.selected).length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Example Prompts */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2">Example Prompts</Text>
          <Text className="text-gray-600 mb-3">Try these examples to get started:</Text>
          
          <View className="space-y-2">
            {examplePrompts.map((examplePrompt, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setPrompt(examplePrompt);
                  generateTaskWithAI(examplePrompt);
                }}
                className="flex-row items-center p-3 bg-gray-50 rounded-xl"
              >
                <Ionicons name="bulb-outline" size={20} color="#6B7280" />
                <Text className="text-gray-600 ml-2 flex-1">{examplePrompt}</Text>
                <Ionicons name="arrow-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
          </View>
      </ScrollView>
    </View>
  );
};

export default GenerateTaskWithAIPage;