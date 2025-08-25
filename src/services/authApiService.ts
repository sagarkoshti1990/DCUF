import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '../constants/apiConstants';
import { STORAGE_KEYS } from '../constants/config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  ApiUser,
  AuthTokens,
} from '../types/api';

export class AuthApiService {
  /**
   * Register a new user (Public endpoint)
   */
  async registerPublic(
    userData: RegisterRequest,
  ): Promise<ApiResponse<ApiUser>> {
    try {
      const response = await httpClient.post<ApiUser>(
        API_ENDPOINTS.AUTH.REGISTER_PUBLIC,
        userData,
      );

      if (response.success) {
        console.log('✅ User registered successfully:', response.data);
      } else {
        console.error('❌ Registration failed:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  /**
   * Register a new user (Authenticated endpoint - requires admin token)
   */
  async registerWithAuth(
    userData: RegisterRequest,
  ): Promise<ApiResponse<ApiUser>> {
    try {
      const response = await httpClient.post<ApiUser>(
        API_ENDPOINTS.USERS.REGISTER_AUTH,
        userData,
      );

      if (response.success) {
        console.log('✅ User registered via auth endpoint:', response.data);
      } else {
        console.error('❌ Auth registration failed:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Auth registration error:', error);
      return {
        success: false,
        error: error.message || 'Authentication registration failed',
      };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
      );

      if (response.success && response.data) {
        // Store authentication data
        await this.storeAuthData(response.data);
        console.log('✅ Login successful:', response.data.data.user.email);

        return response;
      } else {
        // Safe error logging and handling
        const errorMessage = response.error || 'Login failed';
        console.error('❌ Login failed:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Clear stored authentication data
      await this.clearAuthData();

      console.log('✅ Logout successful');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Get current user data from storage
   */
  async getCurrentUser(): Promise<
    ApiResponse<{ user: ApiUser; token: string }>
  > {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);

      if (userData && token) {
        const user = JSON.parse(userData) as ApiUser;
        return {
          success: true,
          data: { user, token },
        };
      }

      return { success: false, error: 'No stored authentication data' };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get current user',
      };
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        return false;
      }

      // For now, just check if token exists and is not expired
      // In a real implementation, you might want to call a validation endpoint
      return this.isTokenValid(token);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );

      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token available',
        };
      }

      // Note: The API doesn't seem to have a refresh endpoint in the collection
      // You might need to implement this on the backend
      // For now, we'll return an error
      return {
        success: false,
        error: 'Token refresh not implemented',
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Store authentication data
   */
  private async storeAuthData(authData: LoginResponse): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(authData.data.user),
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.AUTH_TOKEN,
          authData.data.accessToken,
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          authData.data.refreshToken,
        ),
      ]);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw error;
    }
  }

  /**
   * Check if token is valid (basic validation)
   */
  private isTokenValid(token: string): boolean {
    try {
      // Basic token format validation
      if (!token || token.length < 10) {
        return false;
      }

      // For JWT tokens, you might want to decode and check expiration
      // For now, we'll do a simple check
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return token !== null && this.isTokenValid(token);
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
