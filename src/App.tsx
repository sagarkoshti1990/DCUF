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
        console.log('🚀 Initializing RISE App...');

        // Initialize API service with configuration
        await apiService.initialize({
          baseUrl: 'https://rlapi.tekdinext.com',
        });

        // Note: Word API tests are now handled when user is authenticated
        console.log('📝 Word API will be initialized after authentication');

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
