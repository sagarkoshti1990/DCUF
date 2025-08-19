import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
} from 'react-native-paper';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { UI_CONFIG } from '../constants/config';

const LoginScreen: React.FC = () => {
  const [workerID, setWorkerID] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { actions } = useAppContext();

  const handleLogin = async () => {
    if (!workerID.trim() || !pin.trim()) {
      setError('Please enter both Worker ID and PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(workerID, pin);
      if (response.success && response.data) {
        actions.setUser(response.data.user);
        // Navigation will be handled by the auth state change
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showTestCredentials = () => {
    Alert.alert(
      'Test Credentials',
      'WKR001 / 1234\nWKR002 / 5678\nWKR003 / 9012\nADMIN / 0000',
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Worker Login</Title>
          <Paragraph style={styles.subtitle}>
            Enter your Worker ID and PIN to continue
          </Paragraph>

          <TextInput
            label="Worker ID"
            value={workerID}
            onChangeText={setWorkerID}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="default"
            left={<TextInput.Icon icon="account" />}
            disabled={loading}
          />

          <TextInput
            label="PIN"
            value={pin}
            onChangeText={setPin}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            left={<TextInput.Icon icon="lock" />}
            disabled={loading}
          />

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Button
            mode="text"
            onPress={showTestCredentials}
            style={styles.testButton}
            disabled={loading}
          >
            Show Test Credentials
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: UI_CONFIG.DEFAULT_PADDING,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    borderRadius: UI_CONFIG.CARD_BORDER_RADIUS,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    height: UI_CONFIG.LARGE_BUTTON_HEIGHT,
  },
  testButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
