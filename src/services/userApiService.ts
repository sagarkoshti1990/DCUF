import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '../constants/apiConstants';
import {
  ApiResponse,
  ApiUser,
  UserListFilters,
  UpdateUserRequest,
  PaginatedResponse,
} from '../types/api';

export class UserApiService {
  /**
   * Get list of users with filters and pagination
   */
  async getUsers(
    filters?: UserListFilters,
  ): Promise<ApiResponse<PaginatedResponse<ApiUser>>> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url =
        filters && Object.keys(filters).length > 0
          ? `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`
          : API_ENDPOINTS.USERS.LIST;

      const response = await httpClient.get<PaginatedResponse<ApiUser>>(url);

      if (response.success) {
        console.log('✅ Users fetched successfully:', response.data);
      } else {
        console.error('❌ Failed to fetch users:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch users',
      };
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<ApiUser>> {
    try {
      const response = await httpClient.get<ApiUser>(
        API_ENDPOINTS.USERS.DETAILS(userId),
      );

      if (response.success) {
        console.log('✅ User details fetched:', response.data);
      } else {
        console.error('❌ Failed to fetch user details:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get user details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user details',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(
    userId: string,
    updateData: UpdateUserRequest,
  ): Promise<ApiResponse<ApiUser>> {
    try {
      const response = await httpClient.put<ApiUser>(
        API_ENDPOINTS.USERS.UPDATE(userId),
        updateData,
      );

      if (response.success) {
        console.log('✅ User updated successfully:', response.data);
      } else {
        console.error('❌ Failed to update user:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user',
      };
    }
  }

  /**
   * Get current user profile (using 'me' or current user ID)
   */
  async getCurrentUserProfile(): Promise<ApiResponse<ApiUser>> {
    try {
      // You might want to get the current user ID from storage
      // For now, we'll assume the API supports a 'me' endpoint
      const response = await httpClient.get<ApiUser>('/api/users/me');

      if (response.success) {
        console.log('✅ Current user profile fetched:', response.data);
      } else {
        console.error(
          '❌ Failed to fetch current user profile:',
          response.error,
        );
      }

      return response;
    } catch (error: any) {
      console.error('Get current user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch current user profile',
      };
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUserProfile(
    updateData: UpdateUserRequest,
  ): Promise<ApiResponse<ApiUser>> {
    try {
      // You might want to get the current user ID from storage
      // For now, we'll assume the API supports a 'me' endpoint
      const response = await httpClient.put<ApiUser>(
        '/api/users/me',
        updateData,
      );

      if (response.success) {
        console.log('✅ Current user profile updated:', response.data);
      } else {
        console.error(
          '❌ Failed to update current user profile:',
          response.error,
        );
      }

      return response;
    } catch (error: any) {
      console.error('Update current user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update current user profile',
      };
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(
    searchTerm: string,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiUser>>> {
    try {
      const filters: UserListFilters = {
        search: searchTerm,
        limit,
        page: 1,
      };

      return this.getUsers(filters);
    } catch (error: any) {
      console.error('Search users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search users',
      };
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: 'WORKER' | 'ADMIN',
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiUser>>> {
    try {
      const filters: UserListFilters = {
        role,
        page,
        limit,
      };

      return this.getUsers(filters);
    } catch (error: any) {
      console.error('Get users by role error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get users by role',
      };
    }
  }

  /**
   * Get active users
   */
  async getActiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiUser>>> {
    try {
      const filters: UserListFilters = {
        status: 'active',
        page,
        limit,
      };

      return this.getUsers(filters);
    } catch (error: any) {
      console.error('Get active users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get active users',
      };
    }
  }
}

// Export singleton instance
export const userApiService = new UserApiService();
