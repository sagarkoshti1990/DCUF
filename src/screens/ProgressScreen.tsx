import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  ProgressBar,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';

interface ProgressStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  loading: boolean;
}

const ProgressScreen: React.FC = () => {
  const theme = useTheme();
  const { state } = useAppContext();

  // Ref to prevent multiple simultaneous loadProgressData calls
  const loadingProgressRef = useRef(false);

  const [stats, setStats] = useState<ProgressStats>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    loading: true,
  });

  const [refreshing, setRefreshing] = useState(false);

  // Create stable user identifier to prevent unnecessary re-renders
  const userApiId = useMemo(() => {
    if (!state.user) return null;
    return (
      (state.user as any).id ||
      (state.user as any).apiId ||
      state.user.userId?.toString() ||
      null
    );
  }, [state.user]); // Include state.user for linter compliance

  const loadProgressData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingProgressRef.current) {
      console.log('📊 Already loading progress data, skipping...');
      return;
    }

    if (!userApiId) {
      console.log('📊 No user API ID, skipping progress data load');
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      loadingProgressRef.current = true;
      setStats(prev => ({ ...prev, loading: true }));

      // Get total counts for different statuses in parallel
      const [pendingResponse, approvedResponse, rejectedResponse, allResponse] =
        await Promise.all([
          apiService.submissions.getSubmissionsWithFilters({
            page: 1,
            limit: 1,
            userIds: [userApiId],
            statuses: ['pending'],
            sortBy: 'createdAt',
            sortOrder: 'DESC',
          }),
          apiService.submissions.getSubmissionsWithFilters({
            page: 1,
            limit: 1,
            userIds: [userApiId],
            statuses: ['approved'],
            sortBy: 'createdAt',
            sortOrder: 'DESC',
          }),
          apiService.submissions.getSubmissionsWithFilters({
            page: 1,
            limit: 1,
            userIds: [userApiId],
            statuses: ['rejected'],
            sortBy: 'createdAt',
            sortOrder: 'DESC',
          }),
          apiService.submissions.getSubmissionsWithFilters({
            page: 1,
            limit: 10,
            userIds: [userApiId],
            sortBy: 'createdAt',
            sortOrder: 'DESC',
          }),
        ]);
      console.log('allResponse.data sagar 1', allResponse);
      setStats({
        totalSubmissions: allResponse.data?.pagination?.total || 0,
        approvedSubmissions: approvedResponse.data?.pagination?.total || 0,
        pendingSubmissions: pendingResponse.data?.pagination?.total || 0,
        rejectedSubmissions: rejectedResponse.data?.pagination?.total || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading progress data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    } finally {
      loadingProgressRef.current = false;
    }
  }, [userApiId]);

  console.log('allResponse.data sagar 2', stats, userApiId);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [loadProgressData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProgressData().finally(() => setRefreshing(false));
  };

  const getApprovalRate = () => {
    if (stats.totalSubmissions === 0) return 0;
    return (stats.approvedSubmissions / stats.totalSubmissions) * 100;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    card: {
      marginBottom: 16,
      elevation: 4,
    },
    cardContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      padding: 12,
      margin: 4,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    progressPercent: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    iconText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '500',
    },
  });

  if (stats.loading && stats.totalSubmissions === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading progress data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Dashboard</Text>
        <Text style={styles.subtitle}>
          Track your data collection progress and contributions
        </Text>
      </View>

      {/* Overview Statistics */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconRow}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.sectionTitle, styles.iconText]}>Overview</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text
                style={[styles.statNumber, { color: theme.colors.primary }]}
              >
                {stats.totalSubmissions}
              </Text>
              <Text style={styles.statLabel}>Total Submissions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>
                {stats.approvedSubmissions}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>
                {stats.pendingSubmissions}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressText}>Approval Rate</Text>
              <Text style={styles.progressPercent}>
                {getApprovalRate().toFixed(1)}%
              </Text>
            </View>
            <ProgressBar
              progress={getApprovalRate() / 100}
              color={theme.colors.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          <View style={styles.chipContainer}>
            <Chip icon="check-circle" mode="outlined" compact>
              {stats.approvedSubmissions} Approved
            </Chip>
            <Chip icon="clock-outline" mode="outlined" compact>
              {stats.pendingSubmissions} Pending
            </Chip>
            {stats.rejectedSubmissions > 0 && (
              <Chip icon="close-circle" mode="outlined" compact>
                {stats.rejectedSubmissions} Rejected
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Offline Data Status */}
      {state.offlineData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconRow}>
              <Ionicons
                name="cloud-offline-outline"
                size={24}
                color="#ff9800"
              />
              <Text style={[styles.sectionTitle, styles.iconText]}>
                Offline Queue
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>
                {state.offlineData.length}
              </Text>
              <Text style={styles.statLabel}>Submissions waiting to sync</Text>
            </View>

            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Connect to internet to sync your offline submissions
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

export default ProgressScreen;
