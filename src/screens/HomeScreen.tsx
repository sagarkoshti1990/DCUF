import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const cardData = [
    {
      id: 1,
      title: 'Data Collection',
      description: 'Collect regional words and audio recordings',
      icon: 'mic-outline',
      color: theme.colors.primary,
    },
    {
      id: 2,
      title: 'Submissions',
      description: 'View and manage your submitted data',
      icon: 'list-outline',
      color: theme.colors.secondary,
    },
    {
      id: 3,
      title: 'Progress',
      description: 'Track your collection progress',
      icon: 'stats-chart-outline',
      color: '#4caf50',
    },
    {
      id: 4,
      title: 'Settings',
      description: 'Manage your app preferences',
      icon: 'settings-outline',
      color: '#ff9800',
    },
  ];

  const handleAddPress = () => {
    // Navigate to DataEntry screen (data collection/submission page)
    navigation.navigate('DataEntry' as never);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Welcome to DCUF
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
                  style={[styles.cardTitle, { color: theme.colors.onSurface }]}
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
                  0
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
                  0
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
                <Text style={[styles.statNumber, { color: '#4caf50' }]}>0</Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Completed Today
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

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
});

export default HomeScreen;
