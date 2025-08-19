import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList, MainTabParamList } from '../types';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Temporary simple components to test
const DataEntryScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Data Entry Screen</Text>
  </View>
);

const ProgressScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Progress Screen</Text>
  </View>
);

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#6200ea',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="DataEntry"
      component={DataEntryScreen}
      options={{
        title: 'Data Collection',
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        title: 'Progress',
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Settings',
      }}
    />
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { state, actions } = useAppContext();

  const checkAuthState = useCallback(async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.data) {
        actions.setUser(result.data.user);
      } else {
        actions.setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      actions.setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  if (isLoading || state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AppNavigator;
