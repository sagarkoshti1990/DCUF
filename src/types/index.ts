// Re-export all API types for convenience
export * from './api';

// Legacy User and Authentication Types (maintained for backward compatibility)
export interface User {
  id: string;
  username: string;
  email: string;
  fName: string;
  lName: string;
  role: 'WORKER' | 'ADMIN';
  status: 'active' | 'inactive';
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

// Legacy Location Types (maintained for backward compatibility)
export interface District {
  id: number;
  name: string;
  state: string;
}

export interface Tehsil {
  id: number;
  name: string;
  districtId: number;
}

export interface Village {
  id: number;
  name: string;
  tehsilId: number;
}

// Legacy Word and Submission Types (maintained for backward compatibility)
export interface MasterWord {
  id: number;
  english: string;
  marathi?: string;
  hindi?: string;
  category: string;
  apiId?: string; // API UUID for new API integration
}

export interface Submission {
  id: string;
  masterWordId: number;
  regionalWord: string;
  audioFilePath: string;
  locationId: number;
  workerId: number;
  timestamp: string;
  synced: boolean;
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
