import React from 'react';
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import { Note } from '@/store/notesStore';
import CheckBox from 'expo-checkbox';
import { cn } from '@/lib/utils';

type NoteItemProps = {
  note: Note;
  isSelectionMode: boolean;
  selectedNotes: Set<string>;
  toggleNoteSelection: (noteId: string) => void;
  onSelect: (noteId: string) => void;
  onDelete: () => Promise<void>
};

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelectionMode,
  selectedNotes,
  toggleNoteSelection,
  onSelect,
  onDelete
}) => {
  const handlePress = () => {
    if (isSelectionMode) {
      toggleNoteSelection(note.id);
      Vibration.vibrate([1, 1, 1, 1, 1]);
    } else {
      onSelect(note.id);
    }
  };

  return (
    <View className="flex-row justify-between">
      {isSelectionMode && (
        <CheckBox
          value={selectedNotes.has(note.id)}
          onValueChange={handlePress}
          className={`w-5 h-5 rounded-md mt-3 border-2 mr-3 items-center justify-center ${
            selectedNotes.has(note.id) ? 'bg-gray-300 border-blue-500' : 'border-gray-300'
          }`}
        />
      )}
      <TouchableOpacity
        onPress={handlePress}
        className={cn(
          `flex-1 rounded-xl shadow-sm p-4 mb-3`,
          isSelectionMode ? 'bg-blue-50' : 'bg-white'
        )}
      >
        <Text className={cn("font-semibold", { "text-red-500": !note.isPinned })}>
          {note.title}
        </Text>
        <Text className="text-gray-500">{note.content}</Text>
        <Text className="text-gray-400 text-sm">{note.lastEditedAt}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoteItem;
