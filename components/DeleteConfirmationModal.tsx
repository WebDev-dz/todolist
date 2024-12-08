import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  isDarkMode: boolean;
  message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isVisible,
  onClose,
  isDarkMode,
  onConfirm,
  title = 'Delete Task',
  message = 'Are you sure you want to delete this task? This action cannot be undone.'
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable 
          className={cn(
            "w-full rounded-2xl p-6",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center mb-4">
            <View className={cn(
              "w-16 h-16 rounded-full items-center justify-center mb-4",
              isDarkMode ? "bg-red-950/50" : "bg-red-100"
            )}>
              <Ionicons 
                name="trash-outline" 
                size={32} 
                color={isDarkMode ? "#ef4444" : "#DC2626"} 
              />
            </View>
            <Text className={cn(
              "text-xl font-bold mb-2",
              isDarkMode ? "text-gray-100" : "text-gray-800"
            )}>
              {title}
            </Text>
            <Text className={cn(
              "text-center",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className={cn(
                "flex-1 p-4 rounded-xl",
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              )}
            >
              <Text className={cn(
                "text-center font-semibold",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={cn(
                "flex-1 p-4 rounded-xl",
                isDarkMode ? "bg-red-700" : "bg-red-600"
              )}
            >
              <Text className="text-white text-center font-semibold">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteConfirmationModal;