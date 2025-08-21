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
  const { actions, state } = useAppContext();

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // Use API authentication
      const response = await actions.loginWithAPI(email, password);

      if (response.success) {
        console.log('✅ Login successful');
        // Don't call any unauthorized APIs here - let the app initialize after login
      } else {
        Alert.alert('Login Failed', response.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Use API error if available, otherwise local error
  const displayError = state.apiError;

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
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            disabled={loading}
            placeholder="your.email@example.com"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
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
          />

          {displayError ? (
            <HelperText type="error" visible={!!displayError}>
              {displayError}
            </HelperText>
          ) : null}

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
});

export default LoginScreen;
