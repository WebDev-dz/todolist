import React, { forwardRef, useRef, type Ref, useState } from 'react'
import {
    Pressable,
    View,
    type StyleProp,
    type ViewStyle,
    TouchableOpacity,
    Text,
    type TextStyle,
    ViewProps,
} from 'react-native'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    type WithSpringConfig,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Recorder, type RecorderRef } from '@/components/ui/expo-recorder'

import { useThemeColor } from '@/hooks/useThemeColor'
import { Spacing } from '@/constants/Spacing'
import { formatTimer } from '@/lib/formatTimer'

const RECORD_BUTTON_SIZE = 20
const RECORD_BUTTON_BACKGROUND_SIZE = RECORD_BUTTON_SIZE + Spacing.md
const RECORDING_INDICATOR_COLOR = '#d72d66'
const RECORDING_INDICATOR_SCALE = 0.5

const SPRING_SHORT_CONFIG: WithSpringConfig = {
    stiffness: 120,
    overshootClamping: true,
}

export interface ThemedRecorderSheetProps {
    lightColor?: string
    darkColor?: string
}


export const ThemedRecorderSheet = forwardRef(
    (props: ViewProps & ThemedRecorderSheetProps, ref) => {
        const { style, lightColor, darkColor, ...rest } = props

        const insets = useSafeAreaInsets()

        const [isRecording, setIsRecording] = useState(false)
        const [isPlaying, setIsPlaying] = useState(false)
        const [position, setPosition] = useState(0)

        const recorderRef = useRef<RecorderRef>(null)

        const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'recorderSheet')
        const progressBackgroundColor = useThemeColor({}, 'recorderProgress')
        const iconColor = useThemeColor({}, 'recorderIcon')
        const tintColor = useThemeColor({}, 'recorderTint')
        const timelineColor = useThemeColor({}, 'recorderTimeline')
        const positionColor = useThemeColor({}, 'text')
        const recordBorderColor = useThemeColor({ light: 'rgba(0,0,0,0.3)' }, 'text')
        const recorderBackgroundColor = useThemeColor({}, 'recorderBackground')
        const waveformInactiveColor = useThemeColor({}, 'recorderWaveformInactive')

        const scale = useSharedValue(1)

        const toggleRecording = async () => {
            const permissionStatus = await Audio.getPermissionsAsync()
            if (!permissionStatus.granted) return

            Haptics.selectionAsync()
            if (isRecording) {
                await recorderRef.current?.stopRecording()
            } else {
                await recorderRef.current?.startRecording()
            }
        }

        const resetRecording = async () => {
            if (isRecording) return

            Haptics.selectionAsync()
            await recorderRef.current?.resetRecording()
        }

        const togglePlayback = async () => {
            if (isRecording) return

            Haptics.selectionAsync()
            if (isPlaying) {
                await recorderRef.current?.stopPlayback()
            } else {
                await recorderRef.current?.startPlayback()
            }
        }

        const $recordIndicatorStyles: StyleProp<ViewStyle> = [
            $recordIndicator,
            useAnimatedStyle(() => ({
                borderRadius: interpolate(
                    scale.value,
                    [1, RECORDING_INDICATOR_SCALE],
                    [RECORD_BUTTON_SIZE / 2, Spacing.xs],
                    Extrapolation.CLAMP
                ),
                transform: [{ scale: scale.value }],
            })),
        ]

        return (
            <View
                ref={ref}
                sizes={['auto']}
                style={[{ backgroundColor }, style]}
                contentContainerStyle={[$sheetContent, { paddingBottom: insets.bottom + Spacing.md }]}
                {...rest}
            >
                <View className='flex-row gap-1 rounded-md bg-slate-400'>
                    <Recorder
                        ref={recorderRef}
                        tintColor={tintColor}
                        waveformInactiveColor={waveformInactiveColor}
                        progressInterval={50}
                        timelineColor={timelineColor}
                        backgroundColor={"#000"}
                        progressBackgroundColor={progressBackgroundColor}
                        onRecordReset={() => {
                            scale.value = 1
                            setIsRecording(false)
                            setIsPlaying(false)
                        }}
                        onRecordStart={() => {
                            scale.value = withSpring(RECORDING_INDICATOR_SCALE, SPRING_SHORT_CONFIG)
                            setIsRecording(true)
                        }}
                        onRecordStop={(uri: string, duration: number | undefined, meterings) => {
                            scale.value = withSpring(1, SPRING_SHORT_CONFIG)
                            setIsRecording(false)

                            recorderRef.current?.startPlayback()

                            // Use this uri. Yay! 🎉
                            console.log(uri)

                            console.log(duration)
                            console.log(meterings)
                        }}
                        onPlaybackStart={() => setIsPlaying(true)}
                        onPlaybackStop={() => setIsPlaying(false)}
                        onPositionChange={(pos: number) => setPosition(pos)}
                    />
                    <View className='' style={{ padding: Spacing.md, marginTop: Spacing.xxl }}>
                        <Text style={[$positionText, { color: positionColor ?? '#333333' }]}>
                            {formatTimer(Math.round(position / 100) * 100, true)}
                        </Text>
                    </View>
                </View>
                <View className='flex-row justify-between items-center mt-6'>
                    <View>
                        <TouchableOpacity activeOpacity={0.5} style={$recordControl} onPress={resetRecording}>
                            <Ionicons name="refresh" size={Spacing.xl} style={{ color: iconColor }} />
                        </TouchableOpacity>
                    </View>

                    {/* Toggle Recording */}
                    <View className='flex-row justify-center items-center mt-12'>
                        <View style={[$recordButtonBackground, { borderColor: recordBorderColor }]} />
                        <Pressable style={$recordButton} onPress={toggleRecording}>
                            <Animated.View style={$recordIndicatorStyles} />
                        </Pressable>
                    </View>

                    {/* Play Back */}
                    {/* <View className='bg-blue-400'>
            <TouchableOpacity activeOpacity={0.8} style={$recordControl} onPress={togglePlayback}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={Spacing.xl}
                style={{ color: iconColor }}
              />
            </TouchableOpacity>
          </View> */}
                </View>
                {/* <RecordingControls onDelete={async () => { }} onReset={resetRecording} onSend={async () => { }} /> */}
            </View>
        )
    }
);


type Controlers = {
    onSend: (audioUri: string) => Promise<void>
    onDelete: () => Promise<void>
    onReset: () => Promise<void>
}


export const StyledRecorder = forwardRef<View, ViewProps & Controlers>((props, ref) => {

    const [isRecording, setIsRecording] = useState(false);
    const [uri, setAudioUri] = useState<string | undefined | null>(undefined)
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const recorderRef = useRef<RecorderRef>(null);
    const [isPlaying, setIsPlaying] = useState(false)
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const scale = useSharedValue(1)

    const toggleRecording = async () => {
        const permissionStatus = await Audio.getPermissionsAsync();
        if (!permissionStatus.granted) return;

        Haptics.selectionAsync();
        if (isRecording) {
            await recorderRef.current?.stopRecording();
        } else {
            await recorderRef.current?.startRecording();
        }
    };



    const resetRecording = async () => {
        if (isRecording) return;
        Haptics.selectionAsync();
        await recorderRef.current?.resetRecording();
        props.onReset()
    };

    return (
        <View {...props} ref={ref} style={{ backgroundColor }}>
            <View className="bg-gray-100 rounded-full p-2 flex-row items-center justify-between" >
                <TouchableOpacity onPress={toggleRecording} className="p-2 mr-3">
                    <Ionicons name={isRecording ? "pause" : "play"} size={24} color={textColor} />
                </TouchableOpacity>

                <View className="flex-1 mx-2 overflow-hidden">
                    <Recorder
                        ref={recorderRef}
                        tintColor="#3b82f6"
                        waveformInactiveColor="#cbd5e1"
                        waveformHeight={20}
                        progressInterval={50}
                        timelineColor="#3b82f6"
                        backgroundColor="transparent"
                        // style = {{height: 30}}
                        progressBackgroundColor="#e2e8f0"
                        onRecordReset={() => {
                            scale.value = 1
                            setIsRecording(false)
                            setIsPlaying(false)
                        }}
                        onRecordStart={() => {
                            scale.value = withSpring(RECORDING_INDICATOR_SCALE, SPRING_SHORT_CONFIG)
                            setIsRecording(true)
                        }}
                        onRecordStop={(uri, recordedDuration) => {
                            setIsRecording(false);
                            setDuration(recordedDuration || 0);
                            setAudioUri(uri)
                        }}
                        onPositionChange={(pos: number) => setPosition(pos)}
                        onPlaybackStart={() => setIsPlaying(true)}
                        onPlaybackStop={() => setIsPlaying(false)}
                    />
                </View>

                <Text className="text-sm font-medium" style={{ color: textColor }}>
                    {formatTimer(Math.round(position / 100) * 100, true)}
                </Text>

                <TouchableOpacity onPress={toggleRecording} className="p-2">
                    <Ionicons name="mic" size={24} color={textColor} />
                </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center p-3">
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={props.onDelete} className="p-2">
                        <Ionicons name="trash-outline" size={24} color="red" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async() => {
                       await resetRecording();
                       props.onReset()
                    }} className="p-2">
                        <Ionicons name="refresh-outline" size={24} color="blue" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => { if (uri) props.onSend(uri) }} className="bg-blue-500 px-4 py-2 rounded-full">
                    <Text className="text-white font-medium">Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});


// export const RecordingControls = ({ onSend, onDelete, onReset }: Controlers) => (

// );

const $sheetContent: ViewStyle = {
    paddingTop: Spacing.md,
}

const $recordButtonBackground: ViewStyle = {
    borderRadius: RECORD_BUTTON_BACKGROUND_SIZE / 2,
    height: RECORD_BUTTON_BACKGROUND_SIZE,
    width: RECORD_BUTTON_BACKGROUND_SIZE,
    borderWidth: 2,
    borderColor: 'white',
}

const $recordButton: ViewStyle = {
    position: 'absolute',
}

const $recordIndicator: ViewStyle = {
    backgroundColor: RECORDING_INDICATOR_COLOR,
    borderRadius: RECORD_BUTTON_SIZE / 2,
    height: RECORD_BUTTON_SIZE,
    width: RECORD_BUTTON_SIZE,
}

const $recordControl: ViewStyle = {
    padding: Spacing.md,
}

const $positionText: TextStyle = {
    fontWeight: 'medium',
    fontSize: 28,
    textAlign: 'center',
}