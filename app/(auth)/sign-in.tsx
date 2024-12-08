import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@/hooks/ThemeProvider";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useTaskStore } from "@/store/taskStore";
import { cn } from "@/lib/utils";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { height } = useWindowDimensions();
  const { setUserId } = useTaskStore()
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        
        router.push("/(tabs)/");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

  return (
    <SafeAreaView style={{ height }} className={cn("flex-1", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
      <ScrollView>
        {/* Header Section */}
        <View className="bg-blue-500 pt-4 pb-6">
          <View className="px-4 flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">Sign In</Text>
          </View>
          
          <View className="px-4">
            <Text className="text-white text-3xl font-bold mb-2">Welcome Back! 👋</Text>
            <Text className="text-white/80">Sign in to continue managing your tasks</Text>
          </View>
        </View>

        {/* Form Section */}
        <View className={cn("p-4 -mt-4 rounded-t-3xl", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
          <View className={cn("p-4 rounded-xl shadow-sm", isDarkMode ? "bg-gray-700" : "bg-white")}>
            <InputField
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              className="mb-4"
              textClassName={isDarkMode ? "text-white" : "text-gray-800"}
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              className="mb-6"
              textClassName={isDarkMode ? "text-white" : "text-gray-800"}
            />

            <CustomButton
              title="Sign In"
              onPress={onSignInPress}
              className="bg-blue-500 py-3 rounded-xl"
              textClassName="text-white text-center font-semibold text-lg"
            />
          </View>

          {/* OAuth Section */}
          <View className="mt-6">
            <Text className={cn("text-center mb-4", isDarkMode ? "text-gray-300" : "text-gray-500")}>
              Or continue with
            </Text>
            <OAuth />
          </View>

          {/* Sign Up Link */}
          <View className="mt-8 flex-row justify-center">
            <Text className={cn(isDarkMode ? "text-gray-300" : "text-gray-600")}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;