import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '../constants/config';
import { User, Submission, AppSettings } from '../types';
import { apiService } from '../services/apiService';
import { ApiUser } from '../types/api';

// State interface
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  submissions: Submission[];
  settings: AppSettings;
  offlineData: Submission[];
  // New API-related state
  apiInitialized: boolean;
  apiError: string | null;
  // Network connectivity state
  isConnected: boolean;
  connectionType: string | null;
}

// Helper function to convert API user to legacy format
// We memoize this to prevent creating new objects on each render
const convertApiUserToLegacy = (
  apiUser: ApiUser,
  existingLoginTime?: string,
): User & { apiId?: string } => {
  const legacyUser: User & { apiId?: string } = {
    userId: apiUser.id, // Use API id as userId
    email: apiUser.email,
    fName: apiUser.fName,
    lName: apiUser.lName,
    role: apiUser.role, // Already matches 'WORKER' | 'ADMIN'
    status: apiUser.status, // Already matches 'active' | 'inactive'
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    // Legacy compatibility fields
    id: apiUser.id, // For backward compatibility
    loginTime: existingLoginTime || new Date().toISOString(), // Preserve existing loginTime to prevent re-renders
    apiId: apiUser.id, // Preserve original API ID for submissions
  };

  console.log('👤 Converting API user to legacy:', {
    apiUser: {
      id: apiUser.id,
      email: apiUser.email,
      fName: apiUser.fName,
      lName: apiUser.lName,
    },
    legacyUser: {
      userId: legacyUser.userId,
      email: legacyUser.email,
      fName: legacyUser.fName,
      lName: legacyUser.lName,
      apiId: legacyUser.apiId,
    },
  });

  return legacyUser;
};

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  submissions: [],
  settings: {
    theme: 'light',
    notifications: true,
    autoSync: true,
  },
  offlineData: [],
  apiInitialized: false,
  apiError: null,
  // Network connectivity state
  isConnected: true,
  connectionType: null,
};

// Action types
export const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_SUBMISSION: 'ADD_SUBMISSION',
  SET_SUBMISSIONS: 'SET_SUBMISSIONS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  ADD_OFFLINE_DATA: 'ADD_OFFLINE_DATA',
  CLEAR_OFFLINE_DATA: 'CLEAR_OFFLINE_DATA',
  REMOVE_OFFLINE_DATA: 'REMOVE_OFFLINE_DATA',
  SET_API_INITIALIZED: 'SET_API_INITIALIZED',
  SET_API_ERROR: 'SET_API_ERROR',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
} as const;

// Action interfaces
type AppAction =
  | { type: typeof ACTION_TYPES.SET_LOADING; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_USER; payload: User | null }
  | { type: typeof ACTION_TYPES.LOGOUT }
  | { type: typeof ACTION_TYPES.ADD_SUBMISSION; payload: Submission }
  | { type: typeof ACTION_TYPES.SET_SUBMISSIONS; payload: Submission[] }
  | { type: typeof ACTION_TYPES.UPDATE_SETTINGS; payload: Partial<AppSettings> }
  | { type: typeof ACTION_TYPES.ADD_OFFLINE_DATA; payload: Submission }
  | { type: typeof ACTION_TYPES.CLEAR_OFFLINE_DATA }
  | { type: typeof ACTION_TYPES.REMOVE_OFFLINE_DATA; payload: string }
  | { type: typeof ACTION_TYPES.SET_API_INITIALIZED; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_API_ERROR; payload: string | null }
  | {
      type: typeof ACTION_TYPES.SET_NETWORK_STATUS;
      payload: { isConnected: boolean; connectionType: string | null };
    };

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        submissions: [],
      };

    case ACTION_TYPES.ADD_SUBMISSION:
      return {
        ...state,
        submissions: [...state.submissions, action.payload],
      };

    case ACTION_TYPES.SET_SUBMISSIONS:
      return {
        ...state,
        submissions: action.payload,
      };

    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case ACTION_TYPES.ADD_OFFLINE_DATA:
      return {
        ...state,
        offlineData: [...state.offlineData, action.payload],
      };

    case ACTION_TYPES.CLEAR_OFFLINE_DATA:
      return {
        ...state,
        offlineData: [],
      };

    case ACTION_TYPES.REMOVE_OFFLINE_DATA:
      return {
        ...state,
        offlineData: state.offlineData.filter(
          item => item.submissionId !== action.payload,
        ),
      };

    case ACTION_TYPES.SET_API_INITIALIZED:
      return {
        ...state,
        apiInitialized: action.payload,
      };

    case ACTION_TYPES.SET_API_ERROR:
      return {
        ...state,
        apiError: action.payload,
      };

    case ACTION_TYPES.SET_NETWORK_STATUS:
      return {
        ...state,
        isConnected: action.payload.isConnected,
        connectionType: action.payload.connectionType,
      };

    default:
      return state;
  }
};

// Context actions interface
interface AppActions {
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  addSubmission: (submission: Submission) => void;
  setSubmissions: (submissions: Submission[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addOfflineData: (data: Submission) => void;
  clearOfflineData: () => void;
  removeOfflineData: (id: string) => void;
  syncOfflineData: () => Promise<{
    success: boolean;
    syncedCount: number;
    errorCount: number;
  }>;
  setApiInitialized: (initialized: boolean) => void;
  setApiError: (error: string | null) => void;
  // New API-integrated actions
  loginWithAPI: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<boolean>;
  loadInitialData: () => Promise<void>;
  setNetworkStatus: (status: {
    isConnected: boolean;
    connectionType: string | null;
  }) => void;
}

// Context interface
interface AppContextType {
  state: AppState;
  actions: AppActions;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider props interface
interface AppProviderProps {
  children: ReactNode;
}

// Context provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoize serializable versions of state to prevent unnecessary re-renders
  const userDataString = useMemo(
    () => (state.user ? JSON.stringify(state.user) : null),
    [state.user],
  );

  const settingsString = useMemo(
    () => JSON.stringify(state.settings),
    [state.settings],
  );

  const offlineDataString = useMemo(
    () =>
      state.offlineData.length > 0 ? JSON.stringify(state.offlineData) : null,
    [state.offlineData],
  );

  const saveDataToStorage = useCallback(async () => {
    try {
      if (userDataString) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userDataString);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, settingsString);

      if (offlineDataString) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.OFFLINE_DATA,
          offlineDataString,
        );
      }
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }, [userDataString, settingsString, offlineDataString]);

  const loadStoredData = async () => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      // Check if user is already authenticated via API
      const isAuthenticated = await apiService.auth.isAuthenticated();

      if (isAuthenticated) {
        const currentUserResponse = await apiService.auth.getCurrentUser();
        if (currentUserResponse.success && currentUserResponse.data) {
          // Check if we have existing user data to preserve loginTime
          const existingUserData = await AsyncStorage.getItem(
            STORAGE_KEYS.USER_DATA,
          );
          let existingLoginTime: string | undefined;

          if (existingUserData) {
            try {
              const existingUser = JSON.parse(existingUserData) as User;
              existingLoginTime = existingUser.loginTime;
            } catch (e) {
              // Ignore parse error
            }
          }

          const legacyUser = convertApiUserToLegacy(
            currentUserResponse.data.user,
            existingLoginTime,
          );
          dispatch({
            type: ACTION_TYPES.SET_USER,
            payload: legacyUser,
          });
        }
      }

      // Load other stored data
      const [settings, offlineData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA),
      ]);

      if (settings) {
        dispatch({
          type: ACTION_TYPES.UPDATE_SETTINGS,
          payload: JSON.parse(settings) as Partial<AppSettings>,
        });
      }

      if (offlineData) {
        const parsedOfflineData = JSON.parse(offlineData) as Submission[];
        parsedOfflineData.forEach(data => {
          dispatch({
            type: ACTION_TYPES.ADD_OFFLINE_DATA,
            payload: data,
          });
        });
      }

      dispatch({ type: ACTION_TYPES.SET_API_INITIALIZED, payload: true });
    } catch (error) {
      console.error('Error loading stored data:', error);
      dispatch({
        type: ACTION_TYPES.SET_API_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to load data',
      });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Load data from storage on app start
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data to storage when state changes
  useEffect(() => {
    if (state.apiInitialized) {
      saveDataToStorage();
    }
  }, [saveDataToStorage, state.apiInitialized]);

  // Network connectivity monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({
        type: ACTION_TYPES.SET_NETWORK_STATUS,
        payload: {
          isConnected: state.isConnected ?? false,
          connectionType: state.type,
        },
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Action creators
  const actions: AppActions = {
    setLoading: (loading: boolean) =>
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),

    setUser: (user: User | null) =>
      dispatch({ type: ACTION_TYPES.SET_USER, payload: user }),

    logout: async () => {
      try {
        // Logout via API
        await apiService.auth.logout();

        // Clear local storage
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
        ]);

        dispatch({ type: ACTION_TYPES.LOGOUT });
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear local state even if API call fails
        dispatch({ type: ACTION_TYPES.LOGOUT });
      }
    },

    addSubmission: (submission: Submission) =>
      dispatch({ type: ACTION_TYPES.ADD_SUBMISSION, payload: submission }),

    setSubmissions: (submissions: Submission[]) =>
      dispatch({ type: ACTION_TYPES.SET_SUBMISSIONS, payload: submissions }),

    updateSettings: (settings: Partial<AppSettings>) =>
      dispatch({ type: ACTION_TYPES.UPDATE_SETTINGS, payload: settings }),

    addOfflineData: (data: Submission) =>
      dispatch({ type: ACTION_TYPES.ADD_OFFLINE_DATA, payload: data }),

    clearOfflineData: () => dispatch({ type: ACTION_TYPES.CLEAR_OFFLINE_DATA }),

    removeOfflineData: (id: string) =>
      dispatch({ type: ACTION_TYPES.REMOVE_OFFLINE_DATA, payload: id }),

    syncOfflineData: async () => {
      const offlineSubmissions = [...state.offlineData];
      let syncedCount = 0;
      let errorCount = 0;

      for (const submission of offlineSubmissions) {
        try {
          let response;

          if (submission.audioUrl) {
            // Check if audioUrl is a local file path/blob that needs upload
            const isLocalFile =
              submission.audioUrl.startsWith('file://') ||
              submission.audioUrl.startsWith('blob:') ||
              submission.audioUrl.includes('react-native');

            if (isLocalFile) {
              // Convert local audio to proper format for upload
              console.log(
                '🎵 Syncing submission with audio upload:',
                submission.submissionId,
              );

              // For React Native, we need to convert the local file
              const audioFile = {
                uri: submission.audioUrl,
                type: 'audio/m4a', // Default audio type
                name: `submission_${submission.submissionId}.m4a`,
              };

              const uploadData = {
                wordId: submission.wordId,
                synonyms: submission.synonyms,
                villageId: submission.villageId,
                tehsilId: submission.tehsilId,
                districtId: submission.districtId,
                languageId: submission.languageId,
                audioFile: audioFile,
              };

              response =
                await apiService.submissions.submitSubmissionWithUpload(
                  uploadData,
                );
            } else {
              // Use regular submission with audioUrl (already hosted)
              console.log(
                '📝 Syncing submission with hosted audio URL:',
                submission.submissionId,
              );
              const apiSubmissionData = {
                wordId: submission.wordId,
                synonyms: submission.synonyms,
                villageId: submission.villageId,
                tehsilId: submission.tehsilId,
                districtId: submission.districtId,
                languageId: submission.languageId,
                audioUrl: submission.audioUrl,
              };

              response = await apiService.submissions.submitSubmission(
                apiSubmissionData,
              );
            }
          } else {
            // No audio - use regular submission
            console.log(
              '📝 Syncing submission without audio:',
              submission.submissionId,
            );
            const apiSubmissionData = {
              wordId: submission.wordId,
              synonyms: submission.synonyms,
              villageId: submission.villageId,
              tehsilId: submission.tehsilId,
              districtId: submission.districtId,
              languageId: submission.languageId,
            };

            response = await apiService.submissions.submitSubmission(
              apiSubmissionData,
            );
          }

          if (response.success) {
            dispatch({
              type: ACTION_TYPES.REMOVE_OFFLINE_DATA,
              payload: submission.submissionId,
            });
            syncedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(
            'Error syncing submission:',
            submission.submissionId,
            error,
          );
          errorCount++;
        }
      }
      return { success: true, syncedCount, errorCount };
    },

    setApiInitialized: (initialized: boolean) =>
      dispatch({
        type: ACTION_TYPES.SET_API_INITIALIZED,
        payload: initialized,
      }),

    setApiError: (error: string | null) =>
      dispatch({ type: ACTION_TYPES.SET_API_ERROR, payload: error }),

    // New API-integrated actions
    loginWithAPI: async (email: string, password: string) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        dispatch({ type: ACTION_TYPES.SET_API_ERROR, payload: null });

        console.log('🔐 Attempting API login with:', { email });
        const response = await apiService.auth.login({ email, password });

        if (response.success && response.data) {
          const legacyUser = convertApiUserToLegacy(response.data.data.user);
          console.log('✅ API login successful, setting user:', legacyUser);
          dispatch({ type: ACTION_TYPES.SET_USER, payload: legacyUser });
          dispatch({ type: ACTION_TYPES.SET_API_INITIALIZED, payload: true });
          return { success: true };
        } else {
          // Safe error handling - ensure error is always a string
          const errorMessage = response.error || 'Login failed';
          console.error('❌ API login failed:', errorMessage);
          dispatch({
            type: ACTION_TYPES.SET_API_ERROR,
            payload: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error('💥 Login error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';
        dispatch({ type: ACTION_TYPES.SET_API_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    checkAuthStatus: async () => {
      try {
        return await apiService.auth.isAuthenticated();
      } catch (error) {
        console.error('Auth status check error:', error);
        return false;
      }
    },

    loadInitialData: async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

        const bulkOps = await apiService.bulkOperations();
        const initialData = await bulkOps.loadInitialData();

        if (initialData.errors.length > 0) {
          console.warn('Initial data loading warnings:', initialData.errors);
        }

        console.log('✅ Initial data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
        dispatch({
          type: ACTION_TYPES.SET_API_ERROR,
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to load initial data',
        });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    setNetworkStatus: (status: {
      isConnected: boolean;
      connectionType: string | null;
    }) => dispatch({ type: ACTION_TYPES.SET_NETWORK_STATUS, payload: status }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
