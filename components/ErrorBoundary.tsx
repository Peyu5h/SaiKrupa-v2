import React from 'react';
import { View } from 'react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-destructive text-lg mb-4">Something went wrong!</Text>
          <Button onPress={() => this.setState({ hasError: false })} variant="destructive">
            <Text>Try Again</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
