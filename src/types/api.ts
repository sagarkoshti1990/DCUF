// API Request and Response Types

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: 'WORKER' | 'ADMIN';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

// User Types (API Structure)
export interface ApiUser {
  id: string;
  fName: string;
  lName: string;
  email: string;
  role: 'WORKER' | 'ADMIN';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserListFilters {
  page?: number;
  limit?: number;
  role?: 'WORKER' | 'ADMIN';
  status?: 'active' | 'inactive';
  search?: string;
}

export interface UpdateUserRequest {
  fName?: string;
  lName?: string;
  email?: string;
  role?: 'WORKER' | 'ADMIN';
  status?: 'active' | 'inactive';
  updatedBy?: string;
}

// Location Types (API Structure)
export interface ApiDistrict {
  id: string;
  name: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTehsil {
  id: string;
  name: string;
  districtId: string;
  district?: ApiDistrict;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVillage {
  id: string;
  name: string;
  tehsilId: string;
  tehsil?: ApiTehsil;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFilterRequest {
  name?: string;
  districtId?: string;
  tehsilId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Word and Language Types
export interface ApiLanguage {
  languageId: string; // Changed from 'id' to 'languageId' to match API response
  name: string;
  code?: string; // Made optional since it's not in the API response
  createdBy: string;
  updatedBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Updated to match the new API response structure
export interface ApiWord {
  wordId: string; // Changed from 'id' to 'wordId'
  languageId: string;
  word: string; // This is the actual word text (could be in any language)
  categoryId?: string | null; // Changed from 'category' to 'categoryId' and made nullable
  status: 'active' | 'inactive'; // Added status field
  // Legacy fields for backward compatibility (will be populated by conversion function)
  id?: string;
  english?: string;
  marathi?: string;
  hindi?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WordFilterRequest {
  languageIds?: string[];
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Submission Types (API Structure)
export interface ApiSubmission {
  id: string;
  wordId: string;
  word?: ApiWord;
  synonyms: string;
  audioUrl?: string;
  villageId: string;
  village?: ApiVillage;
  tehsilId: string;
  tehsil?: ApiTehsil;
  districtId: string;
  district?: ApiDistrict;
  languageId: string;
  language?: ApiLanguage;
  userId: string;
  user?: ApiUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SubmissionRequest {
  wordId: string;
  synonyms: string;
  audioUrl?: string;
  villageId: string;
  tehsilId: string;
  districtId: string;
  languageId: string;
}

export interface SubmissionWithUploadRequest {
  wordId: string;
  synonyms?: string;
  villageId: string;
  tehsilId: string;
  districtId: string;
  languageId?: string;
  audioFile: File | Blob | { uri: string; type: string; name: string }; // Support React Native format
}

export interface UpdateSubmissionRequest {
  synonyms?: string;
  audioUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  villageId?: string;
  tehsilId?: string;
  districtId?: string;
  languageId?: string;
}

export interface UpdateSubmissionStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export interface SubmissionFilterRequest {
  districtId?: string;
  tehsilId?: string;
  villageId?: string;
  languageId?: string;
  userIds?: string[];
  statuses?: ('pending' | 'approved' | 'rejected')[];
  wordId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Request Configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
