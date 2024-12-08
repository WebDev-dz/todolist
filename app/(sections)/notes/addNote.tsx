import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Note, useNotesStore } from "@/store/notesStore";
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset } from 'expo-image-picker';
import { Example } from '@/components/editor/Editor';

const NoteEditor = () => {
  const [note, setNote] = useState<Note | undefined>()
  const richText = useRef<RichEditor | null>(null);

  const { addNote, updateNote, getNoteById , updateTag, userId } = useNotesStore();

  const [image, setImage] = useState<ImagePickerAsset | undefined>()
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { noteId: string }
  const noteId = params["noteId"] || "";

  console.log({ note: "Now You are in Editor page" })
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
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  return (
    <SafeAreaView className='h-screen mt-11 bg-slate-100'>
      <View className="flex-1 p-4">
        <TextInput
          className="text-2xl font-bold mb-4"
          value={note?.title || "New Note"}
          onChangeText={(text) => setNote({ ...note!, title: text })}
          placeholder="Note Title"
        />
        {/* <KeyboardAvoidingView className='flex-1'>


          <RichEditor
            ref={richText}
            hideKeyboardAccessoryView = {true}
            onChange={(content: string) => setNote({ ...note!, content })}
            initialContentHTML={note?.content}
            className="flex-1 bg-white border border-gray-300 my-2 p-2"
          />
          <RichToolbar
            editor={richText}
            onPressAddImage  = {pickImage}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.insertImage,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.undo,
              actions.redo,
            ]}
            className="my-2"
          />
        </KeyboardAvoidingView> */}

        <Example />

        <TouchableOpacity className="bg-blue-500 p-3 rounded-lg items-center" onPress={handleSave}>
          <Text className="text-white text-lg font-bold">Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NoteEditor;