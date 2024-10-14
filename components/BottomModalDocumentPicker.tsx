

import { View, Text, Button, Pressable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Modal, SlideAnimation, ModalContent, BottomModal } from 'react-native-modals';

import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Attachment, Task, useTaskStore } from '@/store/taskStore';
import { UseFormReturn } from 'react-hook-form';

type Props = {
    children?: React.ReactNode
    form: UseFormReturn<Task>
}

const BottomModalDocumentPicker = ({ form}: Props) => {

    const [visible, setvisible] = useState(false)
    const [isPicking, setIsPicking] = useState(false)
    const { updateTask } = useTaskStore(t => t);



    const handleImagePick = async () => {

        if (!isPicking){
            setIsPicking(true);
            const res =  DocumentPicker.getDocumentAsync({ "type": "image/*" }).then((data) => {
                const assets = data.assets
                let files : Attachment[] = []
                if (assets) {
                    assets.forEach(asset => {
                        const {file, ...rest} = asset
                        files = [...files, {...rest, id: asset.name}]
                    })
                    console.log(assets)
                    form.setValue("attachments",[...form.getValues("attachments"),...files])
                    console.log(form.getValues())
                }
            }).finally(() => {
                setIsPicking(false);

            })
        }
        
    }
    return (
        <View >
            <TouchableOpacity onPress={(e) => { setvisible(true) }} 
            className="bg-blue-100 px-2 py-1 rounded-xl overflow-hidden"
            >
                <Ionicons size={24} name="add" />
            </TouchableOpacity>
            <BottomModal
                visible={visible}

                swipeDirection={['up', 'down']} // can be string or an array
                onTouchOutside={() => { setvisible(false) }}
                swipeThreshold={200} // default 100
                onSwipeOut={(event) => {
                    setvisible(false);
                }}
                modalAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
            >
                <ModalContent>
                    <View className='flex-row gap-3 justify-center'>
                        {["image", "mic", "videocam"].map((item) => (
                            <Pressable className='rounded-full p-1' onPress={handleImagePick}>
                                <Ionicons color={"blue"} size={24} name={item as "image"} />
                            </Pressable>
                        ))}
                    </View>
                </ModalContent>
            </BottomModal>
        </View>
    )
}

export default BottomModalDocumentPicker