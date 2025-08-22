import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  District,
  Tehsil,
  Village,
  MasterWord,
  Submission,
  MainTabParamList,
} from '../types';
import { ApiLanguage } from '../types/api';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import LocationSelector from '../components/LocationSelector';
import LanguageWordSelector from '../components/LanguageWordSelector';
import RegionalWordInput from '../components/RegionalWordInput';
import AudioRecorder, { AudioRecorderRef } from '../components/AudioRecorder';

const DataEntryScreen: React.FC = () => {
  const { state, actions } = useAppContext();
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  // Ref for AudioRecorder
  const audioRecorderRef = useRef<AudioRecorderRef>(null);

  // Form state
  const [selectedLanguage, setSelectedLanguage] = useState<ApiLanguage | null>(
    null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [selectedTehsil, setSelectedTehsil] = useState<Tehsil | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedWord, setSelectedWord] = useState<MasterWord | null>(null);
  const [regionalWord, setRegionalWord] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [_isRecording, _setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Reset word selection when language changes
  const handleLanguageChange = (language: ApiLanguage) => {
    setSelectedLanguage(language);
    setSelectedWord(null); // Reset word selection when language changes
  };

  // Handle offline sync
  const handleSyncOfflineData = async () => {
    if (state.offlineData.length === 0) {
      Alert.alert(
        'No Offline Data',
        'There are no offline submissions to sync.',
      );
      return;
    }

    if (!state.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
      );
      return;
    }

    setIsSyncing(true);
    try {
      const result = await actions.syncOfflineData();
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${result.syncedCount} submissions. ${
          result.errorCount > 0
            ? `${result.errorCount} submissions failed to sync.`
            : ''
        }`,
      );
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert(
        'Sync Failed',
        'Failed to sync offline data. Please try again.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle clearing offline data
  const handleClearOfflineData = () => {
    if (state.offlineData.length === 0) {
      Alert.alert(
        'No Offline Data',
        'There are no offline submissions to clear.',
      );
      return;
    }

    Alert.alert(
      'Clear Offline Data',
      `Are you sure you want to delete all ${state.offlineData.length} offline submissions? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            actions.clearOfflineData();
            Alert.alert(
              'Cleared',
              'All offline submissions have been cleared.',
            );
          },
        },
      ],
    );
  };

  // Styles using theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    userInfo: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    divider: {
      marginVertical: 8,
    },
    submitButton: {
      marginTop: 20,
      marginBottom: 16,
    },
    submitButtonContent: {
      height: 56,
    },
    offlineIndicator: {
      textAlign: 'center',
      color: '#f39c12',
      fontSize: 12,
      marginBottom: 8,
    },
    errorIndicator: {
      textAlign: 'center',
      color: theme.colors.error,
      fontSize: 12,
      marginBottom: 8,
    },
    statsContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    statsText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    offlineStatsText: {
      fontSize: 12,
      color: '#e67e22',
    },
    buttonSpacing: {
      marginTop: 8,
    },
  });

  // Validation
  const isFormValid = () => {
    return (
      selectedLanguage &&
      selectedDistrict &&
      selectedTehsil &&
      selectedVillage &&
      selectedWord &&
      regionalWord.trim().length >= 2 &&
      (audioFilePath || audioBlob)
    );
  };

  // Handle audio recording completion
  const handleAudioRecordingComplete = (filePath: string, blob?: Blob) => {
    setAudioFilePath(filePath);
    if (blob) {
      setAudioBlob(blob);
    }
  };

  // Reset form function
  const resetForm = () => {
    setSelectedLanguage(null);
    setSelectedDistrict(null);
    setSelectedTehsil(null);
    setSelectedVillage(null);
    setSelectedWord(null);
    setRegionalWord('');
    setAudioFilePath('');
    setAudioBlob(null);
    // Clear audio recording via ref
    audioRecorderRef.current?.clearRecording();
  };

  // Helper function to get the correct ID (API UUID if available, otherwise legacy ID)
  const getCorrectId = (item: any): string => {
    return (
      (item as any).wordId || (item as any).apiId || item.id?.toString() || ''
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert(
        'Incomplete Form',
        'Please fill all required fields and record audio before submitting.',
      );
      return;
    }

    if (!state.user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data with proper ID handling
      const submissionData = {
        wordId: getCorrectId(selectedWord!),
        synonyms: regionalWord.trim(),
        villageId: getCorrectId(selectedVillage!),
        tehsilId: getCorrectId(selectedTehsil!),
        districtId: getCorrectId(selectedDistrict!),
        languageId: selectedLanguage!.languageId, // Use languageId instead of id
      };

      console.log('📝 Submitting with data:', submissionData);

      let response;
      let shouldStoreOffline = false;
      let offlineReason = '';

      // Check network connectivity first
      if (!state.isConnected) {
        shouldStoreOffline = true;
        offlineReason = 'No internet connection';
      } else {
        // Try to submit to API
        try {
          if (audioBlob) {
            // Submit with audio file upload
            console.log('🎵 Submitting with audio file upload...');
            response = await apiService.submissions.submitSubmissionWithUpload({
              ...submissionData,
              audioFile: audioBlob,
            });
          } else if (audioFilePath) {
            // Submit with audio URL (if we have a hosted URL)

            response = await apiService.submissions.submitSubmissionWithUpload({
              ...submissionData,
              audioFile: audioFilePath,
            });
          } else {
            // Submit without audio
            console.log('📝 Submitting without audio...');
            response = await apiService.submissions.submitSubmission(
              submissionData,
            );
          }

          if (!response.success) {
            shouldStoreOffline = true;
            offlineReason = response.error || 'API error';
          }
        } catch (apiError) {
          console.error('API submission error:', apiError);
          shouldStoreOffline = true;
          offlineReason = 'API connection failed';
        }
      }

      if (shouldStoreOffline) {
        // Store offline when there's no connection or API error
        const offlineSubmission: Submission = {
          submissionId: Date.now().toString(),
          userId: state.user?.userId || '',
          wordId: getCorrectId(selectedWord!),
          synonyms: regionalWord,
          audioUrl: audioFilePath || null,
          villageId: getCorrectId(selectedVillage!),
          tehsilId: getCorrectId(selectedTehsil!),
          districtId: getCorrectId(selectedDistrict!),
          languageId: selectedLanguage!.languageId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        actions.addOfflineData(offlineSubmission);

        if (!state.isConnected) {
          Alert.alert(
            'Stored Offline',
            'No internet connection. Your submission has been saved locally and will be uploaded when connection is restored.',
            [
              {
                text: 'OK',
                onPress: () => {
                  resetForm();
                  navigation.navigate('Submissions');
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'API Error - Stored Offline',
            `Unable to reach server (${offlineReason}). Your submission has been saved locally and will be uploaded when connection is restored.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  resetForm();
                  navigation.navigate('Submissions');
                },
              },
            ],
          );
        }
      } else if (response && response.success) {
        Alert.alert(
          'Success!',
          'Your submission has been recorded successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                navigation.navigate('Submissions');
              },
            },
          ],
        );

        // Add to local submissions for tracking using API response data
        if (response.data) {
          const apiSubmission: Submission = {
            submissionId: response.data.id,
            userId: state.user?.userId || '',
            wordId: response.data.wordId,
            synonyms: response.data.synonyms,
            audioUrl: response.data.audioUrl || null,
            villageId: response.data.villageId,
            tehsilId: response.data.tehsilId,
            districtId: response.data.districtId,
            languageId: response.data.languageId,
            status: response.data.status,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
          };

          actions.addSubmission(apiSubmission);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);

      // Store offline when there's an unexpected error
      const offlineSubmission: Submission = {
        submissionId: Date.now().toString(),
        userId: state.user?.userId || '',
        wordId: getCorrectId(selectedWord!),
        synonyms: regionalWord,
        audioUrl: audioFilePath || null,
        villageId: getCorrectId(selectedVillage!),
        tehsilId: getCorrectId(selectedTehsil!),
        districtId: getCorrectId(selectedDistrict!),
        languageId: selectedLanguage!.languageId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions.addOfflineData(offlineSubmission);

      Alert.alert(
        'Saved Offline',
        'An unexpected error occurred. Your submission has been saved locally and will be uploaded when connection is restored.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.navigate('Submissions');
            },
          },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    let completed = 0;
    const total = 5; // Total required fields (language and word count as one combined step)

    if (selectedLanguage && selectedWord) completed++; // Combined language + word selection
    if (selectedDistrict) completed++;
    if (selectedTehsil) completed++;
    if (selectedVillage) completed++;
    if (regionalWord.trim().length >= 2 && (audioFilePath || audioBlob))
      completed++;

    return { completed, total };
  };

  const progress = getProgress();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Data Collection</Text>
          <Text style={styles.subtitle}>
            Step {progress.completed} of {progress.total} completed
          </Text>
          {state.user && (
            <Text style={styles.userInfo}>
              Welcome, {state.user.fName} {state.user.lName} • {state.user.role}
            </Text>
          )}
        </View>
        {/* Location Selection */}
        <LocationSelector
          selectedDistrict={selectedDistrict}
          selectedTehsil={selectedTehsil}
          selectedVillage={selectedVillage}
          onDistrictChange={setSelectedDistrict}
          onTehsilChange={setSelectedTehsil}
          onVillageChange={setSelectedVillage}
          useApi={state.apiInitialized}
        />

        <Divider style={styles.divider} />
        {/* Language & Word Selection */}
        <LanguageWordSelector
          selectedLanguage={selectedLanguage}
          selectedWord={selectedWord}
          onLanguageSelect={handleLanguageChange}
          onWordSelect={setSelectedWord}
          disabled={false}
          useApi={state.apiInitialized}
        />

        <Divider style={styles.divider} />

        {/* Regional Word Input */}
        <RegionalWordInput
          value={regionalWord}
          onChangeText={setRegionalWord}
          disabled={false}
        />

        <Divider style={styles.divider} />

        {/* Audio Recording */}
        <AudioRecorder
          onRecordingComplete={handleAudioRecordingComplete}
          isRecording={_isRecording}
          disabled={false}
          ref={audioRecorderRef}
        />

        <Divider style={styles.divider} />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormValid() || isSubmitting || _isRecording}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          icon="cloud-upload"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Data'}
        </Button>

        {/* API Status */}
        {!state.isConnected && (
          <Text style={styles.offlineIndicator}>
            🔴 No Internet Connection - Working in offline mode
          </Text>
        )}

        {state.isConnected && !state.apiInitialized && (
          <Text style={styles.offlineIndicator}>
            📡 Connected but API unavailable - Data will sync when server is
            accessible
          </Text>
        )}

        {state.isConnected && state.apiInitialized && state.apiError && (
          <Text style={styles.errorIndicator}>
            ⚠️ API Warning: {state.apiError}
          </Text>
        )}

        {state.isConnected && state.apiInitialized && !state.apiError && (
          <Text
            style={[
              styles.statsText,
              { color: '#4caf50', textAlign: 'center', fontSize: 12 },
            ]}
          >
            ✅ Connected to server
          </Text>
        )}

        {/* Submission Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Total Submissions: {state.submissions.length}
          </Text>
          {state.offlineData.length > 0 && (
            <Text style={styles.offlineStatsText}>
              Offline Queue: {state.offlineData.length}
            </Text>
          )}
        </View>

        {/* Sync Offline Data Button */}
        {state.offlineData.length > 0 && (
          <Button
            mode="outlined"
            onPress={handleSyncOfflineData}
            loading={isSyncing}
            disabled={
              isSyncing || state.offlineData.length === 0 || !state.isConnected
            }
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            icon="cloud-sync"
          >
            {isSyncing
              ? 'Syncing...'
              : !state.isConnected
              ? 'No Internet - Cannot Sync'
              : 'Sync Offline Data'}
          </Button>
        )}

        {/* Clear Offline Data Button */}
        {state.offlineData.length > 0 && (
          <Button
            mode="outlined"
            onPress={handleClearOfflineData}
            style={[styles.submitButton, styles.buttonSpacing]}
            contentStyle={styles.submitButtonContent}
            icon="delete"
          >
            Clear Offline Data
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default DataEntryScreen;
