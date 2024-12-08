import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Button,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export  function Example() {
  const richText = useRef<RichEditor>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        addToDebugLog('Media library permission not granted');
      } else {
        addToDebugLog('Media library permission granted');
      }
    })();
  }, []);

  const addToDebugLog = (message: string) => {
    setDebugLog(prevLog => [...prevLog, `${new Date().toISOString()}: ${message}`]);
  };

  const handleChange = useCallback((html: string) => {
    setContent(html);
    addToDebugLog(`Content updated: ${html.substring(0, 50)}...`);
  }, []);

  const pickImage = async () => {
    addToDebugLog('Picking image...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    addToDebugLog(`Image picker result: ${JSON.stringify(result)}`);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
  };

  const handleInsertImage = useCallback(async () => {
    setIsLoading(true);
    addToDebugLog('Starting image insertion process');
    try {
      const uri = await pickImage();
      if (uri) {
        addToDebugLog(`Image URI: ${uri}`);
        
        // Check if the file exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        addToDebugLog(`File info: ${JSON.stringify(fileInfo)}`);
        
        if (fileInfo.exists) {
          // Convert to base64
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          addToDebugLog(`Base64 string length: ${base64.length}`);
          
          const imageHtml = `<img src="data:image/jpeg;base64,${base64}" alt="Inserted Image" style="max-width: 100%; height: auto;" />`;
          addToDebugLog('Inserting image HTML');

          console.log(imageHtml)
          richText.current?.insertHTML(imageHtml);
          
          // Check if the content was updated
          setTimeout(() => {
            // const currentContent = richText.current?.state;
            // addToDebugLog(`Current content after insertion: ${currentContent?.substring(0, 50)}...`);
          }, 1000);
        } else {
          addToDebugLog('File does not exist');
        }
      } else {
        addToDebugLog('No image URI returned');
      }
    } catch (error) {
      addToDebugLog(`Error in handleInsertImage: ${error}`);
    } finally {
      setIsLoading(false);
      addToDebugLog('Image insertion process completed');
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Image Debug Editor</Text>
          
          <RichToolbar
            editor={richText}
            actions={[actions.insertImage, actions.setBold, actions.setItalic, actions.insertBulletsList, actions.insertOrderedList, actions.insertLink]}
            iconMap={{ [actions.insertImage]: () => (<Text style={{color: 'blue'}}>Image</Text>) }}
            onPressAddImage={handleInsertImage}
          />
          
          <RichEditor
            ref={richText}
            initialContentHTML={content}
            onChange={handleChange}
            placeholder="Start writing here..."
            useContainer={true}
            initialHeight={200}
            disabled={isLoading}
            editorStyle={{
              backgroundColor: 'white',
              contentCSSText: 'font-size: 16px;',
            }}
          />
          
          {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
          
          <Button title="Insert Image" onPress={handleInsertImage} disabled={isLoading} />
          
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Debug Log:</Text>
          <ScrollView style={{ height: 200, borderWidth: 1, borderColor: '#ccc', padding: 10 }}>
            {debugLog.map((log, index) => (
              <Text key={index}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

