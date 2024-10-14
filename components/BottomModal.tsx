import { Modal, SlideAnimation, ModalContent, BottomModal } from 'react-native-modals';




import { View, Text, Button } from 'react-native'
import React, { Children, useState } from 'react'

const BottomModalInput = ({ children }: { children?: React.ReactNode }) => {

    const [visible, setvisible] = useState(false)


    return (
        <View >
            <Button onPress={(e) => { setvisible(true) }} title="modal"></Button>
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
                    {children}
                </ModalContent>
            </BottomModal>
        </View>
    )
}

export default BottomModalInput



