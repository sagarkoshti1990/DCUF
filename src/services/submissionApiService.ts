import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '../constants/apiConstants';
import {
  ApiResponse,
  ApiSubmission,
  SubmissionRequest,
  SubmissionWithUploadRequest,
  UpdateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  SubmissionFilterRequest,
  PaginatedResponse,
} from '../types/api';

export class SubmissionApiService {
  /**
   * Submit a new word submission (JSON)
   */
  async submitSubmission(
    submissionData: SubmissionRequest,
  ): Promise<ApiResponse<ApiSubmission>> {
    try {
      const response = await httpClient.post<ApiSubmission>(
        API_ENDPOINTS.SUBMISSIONS.SUBMIT,
        submissionData,
      );

      if (response.success) {
        console.log('✅ Submission created successfully:', response.data);
      } else {
        console.error('❌ Failed to create submission:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Submit submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit submission',
      };
    }
  }

  /**
   * Submit a new word submission with audio file upload (FormData)
   */
  async submitSubmissionWithUpload(
    submissionData: SubmissionWithUploadRequest,
  ): Promise<ApiResponse<ApiSubmission>> {
    try {
      const formData = new FormData();

      // Add all required fields to match the curl example exactly
      formData.append('wordId', submissionData.wordId);
      formData.append('villageId', submissionData.villageId);
      formData.append('tehsilId', submissionData.tehsilId);
      formData.append('districtId', submissionData.districtId);
      formData.append(
        'languageId',
        submissionData.languageId || 'be9a1512-918c-4ca9-ad7b-cdd5581aab79',
      );
      formData.append('synonyms', submissionData.synonyms || '');

      // Handle audio file - React Native format or web format
      if (submissionData.audioFile) {
        const audioFile = submissionData.audioFile as any;
        if (audioFile.uri) {
          // React Native file format
          formData.append('audioFile', {
            uri: audioFile.uri,
            type: audioFile.type || 'audio/m4a',
            name: audioFile.name || 'recording.m4a',
          });
        } else {
          // Web File/Blob format
          formData.append('audioFile', submissionData.audioFile);
        }
      }

      console.log('📤 Submitting FormData with:', {
        wordId: submissionData.wordId,
        villageId: submissionData.villageId,
        tehsilId: submissionData.tehsilId,
        districtId: submissionData.districtId,
        languageId: submissionData.languageId,
        synonyms: submissionData.synonyms,
        audioFile: submissionData.audioFile,
      });

      const response = await httpClient.post<ApiSubmission>(
        API_ENDPOINTS.SUBMISSIONS.SUBMIT_WITH_UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.success) {
        console.log(
          '✅ Submission with upload created successfully:',
          response.data,
        );
      } else {
        console.error(
          '❌ Failed to create submission with upload:',
          response.error,
        );
      }

      return response;
    } catch (error: any) {
      console.error('Submit submission with upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit submission with upload',
      };
    }
  }

  /**
   * Get submission details by ID
   */
  async getSubmissionById(
    submissionId: string,
  ): Promise<ApiResponse<ApiSubmission>> {
    try {
      const response = await httpClient.get<ApiSubmission>(
        API_ENDPOINTS.SUBMISSIONS.DETAILS(submissionId),
      );

      if (response.success) {
        console.log('✅ Submission details fetched:', response.data);
      } else {
        console.error('❌ Failed to fetch submission details:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Get submission details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submission details',
      };
    }
  }

  /**
   * Update submission
   */
  async updateSubmission(
    submissionId: string,
    updateData: UpdateSubmissionRequest,
  ): Promise<ApiResponse<ApiSubmission>> {
    try {
      const response = await httpClient.put<ApiSubmission>(
        API_ENDPOINTS.SUBMISSIONS.UPDATE(submissionId),
        updateData,
      );

      if (response.success) {
        console.log('✅ Submission updated successfully:', response.data);
      } else {
        console.error('❌ Failed to update submission:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Update submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update submission',
      };
    }
  }

  /**
   * Update submission status only
   */
  async updateSubmissionStatus(
    submissionId: string,
    statusData: UpdateSubmissionStatusRequest,
  ): Promise<ApiResponse<ApiSubmission>> {
    try {
      const response = await httpClient.put<ApiSubmission>(
        API_ENDPOINTS.SUBMISSIONS.UPDATE_STATUS(submissionId),
        statusData,
      );

      if (response.success) {
        console.log(
          '✅ Submission status updated successfully:',
          response.data,
        );
      } else {
        console.error('❌ Failed to update submission status:', response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Update submission status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update submission status',
      };
    }
  }

  /**
   * Get submissions with filters (uses POST for complex filtering)
   */
  async getSubmissionsWithFilters(
    filters: SubmissionFilterRequest,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const requestBody = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'DESC',
        ...filters,
      };

      const response = await httpClient.post<any>(
        API_ENDPOINTS.SUBMISSIONS.FILTER,
        requestBody,
      );

      if (response.success && response.data?.data?.submissions) {
        // Transform the API response structure to match our expected format
        const apiData = response.data.data;
        const transformedData: PaginatedResponse<ApiSubmission> = {
          items: apiData.submissions.map((submission: any) => ({
            ...submission,
            id: submission.submissionId, // Map submissionId to id
          })),
          totalItems: apiData.pagination?.total || apiData.submissions.length,
          currentPage: apiData.pagination?.page || 1,
          totalPages: apiData.pagination?.totalPages || 1,
          hasNextPage: apiData.pagination?.hasNext || false,
          hasPrevPage: apiData.pagination?.hasPrevious || false,
        };

        console.log('✅ Submissions fetched successfully:', transformedData);
        return {
          success: true,
          data: transformedData,
        };
      } else {
        console.error(
          '❌ Failed to fetch submissions:',
          response.error || 'Invalid response structure',
        );
        return {
          success: false,
          error: response.error || 'Invalid response structure',
        };
      }
    } catch (error: any) {
      console.error('Get submissions with filters error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions',
      };
    }
  }

  /**
   * Get submissions by location
   */
  async getSubmissionsByLocation(
    districtId?: string,
    tehsilId?: string,
    villageId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const filters: SubmissionFilterRequest = {
        districtId,
        tehsilId,
        villageId,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      return this.getSubmissionsWithFilters(filters);
    } catch (error: any) {
      console.error('Get submissions by location error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions by location',
      };
    }
  }

  /**
   * Get submissions by user
   */
  async getSubmissionsByUser(
    userIds: string[],
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const filters: SubmissionFilterRequest = {
        userIds,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      return this.getSubmissionsWithFilters(filters);
    } catch (error: any) {
      console.error('Get submissions by user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions by user',
      };
    }
  }

  /**
   * Get submissions by status
   */
  async getSubmissionsByStatus(
    statuses: ('pending' | 'approved' | 'rejected')[],
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const filters: SubmissionFilterRequest = {
        statuses,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      return this.getSubmissionsWithFilters(filters);
    } catch (error: any) {
      console.error('Get submissions by status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions by status',
      };
    }
  }

  /**
   * Get pending submissions
   */
  async getPendingSubmissions(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    return this.getSubmissionsByStatus(['pending'], page, limit);
  }

  /**
   * Get approved submissions
   */
  async getApprovedSubmissions(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    return this.getSubmissionsByStatus(['approved'], page, limit);
  }

  /**
   * Get rejected submissions
   */
  async getRejectedSubmissions(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    return this.getSubmissionsByStatus(['rejected'], page, limit);
  }

  /**
   * Get submissions by date range
   */
  async getSubmissionsByDateRange(
    dateFrom: string,
    dateTo?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const filters: SubmissionFilterRequest = {
        dateFrom,
        dateTo,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      return this.getSubmissionsWithFilters(filters);
    } catch (error: any) {
      console.error('Get submissions by date range error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions by date range',
      };
    }
  }

  /**
   * Approve submission
   */
  async approveSubmission(
    submissionId: string,
  ): Promise<ApiResponse<ApiSubmission>> {
    return this.updateSubmissionStatus(submissionId, { status: 'approved' });
  }

  /**
   * Reject submission
   */
  async rejectSubmission(
    submissionId: string,
  ): Promise<ApiResponse<ApiSubmission>> {
    return this.updateSubmissionStatus(submissionId, { status: 'rejected' });
  }

  /**
   * Reset submission to pending
   */
  async resetSubmissionToPending(
    submissionId: string,
  ): Promise<ApiResponse<ApiSubmission>> {
    return this.updateSubmissionStatus(submissionId, { status: 'pending' });
  }

  /**
   * Get submissions for a specific word
   */
  async getSubmissionsForWord(
    wordId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<ApiSubmission>>> {
    try {
      const filters: SubmissionFilterRequest = {
        wordId,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      return this.getSubmissionsWithFilters(filters);
    } catch (error: any) {
      console.error('Get submissions for word error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch submissions for word',
      };
    }
  }
}

// Export singleton instance
export const submissionApiService = new SubmissionApiService();
