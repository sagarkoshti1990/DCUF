// API Configuration based on Postman collection
export const API_CONFIG = {
  BASE_URL: 'https://rlapi.tekdinext.com/',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// API Endpoints from Postman collection
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER_PUBLIC: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },

  // User management endpoints
  USERS: {
    BASE: '/api/users',
    REGISTER_AUTH: '/api/users',
    LIST: '/api/users',
    DETAILS: (userId: string) => `/api/users/${userId}`,
    UPDATE: (userId: string) => `/api/users/${userId}`,
  },

  // Submission endpoints
  SUBMISSIONS: {
    BASE: '/api/submissions',
    SUBMIT: '/api/submissions',
    SUBMIT_WITH_UPLOAD: '/api/submissions/upload',
    DETAILS: (submissionId: string) => `/api/submissions/${submissionId}`,
    UPDATE: (submissionId: string) => `/api/submissions/${submissionId}`,
    UPDATE_STATUS: (submissionId: string) =>
      `/api/submissions/${submissionId}/status`,
    FILTER: '/api/submissions/filter',
  },

  // Location endpoints
  LOCATIONS: {
    DISTRICTS: '/api/districts/filter',
    TEHSILS: '/api/tehsils/filter',
    VILLAGES: '/api/villages/filter',
  },

  // Words and Languages endpoints
  WORDS: {
    FILTER: '/api/words/filter',
  },

  LANGUAGES: {
    FILTER: '/api/languages/filter',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

// Response Status Codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
