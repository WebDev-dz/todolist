import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/ThemeProvider';
import { TouchableOpacityProps } from 'react-native-gesture-handler';






const WavesButton: React.FC<TouchableOpacityProps> = ({ className,children, ...rest }) => {
   
    const sv = useSharedValue(1);
   
    const { isDarkMode } = useTheme()
   

    useEffect(() => {
        sv.value = withRepeat(
            withTiming(2, {
                duration: 2000, // 1 second
                easing: Easing.bezier(0, 0, 0.2, 1),
            }),
            -1, // infinite repeat
        );

        return () => { };
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: sv.value }],
            opacity: 2 - sv.value, // Fade out as it scales up
        };
    });



    return (

        <TouchableOpacity
            {...rest}
            className={cn('absolute bottom-0 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg', isDarkMode ? "bg-blue-600": "bg-blue-500", className)}
        >
            <Animated.View style={[animatedStyle]} className={cn("w-full absolute inline-flex h-full  rounded-full bg-blue-500 opacity-75", isDarkMode ? "bg-blue-600": "bg-blue-500")} />
            {/* <Ionicons name="add" size={32} color="#fff" /> */}
            {children}
        </TouchableOpacity>

    );
};

export default WavesButton;