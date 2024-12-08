import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';

const EditProfilePage: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [imageUri, setImageUri] = useState<string | null>(user?.imageUrl || null);

    // Request permission for image picker
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to change your profile picture.');
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0].uri) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;

        setUpdating(true);
        try {
            // Update basic profile information
            console.log({firstName, lastName, username})
            // await user.update({
            //     firstName,
            //     lastName,
            //     username,
                
            // }).then(data => data).catch(console.error);
            // Update profile image if changed
            if (imageUri && imageUri !== user.imageUrl) {
                // Convert image to blob
                const response = await fetch(imageUri);
                const blob = await response.blob();
                console.log({blob})
                // Uploa    d image to Clerk
                await user.setProfileImage({
                    file: blob,
                }).catch(console.log);
            }

            Alert.alert(
                'Success',
                'Profile updated successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to update profile'
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView className='h-screen mt-11'>
            <ScrollView className="flex-1 bg-gray-100">
                {/* Header */}
                <View className="bg-blue-500 pt-12 pb-6 px-4">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Edit Profile</Text>
                </View>

                {/* Profile Picture */}
                <View className="items-center mt-6">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                className="w-24 h-24 rounded-full"
                            />
                        ) : (
                            <View className="w-24 h-24 rounded-full bg-gray-300 justify-center items-center">
                                <Ionicons name="person" size={40} color="#666" />
                            </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="mt-6 mx-4">
                    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-sm text-gray-500 mb-1">First Name</Text>
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter first name"
                                className="text-gray-800 text-base"
                            />
                        </View>

                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-sm text-gray-500 mb-1">Last Name</Text>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter last name"
                                className="text-gray-800 text-base"
                            />
                        </View>

                        <View className="p-4">
                            <Text className="text-sm text-gray-500 mb-1">Username</Text>
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter username"
                                className="text-gray-800 text-base"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleUpdateProfile}
                        disabled={updating}
                        className={`mt-6 rounded-xl p-4 ${updating ? 'bg-blue-300' : 'bg-blue-500'}`}
                    >
                        {updating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfilePage;