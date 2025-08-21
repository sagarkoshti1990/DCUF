import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Button,
  ProgressBar,
} from 'react-native-paper';

// 1. Import the library
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';

interface AudioRecorderProps {
  onRecordingComplete: (filePath: string, audioFile?: any) => void;
  isRecording: boolean;
  disabled?: boolean;
  existingRecording?: string;
}

// Correct way to use the library
const audioRecorderPlayer = AudioRecorderPlayer;

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  disabled = false,
  existingRecording,
}) => {
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentRecordingPath, setCurrentRecordingPath] = useState<
    string | null
  >(existingRecording || null);
  const [internalIsRecording, setInternalIsRecording] = useState(false);

  useEffect(() => {
    checkPermissions();
    // 3. Add a cleanup function to stop recording/playback when component unmounts
    return () => {
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'This app needs access to microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // 4. Update to use the library's recording methods
  const onStartRecord = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to record audio',
      );
      await checkPermissions();
      return;
    }

    try {
      const path = Platform.select({
        ios: 'hello.m4a', // Use a consistent filename
        android: `${PermissionsAndroid.PERMISSIONS.RECORD_AUDIO.split(
          '.',
        ).pop()}_${Date.now()}.m4a`, // Dynamic filename
      });

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVLinearPCMBitRateKey: 16,
        AVNumberOfChannelsKey: 2,
        AVSampleRateKey: 44100,
        OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
      };

      const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
      audioRecorderPlayer.addRecordBackListener(e => {
        const currentTime = audioRecorderPlayer.mmss(
          Math.floor(e.currentPosition),
        );
        setRecordTime(currentTime);
      });

      setInternalIsRecording(true);
      setCurrentRecordingPath(uri);
      console.log('🎤 Recording started. URI:', uri);
    } catch (error) {
      console.error('Start recording error:', error);
      setInternalIsRecording(false);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please try again.',
      );
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      setInternalIsRecording(false);

      // The library gives us the path and the file object is created internally.
      // We can use the result directly in the parent component.
      onRecordingComplete(result);

      console.log('🛑 Recording stopped:', result);
      Alert.alert(
        'Recording Complete',
        `Audio recorded successfully!\nFile Path: ${result}`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Stop recording error:', error);
      setInternalIsRecording(false);
      Alert.alert('Recording Error', 'Failed to stop recording properly.');
    }
  };

  // 5. Update to use the library's playback methods
  const onStartPlay = async () => {
    if (!currentRecordingPath) {
      Alert.alert('No Recording', 'Please record audio first');
      return;
    }

    try {
      setIsPlaying(true);
      setPlayTime('00:00');

      await audioRecorderPlayer.startPlayer(currentRecordingPath);
      audioRecorderPlayer.addPlayBackListener(e => {
        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
          setPlayTime('00:00');
          audioRecorderPlayer.removePlayBackListener();
        } else {
          setPlayTime(audioRecorderPlayer.mmss(Math.floor(e.currentPosition)));
        }
      });
      console.log('▶️ Playback started');
    } catch (error) {
      console.error('Play error:', error);
      setIsPlaying(false);
      Alert.alert('Playback Error', 'Failed to play audio');
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
      console.log('⏹️ Playback stopped');
    } catch (error) {
      console.error('Stop play error:', error);
    }
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
            // No need to delete the file, the library handles that.
            // Just clear the state.
            setCurrentRecordingPath(null);
            setRecordTime('00:00');
            setPlayTime('00:00');
            onRecordingComplete('');
            console.log('🗑️ Recording deleted');
          },
        },
      ],
    );
  };

  const currentlyRecording = internalIsRecording || isRecording;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Audio Recording
        </Text>

        {/* Large Record Button */}
        <View style={styles.recordButtonContainer}>
          <IconButton
            icon={currentlyRecording ? 'stop-circle' : 'microphone'}
            size={60}
            mode="contained-tonal"
            iconColor={currentlyRecording ? '#d32f2f' : '#1976d2'}
            containerColor={currentlyRecording ? '#ffebee' : '#e3f2fd'}
            onPress={currentlyRecording ? onStopRecord : onStartRecord}
            disabled={disabled || !hasPermission}
            style={[
              styles.recordButton,
              currentlyRecording ? styles.recordingButton : [],
              disabled && styles.disabledButton,
            ]}
          />
          <Text style={styles.recordButtonText}>
            {currentlyRecording
              ? '🔴 Recording... Tap to Stop'
              : 'Tap to Record'}
          </Text>
          {currentlyRecording && (
            <Text style={styles.recordTime}>Duration: {recordTime}</Text>
          )}
        </View>

        {/* Recording Progress */}
        {currentlyRecording && (
          <View style={styles.progressContainer}>
            <ProgressBar
              indeterminate={true}
              style={styles.progressBar}
              color="#d32f2f"
            />
            <Text style={styles.recordingText}>
              🎤 Recording in progress...
            </Text>
          </View>
        )}

        {/* Playback Controls */}
        {currentRecordingPath && !currentlyRecording && (
          <View style={styles.playbackContainer}>
            <Text style={styles.playbackText}>
              ✅ Recording saved {isPlaying && `• Playing: ${playTime}`}
            </Text>

            <View style={styles.playbackButtons}>
              <Button
                mode="contained-tonal"
                icon={isPlaying ? 'pause' : 'play'}
                onPress={isPlaying ? onStopPlay : onStartPlay}
                disabled={disabled}
                style={styles.playButton}
              >
                {isPlaying ? 'Pause' : 'Play Recording'}
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
              ⚠️ Microphone permission required for audio recording
            </Text>
            <Button
              mode="outlined"
              onPress={checkPermissions}
              style={styles.permissionButton}
            >
              Grant Permission
            </Button>
          </View>
        )}

        {/* Status Info */}
        <Text style={styles.statusText}>
          Status:{' '}
          {currentlyRecording
            ? '🔴 Recording'
            : currentRecordingPath
            ? '✅ Ready to play'
            : '⭕ No recording'}
        </Text>
      </Card.Content>
    </Card>
  );
};

// ... (styles remain the same)
const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
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
    transform: [],
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
  progressContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  recordingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
export default AudioRecorder;
