import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import { STORAGE_KEYS } from '../constants/config';
import { mockUsers, mockCredentials } from '../data/mockUsers';

class AuthService {
  async login(workerID: string, pin: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

    const credential = mockCredentials.find(
      c => c.workerID === workerID && c.pin === pin,
    );

    if (credential) {
      const user = mockUsers.find(u => u.workerID === workerID);

      if (user) {
        const userData: User = {
          ...user,
          loginTime: new Date().toISOString(),
        };

        const token = `mock_token_${user.id}_${Date.now()}`;

        // Store auth data
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(userData),
        );
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

        return {
          success: true,
          data: { user: userData, token },
        };
      }
    }

    return {
      success: false,
      message: 'Invalid Worker ID or PIN',
    };
  }

  async logout(): Promise<AuthResponse> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (userData && token) {
        const user = JSON.parse(userData) as User;
        return {
          success: true,
          data: { user, token },
        };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error };
    }
  }

  async validateToken(token: string): Promise<boolean> {
    // Simple mock validation
    return Boolean(token && token.startsWith('mock_token_'));
  }

  async refreshToken(): Promise<AuthResponse> {
    // Mock refresh token implementation
    const currentUser = await this.getCurrentUser();
    if (currentUser.success && currentUser.data) {
      const newToken = `mock_token_${currentUser.data.user.id}_${Date.now()}`;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);

      return {
        success: true,
        data: {
          user: currentUser.data.user,
          token: newToken,
        },
      };
    }
    return { success: false, message: 'No valid session found' };
  }
}

export const authService = new AuthService();
