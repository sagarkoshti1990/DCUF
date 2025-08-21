// Main API Service - Unified interface for all API operations
import { authApiService } from './authApiService';
import { userApiService } from './userApiService';
import { locationApiService } from './locationApiService';
import { submissionApiService } from './submissionApiService';
import { wordsApiService, languagesApiService } from './wordsApiService';
import { httpClient } from './httpClient';

/**
 * Unified API Service
 * Provides a single interface for all API operations
 */
export class ApiService {
  // Authentication operations
  auth = authApiService;

  // User management operations
  users = userApiService;

  // Location operations (districts, tehsils, villages)
  locations = locationApiService;

  // Submission operations
  submissions = submissionApiService;

  // Words operations
  words = wordsApiService;

  // Languages operations
  languages = languagesApiService;

  /**
   * Configure API base URL
   */
  setBaseUrl(url: string): void {
    httpClient.setBaseURL(url);
  }

  /**
   * Set auth token for testing
   */
  setAuthToken(token: string | null): void {
    httpClient.setAuthToken(token);
  }

  /**
   * Get current API base URL
   */
  getBaseUrl(): string {
    return httpClient.getBaseURL();
  }

  /**
   * Test the new words API endpoint
   */
  async testWordsAPI(
    languageId: string = 'be9a1512-918c-4ca9-ad7b-cdd5581aab79',
  ): Promise<any> {
    try {
      console.log('🧪 Testing words API with language ID:', languageId);
      const response = await this.words.getWordsByLanguage([languageId], 1, 50);
      console.log('🧪 Test response:', response);
      return response;
    } catch (error) {
      console.error('🧪 Test failed:', error);
      throw error;
    }
  }

  /**
   * Health check - Test API connectivity
   */
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    try {
      // Try a simple API call to test connectivity
      const response = await this.languages.getAllLanguages();

      return {
        success: response.success,
        message: response.success
          ? 'API is healthy'
          : 'API connectivity issues',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'API health check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Initialize API service
   * Call this when the app starts to setup configurations
   */
  async initialize(config?: {
    baseUrl?: string;
    timeout?: number;
  }): Promise<void> {
    try {
      if (config?.baseUrl) {
        this.setBaseUrl(config.baseUrl);
      }

      // Perform health check
      const health = await this.healthCheck();
      console.log('🔗 API Service initialized:', health);

      if (!health.success) {
        console.warn('⚠️ API initialization warning:', health.message);
      }
    } catch (error) {
      console.error('❌ API initialization error:', error);
    }
  }

  /**
   * Bulk operations helper
   */
  async bulkOperations() {
    return {
      /**
       * Load all necessary data for the app initialization
       */
      loadInitialData: async () => {
        try {
          console.log('📊 Loading initial data...');

          const [languages, districts] = await Promise.all([
            this.languages.getAllLanguages(),
            this.locations.getAllDistricts(),
          ]);

          return {
            languages: languages.success ? languages.data : [],
            districts: districts.success ? districts.data : [],
            errors: [
              ...(languages.success ? [] : [languages.error]),
              ...(districts.success ? [] : [districts.error]),
            ].filter(Boolean),
          };
        } catch (error: any) {
          console.error('❌ Error loading initial data:', error);
          return {
            languages: [],
            districts: [],
            errors: [error.message || 'Failed to load initial data'],
          };
        }
      },

      /**
       * Load location hierarchy data
       */
      loadLocationData: async (districtId?: string, tehsilId?: string) => {
        try {
          return await this.locations.getLocationHierarchy(
            districtId,
            tehsilId,
          );
        } catch (error: any) {
          console.error('❌ Error loading location data:', error);
          return {
            districts: { success: false, error: error.message },
          };
        }
      },

      /**
       * Load words for a specific language
       */
      loadWordsForLanguage: async (languageId: string) => {
        try {
          const [words, categories] = await Promise.all([
            this.words.getAllWordsForLanguage(languageId),
            this.words.getWordCategories([languageId]),
          ]);

          return {
            words: words.success ? words.data : [],
            categories: categories.success ? categories.data : [],
            errors: [
              ...(words.success ? [] : [words.error]),
              ...(categories.success ? [] : [categories.error]),
            ].filter(Boolean),
          };
        } catch (error: any) {
          console.error('❌ Error loading words for language:', error);
          return {
            words: [],
            categories: [],
            errors: [error.message || 'Failed to load words'],
          };
        }
      },
    };
  }

  /**
   * Common workflows
   */
  async workflows() {
    return {
      /**
       * Complete user authentication workflow
       */
      loginUser: async (email: string, password: string) => {
        try {
          console.log('🔐 Starting login workflow for:', email);

          const loginResponse = await this.auth.login({ email, password });

          if (loginResponse.success && loginResponse.data) {
            console.log('✅ Login successful, loading user data...');

            // Load additional user data if needed
            const userProfile = await this.users.getCurrentUserProfile();

            return {
              success: true,
              data: {
                auth: loginResponse.data,
                profile: userProfile.success ? userProfile.data : null,
              },
            };
          }

          return loginResponse;
        } catch (error: any) {
          console.error('❌ Login workflow error:', error);
          return {
            success: false,
            error: error.message || 'Login workflow failed',
          };
        }
      },

      /**
       * Complete submission workflow
       */
      submitWordData: async (submissionData: any, audioFile?: File | Blob) => {
        try {
          console.log('📝 Starting submission workflow...');

          if (audioFile) {
            // Use upload endpoint for audio submissions
            const uploadData = {
              ...submissionData,
              audioFile,
            };
            return await this.submissions.submitSubmissionWithUpload(
              uploadData,
            );
          } else {
            // Use regular JSON submission
            return await this.submissions.submitSubmission(submissionData);
          }
        } catch (error: any) {
          console.error('❌ Submission workflow error:', error);
          return {
            success: false,
            error: error.message || 'Submission workflow failed',
          };
        }
      },
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual services for direct access if needed
export {
  authApiService,
  userApiService,
  locationApiService,
  submissionApiService,
  wordsApiService,
  languagesApiService,
};

// Export types for convenience
export * from '../types/api';
