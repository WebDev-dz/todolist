import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  perks: string[];
}

interface DonationHistory {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const DonationPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const donationTiers: DonationTier[] = [
    {
      id: '1',
      name: 'Supporter',
      amount: 5,
      description: 'Show your support for our app',
      perks: ['Ad-free experience', 'Supporter badge'],
    },
    {
      id: '2',
      name: 'Premium',
      amount: 10,
      description: 'Get premium features',
      perks: ['Ad-free experience', 'Premium badge', 'Extra themes', 'Priority support'],
    },
    {
      id: '3',
      name: 'Elite',
      amount: 25,
      description: 'Become an elite supporter',
      perks: [
        'Ad-free experience',
        'Elite badge',
        'All premium features',
        'Early access to new features',
        'Direct developer contact',
      ],
    },
  ];

  const donationHistory: DonationHistory[] = [
    { id: '1', amount: 10, date: '2024-10-15', status: 'completed' },
    { id: '2', amount: 5, date: '2024-09-20', status: 'completed' },
    { id: '3', amount: 25, date: '2024-08-10', status: 'completed' },
  ];

  const handleDonate = (tierId: string) => {
    setSelectedTier(tierId);
    console.log(`Processing donation for tier ${tierId}`);
    router.push("/(drawers)/paymentwall");
  };

  const getStatusColor = (status: string) => {
    if (isDarkMode) {
      switch (status) {
        case 'completed':
          return 'text-green-400';
        case 'pending':
          return 'text-yellow-400';
        case 'failed':
          return 'text-red-400';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (status) {
        case 'completed':
          return 'text-green-600';
        case 'pending':
          return 'text-yellow-600';
        case 'failed':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    }
  };

  return (
    <ScrollView className={cn(
      "flex-1",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      <View className={cn(
        "pt-12 pb-6 px-4",
        isDarkMode ? "bg-gray-800" : "bg-blue-500"
      )}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Support Us</Text>
        <Text className="text-white text-sm mt-2">
          Help us improve the app and unlock premium features
        </Text>
      </View>

      <View className="px-4 py-6">
        {/* Donation Tiers */}
        <Text className={cn(
          "text-xl font-bold mb-4",
          isDarkMode ? "text-white" : "text-gray-800"
        )}>Choose Your Tier</Text>
        {donationTiers.map((tier) => (
          <TouchableOpacity
            key={tier.id}
            onPress={() => handleDonate(tier.id)}
            className={cn(
              "rounded-xl shadow-sm p-4 mb-4 border-2",
              isDarkMode ? [
                "bg-gray-800",
                selectedTier === tier.id ? "border-blue-400" : "border-gray-700"
              ] : [
                "bg-white",
                selectedTier === tier.id ? "border-blue-500" : "border-transparent"
              ]
            )}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className={cn(
                "text-lg font-bold",
                isDarkMode ? "text-white" : "text-gray-800"
              )}>{tier.name}</Text>
              <Text className={isDarkMode ? "text-blue-400" : "text-blue-500"}>
                ${tier.amount}
              </Text>
            </View>
            <Text className={cn(
              "mb-2",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>{tier.description}</Text>
            <View className="mt-2">
              {tier.perks.map((perk, index) => (
                <View key={index} className="flex-row items-center mt-1">
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={isDarkMode ? "#A78BFA" : "#8B5CF6"} 
                  />
                  <Text className={cn(
                    "ml-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>{perk}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Payment Methods */}
        <View className="mt-6">
          <Text className={cn(
            "text-xl font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>Payment Methods</Text>
          <View className={cn(
            "rounded-xl shadow-sm p-4",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <TouchableOpacity className={cn(
              "flex-row items-center justify-between py-3 border-b",
              isDarkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <View className="flex-row items-center">
                <Ionicons 
                  name="card-outline" 
                  size={24} 
                  color={isDarkMode ? "#9CA3AF" : "#4B5563"} 
                />
                <Text className={cn(
                  "ml-3",
                  isDarkMode ? "text-white" : "text-gray-800"
                )}>Credit/Debit Card</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
              />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons 
                  name="logo-paypal" 
                  size={24} 
                  color={isDarkMode ? "#9CA3AF" : "#4B5563"} 
                />
                <Text className={cn(
                  "ml-3",
                  isDarkMode ? "text-white" : "text-gray-800"
                )}>PayPal</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDarkMode ? "#6B7280" : "#CBD5E0"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Donation History */}
        <View className="mt-6">
          <Text className={cn(
            "text-xl font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>Donation History</Text>
          <View className={cn(
            "rounded-xl shadow-sm overflow-hidden",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            {donationHistory.map((donation) => (
              <View
                key={donation.id}
                className={cn(
                  "p-4 border-b flex-row justify-between items-center",
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                )}
              >
                <View>
                  <Text className={isDarkMode ? "text-white" : "text-gray-800"}>
                    ${donation.amount}
                  </Text>
                  <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                    {donation.date}
                  </Text>
                </View>
                <Text className={`font-medium ${getStatusColor(donation.status)}`}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DonationPage;