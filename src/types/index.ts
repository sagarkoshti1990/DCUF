// User and Authentication Types
export interface User {
  id: number;
  workerID: string;
  name: string;
  assignedVillage: Village | null;
  role: 'data_collector' | 'admin';
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

// Location Types
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

// Word and Submission Types
export interface MasterWord {
  id: number;
  english: string;
  marathi?: string;
  hindi?: string;
  category: string;
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
  DataEntry: undefined;
  Progress: undefined;
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
