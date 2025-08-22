import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
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

// Import the new libraries
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';

interface AudioRecorderProps {
  onRecordingComplete: (filePath: string, audioFile?: any) => void;
  isRecording: boolean;
  disabled?: boolean;
  existingRecording?: string;
}

export interface AudioRecorderRef {
  clearRecording: () => void;
}

const AudioRecorder = forwardRef<AudioRecorderRef, AudioRecorderProps>(
  (
    { onRecordingComplete, isRecording, disabled = false, existingRecording },
    ref,
  ) => {
    const [recordTime, setRecordTime] = useState('00:00');
    const [playTime, setPlayTime] = useState('00:00');
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [currentRecordingPath, setCurrentRecordingPath] = useState<
      string | null
    >(existingRecording || null);
    const [internalIsRecording, setInternalIsRecording] = useState(false);
    const [sound, setSound] = useState<Sound | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(
      null,
    );
    const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

    useEffect(() => {
      const initializeComponent = async () => {
        await checkPermissions();
        initializeAudioRecord();

        // Enable sound playback for local files
        Sound.setCategory('Playback');
      };

      initializeComponent();

      return () => {
        // Cleanup
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        AudioRecord.stop();
      };
    }, []); // Empty dependency array is fine here since we only want this to run once

    // Separate useEffect for sound cleanup
    useEffect(() => {
      return () => {
        if (sound) {
          sound.release();
        }
      };
    }, [sound]);

    // Expose clearRecording method via ref
    useImperativeHandle(ref, () => ({
      clearRecording: () => {
        if (sound) {
          sound.release();
          setSound(null);
        }
        setCurrentRecordingPath(null);
        setRecordTime('00:00');
        setPlayTime('00:00');
        onRecordingComplete('');
        console.log('��️ Recording cleared via ref');
      },
    }));

    const initializeAudioRecord = () => {
      try {
        const options = {
          sampleRate: 16000, // default 44100
          channels: 1, // 1 or 2, default 1
          bitsPerSample: 16, // 8 or 16, default 16
          audioSource: 6, // android only (see below)
          wavFile: 'audio.wav', // default 'audio.wav'
        };

        AudioRecord.init(options);
        setIsInitialized(true);
        console.log('✅ AudioRecord initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize AudioRecord:', error);
        setIsInitialized(false);
      }
    };

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
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          setHasPermission(false);
          return false;
        }
      } else {
        setHasPermission(true);
        return true;
      }
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    };

    const startRecordingTimer = () => {
      let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1;
        setRecordTime(formatTime(seconds));
      }, 1000);
      recordingTimerRef.current = timer;
    };

    const stopRecordingTimer = () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };

    const onStartRecord = async () => {
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record audio',
        );
        const granted = await checkPermissions();
        if (!granted) return;
      }

      if (!isInitialized) {
        console.log(
          '⚠️ AudioRecord not initialized, attempting to initialize...',
        );
        initializeAudioRecord();

        // Wait a bit for initialization
        await new Promise<void>(resolve => setTimeout(resolve, 100));

        if (!isInitialized) {
          Alert.alert(
            'Initialization Error',
            'Failed to initialize audio recording. Please try again.',
          );
          return;
        }
      }

      try {
        console.log('🎤 Starting recording...');
        AudioRecord.start();
        setInternalIsRecording(true);
        startRecordingTimer();
      } catch (error) {
        console.error('Start recording error:', error);
        setInternalIsRecording(false);
        Alert.alert(
          'Recording Error',
          'Failed to start recording. Please ensure the app has microphone permissions and try again.',
        );
      }
    };

    const onStopRecord = async () => {
      try {
        console.log('🛑 Stopping recording...');
        const audioFile = await AudioRecord.stop();
        setInternalIsRecording(false);
        stopRecordingTimer();

        if (audioFile) {
          setCurrentRecordingPath(audioFile);
          onRecordingComplete(audioFile);

          console.log('Recording saved:', audioFile);
          // Alert.alert(
          //   'Recording Complete',
          //   `Audio recorded successfully!\nFile saved: ${audioFile}`,
          //   [{ text: 'OK' }],
          // );
        }
      } catch (error) {
        console.error('Stop recording error:', error);
        setInternalIsRecording(false);
        stopRecordingTimer();
        Alert.alert('Recording Error', 'Failed to stop recording properly.');
      }
    };

    const startPlaybackTimer = (duration: number) => {
      let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1;
        setPlayTime(formatTime(seconds));

        if (seconds >= duration) {
          clearInterval(timer);
          setIsPlaying(false);
          setPlayTime('00:00');
        }
      }, 1000);
      playbackTimerRef.current = timer;
    };

    const stopPlaybackTimer = () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };

    const onStartPlay = async () => {
      if (!currentRecordingPath) {
        Alert.alert('No Recording', 'Please record audio first');
        return;
      }

      try {
        console.log('▶️ Starting playback:', currentRecordingPath);

        // Release previous sound if exists
        if (sound) {
          sound.release();
        }

        const newSound = new Sound(currentRecordingPath, '', error => {
          if (error) {
            console.error('Failed to load sound:', error);
            Alert.alert('Playback Error', 'Failed to load audio file');
            return;
          }

          console.log(
            'Sound loaded successfully, duration:',
            newSound.getDuration(),
          );
          setSound(newSound);
          setIsPlaying(true);

          newSound.play(success => {
            if (success) {
              console.log('⏹️ Playback completed successfully');
            } else {
              console.log('⚠️ Playback failed due to audio decoding errors');
            }
            setIsPlaying(false);
            setPlayTime('00:00');
            stopPlaybackTimer();
          });

          startPlaybackTimer(newSound.getDuration());
        });
      } catch (error) {
        console.error('Play error:', error);
        setIsPlaying(false);
        Alert.alert('Playback Error', 'Failed to play audio');
      }
    };

    const onStopPlay = async () => {
      try {
        if (sound) {
          sound.stop(() => {
            console.log('⏹️ Playback stopped');
            setIsPlaying(false);
            setPlayTime('00:00');
            stopPlaybackTimer();
          });
        }
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
              if (sound) {
                sound.release();
                setSound(null);
              }
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
              disabled={disabled || !hasPermission || !isInitialized}
              style={[
                styles.recordButton,
                currentlyRecording ? styles.recordingButton : [],
                (disabled || !hasPermission || !isInitialized) &&
                  styles.disabledButton,
              ]}
            />
            <Text style={styles.recordButtonText}>
              {!isInitialized
                ? '⚙️ Initializing...'
                : currentlyRecording
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
                  {isPlaying ? 'Stop' : 'Play Recording'}
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
            {!isInitialized
              ? '⚙️ Initializing audio system...'
              : currentlyRecording
              ? '🔴 Recording'
              : currentRecordingPath
              ? '✅ Ready to play'
              : '⭕ No recording'}
          </Text>
        </Card.Content>
      </Card>
    );
  },
);

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
    // Remove the empty transform array as it's not needed
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
