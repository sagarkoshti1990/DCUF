import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_CONFIG,
  DEFAULT_HEADERS,
  STATUS_CODES,
} from '../constants/apiConstants';
import { STORAGE_KEYS } from '../constants/config';
import { ApiResponse, RequestConfig } from '../types/api';

export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Check if there's a manually set token first (for testing)
      if (this.manualToken) {
        return this.manualToken;
      }
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private manualToken: string | null = null;

  // Method to manually set auth token (for testing)
  setAuthToken(token: string | null): void {
    this.manualToken = token;
  }

  private async getDefaultHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      'ngrok-skip-browser-warning': 'true', // Required for ngrok-free.app
    };
    const token = await this.getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit & RequestConfig = {},
    attempt: number = 1,
  ): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      const defaultHeaders = await this.getDefaultHeaders();

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      // Add timeout if specified
      if (options.timeout || this.defaultTimeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          options.timeout || this.defaultTimeout,
        );
        config.signal = controller.signal;

        // Clear timeout if request completes
        config.signal.addEventListener('abort', () => clearTimeout(timeoutId));
      }

      console.log(`[HTTP] ${options.method || 'GET'} ${fullUrl}`, {
        headers: config.headers,
        body: options.body,
      });

      const response = await fetch(fullUrl, config);
      const responseText = await response.text();

      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        data = { message: responseText };
      }

      console.log(`[HTTP] Response ${response.status}:`, data);

      if (response.ok) {
        return {
          success: true,
          data: data, // Return full response data to handle nested structures
          message: data.message || data.params?.successmessage,
        };
      } else {
        // Handle specific error cases
        if (response.status === STATUS_CODES.UNAUTHORIZED) {
          // Token expired or invalid
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          // You might want to redirect to login here
        }

        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
          errors: data.errors,
        };
      }
    } catch (error: any) {
      console.error(`[HTTP] Request failed (attempt ${attempt}):`, error);

      // Retry logic for network errors
      if (attempt < (options.retries || this.retryAttempts)) {
        const delay = (options.retryDelay || this.retryDelay) * attempt;
        console.log(`[HTTP] Retrying in ${delay}ms...`);
        await this.delay(delay);
        return this.makeRequest<T>(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET', ...config });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers =
      data instanceof FormData
        ? { ...config?.headers } // Don't set Content-Type for FormData
        : { 'Content-Type': 'application/json', ...config?.headers };

    return this.makeRequest<T>(url, {
      method: 'POST',
      body,
      headers,
      ...config,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config,
    });
  }

  async delete<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE', ...config });
  }

  // Upload file with progress support
  async uploadFile<T>(
    url: string,
    file: File | Blob,
    additionalData?: Record<string, any>,
    _onProgress?: (progress: number) => void, // Prefixed with underscore to indicate intentionally unused
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // For now, we'll use the regular post method
      // In a real implementation, you might want to use XMLHttpRequest for progress tracking
      return this.post<T>(url, formData);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'File upload failed',
      };
    }
  }

  // Update base URL (useful for environment switching)
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
