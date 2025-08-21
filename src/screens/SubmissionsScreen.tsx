import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  List,
  ActivityIndicator,
  Chip,
  Searchbar,
  FAB,
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

  // Extract stable values to prevent re-render loops
  const userId = state.user?.id;
  const apiInitialized = state.apiInitialized;
  const userApiId = userId
    ? (state.user as any).apiId || userId.toString()
    : null;

  // Load submissions based on current user and filters
  const loadSubmissions = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      if (!userApiId || !apiInitialized) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
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
        if (filterStatus !== 'all') {
          filters.statuses = [
            filterStatus as 'pending' | 'approved' | 'rejected',
          ];
        }

        console.log('📊 Loading submissions with filters:', filters);

        const response = await apiService.submissions.getSubmissionsWithFilters(
          filters,
        );

        if (response.success && response.data) {
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
            count: newSubmissions.length,
            total: response.data.totalItems,
            hasMore: response.data.hasNextPage,
          });
        } else {
          console.error('❌ Failed to load submissions:', response.error);
        }
      } catch (error) {
        console.error('Load submissions error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userApiId, apiInitialized, filterStatus],
  );

  // Initial load
  useEffect(() => {
    if (apiInitialized && userApiId) {
      loadSubmissions(1, true);
    }
  }, [loadSubmissions, apiInitialized, userApiId]);

  // Refresh handler
  const handleRefresh = () => {
    loadSubmissions(1, true);
  };

  // Load more handler
  const handleLoadMore = () => {
    if (hasMoreData && !loading) {
      loadSubmissions(page + 1);
    }
  };

  // Filter status change
  const handleStatusFilter = (
    status: 'all' | 'pending' | 'approved' | 'rejected',
  ) => {
    setFilterStatus(status);
    setPage(1);
    setSubmissions([]);
  };

  // Render submission item
  const renderSubmissionItem = (submission: ApiSubmission) => {
    const statusColor = {
      pending: '#f39c12',
      approved: '#27ae60',
      rejected: '#e74c3c',
    }[submission.status];

    return (
      <Card key={submission.id} style={styles.submissionCard}>
        <List.Item
          title={submission.word?.english || 'Unknown Word'}
          description={
            <View style={styles.submissionDetails}>
              <Text style={styles.synonyms}>
                Synonyms: {submission.synonyms}
              </Text>
              <Text style={styles.location}>
                {submission.village?.name}, {submission.tehsil?.name},{' '}
                {submission.district?.name}
              </Text>
              <Text style={styles.date}>
                Submitted: {new Date(submission.createdAt).toLocaleDateString()}
              </Text>
            </View>
          }
          left={() => (
            <View style={styles.leftContent}>
              <Chip
                mode="outlined"
                textStyle={{ color: statusColor }}
                style={[styles.statusChip, { borderColor: statusColor }]}
              >
                {submission.status.toUpperCase()}
              </Chip>
            </View>
          )}
          right={() => (
            <View style={styles.rightContent}>
              {submission.audioUrl && (
                <Chip
                  icon="volume-high"
                  mode="outlined"
                  style={styles.audioChip}
                >
                  Audio
                </Chip>
              )}
            </View>
          )}
        />
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
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isCloseToBottom && hasMoreData && !loading) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
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

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading submissions...</Text>
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
  submissionDetails: {
    marginTop: 4,
  },
  synonyms: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  leftContent: {
    justifyContent: 'center',
    marginRight: 8,
  },
  rightContent: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  statusChip: {
    marginBottom: 4,
  },
  audioChip: {
    marginTop: 4,
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
