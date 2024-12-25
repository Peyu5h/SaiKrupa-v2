import { View } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function SettingsScreen() {
  return (
    <View className="flex-1  bg-background p-4">
      <ThemeToggle />
    </View>
  );
}
