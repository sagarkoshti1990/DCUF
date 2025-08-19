import React from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import {
  List,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  Avatar,
} from 'react-native-paper';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';

const SettingsScreen: React.FC = () => {
  const { state, actions } = useAppContext();

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

  const user = state.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <Title>No user logged in</Title>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileContent}>
            <Avatar.Text size={60} label={user.name.charAt(0)} />
            <View style={styles.userInfo}>
              <Title>{user.name}</Title>
              <Paragraph>Worker ID: {user.workerID}</Paragraph>
              <Paragraph>
                Village: {user.assignedVillage?.name || 'Not assigned'}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Options */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <List.Item
            title="Data Sync"
            description="Sync offline submissions"
            left={props => <List.Icon {...props} icon="sync" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Handle sync
            }}
          />

          <Divider />

          <List.Item
            title="App Info"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />

          <Divider />

          <List.Item
            title="Help & Support"
            description="Get help and report issues"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
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
