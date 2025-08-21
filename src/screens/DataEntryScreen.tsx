import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Divider, useTheme } from 'react-native-paper';
import { District, Tehsil, Village, MasterWord, Submission } from '../types';
import { ApiLanguage } from '../types/api';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import LocationSelector from '../components/LocationSelector';
import LanguageWordSelector from '../components/LanguageWordSelector';
import RegionalWordInput from '../components/RegionalWordInput';
import AudioRecorder from '../components/AudioRecorder';

const DataEntryScreen: React.FC = () => {
  const { state, actions } = useAppContext();
  const theme = useTheme();

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

  // Reset word selection when language changes
  const handleLanguageChange = (language: ApiLanguage) => {
    setSelectedLanguage(language);
    setSelectedWord(null); // Reset word selection when language changes
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
      // Helper function to get the correct ID (API UUID if available, otherwise legacy ID)
      const getCorrectId = (item: any): string => {
        return (item as any).apiId || item.id.toString();
      };

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

      if (audioBlob) {
        // Submit with audio file upload
        console.log('🎵 Submitting with audio file upload...');
        response = await apiService.submissions.submitSubmissionWithUpload({
          ...submissionData,
          audioFile: audioBlob,
        });
      } else if (audioFilePath) {
        // Submit with audio URL (if we have a hosted URL)
        console.log('🎵 Submitting with audio URL...');
        response = await apiService.submissions.submitSubmission({
          ...submissionData,
          audioUrl: audioFilePath,
        });
      } else {
        // Submit without audio
        console.log('📝 Submitting without audio...');
        response = await apiService.submissions.submitSubmission(
          submissionData,
        );
      }

      if (response.success) {
        Alert.alert(
          'Success!',
          'Your submission has been recorded successfully.',
          [
            {
              text: 'OK',
              onPress: resetForm,
            },
          ],
        );

        // Add to local submissions for tracking
        const legacySubmission: Submission = {
          id: response.data?.id || Date.now().toString(),
          masterWordId: selectedWord!.id,
          regionalWord: regionalWord,
          audioFilePath: audioFilePath,
          locationId:
            typeof selectedVillage!.id === 'string'
              ? parseInt(selectedVillage!.id)
              : selectedVillage!.id,
          workerId:
            typeof state.user.id === 'string'
              ? parseInt(state.user.id)
              : parseInt(state.user.id),
          timestamp: new Date().toISOString(),
          synced: true, // Since we successfully submitted to API
        };

        actions.addSubmission(legacySubmission);
      } else {
        // API submission failed, store offline
        console.warn('API submission failed, storing offline:', response.error);

        const offlineSubmission: Submission = {
          id: Date.now().toString(),
          masterWordId: selectedWord!.id,
          regionalWord: regionalWord,
          audioFilePath: audioFilePath,
          locationId:
            typeof selectedVillage!.id === 'string'
              ? parseInt(selectedVillage!.id)
              : selectedVillage!.id,
          workerId:
            typeof state.user.id === 'string'
              ? parseInt(state.user.id)
              : parseInt(state.user.id),
          timestamp: new Date().toISOString(),
          synced: false,
        };

        actions.addOfflineData(offlineSubmission);

        Alert.alert(
          'Stored Offline',
          'Your submission has been saved locally and will be uploaded when connection is restored.',
          [
            {
              text: 'OK',
              onPress: resetForm,
            },
          ],
        );
      }
    } catch (error) {
      console.error('Submission error:', error);

      // Store offline when there's an error
      const offlineSubmission: Submission = {
        id: Date.now().toString(),
        masterWordId: selectedWord!.id,
        regionalWord: regionalWord,
        audioFilePath: audioFilePath,
        locationId:
          typeof selectedVillage!.id === 'string'
            ? parseInt(selectedVillage!.id)
            : selectedVillage!.id,
        workerId:
          typeof state.user.id === 'string'
            ? parseInt(state.user.id)
            : parseInt(state.user.id),
        timestamp: new Date().toISOString(),
        synced: false,
      };

      actions.addOfflineData(offlineSubmission);

      Alert.alert(
        'Saved Offline',
        'Unable to connect to server. Your submission has been saved locally and will be uploaded when connection is restored.',
        [
          {
            text: 'OK',
            onPress: resetForm,
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
        {!state.apiInitialized && (
          <Text style={styles.offlineIndicator}>
            📡 Working in offline mode - Data will sync when connection is
            restored
          </Text>
        )}

        {state.apiError && (
          <Text style={styles.errorIndicator}>
            ⚠️ API Error: {state.apiError}
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
      </View>
    </ScrollView>
  );
};

export default DataEntryScreen;
