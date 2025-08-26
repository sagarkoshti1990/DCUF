import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants/config';

const HomeScreen: React.FC = memo(() => {
  console.log('🏠 HomeScreen render triggered');
  const theme = useTheme();
  const navigation = useNavigation();
  const { state } = useAppContext();

  // Ref to prevent multiple simultaneous loadStats calls
  const loadingStatsRef = useRef(false);

  // State for statistics
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSync: 0,
    completedToday: 0,
    loading: true,
  });

  // Extract stable values to prevent re-render loops
  const apiInitialized = state.apiInitialized;
  const offlineDataLength = state.offlineData.length;

  // Create a stable userApiId that only changes when the actual user changes
  const userApiId = useMemo(() => {
    if (!state.user) return null;
    return (
      (state.user as any).id ||
      (state.user as any).apiId ||
      state.user.userId?.toString() ||
      null
    );
  }, [state.user]); // Include state.user for linter

  // Memoize card data to prevent recreation on every render
  const cardData = useMemo(
    () => [
      {
        id: 1,
        title: 'Data Collection',
        description: 'Collect regional words and audio recordings',
        icon: 'mic-outline',
        color: theme.colors.primary,
        screen: 'DataEntry',
      },
      {
        id: 2,
        title: 'Submissions',
        description: 'View and manage your submitted data',
        icon: 'list-outline',
        color: theme.colors.secondary,
        screen: 'Submissions',
      },
      {
        id: 3,
        title: 'Progress',
        description: 'Track your collection progress',
        icon: 'stats-chart-outline',
        color: '#4caf50',
        screen: 'Progress',
      },
      {
        id: 4,
        title: 'Settings',
        description: 'Manage your app preferences',
        icon: 'settings-outline',
        color: '#ff9800',
        screen: 'Settings',
      },
    ],
    [theme.colors.primary, theme.colors.secondary],
  );

  // Memoize navigation handlers to prevent recreation
  const handleAddPress = useCallback(() => {
    console.log('📱 Navigate to DataEntry');
    navigation.navigate('DataEntry' as never);
  }, [navigation]);

  const handleCardPress = useCallback(
    (screen: string) => {
      console.log('📱 Navigate to screen:', screen);
      navigation.navigate(screen as never);
    },
    [navigation],
  );

  // Load submission statistics - optimized to prevent re-render loops
  const loadStats = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingStatsRef.current) {
      console.log('📊 Already loading stats, skipping...');
      return;
    }

    if (!userApiId || !apiInitialized) {
      console.log('📊 Skipping loadStats - missing requirements');
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      loadingStatsRef.current = true;
      setStats(prev => ({ ...prev, loading: true }));

      if (userApiId) {
        // Check for authentication token
        const authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!authToken) {
          console.log('🔐 No auth token found, skipping API call');
          setStats({
            totalSubmissions: 0,
            pendingSync: offlineDataLength,
            completedToday: 0,
            loading: false,
          });
          return;
        }

        // Proceed with API call since we have auth token
        // Get user submissions
        console.log('📊 Fetching submissions with userApiId:', userApiId);
        // Get total counts for pending and approved statuses in parallel
        const [pendingResponse, approvedResponse, allResponse] =
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
              limit: 10,
              userIds: [userApiId],
              sortBy: 'createdAt',
              sortOrder: 'DESC',
            }),
          ]);

        const submissionsResponse = {
          success: allResponse.success,
          data: {
            total: allResponse.data?.pagination?.total || 0,
            pending: pendingResponse.data?.pagination?.total || 0,
            approved: approvedResponse.data?.pagination?.total || 0,
          },
        };
        if (submissionsResponse.success && submissionsResponse.data) {
          setStats({
            totalSubmissions: submissionsResponse.data.total,
            pendingSync: submissionsResponse.data.pending,
            completedToday: submissionsResponse.data.approved,
            loading: false,
          });
        } else {
          setStats({
            totalSubmissions: 0,
            pendingSync: offlineDataLength,
            completedToday: 0,
            loading: false,
          });
        }
      } else {
        setStats({
          totalSubmissions: 0,
          pendingSync: offlineDataLength,
          completedToday: 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        error: error,
      });
      setStats({
        totalSubmissions: 0,
        pendingSync: offlineDataLength,
        completedToday: 0,
        loading: false,
      });
    } finally {
      loadingStatsRef.current = false;
    }
  }, [userApiId, apiInitialized, offlineDataLength]); // Include offlineDataLength for linter compliance

  // Load stats when component mounts and when screen is focused
  useEffect(() => {
    console.log('🎯 useEffect loadStats triggered');
    loadStats();
  }, [loadStats]);

  // Optimized focus effect to prevent unnecessary calls
  const focusEffectCallback = useCallback(() => {
    console.log('🎯 useFocusEffect triggered - screen focused');
    // Add a small delay to prevent rapid calls when switching tabs
    const timeoutId = setTimeout(() => {
      loadStats();
    }, 100);

    // Cleanup function called when screen loses focus
    return () => {
      console.log('🎯 useFocusEffect cleanup - screen unfocused');
      clearTimeout(timeoutId);
    };
  }, [loadStats]);

  useFocusEffect(focusEffectCallback);
  console.log('stats sagar 1', stats);
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Welcome to RISE
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Data Collection and User Feedback
          </Text>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsContainer}>
          {cardData.map(card => (
            <Card
              key={card.id}
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <TouchableOpacity
                onPress={() => handleCardPress(card.screen)}
                activeOpacity={0.7}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: card.color + '20' },
                      ]}
                    >
                      <Ionicons name={card.icon} size={32} color={card.color} />
                    </View>
                  </View>
                  <Title
                    style={[
                      styles.cardTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {card.title}
                  </Title>
                  <Paragraph
                    style={[
                      styles.cardDescription,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {card.description}
                  </Paragraph>
                </Card.Content>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleAddPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={theme.colors.onPrimary} />
            <Text
              style={[styles.addButtonText, { color: theme.colors.onPrimary }]}
            >
              Start Data Collection
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Section */}
        <Card
          style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Title
              style={[styles.statsTitle, { color: theme.colors.onSurface }]}
            >
              Quick Overview
            </Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: theme.colors.primary }]}
                >
                  {stats.loading ? '...' : stats.totalSubmissions}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Submissions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: theme.colors.secondary }]}
                >
                  {stats.loading ? '...' : stats.pendingSync}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Pending Sync
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.completedTodayNumber]}>
                  {stats.loading ? '...' : stats.completedToday}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Completed
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
});

// Add display name for debugging
HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardHeader: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButtonContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsCard: {
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  completedTodayNumber: {
    color: '#4caf50',
  },
});

export default HomeScreen;
