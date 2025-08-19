import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { District, Tehsil, Village, MasterWord, Submission } from '../types';
import { useAppContext } from '../context/AppContext';
import LocationSelector from '../components/LocationSelector';
import MasterWordDropdown from '../components/MasterWordDropdown';
import RegionalWordInput from '../components/RegionalWordInput';
import AudioRecorder from '../components/AudioRecorder';

const DataEntryScreen: React.FC = () => {
  const { state, actions } = useAppContext();

  // Form state
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [selectedTehsil, setSelectedTehsil] = useState<Tehsil | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedWord, setSelectedWord] = useState<MasterWord | null>(null);
  const [regionalWord, setRegionalWord] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isFormValid = () => {
    return (
      selectedDistrict &&
      selectedTehsil &&
      selectedVillage &&
      selectedWord &&
      regionalWord.trim().length >= 2 &&
      audioFilePath
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
      // Create submission object
      const submission: Omit<Submission, 'id'> = {
        masterWordId: selectedWord!.id,
        regionalWord: regionalWord.trim(),
        audioFilePath,
        locationId: selectedVillage!.id,
        workerId: state.user.id,
        timestamp: new Date().toISOString(),
        synced: false, // Will be synced later
      };

      // Add to context (this would normally call an API)
      actions.addSubmission({
        ...submission,
        id: `submission_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      } as Submission);

      Alert.alert(
        'Success!',
        `Your submission for "${selectedWord!.english}" has been saved.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Reset form for next entry
              setSelectedWord(null);
              setRegionalWord('');
              setAudioFilePath('');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Submission failed:', error);
      Alert.alert('Error', 'Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all entered data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSelectedDistrict(null);
            setSelectedTehsil(null);
            setSelectedVillage(null);
            setSelectedWord(null);
            setRegionalWord('');
            setAudioFilePath('');
            setIsRecording(false);
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Data Collection
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Record regional language translations
        </Text>
      </View>

      {/* Step 1: Location Selection */}
      <LocationSelector
        selectedDistrict={selectedDistrict}
        selectedTehsil={selectedTehsil}
        selectedVillage={selectedVillage}
        onDistrictChange={setSelectedDistrict}
        onTehsilChange={setSelectedTehsil}
        onVillageChange={setSelectedVillage}
      />

      <Divider style={styles.divider} />

      {/* Step 2: Master Word Selection */}
      <MasterWordDropdown
        selectedWord={selectedWord}
        onWordSelect={setSelectedWord}
        disabled={!selectedVillage}
      />

      <Divider style={styles.divider} />

      {/* Step 3: Regional Word Input */}
      <RegionalWordInput
        value={regionalWord}
        onChangeText={setRegionalWord}
        disabled={!selectedWord}
        selectedMasterWord={selectedWord?.english}
      />

      <Divider style={styles.divider} />

      {/* Step 4: Audio Recording */}
      <AudioRecorder
        onRecordingComplete={setAudioFilePath}
        isRecording={isRecording}
        disabled={!selectedWord || !regionalWord.trim()}
        existingRecording={audioFilePath}
      />

      {/* Form Actions */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleReset}
          disabled={isSubmitting}
          style={styles.resetButton}
          contentStyle={styles.buttonContent}
        >
          Reset Form
        </Button>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Entry'}
        </Button>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text variant="bodySmall" style={styles.progressText}>
          Submissions today: {state.submissions.length}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    marginTop: 4,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  resetButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  progressContainer: {
    padding: 16,
    alignItems: 'center',
  },
  progressText: {
    color: '#666',
  },
});

export default DataEntryScreen;
