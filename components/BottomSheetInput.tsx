import { View, Text, Button, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Modal, SlideAnimation, ModalContent, BottomModal } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/taskStore';
import { UseFormReturn } from 'react-hook-form';
import { fetchChatCompletion, useChat } from '@/hooks/useCustomAi';
import { router } from 'expo-router';

type Props = {
  children?: React.ReactNode;
  form?: UseFormReturn<any>;
};

const BottomModalDocumentPicker = ({ form }: Props) => {
  const [visible, setVisible] = useState(false);
  const { updateTask } = useTaskStore((t) => t);
  const [Loading, setIsLoading] = useState(false)

  const { setGeneratedByAi } = useTaskStore(t => t)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/aiPrompt',
    onFinish(message) {
      console.log({ message });
    },
    onError(error) {
      console.log({ error });
      console.log(error.cause);
    },
    onResponse(response) {
      console.log({ response });
    },
  });

  useEffect(() => {
    console.log({ messages });
  }, [messages]);

  return (
    <View>
      {/* Button to trigger modal */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-blue-100 px-2 py-1 rounded-xl absolute bottom-0 right-0"
      >
        <Ionicons size={24} name="star" />
      </TouchableOpacity>

      {/* Bottom Modal */}
      <BottomModal
        visible={visible}
        swipeDirection={['up', 'down']}
        onTouchOutside={() => setVisible(false)}
        swipeThreshold={200}
        onSwipeOut={() => setVisible(false)}
        modalAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
      >
        <ModalContent>
          <View className="flex-row w-full text-center gap-3 justify-center">
            <TextInput
              className="flex-1 mr-auto border p-1"
              onChangeText={handleInputChange}
              value={input}
              placeholder="Enter your message"
            />
            <Button
              disabled={isLoading}
              title="Submit"
              onPress={() => {
                setIsLoading(true); // Indicate loading state
                fetchChatCompletion(process.env.OPENAI_API_KEY!, input)
                  .then(data => {
                    console.log({ data }); // Handle response
                    if (data.success == "true") {
                      const generatedTasks = data.data.tasks
                      console.log({generatedTasks})
                      setGeneratedByAi(generatedTasks);
                      router.push("/(tabs)/ai/generated")
                    }
                    
                   

                    

                  })
                  .catch(e => {
                    console.log({ e }); // Handle error
                  })
                  .finally(() => {
                    setIsLoading(false); // Remove loading state
                  });
              }}
            />
          </View>

          {/* Display Loading or Error States */}
          {Loading && <Text className="text-center text-blue-500">Loading...</Text>}
          {error && <Text className="text-center text-red-500">Error: {error.message}</Text>}
        </ModalContent>
      </BottomModal>
    </View>
  );
};

export default BottomModalDocumentPicker;
