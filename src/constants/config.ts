// App Configuration
export const APP_CONFIG = {
  NAME: 'RISE - Data Collection',
  VERSION: '1.0.0',
  MAX_SUBMISSIONS_PER_WORD: 5,
  API_TIMEOUT: 10000,
  AUDIO_RECORDING_MAX_DURATION: 30000, // 30 seconds
  OFFLINE_SYNC_INTERVAL: 300000, // 5 minutes
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.rise.example.com',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
  },
  DATA: {
    LOCATIONS: '/data/locations',
    WORDS: '/data/words',
    SUBMISSIONS: '/data/submissions',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: '@rise_user_data',
  AUTH_TOKEN: '@rise_auth_token',
  REFRESH_TOKEN: '@rise_refresh_token',
  SETTINGS: '@rise_settings',
  OFFLINE_DATA: '@rise_offline_data',
  SUBMISSIONS: '@rise_submissions',
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  CHANNELS: 1,
  BITS_PER_SAMPLE: 16,
  FILE_FORMAT: 'm4a',
} as const;

// UI Configuration
export const UI_CONFIG = {
  BUTTON_MIN_HEIGHT: 44,
  LARGE_BUTTON_HEIGHT: 64,
  CARD_BORDER_RADIUS: 8,
  DEFAULT_PADDING: 16,
} as const;
