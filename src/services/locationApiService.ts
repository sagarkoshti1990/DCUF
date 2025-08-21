import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '../constants/apiConstants';
import {
  ApiResponse,
  ApiDistrict,
  ApiTehsil,
  ApiVillage,
  LocationFilterRequest,
  PaginatedResponse,
} from '../types/api';

export class LocationApiService {
  /**
   * Get districts with filters
   */
  async getDistricts(
    filters?: LocationFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiDistrict>>> {
    try {
      const requestBody = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        sortBy: filters?.sortBy || 'name',
        sortOrder: filters?.sortOrder || 'ASC',
        ...filters,
      };

      const response = await httpClient.post<PaginatedResponse<ApiDistrict>>(
        API_ENDPOINTS.LOCATIONS.DISTRICTS,
        requestBody,
      );

      if (response.success) {
        console.log('✅ Districts fetched successfully:', response.data);
      } else {
        console.error('❌ Failed to fetch districts:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get districts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch districts',
      };
    }
  }

  /**
   * Get tehsils with filters
   */
  async getTehsils(
    filters?: LocationFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiTehsil>>> {
    try {
      const requestBody = {
        page: filters?.page || 1,
        limit: filters?.limit || 15,
        sortBy: filters?.sortBy || 'name',
        sortOrder: filters?.sortOrder || 'ASC',
        ...filters,
      };

      const response = await httpClient.post<PaginatedResponse<ApiTehsil>>(
        API_ENDPOINTS.LOCATIONS.TEHSILS,
        requestBody,
      );

      if (response.success) {
        console.log('✅ Tehsils fetched successfully:', response.data);
      } else {
        console.error('❌ Failed to fetch tehsils:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get tehsils error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tehsils',
      };
    }
  }

  /**
   * Get villages with filters
   */
  async getVillages(
    filters?: LocationFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiVillage>>> {
    try {
      const requestBody = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        sortBy: filters?.sortBy || 'name',
        sortOrder: filters?.sortOrder || 'ASC',
        ...filters,
      };

      const response = await httpClient.post<PaginatedResponse<ApiVillage>>(
        API_ENDPOINTS.LOCATIONS.VILLAGES,
        requestBody,
      );

      if (response.success) {
        console.log('✅ Villages fetched successfully:', response.data);
      } else {
        console.error('❌ Failed to fetch villages:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get villages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch villages',
      };
    }
  }

  /**
   * Get tehsils by district ID
   */
  async getTehsilsByDistrict(
    districtId: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiTehsil>>> {
    try {
      const filters: LocationFilterRequest = {
        districtId,
        page: 1,
        limit: 100, // Get all tehsils for the district
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getTehsils(filters);
    } catch (error: any) {
      console.error('Get tehsils by district error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tehsils by district',
      };
    }
  }

  /**
   * Get villages by tehsil ID
   */
  async getVillagesByTehsil(
    tehsilId: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiVillage>>> {
    try {
      const filters: LocationFilterRequest = {
        tehsilId,
        page: 1,
        limit: 100, // Get all villages for the tehsil
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getVillages(filters);
    } catch (error: any) {
      console.error('Get villages by tehsil error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch villages by tehsil',
      };
    }
  }

  /**
   * Search districts by name
   */
  async searchDistricts(
    searchTerm: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiDistrict>>> {
    try {
      const filters: LocationFilterRequest = {
        name: searchTerm,
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getDistricts(filters);
    } catch (error: any) {
      console.error('Search districts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search districts',
      };
    }
  }

  /**
   * Search tehsils by name
   */
  async searchTehsils(
    searchTerm: string,
    districtId?: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiTehsil>>> {
    try {
      const filters: LocationFilterRequest = {
        name: searchTerm,
        districtId,
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getTehsils(filters);
    } catch (error: any) {
      console.error('Search tehsils error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search tehsils',
      };
    }
  }

  /**
   * Search villages by name
   */
  async searchVillages(
    searchTerm: string,
    tehsilId?: string,
  ): Promise<ApiResponse<PaginatedResponse<ApiVillage>>> {
    try {
      const filters: LocationFilterRequest = {
        name: searchTerm,
        tehsilId,
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      return this.getVillages(filters);
    } catch (error: any) {
      console.error('Search villages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search villages',
      };
    }
  }

  /**
   * Get all districts (for dropdown/selector)
   */
  async getAllDistricts(): Promise<ApiResponse<ApiDistrict[]>> {
    try {
      const response = await this.getDistricts({
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
        error: response.error || 'Failed to fetch districts',
      };
    } catch (error: any) {
      console.error('Get all districts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch all districts',
      };
    }
  }

  /**
   * Get location hierarchy (district -> tehsil -> village)
   */
  async getLocationHierarchy(
    districtId?: string,
    tehsilId?: string,
  ): Promise<{
    districts: ApiResponse<ApiDistrict[]>;
    tehsils?: ApiResponse<ApiTehsil[]>;
    villages?: ApiResponse<ApiVillage[]>;
  }> {
    try {
      const results: any = {};

      // Always get districts
      results.districts = await this.getAllDistricts();

      // Get tehsils if district is selected
      if (districtId) {
        const tehsilsResponse = await this.getTehsilsByDistrict(districtId);
        if (tehsilsResponse.success && tehsilsResponse.data) {
          results.tehsils = {
            success: true,
            data: tehsilsResponse.data.items,
          };
        } else {
          results.tehsils = tehsilsResponse;
        }
      }

      // Get villages if tehsil is selected
      if (tehsilId) {
        const villagesResponse = await this.getVillagesByTehsil(tehsilId);
        if (villagesResponse.success && villagesResponse.data) {
          results.villages = {
            success: true,
            data: villagesResponse.data.items,
          };
        } else {
          results.villages = villagesResponse;
        }
      }

      return results;
    } catch (error: any) {
      console.error('Get location hierarchy error:', error);
      return {
        districts: {
          success: false,
          error: error.message || 'Failed to fetch location hierarchy',
        },
      };
    }
  }
}

// Export singleton instance
export const locationApiService = new LocationApiService();
