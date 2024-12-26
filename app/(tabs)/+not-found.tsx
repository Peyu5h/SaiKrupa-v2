import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text>This detil screen doesn't exist.</Text>

        <Button onPress={() => router.push('/')}>
          <Text>Go to home screen!</Text>
        </Button>
      </View>
    </View>
  );
}
