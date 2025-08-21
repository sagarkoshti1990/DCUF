import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '../constants/apiConstants';
import {
  ApiResponse,
  ApiWord,
  ApiLanguage,
  WordFilterRequest,
  LocationFilterRequest,
  PaginatedResponse,
} from '../types/api';

export class WordsApiService {
  /**
   * Get words with filters
   */
  async getWords(
    filters?: WordFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiWord>>> {
    try {
      const requestBody = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        sortBy: filters?.sortBy || 'createdAt',
        sortOrder: filters?.sortOrder || 'ASC',
        ...filters,
      };

      const response = await httpClient.post<any>(
        API_ENDPOINTS.WORDS.FILTER,
        requestBody,
      );

      if (
        response.success &&
        response.data?.responseCode === 200 &&
        response.data?.data?.words
      ) {
        // Transform the new API response structure to match our expected format
        const transformedData: PaginatedResponse<ApiWord> = {
          items: response.data.data.words,
          totalItems:
            response.data.data.pagination?.total ||
            response.data.data.words.length,
          currentPage: response.data.data.pagination?.page || 1,
          totalPages: response.data.data.pagination?.totalPages || 1,
          hasNextPage: response.data.data.pagination?.hasNext || false,
          hasPrevPage: response.data.data.pagination?.hasPrevious || false,
        };

        console.log('✅ Words fetched successfully:', transformedData);
        return {
          success: true,
          data: transformedData,
        };
      } else {
        console.error(
          '❌ Failed to fetch words:',
          response.error || 'Invalid response structure',
        );
        return {
          success: false,
          error: response.error || 'Invalid response structure',
        };
      }
    } catch (error: any) {
      console.error('Get words error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch words',
      };
    }
  }

  /**
   * Get words by language
   */
  async getWordsByLanguage(
    languageIds: string[],
    page: number = 1,
    limit: number = 50,
  ): Promise<ApiResponse<PaginatedResponse<ApiWord>>> {
    try {
      const filters: WordFilterRequest = {
        languageIds,
        page,
        limit,
        sortBy: 'word', // Sort by word field for easier navigation
        sortOrder: 'ASC',
      };

      return this.getWords(filters);
    } catch (error: any) {
      console.error('Get words by language error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch words by language',
      };
    }
  }

  /**
   * Search words by text
   */
  async searchWords(
    searchTerm: string,
    languageIds?: string[],
    category?: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiWord>>> {
    try {
      const filters: WordFilterRequest = {
        search: searchTerm,
        languageIds,
        category,
        page: 1,
        limit: 50,
        sortBy: 'word',
        sortOrder: 'ASC',
      };

      return this.getWords(filters);
    } catch (error: any) {
      console.error('Search words error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search words',
      };
    }
  }

  /**
   * Get words by category
   */
  async getWordsByCategory(
    category: string,
    languageIds?: string[],
    page: number = 1,
    limit: number = 50,
  ): Promise<ApiResponse<PaginatedResponse<ApiWord>>> {
    try {
      const filters: WordFilterRequest = {
        category,
        languageIds,
        page,
        limit,
        sortBy: 'word',
        sortOrder: 'ASC',
      };

      return this.getWords(filters);
    } catch (error: any) {
      console.error('Get words by category error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch words by category',
      };
    }
  }

  /**
   * Get all words for a language (for dropdown/selector)
   */
  async getAllWordsForLanguage(
    languageId: string,
  ): Promise<ApiResponse<ApiWord[]>> {
    try {
      const response = await this.getWordsByLanguage([languageId], 1, 1000); // Large limit to get all

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.items,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch words for language',
      };
    } catch (error: any) {
      console.error('Get all words for language error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch all words for language',
      };
    }
  }

  /**
   * Get word categories (extract unique categories from words)
   */
  async getWordCategories(
    languageIds?: string[],
  ): Promise<ApiResponse<string[]>> {
    try {
      // Since there's no dedicated categories endpoint, we'll fetch words and extract categories
      const response = await this.getWords({
        languageIds,
        page: 1,
        limit: 1000,
      });

      if (response.success && response.data) {
        const categories = new Set<string>();
        response.data.items.forEach(word => {
          if (word.category) {
            categories.add(word.category);
          }
        });

        return {
          success: true,
          data: Array.from(categories).sort(),
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch word categories',
      };
    } catch (error: any) {
      console.error('Get word categories error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch word categories',
      };
    }
  }
}

export class LanguagesApiService {
  /**
   * Get languages with filters
   */
  async getLanguages(
    filters?: LocationFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiLanguage>>> {
    try {
      const requestBody = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        sortBy: filters?.sortBy || 'name',
        sortOrder: filters?.sortOrder || 'ASC',
        ...filters,
      };

      const response = await httpClient.post<any>(
        API_ENDPOINTS.LANGUAGES.FILTER,
        requestBody,
      );

      if (response.success && response.data?.data?.languages) {
        // Transform the actual API response structure to match our expected format
        const transformedData: PaginatedResponse<ApiLanguage> = {
          items: response.data.data.languages,
          totalItems:
            response.data.data.pagination?.total ||
            response.data.data.languages.length,
          currentPage: response.data.data.pagination?.page || 1,
          totalPages: response.data.data.pagination?.totalPages || 1,
          hasNextPage: response.data.data.pagination?.hasNext || false,
          hasPrevPage: response.data.data.pagination?.hasPrevious || false,
        };

        console.log('✅ Languages fetched successfully:', transformedData);
        return {
          success: true,
          data: transformedData,
        };
      } else {
        console.error('❌ Failed to fetch languages:', response.error);
        return response;
      }
    } catch (error: any) {
      console.error('Get languages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch languages',
      };
    }
  }

  /**
   * Get all languages (for dropdown/selector)
   */
  async getAllLanguages(): Promise<ApiResponse<ApiLanguage[]>> {
    try {
      const response = await this.getLanguages({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.items,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch languages',
      };
    } catch (error: any) {
      console.error('Get all languages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch all languages',
      };
    }
  }

  /**
   * Search languages by name
   */
  async searchLanguages(
    searchTerm: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiLanguage>>> {
    try {
      const filters: LocationFilterRequest = {
        name: searchTerm,
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getLanguages(filters);
    } catch (error: any) {
      console.error('Search languages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search languages',
      };
    }
  }

  /**
   * Get language by ID
   */
  async getLanguageById(languageId: string): Promise<ApiResponse<ApiLanguage>> {
    try {
      // Since there's no direct get-by-id endpoint, we'll filter by ID
      const response = await this.getLanguages({
        page: 1,
        limit: 100, // Get all languages to find the one we need
      });

      if (response.success && response.data) {
        const language = response.data.items.find(
          lang => lang.languageId === languageId,
        );
        if (language) {
          return {
            success: true,
            data: language,
          };
        }
      }

      return {
        success: false,
        error: 'Language not found',
      };
    } catch (error: any) {
      console.error('Get language by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch language by ID',
      };
    }
  }
}

// Export singleton instances
export const wordsApiService = new WordsApiService();
export const languagesApiService = new LanguagesApiService();
