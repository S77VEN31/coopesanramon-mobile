import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AppNavigator } from './src/navigation';
import { useAuthStore } from './src/lib/states/auth.store';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const colorScheme = useColorScheme();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize authentication state
      await initializeAuth();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff' }]}>
          <ActivityIndicator size="large" color="#a61612" />
        </View>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

// Dark mode colors - Keep these for backward compatibility with components that still use them
export const getBackgroundColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#1a1a1a' : '#fff5f5';
};

export const getCardBackgroundColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#2a2a2a' : '#ffffff';
};

export const getTextColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#f5f5f5' : '#262626';
};

export const getSecondaryTextColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#a3a3a3' : '#737373';
};

export const getBorderColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#404040' : '#e5e5e5';
};

export const getInputBackgroundColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return colorScheme === 'dark' ? '#333333' : '#f5f5f5';
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

