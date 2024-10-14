import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

const Layout = () => {

  const { userId } = useAuth()

  if (userId) return <Redirect href={"/(tabs)/"} />
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
