import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

const features = [
  { name: 'Unlimited Goals', free: true, pro: true },
  { name: 'Basic Analytics', free: true, pro: true },
  { name: 'Cloud Sync', free: false, pro: true },
  { name: 'Advanced Analytics', free: false, pro: true },
  { name: 'Priority Support', free: false, pro: true },
  { name: 'Custom Categories', free: false, pro: true },
  { name: 'Data Export', free: false, pro: true },
  { name: 'Dark Mode', free: false, pro: true },
];

const PaymentWall: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaView className={cn(
      "h-screen mt-11",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      {/* Header */}
      <View className={cn(
        "p-4 flex-row items-center",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons 
            name="close" 
            size={24} 
            color={isDarkMode ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <Text className={cn(
          "text-lg font-bold ml-4",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          Upgrade to Pro
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Subscription Plans */}
        <View className="flex-row justify-between mb-6">
          {/* Monthly Plan */}
          <TouchableOpacity 
            className={cn(
              "flex-1 p-4 rounded-xl mr-2",
              isDarkMode ? "bg-gray-800" : "bg-white"
            )}
          >
            <View className="items-center">
              <Text className={cn(
                "text-lg font-bold mb-2",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Monthly
              </Text>
              <Text className={cn(
                "text-3xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                $4.99
              </Text>
              <Text className={cn(
                "text-sm",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                per month
              </Text>
            </View>
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity 
            className={cn(
              "flex-1 p-4 rounded-xl ml-2 bg-blue-500",
            )}
          >
            <View className="items-center">
              <Text className="text-lg font-bold mb-2 text-white">
                Annual
              </Text>
              <Text className="text-3xl font-bold text-white">
                $39.99
              </Text>
              <Text className="text-sm text-white/80">
                per year
              </Text>
              <View className="bg-green-500 px-2 py-1 rounded-full mt-2">
                <Text className="text-xs text-white">Save 33%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Comparison */}
        <View className={cn(
          "rounded-xl p-4 mb-4",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <Text className={cn(
            "text-lg font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            Features
          </Text>
          
          {features.map((feature, index) => (
            <View 
              key={feature.name}
              className={cn(
                "flex-row justify-between py-3",
                index !== features.length - 1 ? "border-b" : "",
                isDarkMode ? "border-gray-700" : "border-gray-200"
              )}
            >
              <Text className={cn(
                "flex-1",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                {feature.name}
              </Text>
              <View className="flex-row w-24 justify-between">
                <View className="w-8 items-center">
                  {feature.free ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  )}
                </View>
                <View className="w-8 items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              </View>
            </View>
          ))}

          {/* Legend */}
          <View className="flex-row justify-end mt-4">
            <View className="flex-row items-center mr-4">
              <Text className={cn(
                "mr-2",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Free
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className={cn(
                "mr-2",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Pro
              </Text>
            </View>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-xl mb-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            Upgrade Now
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text className={cn(
          "text-center text-sm mb-4",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          By subscribing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentWall;
