import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList, MainTabParamList } from '../types';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DataEntryScreen from '../screens/DataEntryScreen';
import SubmissionsScreen from '../screens/SubmissionsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const getTabBarIcon = (
  routeName: string,
  focused: boolean,
  color: string,
  size: number,
) => {
  let iconName: string = 'help-outline'; // Default fallback icon

  if (routeName === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (routeName === 'DataEntry') {
    iconName = focused ? 'add-circle' : 'add-circle-outline';
  } else if (routeName === 'Submissions') {
    iconName = focused ? 'list' : 'list-outline';
  } else if (routeName === 'Progress') {
    iconName = focused ? 'stats-chart' : 'stats-chart-outline';
  } else if (routeName === 'Settings') {
    iconName = focused ? 'settings' : 'settings-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) =>
        getTabBarIcon(route.name, focused, color, size),
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      // Prevent screens from mounting until they're focused
      lazy: true,
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Home',
      }}
    />
    <Tab.Screen
      name="DataEntry"
      component={DataEntryScreen}
      options={{
        title: 'Data Collection',
      }}
    />
    <Tab.Screen
      name="Submissions"
      component={SubmissionsScreen}
      options={{
        title: 'Submissions',
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
