import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Button,
  ProgressBar,
} from 'react-native-paper';

interface AudioRecorderProps {
  onRecordingComplete: (filePath: string) => void;
  isRecording: boolean;
  disabled?: boolean;
  existingRecording?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  disabled = false,
  existingRecording,
}) => {
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(true); // Simplified for now
  const [currentRecordingPath, setCurrentRecordingPath] = useState<
    string | null
  >(existingRecording || null);

  const onStartRecord = async () => {
    // Mock recording functionality for now
    Alert.alert(
      'Recording',
      'Recording functionality will be implemented with react-native-audio-recorder-player',
    );
    const mockPath = `recording_${Date.now()}.m4a`;
    setCurrentRecordingPath(mockPath);
    onRecordingComplete(mockPath);
  };

  const onStopRecord = async () => {
    Alert.alert('Recording Stopped', 'Recording completed');
  };

  const onStartPlay = async () => {
    if (!currentRecordingPath) {
      Alert.alert('No Recording', 'Please record audio first');
      return;
    }
    setIsPlaying(true);
    // Mock playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const onStopPlay = async () => {
    setIsPlaying(false);
  };

  const onDeleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCurrentRecordingPath(null);
            setRecordTime('00:00');
            setPlayTime('00:00');
          },
        },
      ],
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Audio Recording
        </Text>

        {/* Large Record Button */}
        <View style={styles.recordButtonContainer}>
          <IconButton
            icon={isRecording ? 'stop' : 'microphone'}
            size={60}
            mode="contained-tonal"
            iconColor={isRecording ? '#d32f2f' : '#1976d2'}
            containerColor={isRecording ? '#ffebee' : '#e3f2fd'}
            onPress={isRecording ? onStopRecord : onStartRecord}
            disabled={disabled || !hasPermission}
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton,
              disabled && styles.disabledButton,
            ]}
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Tap to Stop' : 'Tap to Record'}
          </Text>
          {isRecording && (
            <Text style={styles.recordTime}>Recording: {recordTime}</Text>
          )}
        </View>

        {/* Recording Progress */}
        {isRecording && (
          <ProgressBar
            indeterminate={true}
            style={styles.progressBar}
            color="#1976d2"
          />
        )}

        {/* Playback Controls */}
        {currentRecordingPath && !isRecording && (
          <View style={styles.playbackContainer}>
            <Text style={styles.playbackText}>
              Recording saved {playTime !== '00:00' && `• Playing: ${playTime}`}
            </Text>

            <View style={styles.playbackButtons}>
              <Button
                mode="contained-tonal"
                icon={isPlaying ? 'pause' : 'play'}
                onPress={isPlaying ? onStopPlay : onStartPlay}
                disabled={disabled}
                style={styles.playButton}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                mode="outlined"
                icon="delete"
                onPress={onDeleteRecording}
                disabled={disabled}
                style={styles.deleteButton}
                textColor="#d32f2f"
              >
                Delete
              </Button>
            </View>
          </View>
        )}

        {/* Permission Warning */}
        {!hasPermission && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Microphone permission required for audio recording
            </Text>
            <Button
              mode="outlined"
              onPress={() => setHasPermission(true)}
              style={styles.permissionButton}
            >
              Grant Permission
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordingButton: {
    transform: [{ scale: 1.1 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordButtonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordTime: {
    marginTop: 8,
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  progressBar: {
    marginVertical: 16,
    height: 4,
  },
  playbackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  playbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  playbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  playButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  warningContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionButton: {
    alignSelf: 'center',
  },
});

export default AudioRecorder;
