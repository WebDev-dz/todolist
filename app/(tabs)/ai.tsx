





import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Openai from 'openai';
import { StyledRecorder } from '@/components/Recorder';

const AiPage = () => {

    
    
  return (
    <SafeAreaView className="flex-1 bg-gray-100 pt-10">
    <ScrollView className="flex-1 px-2 bg-white">
        <StyledRecorder />
    </ScrollView>
    </SafeAreaView>
  )
}

export default AiPage

