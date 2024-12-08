import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Alert, useWindowDimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotesStore } from '@/store/notesStore'; // Assuming you have a note store similar to note store
import  NoteItem  from '@/components/NoteItem'; // Create a NoteItem component for rendering individual notes
import { cn } from '@/lib/utils';

const NotesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { width, height } = useWindowDimensions();
  const { notes, deleteNote, refreshNotes } = useNotesStore(t => t); // Assuming you have a note store
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNotes(); // Refresh notes from the store
    } catch (error) {
      console.error('Error refreshing notes:', error);
      Alert.alert('Refresh Failed', 'Failed to refresh notes');
    } finally {
      setRefreshing(false);
    }
  };

  const getFilteredNotes = () => {
    if (searchQuery) {
      return notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return notes;
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);

    // If no notes are selected, exit selection mode
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  return (
    <SafeAreaView style={{ height: height }} className="pt-11 bg-gray-100">
      <View className="h-screen">
        {/* Header */}
        <View className="pt-11 pb-6 px-4 bg-blue-500">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons name="person-circle-outline" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold mb-4">My Notes</Text>

          {/* Search Bar */}
          <View className="rounded-xl flex-row items-center px-4 py-2 bg-white/20">
            <Ionicons name="search-outline" size={20} color="white" />
            <TextInput
              className="flex-1 ml-2 text-white placeholder:text-white/70"
              placeholder="Search notes..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Notes List */}
        <View className='flex-1 mb-auto'>
          <ScrollView 
            className="px-4" 
            contentContainerStyle={{ flex: 0 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
                title="Pull to refresh"
                titleColor="#3B82F6"
              />
            }
          >
            {getFilteredNotes().map(note => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={async () => deleteNote(note.id)} // Assuming deleteNote is a function in your store
                isSelectionMode={false} 
                selectedNotes={selectedNotes} 
                toggleNoteSelection={toggleNoteSelection } 
                onSelect={(noteId) => router.push(`/(sections)/notes/${noteId}`)}
                />
            ))}
          </ScrollView>
        </View>

        {/* Add Note Button */}
        <TouchableOpacity
          onPress={() => router.push("/(sections)/notes/addNote")} // Navigate to add note page
          className="absolute bottom-10 right-10 bg-blue-500 p-4 rounded-full"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotesPage;
