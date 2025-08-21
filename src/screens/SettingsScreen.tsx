import React from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import {
  List,
  Card,
  Title,
  Button,
  Divider,
  Avatar,
  Switch,
  useTheme,
  Text,
} from 'react-native-paper';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';

// Render functions moved outside component
const renderThemeIcon = (props: any) => (
  <List.Icon {...props} icon="theme-light-dark" />
);
const renderSyncIcon = (props: any) => <List.Icon {...props} icon="sync" />;
const renderChevronRight = (props: any) => (
  <List.Icon {...props} icon="chevron-right" />
);
const renderInfoIcon = (props: any) => (
  <List.Icon {...props} icon="information" />
);
const renderHelpIcon = (props: any) => (
  <List.Icon {...props} icon="help-circle" />
);

const SettingsScreen: React.FC = () => {
  const {
    state: { user, settings },
    actions,
  } = useAppContext();
  const theme = useTheme();

  // Render function for switch component
  const renderThemeSwitch = () => (
    <Switch
      value={settings.theme === 'dark'}
      onValueChange={handleThemeToggle}
    />
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            actions.logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    actions.updateSettings({ theme: newTheme });
  };

  if (!user) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Title style={{ color: theme.colors.onBackground }}>
          No user logged in
        </Title>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileContent}>
            <Avatar.Text
              size={60}
              label={
                user.fName && user.fName.length > 0
                  ? user.fName.charAt(0).toUpperCase()
                  : '?'
              }
            />
            <View style={styles.userInfo}>
              <Text variant="titleLarge">
                {user.fName || 'Unknown'} {user.lName || 'User'}
              </Text>
              <Text variant="bodyMedium">
                Worker ID: {user.username || 'Not assigned'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <List.Item
            title="Dark Mode"
            description="Toggle between light and dark theme"
            left={renderThemeIcon}
            right={renderThemeSwitch}
          />

          <Divider />

          <List.Item
            title="Data Sync"
            description="Sync offline submissions"
            left={renderSyncIcon}
            right={renderChevronRight}
            onPress={() => {
              // Handle sync
            }}
          />

          <Divider />

          <List.Item
            title="App Info"
            description="Version 1.0.0"
            left={renderInfoIcon}
            right={renderChevronRight}
          />

          <Divider />

          <List.Item
            title="Help & Support"
            description="Get help and report issues"
            left={renderHelpIcon}
            right={renderChevronRight}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonLabel}
        icon="logout"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  settingsCard: {
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 8,
    borderColor: '#d32f2f',
  },
  logoutButtonLabel: {
    color: '#d32f2f',
  },
});

export default SettingsScreen;
