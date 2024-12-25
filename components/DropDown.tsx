import { Platform } from 'react-native';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Text } from './ui/text';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { cn } from '~/lib/utils';
import { Muted } from './ui/typography';

export function RoleDropdownSelect({ defaultValue }: { defaultValue: string }) {
  const contentInsets = {
    left: 12,
    right: 12,
  };

  const [value, setValue] = React.useState(defaultValue);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={Platform.OS === 'web' ? 'sm' : 'default'}
          className="flex-row gap-2 native:pr-3"
        >
          <Text>{value}</Text>
          <ChevronDown size={18} className="text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" insets={contentInsets} className="w-64 native:w-72">
        <DropdownMenuLabel>Select new role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="gap-1">
          <DropdownMenuItem
            onPress={() => {
              setValue('Viewer');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'Viewer' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Viewer</Text>
            <Muted>Can view and comment.</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('Billing');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'Billing' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Billing</Text>
            <Muted>Can view, comment, and manage billing.</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('Owner');
            }}
            className={cn('flex-col items-start gap-1', value === 'Owner' ? 'bg-secondary/70' : '')}
          >
            <Text>Owner</Text>
            <Muted>Admin-level access to all resources</Muted>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
