// Re-export all API types for convenience
export * from './api';

// Updated User and Authentication Types to match API response structure
export interface User {
  userId: string; // Primary identifier from API (previously id)
  username?: string; // Made optional as it might not always be present
  email: string;
  fName: string; // First name
  lName: string; // Last name
  role: 'WORKER' | 'ADMIN';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  // Legacy compatibility field
  id?: string; // For backward compatibility
  loginTime?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  error?: any;
}

// Updated Location Types to match API response structure
export interface District {
  id?: string; // Changed from number to string to match API
  districtId: string; // Changed from number to string to match API
  name: string;
  state?: string; // Made optional since it might not be in all API responses
  status?: 'active' | 'inactive'; // Added status field
  createdAt?: string;
  updatedAt?: string;
}

export interface Tehsil {
  id?: string; // Changed from number to string to match API
  tehsilId: string;
  name: string;
  districtId: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Village {
  id?: string; // Changed from number to string to match API
  villageId: string;
  name: string;
  tehsilId: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Updated Word Types to match API response structure
export interface MasterWord {
  wordId: string; // Primary identifier from API
  languageId: string;
  word: string; // The actual word text (in any language)
  categoryId: string | null; // Can be null as per API response
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Updated Submission Types to match API response structure
export interface Submission {
  submissionId: string; // Primary identifier from API (previously id)
  userId: string; // User who made the submission
  wordId: string; // Reference to the word
  synonyms: string; // The submitted synonym/regional word
  audioUrl: string | null; // URL to audio file (can be null)
  villageId: string;
  tehsilId: string;
  districtId: string;
  languageId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// App State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  submissions: Submission[];
  settings: AppSettings;
  offlineData: Submission[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSync: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  DataEntry: undefined;
  Submissions: undefined;
  Settings: undefined;
};

// Component Props Types
export interface LocationSelectorProps {
  selectedDistrict: District | null;
  selectedTehsil: Tehsil | null;
  selectedVillage: Village | null;
  onDistrictChange: (district: District) => void;
  onTehsilChange: (tehsil: Tehsil) => void;
  onVillageChange: (village: Village) => void;
}

export interface AudioRecorderProps {
  onRecordingComplete: (filePath: string) => void;
  isRecording: boolean;
  disabled?: boolean;
}

export interface SubmissionFormProps {
  onSubmit: (data: Partial<Submission>) => void;
  loading?: boolean;
}

// API Service Interface Types
export interface ApiServiceInterface {
  auth: any;
  users: any;
  locations: any;
  submissions: any;
  words: any;
  languages: any;
}

// Migration Helper Types
export interface LegacyToApiMapping {
  // Helper types for mapping between legacy and new API types
  user: {
    legacy: User;
    api: import('./api').ApiUser;
  };
  district: {
    legacy: District;
    api: import('./api').ApiDistrict;
  };
  submission: {
    legacy: Submission;
    api: import('./api').ApiSubmission;
  };
}
