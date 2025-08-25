import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  Chip,
  Searchbar,
  FAB,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { ApiSubmission, SubmissionFilterRequest } from '../types/api';
import { MainTabParamList } from '../types';
// Import Sound for audio playback
import Sound from 'react-native-sound';
import { API_CONFIG } from '../constants/apiConstants';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Submissions'>;

const SubmissionsScreen: React.FC = () => {
  const BASE_URL = API_CONFIG.BASE_URL;
  const navigation = useNavigation<NavigationProp>();
  const { state, actions } = useAppContext();
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Audio playback state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>(
    {},
  );
  const [audioSounds, setAudioSounds] = useState<{ [key: string]: Sound }>({});

  // Add ref to prevent rapid requests
  const lastLoadTimeRef = useRef<number>(0);
  const progressTimerRef = useRef<{
    [key: string]: ReturnType<typeof setInterval>;
  }>({});

  // Initialize Sound library
  useEffect(() => {
    Sound.setCategory('Playback');

    // Cleanup function for timers only
    return () => {
      // Clear progress timers
      const timers = progressTimerRef.current;
      Object.values(timers).forEach(timer => {
        clearInterval(timer);
      });
      progressTimerRef.current = {};
    };
  }, []);

  // Separate cleanup for audio sounds
  useEffect(() => {
    return () => {
      // Stop all sounds when component unmounts or audioSounds changes
      Object.values(audioSounds).forEach(sound => {
        sound.stop();
        sound.release();
      });
    };
  }, [audioSounds]);

  // Extract stable values to prevent re-render loops
  const userId = state.user?.id;
  const apiInitialized = state.apiInitialized;
  const userApiId = userId
    ? (state.user as any).apiId || userId.toString()
    : null;

  // Load submissions based on current user and filters
  const loadSubmissions = useCallback(
    async (
      pageNum: number = 1,
      isRefresh: boolean = false,
      currentFilterStatus: string = 'all',
    ) => {
      if (!userApiId || !apiInitialized) return;

      // Debounce mechanism - prevent rapid requests
      const now = Date.now();
      if (!isRefresh && now - lastLoadTimeRef.current < 1000) {
        console.log('🚫 Debouncing request - too soon');
        return;
      }
      lastLoadTimeRef.current = now;

      // Prevent multiple simultaneous requests
      if (loading && !isRefresh) {
        console.log('🚫 Skipping request - already loading');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        if (pageNum > 1) {
          setIsLoadingMore(true);
        }
      }

      try {
        // Prepare filter request similar to curl example
        const filters: SubmissionFilterRequest = {
          page: pageNum,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        };

        // Add current user filter
        filters.userIds = [userApiId];

        // Add status filter if not 'all'
        if (currentFilterStatus !== 'all') {
          filters.statuses = [
            currentFilterStatus as 'pending' | 'approved' | 'rejected',
          ];
        }

        console.log('📊 Loading submissions with filters:', filters);

        const response = await apiService.submissions.getSubmissionsWithFilters(
          filters,
        );

        if (response.success && response.data) {
          const newSubmissions = response.data.submissions;

          if (isRefresh || pageNum === 1) {
            setSubmissions(newSubmissions);
            // Update global state when refreshing or loading first page
            console.log('🌍 Updating global submissions state');
            // Convert ApiSubmission to Submission format for global state
            const globalSubmissions = newSubmissions.map((apiSub: any) => ({
              submissionId: apiSub.id,
              wordId: apiSub.word?.id || apiSub.wordId,
              synonyms: apiSub.synonyms,
              audioUrl: apiSub.audioUrl,
              villageId: apiSub.village?.id || apiSub.villageId,
              tehsilId: apiSub.tehsil?.id || apiSub.tehsilId,
              districtId: apiSub.district?.id || apiSub.districtId,
              languageId: apiSub.language?.id || apiSub.languageId,
              createdAt: apiSub.createdAt,
              updatedAt: apiSub.updatedAt,
            }));
            actions.setSubmissions(globalSubmissions);
          } else {
            setSubmissions(prev => [...prev, ...newSubmissions]);
          }

          setTotalCount(response.data.totalItems);
          setHasMoreData(response.data.hasNextPage);
          setPage(pageNum);
        } else {
          console.error('❌ Failed to load submissions:', response.error);
        }
      } catch (error) {
        console.error(`Load submissions error:`, error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [userApiId, apiInitialized, loading], // Include loading in dependencies
  );

  // Initial load - only run once when API is ready
  useEffect(() => {
    if (apiInitialized && userApiId) {
      loadSubmissions(1, true, filterStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiInitialized, userApiId]);

  // Handle filter status changes
  useEffect(() => {
    if (apiInitialized && userApiId) {
      loadSubmissions(1, true, filterStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // Refresh submissions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (apiInitialized && userApiId) {
        loadSubmissions(1, true, filterStatus);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiInitialized, userApiId, filterStatus]),
  );

  // Refresh handler
  const handleRefresh = () => {
    loadSubmissions(1, true, filterStatus);
  };

  // Load more handler
  const handleLoadMore = () => {
    if (hasMoreData && !loading && !isLoadingMore) {
      loadSubmissions(page + 1, false, filterStatus);
    }
  };

  // Filter status change
  const handleStatusFilter = (
    status: 'all' | 'pending' | 'approved' | 'rejected',
  ) => {
    setFilterStatus(status);
    setPage(1);
    setSubmissions([]);
    setHasMoreData(true);
    // Filter change will trigger useEffect above
  };

  // Handle audio playback with proper implementation
  const handleAudioPlay = async (audioUrl: string, submissionId: string) => {
    try {
      // If currently playing this audio, stop it
      if (currentPlayingId === submissionId) {
        const sound = audioSounds[submissionId];
        if (sound) {
          sound.stop(() => {
            setCurrentPlayingId(null);
            setAudioProgress(prev => ({ ...prev, [submissionId]: 0 }));
            if (progressTimerRef.current[submissionId]) {
              clearInterval(progressTimerRef.current[submissionId]);
              delete progressTimerRef.current[submissionId];
            }
          });
        }
        return;
      }

      // Stop any currently playing audio
      if (currentPlayingId) {
        const currentSound = audioSounds[currentPlayingId];
        if (currentSound) {
          currentSound.stop();
          setAudioProgress(prev => ({ ...prev, [currentPlayingId]: 0 }));
          if (progressTimerRef.current[currentPlayingId]) {
            clearInterval(progressTimerRef.current[currentPlayingId]);
            delete progressTimerRef.current[currentPlayingId];
          }
        }
      }

      setAudioLoadingId(submissionId);
      setCurrentPlayingId(null);
      // Create new sound instance
      const sound = new Sound(`${BASE_URL}${audioUrl}`, '', error => {
        setAudioLoadingId(null);
        if (error) {
          console.error('Failed to load sound:', error);
          Alert.alert(
            'Audio Error',
            'Failed to load audio file. Please check your internet connection.',
          );
          return;
        }

        console.log(
          'Sound loaded successfully, duration:',
          sound.getDuration(),
        );

        // Update sounds state
        setAudioSounds(prev => ({ ...prev, [submissionId]: sound }));
        setCurrentPlayingId(submissionId);
        setAudioProgress(prev => ({ ...prev, [submissionId]: 0 }));

        // Start playback
        sound.play(success => {
          if (success) {
            console.log('Audio playback completed successfully');
          } else {
            console.log('Audio playback failed');
            Alert.alert('Playback Error', 'Audio playback failed');
          }

          // Reset state after playback
          setCurrentPlayingId(null);
          setAudioProgress(prev => ({ ...prev, [submissionId]: 0 }));
          if (progressTimerRef.current[submissionId]) {
            clearInterval(progressTimerRef.current[submissionId]);
            delete progressTimerRef.current[submissionId];
          }
        });

        // Start progress tracking
        const duration = sound.getDuration();
        progressTimerRef.current[submissionId] = setInterval(() => {
          sound.getCurrentTime(seconds => {
            const progress = duration > 0 ? seconds / duration : 0;
            setAudioProgress(prev => ({ ...prev, [submissionId]: progress }));

            // Stop timer when playback completes
            if (progress >= 1) {
              clearInterval(progressTimerRef.current[submissionId]);
              delete progressTimerRef.current[submissionId];
            }
          });
        }, 100);
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioLoadingId(null);
      setCurrentPlayingId(null);
      Alert.alert(
        'Audio Error',
        'An error occurred while trying to play the audio.',
      );
    }
  };

  // Render submission item
  const renderSubmissionItem = (submission: ApiSubmission) => {
    const statusConfig = {
      pending: { color: '#f39c12', bgColor: '#fef9e7', icon: 'clock-outline' },
      approved: { color: '#27ae60', bgColor: '#eafaf1', icon: 'check-circle' },
      rejected: { color: '#e74c3c', bgColor: '#fdeaea', icon: 'close-circle' },
    }[submission.status];

    const wordText =
      submission.word?.word || submission.word?.english || 'Unknown Word';

    const isCurrentlyPlaying = currentPlayingId === submission.id;
    const isAudioLoading = audioLoadingId === submission.id;
    const progress = audioProgress[submission.id] || 0;

    return (
      <Card key={submission.id} style={styles.submissionCard}>
        <Card.Content style={styles.cardContent}>
          {/* Header with word and status */}
          <View style={styles.cardHeader}>
            <View style={styles.wordContainer}>
              <Text style={styles.wordText}>{wordText} -</Text>
              {submission.language && (
                <Text style={styles.wordText}>{submission.language.name}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              {/* <Badge
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusConfig.color },
                ]}
              /> */}
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {submission.status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Synonyms */}
          <View style={styles.synonymsContainer}>
            <Text style={styles.synonymsLabel}>Synonyms:</Text>
            <Text style={styles.wordText}>{submission.synonyms}</Text>
          </View>

          {/* Location and Date */}
          <View style={styles.metadataContainer}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                📍 {submission.village?.name}, {submission.tehsil?.name},{' '}
                {submission.district?.name}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(submission.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>

          {/* Enhanced Audio Section */}
          {submission.audioUrl && (
            <View style={styles.audioContainer}>
              <View style={styles.audioMainRow}>
                <TouchableOpacity
                  style={styles.audioPlayButton}
                  onPress={() =>
                    handleAudioPlay(submission.audioUrl!, submission.id)
                  }
                  disabled={isAudioLoading}
                >
                  {isAudioLoading ? (
                    <ActivityIndicator
                      size={20}
                      color="#6366f1"
                      style={styles.loadingIcon}
                    />
                  ) : (
                    <IconButton
                      icon={isCurrentlyPlaying ? 'pause' : 'play'}
                      size={20}
                      iconColor="#6366f1"
                      style={styles.playIcon}
                    />
                  )}
                  <Text style={styles.audioText}>
                    {isAudioLoading
                      ? 'Loading...'
                      : isCurrentlyPlaying
                      ? 'Playing'
                      : 'Play Audio'}
                  </Text>
                </TouchableOpacity>

                {/* Audio indicator */}
                <View style={styles.audioIndicator}>
                  <IconButton
                    icon="volume-high"
                    size={16}
                    iconColor={isCurrentlyPlaying ? '#6366f1' : '#999'}
                  />
                </View>
              </View>
              <View style={styles.progressContainer}>
                {/* Audio progress bar */}
                {isCurrentlyPlaying && (
                  <View style={styles.subProgressContainer}>
                    <Text style={styles.progressText}>
                      {Math.round(progress * 100)}%
                    </Text>
                    <ProgressBar
                      progress={progress}
                      color="#6366f1"
                      style={styles.progressBar}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (!state.user) {
    return (
      <View style={styles.centerContainer}>
        <Text>Please log in to view submissions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>My Submissions</Text>
          <Text style={styles.subtitle}>Total: {totalCount} submissions</Text>
        </Card.Content>
      </Card>

      {/* Search and Filters */}
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search submissions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <View style={styles.filtersContainer}>
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <Chip
                  key={status}
                  selected={filterStatus === status}
                  onPress={() => handleStatusFilter(status as any)}
                  style={styles.filterChip}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Submissions List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        {submissions && submissions.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>No submissions found</Text>
              <Text style={styles.emptySubtext}>
                Start by submitting some data in the Data Collection tab
              </Text>
            </Card.Content>
          </Card>
        ) : (
          submissions && submissions.map(renderSubmissionItem)
        )}

        {loading && submissions.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading submissions...</Text>
          </View>
        )}

        {/* Load More Button */}
        {hasMoreData && submissions && submissions.length > 0 && !loading && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <View style={styles.loadMoreButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadMoreLoadingText}>Loading...</Text>
                </View>
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isLoadingMore && (
          <View style={styles.paginationLoadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.paginationLoadingText}>
              Loading more submissions...
            </Text>
          </View>
        )}

        {!hasMoreData && submissions && submissions.length > 0 && (
          <View style={styles.endContainer}>
            <Text style={styles.endText}>No more submissions</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to data collection - this would need navigation prop
          // Alert.alert(
          //   'Info',
          //   'Navigate to Data Collection tab to add new submissions',
          // );
          navigation.navigate('DataEntry');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  submissionCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  languageChip: {
    backgroundColor: '#e0e0e0',
    borderColor: '#b0b0b0',
    borderWidth: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  synonymsContainer: {
    marginBottom: 8,
  },
  synonymsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  synonymsText: {
    fontSize: 14,
    color: '#666',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  audioContainer: {
    flexDirection: 'column', // Changed to column for vertical layout
    alignItems: 'center',
    // marginTop: 8,
    // paddingVertical: 8,
    // paddingHorizontal: 12,
    backgroundColor: '#e0dcf5', // Changed to a lighter blue that contrasts better
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d9e3',
  },
  audioMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playIcon: {
    marginRight: 8,
  },
  loadingIcon: {
    margin: 12,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    marginRight: 8,
  },
  progressContainer: {
    width: '100%',
  },
  subProgressContainer: {
    flexDirection: 'column',
    gap: 4,
    marginRight: 8,
    marginLeft: 8,
  },
  progressBar: {
    marginBlock: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  audioIndicator: {
    marginLeft: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  paginationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  paginationLoadingText: {
    marginLeft: 8,
    color: '#666',
  },
  endContainer: {
    alignItems: 'center',
    padding: 20,
  },
  endText: {
    color: '#999',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  loadMoreButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadMoreButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreLoadingText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubmissionsScreen;
