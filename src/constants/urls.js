/**
 * API URLs and app-wide constants
 */

// Base API URL - update this with your actual API endpoint
export const BASE_URL = 'https://api.dcuf.com';

// API Endpoints
export const API_ENDPOINTS = {
  // User management
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGOUT: `${BASE_URL}/auth/logout`,

  // Data submission
  SUBMIT_FORM: `${BASE_URL}/forms/submit`,
  GET_FORMS: `${BASE_URL}/forms`,

  // User feedback
  SUBMIT_FEEDBACK: `${BASE_URL}/feedback`,
  GET_FEEDBACK: `${BASE_URL}/feedback`,

  // File uploads
  UPLOAD_FILE: `${BASE_URL}/upload`,
  UPLOAD_IMAGE: `${BASE_URL}/upload/image`,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'DCUF',
  VERSION: '1.0.0',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#6200ea',
  PRIMARY_DARK: '#3700b3',
  SECONDARY: '#03dac6',
  BACKGROUND: '#f5f5f5',
  SURFACE: '#ffffff',
  ERROR: '#b00020',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
};

// Form Constants
export const FORM_CATEGORIES = [
  { label: 'Feedback', value: 'feedback' },
  { label: 'Support', value: 'support' },
  { label: 'Suggestion', value: 'suggestion' },
  { label: 'Bug Report', value: 'bug_report' },
  { label: 'Feature Request', value: 'feature_request' },
];

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@dcuf_user_token',
  USER_DATA: '@dcuf_user_data',
  SETTINGS: '@dcuf_settings',
  OFFLINE_DATA: '@dcuf_offline_data',
};
