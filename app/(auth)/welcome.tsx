import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { useTheme } from "@/hooks/ThemeProvider";
import { Colors } from "react-native/Libraries/NewAppScreen";
const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { isDarkMode } = useTheme();

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView 
      className="flex h-full items-center justify-between"
      style={{ backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }}
    >
      <TouchableOpacity
        onPress={() => router.replace("/(auth)/sign-up")}
        className="w-full flex justify-end items-end p-5"
      >
        <Text 
          className="text-md font-JakartaBold"
          style={{ color: isDarkMode ? Colors.dark.text : Colors.light.text }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[32px] h-[4px] mx-1 rounded-full" 
            style={{ backgroundColor: isDarkMode ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }}
          />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 rounded-full" 
            style={{ backgroundColor: isDarkMode ? Colors.dark.tint : Colors.light.tint }}
          />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center px-5">
            <View className="bg-white/10 rounded-3xl p-5">
              <Image
                source={item.image}
                className="w-[300px] h-[300px]"
                resizeMode="contain"
              />
            </View>
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text 
                className="text-3xl font-JakartaBold mx-10 text-center"
                style={{ color: isDarkMode ? Colors.dark.text : Colors.light.text }}
              >
                {item.title}
              </Text>
            </View>
            <Text 
              className="text-md font-JakartaSemiBold text-center mx-10 mt-3"
              style={{ color: isDarkMode ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-up")
            : swiperRef.current?.scrollBy(1)
        }
        className="w-11/12 mt-10 mb-5"
      />
    </SafeAreaView>
  );
};

export default Welcome;
