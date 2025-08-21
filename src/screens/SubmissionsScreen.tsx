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
  Badge,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { ApiSubmission, SubmissionFilterRequest } from '../types/api';
import { MainTabParamList } from '../types';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Submissions'>;

const SubmissionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state } = useAppContext();
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

  // Add ref to prevent rapid requests
  const lastLoadTimeRef = useRef<number>(0);

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
          limit: 10,
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
          console.log('🔍 Response:', response);
          const newSubmissions = response.data.items;

          if (isRefresh || pageNum === 1) {
            setSubmissions(newSubmissions);
          } else {
            setSubmissions(prev => [...prev, ...newSubmissions]);
          }

          setTotalCount(response.data.totalItems);
          setHasMoreData(response.data.hasNextPage);
          setPage(pageNum);

          console.log('✅ Loaded submissions:', {
            count: newSubmissions?.length,
            total: response.data.totalItems,
            hasMore: response.data.hasNextPage,
          });
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

  // Handle audio playback
  const handleAudioPlay = (audioUrl: string, _submissionId: string) => {
    Alert.alert('Audio Playback', 'Audio playback feature coming soon!', [
      { text: 'OK', style: 'default' },
      {
        text: 'Open URL',
        style: 'default',
        onPress: () => {
          console.log('Audio URL:', audioUrl);
          // In a real app, you would use a library like react-native-sound or expo-av
          // For now, just log the URL
        },
      },
    ]);
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

    return (
      <Card key={submission.id} style={styles.submissionCard}>
        <Card.Content style={styles.cardContent}>
          {/* Header with word and status */}
          <View style={styles.cardHeader}>
            <View style={styles.wordContainer}>
              <Text style={styles.wordText}>{wordText}</Text>
              {submission.language && (
                <Chip mode="outlined" compact style={styles.languageChip}>
                  {submission.language.name}
                </Chip>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Badge
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {submission.status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Synonyms */}
          <View style={styles.synonymsContainer}>
            <Text style={styles.synonymsLabel}>Synonyms:</Text>
            <Text style={styles.synonymsText}>{submission.synonyms}</Text>
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
              {new Date(submission.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Audio Section */}
          {submission.audioUrl && (
            <TouchableOpacity
              style={styles.audioContainer}
              onPress={() =>
                handleAudioPlay(submission.audioUrl!, submission.id)
              }
            >
              <IconButton
                icon="play-circle"
                size={24}
                iconColor="#6366f1"
                style={styles.audioIcon}
              />
              <Text style={styles.audioText}>Play Audio</Text>
              <IconButton icon="volume-high" size={20} iconColor="#6366f1" />
            </TouchableOpacity>
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 100; // Increase padding to trigger earlier but less frequently
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;

          // More strict conditions to prevent rapid firing
          if (
            isCloseToBottom &&
            hasMoreData &&
            !loading &&
            !refreshing &&
            !isLoadingMore &&
            submissions.length > 0 // Only trigger if we have existing data
          ) {
            console.log('🔄 Loading more submissions...');
            handleLoadMore();
          }
        }}
        scrollEventThrottle={200}
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

        {loading && submissions.length > 0 && (
          <View style={styles.paginationLoadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.paginationLoadingText}>Loading more...</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9eb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1f3d8',
  },
  audioIcon: {
    marginRight: 8,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    marginRight: 8,
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
});

export default SubmissionsScreen;
