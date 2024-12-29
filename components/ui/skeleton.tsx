import { cn } from '~/lib/utils';
import { View } from 'react-native';

function Skeleton({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return (
    <View className={cn('bg-gray-200/70 dark:bg-foreground/10 rounded-md', className)} {...props} />
  );
}

export { Skeleton };
