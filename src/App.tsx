import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { AppProvider, useAppContext } from './context/AppContext';
import { apiService } from './services/apiService';
import { httpClient } from './services/httpClient';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ea',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#b00020',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    primaryContainer: '#6200ea',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#cf6679',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize API service on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing DCUF App...');

        // Set the auth token for testing
        httpClient.setAuthToken(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMWE0NGZmNS0yMjUwLTQ0NmYtOTA1NC01YThjN2RjYmM3NDkiLCJlbWFpbCI6InR1c2hhci5tYWhhamFuQHRla2RpdGVjaG5vbG9naWVzLmNvbSIsImlhdCI6MTc1NTc3MTA4NiwiZXhwIjoxNzU1ODU3NDg2fQ.h5K59KZDA1xtEaSKqqrOR3j-Qcna-scpR_lF_Y82vOs',
        );

        // Initialize API service with configuration
        await apiService.initialize({
          baseUrl: 'https://59312d0a3250.ngrok-free.app',
        });

        // Test the new words API
        console.log('🧪 Testing new words API...');
        const testResult = await apiService.testWordsAPI();
        if (testResult.success) {
          console.log(
            '✅ Words API test successful! Words count:',
            testResult.data?.length || 0,
          );
        } else {
          console.log('⚠️ Words API test failed:', testResult.error);
        }

        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedApp isDarkMode={isDarkMode} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp({ isDarkMode }: { isDarkMode: boolean }): React.JSX.Element {
  const { state } = useAppContext();

  // Use app settings theme if available, otherwise use system theme
  const useTheme =
    state?.settings?.theme === 'dark' ||
    (state?.settings?.theme !== 'light' && isDarkMode);

  const theme = useTheme ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={useTheme ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <AppContent />
    </PaperProvider>
  );
}

function AppContent(): React.JSX.Element {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
