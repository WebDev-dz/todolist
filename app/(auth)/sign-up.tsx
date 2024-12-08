import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { 
  Alert, 
  Image, 
  ScrollView, 
  Text, 
  View,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions 
} from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { Ionicons } from '@expo/vector-icons';

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { height } = useWindowDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsSubmitting(true)
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    } finally {
      setIsSubmitting(false)
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {

      console.log(err)
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <SafeAreaView style={{ height }} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="bg-blue-500 pt-20 pb-6 mb-10">
         
          
          <View className="px-4">
            <Text className="text-white text-3xl font-bold mb-2">Create Account 🚀</Text>
            <Text className="text-white/80">Join us to start managing your tasks</Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="p-4 -mt-4 bg-gray-100 rounded-t-3xl">
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <InputField
              label="Name"
              placeholder="Enter your name"
              icon={icons.person}
              value={form.name}
              inputStyle= {verification.error && "border border-red-400"}
              onChangeText={(value) => setForm({ ...form, name: value })}
              className={verification.error && "border border-red-400"}
            />

            <InputField
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              // className="mb-4"
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              // className="mb-6"
            />

            <CustomButton
              title="Sign Up"
              onPress={onSignUpPress}
              disabled = {isSubmitting}
              className="bg-blue-500 py-3 rounded-xl"
              textClassName="text-white text-center font-semibold text-lg"
            />
          </View>

          {/* OAuth Section */}
          <View className="mt-6">
            <Text className="text-center text-gray-500 mb-4">Or continue with</Text>
            <OAuth />
          </View>

          {/* Sign In Link */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity disabled= {verification.state == "pending"}>
                <Text className="text-blue-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Verification Modal */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white p-6 rounded-2xl">
            <Text className="text-2xl font-bold mb-2">Verification</Text>
            <Text className="text-gray-600 mb-6">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="Enter verification code"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })}
              className="mb-2"
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mb-4">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="bg-blue-500 py-3 rounded-xl"
              textClassName="text-white text-center font-semibold text-lg"
            />
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white p-6 rounded-2xl items-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={48} color="#3b82f6" />
            </View>

            <Text className="text-2xl font-bold text-center mb-2">
              Verified Successfully!
            </Text>
            
            <Text className="text-gray-500 text-center mb-6">
              Your account has been verified successfully. Welcome aboard!
            </Text>

            <CustomButton
              title="Get Started"
              onPress={() => router.push('/(tabs)/')}
              className="bg-blue-500 py-3 rounded-xl w-full"
              textClassName="text-white text-center font-semibold text-lg"
            />
          </View>
        </ReactNativeModal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;