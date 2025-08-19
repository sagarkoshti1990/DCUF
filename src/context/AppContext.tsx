import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { User, Submission, AppSettings } from '../types';

// State interface
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  submissions: Submission[];
  settings: AppSettings;
  offlineData: Submission[];
}

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
  | { type: typeof ACTION_TYPES.CLEAR_OFFLINE_DATA };

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

    default:
      return state;
  }
};

// Context actions interface
interface AppActions {
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  addSubmission: (submission: Submission) => void;
  setSubmissions: (submissions: Submission[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addOfflineData: (data: Submission) => void;
  clearOfflineData: () => void;
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

  const saveDataToStorage = useCallback(async () => {
    try {
      if (state.user) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(state.user),
        );
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(state.settings),
      );

      if (state.offlineData.length > 0) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.OFFLINE_DATA,
          JSON.stringify(state.offlineData),
        );
      }
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }, [state.user, state.settings, state.offlineData]);

  const loadStoredData = async () => {
    try {
      const [userData, settings, offlineData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA),
      ]);

      if (userData) {
        dispatch({
          type: ACTION_TYPES.SET_USER,
          payload: JSON.parse(userData) as User,
        });
      }

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
    } catch (error) {
      console.error('Error loading stored data:', error);
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
    saveDataToStorage();
  }, [saveDataToStorage]);

  // Action creators
  const actions: AppActions = {
    setLoading: (loading: boolean) =>
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),

    setUser: (user: User | null) =>
      dispatch({ type: ACTION_TYPES.SET_USER, payload: user }),

    logout: () => {
      AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
      dispatch({ type: ACTION_TYPES.LOGOUT });
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
