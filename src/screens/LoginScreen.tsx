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
import { useAppContext } from '../context/AppContext';
import { UI_CONFIG } from '../constants/config';

const LoginScreen: React.FC = () => {
  // Email/Password fields for API login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { actions, state } = useAppContext();

  // Clear errors when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError || state.apiError) {
      setLocalError('');
      actions.setApiError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (localError || state.apiError) {
      setLocalError('');
      actions.setApiError(null);
    }
  };

  const handleEmailPasswordLogin = async () => {
    // Clear any existing errors
    setLocalError('');
    actions.setApiError(null);

    // Validate input
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter your password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Use API authentication
      const response = await actions.loginWithAPI(email.trim(), password);

      if (response.success) {
        console.log('✅ Login successful');
        // Clear any errors on successful login
        setLocalError('');
        actions.setApiError(null);
      } else {
        // Set user-friendly error messages
        const errorMessage = response.error || 'Invalid credentials';
        if (
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('invalid credentials')
        ) {
          setLocalError(
            'Invalid email or password. Please check your credentials and try again.',
          );
        } else if (errorMessage.toLowerCase().includes('network')) {
          setLocalError(
            'Network error. Please check your internet connection and try again.',
          );
        } else {
          setLocalError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLocalError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Login</Title>
          <Paragraph style={styles.subtitle}>
            Enter your email and password to continue
          </Paragraph>

          <TextInput
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            disabled={loading}
            placeholder="your.email@example.com"
            error={!!(localError || state.apiError)}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            disabled={loading}
            placeholder="Your password"
            error={!!(localError || state.apiError)}
          />

          {(localError || state.apiError) && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {localError || state.apiError}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleEmailPasswordLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {!state.apiInitialized && (
            <HelperText type="info" visible={true}>
              Initializing API connection...
            </HelperText>
          )}
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
    height: 48, // Fixed height instead of using contentStyle
  },
  errorText: {
    marginTop: 4,
    marginBottom: 8,
  },
});

export default LoginScreen;
