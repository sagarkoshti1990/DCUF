import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  List,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { ApiLanguage } from '../types/api';
import { apiService } from '../services/apiService';

interface LanguageDropdownProps {
  selectedLanguage: ApiLanguage | null;
  onLanguageSelect: (language: ApiLanguage) => void;
  disabled?: boolean;
  useApi?: boolean;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onLanguageSelect,
  disabled = false,
  useApi = true,
}) => {
  const theme = useTheme();
  const [languages, setLanguages] = useState<ApiLanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load languages from API
  const loadLanguages = useCallback(async () => {
    if (!useApi) return;

    // Check if user is authenticated before making API calls
    const isAuthenticated = await apiService.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping language loading');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.languages.getAllLanguages();
      if (response.success && response.data) {
        setLanguages(response.data);
        console.log('✅ Languages loaded successfully:', response.data.length);
      } else {
        console.warn('Failed to load languages:', response.error);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  // Load data on component mount
  useEffect(() => {
    if (useApi) {
      loadLanguages();
    }
  }, [useApi, loadLanguages]);

  const handleLanguageSelect = (language: ApiLanguage) => {
    onLanguageSelect(language);
    setIsExpanded(false);
  };

  const renderLanguageItem = ({ item }: { item: ApiLanguage }) => (
    <List.Item
      title={item.name}
      description={item.code ? `Code: ${item.code}` : undefined}
      onPress={() => handleLanguageSelect(item)}
      style={styles.languageItem}
      titleStyle={{ fontSize: 16 }}
      descriptionStyle={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
    />
  );

  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    selectedLanguageContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginBottom: 8,
    },
    disabled: {
      opacity: 0.6,
    },
    expandedContainer: {
      marginTop: 8,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 8,
      color: theme.colors.onSurfaceVariant,
    },
    languagesList: {
      maxHeight: 200,
    },
    languageItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <Card style={[styles.card, disabled && styles.disabled]}>
      <Card.Content>
        <Text style={styles.title}>Select Language *</Text>
        <Text style={styles.subtitle}>
          Choose the language for word collection
        </Text>

        {/* Selected Language */}
        {selectedLanguage && (
          <View style={styles.selectedLanguageContainer}>
            <List.Item
              title={selectedLanguage.name}
              description={
                selectedLanguage.code
                  ? `Code: ${selectedLanguage.code}`
                  : undefined
              }
              left={props => <List.Icon {...props} icon="translate" />}
              right={props => (
                <List.Icon
                  {...props}
                  icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                />
              )}
              onPress={() => !disabled && setIsExpanded(!isExpanded)}
              disabled={disabled}
            />
          </View>
        )}

        {/* No Language Selected */}
        {!selectedLanguage && (
          <List.Item
            title="Select a language"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => (
              <List.Icon
                {...props}
                icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              />
            )}
            onPress={() => !disabled && setIsExpanded(!isExpanded)}
            disabled={disabled}
          />
        )}

        {/* Expanded Language List */}
        {isExpanded && (
          <View style={styles.expandedContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading languages...</Text>
              </View>
            ) : (
              <View style={styles.languagesList}>
                <FlatList
                  data={languages}
                  renderItem={renderLanguageItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        No languages available
                      </Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default LanguageDropdown;
