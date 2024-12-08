import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';



export default function NotFoundScreen() {
  const path = usePathname()
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text  className='text-2xlr'>This screen doesn't exist.</Text>
        <Text>{path}</Text>
        <Link href="/" style={styles.link}>
          <Text className='text-2xl'>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
