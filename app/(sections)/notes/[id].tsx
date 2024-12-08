import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Note, useNotesStore } from "@/store/notesStore";
import { useNavigation, useRoute } from '@react-navigation/native';

export const NoteEditor = () => {
  const [note, setNote] = useState<Note | undefined>()
  const richText = useRef<RichEditor | null>(null);
    const { addNote, updateNote, getNoteById } = useNotesStore();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { noteId: string}
  const noteId =params["noteId"] || "";

  useEffect(() => {
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setNote(note)
      }
    }
  }, [noteId]);

  const handleSave = () => {
    const now = new Date().toISOString();
    if (noteId && note) {
      updateNote({
        
       ...note,
        lastEditedAt: now,
        createdAt: getNoteById(noteId)?.createdAt || now,
      });
    } else {
      if (!note?.title || !note?.content) {
        Alert.alert("Error", "title and content are required")
        return
      }
      addNote({
          id: Date.now().toString(),
          title: note?.title,
          content: note?.content,
          createdAt: now,
          lastEditedAt: now,
          tags: [],
          isPinned: false,
          isArchived: false
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={note?.title || "New Note"}
        onChangeText={ (text) => setNote({...note!, title: text})}
        placeholder="Note Title"
      />
      <RichEditor
        ref={richText}
        onChange={(content: string) => setNote({...note!, content})}
        initialContentHTML={note?.content}
        style={styles.editor}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.heading1,
          actions.heading2,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.undo,
          actions.redo,
        ]}
        style={styles.toolbar}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editor: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 8,
    padding: 8,
  },
  toolbar: {
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

