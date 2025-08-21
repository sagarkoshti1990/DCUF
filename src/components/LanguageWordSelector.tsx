import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  List,
  ActivityIndicator,
  useTheme,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { ApiLanguage } from '../types/api';
import { MasterWord } from '../types';
import { ApiWord } from '../types/api';
import { apiService } from '../services/apiService';
import { mockWords } from '../data/mockWords';

interface LanguageWordSelectorProps {
  selectedLanguage: ApiLanguage | null;
  selectedWord: MasterWord | null;
  onLanguageSelect: (language: ApiLanguage) => void;
  onWordSelect: (word: MasterWord) => void;
  disabled?: boolean;
  useApi?: boolean;
}

// Helper function to convert API word to legacy format
const convertApiWordToLegacy = (apiWord: ApiWord): MasterWord => ({
  id: parseInt(apiWord.id, 10) || 0,
  english: apiWord.english,
  marathi: apiWord.marathi || '',
  hindi: apiWord.hindi || '',
  category: apiWord.category || 'General',
  apiId: apiWord.id,
});

const LanguageWordSelector: React.FC<LanguageWordSelectorProps> = ({
  selectedLanguage,
  selectedWord,
  onLanguageSelect,
  onWordSelect,
  disabled = false,
  useApi = true,
}) => {
  const theme = useTheme();
  const [languages, setLanguages] = useState<ApiLanguage[]>([]);
  const [words, setWords] = useState<MasterWord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // UI state
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isWordExpanded, setIsWordExpanded] = useState(false);

  // Loading states
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);

  // Load languages from API
  const loadLanguages = useCallback(async () => {
    if (!useApi) return;

    const isAuthenticated = await apiService.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping language loading');
      return;
    }

    setLoadingLanguages(true);
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
      setLoadingLanguages(false);
    }
  }, [useApi]);

  // Load words based on selected language
  const loadWords = useCallback(async () => {
    if (!useApi) {
      setWords(mockWords);
      return;
    }

    const isAuthenticated = await apiService.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, using mock words');
      setWords(mockWords);
      return;
    }

    if (!selectedLanguage) {
      console.log('📝 No language selected, clearing words');
      setWords([]);
      return;
    }

    setLoadingWords(true);
    try {
      const response = await apiService.words.getAllWordsForLanguage(
        selectedLanguage.languageId,
      );
      if (response.success && response.data) {
        const legacyWords = response.data.map(convertApiWordToLegacy);
        setWords(legacyWords);
        console.log(
          `✅ Loaded ${legacyWords.length} words for language ${selectedLanguage.languageId}`,
        );
      } else {
        console.warn(
          'Failed to load words from API, falling back to mock data:',
          response.error,
        );
        setWords(mockWords);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      setWords(mockWords);
    } finally {
      setLoadingWords(false);
    }
  }, [useApi, selectedLanguage]);

  // Load categories based on current words
  const loadCategories = useCallback(() => {
    if (!words || words.length === 0) {
      setCategories([]);
      return;
    }

    const uniqueCategories = Array.from(
      new Set(words.map(word => word.category)),
    );
    setCategories(uniqueCategories.sort());
  }, [words]);

  // Load data effects
  useEffect(() => {
    if (useApi) {
      loadLanguages();
    }
  }, [useApi, loadLanguages]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filter words based on search query and category
  const filteredWords = useMemo(() => {
    if (!words || !Array.isArray(words)) {
      return [];
    }

    let filtered = words;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        word =>
          word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (word.marathi &&
            word.marathi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (word.hindi &&
            word.hindi.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    return filtered;
  }, [words, searchQuery, selectedCategory]);

  // Handlers
  const handleLanguageSelect = (language: ApiLanguage) => {
    onLanguageSelect(language);
    setIsLanguageExpanded(false);
    // Clear word selection when language changes
    if (selectedWord) {
      // Reset search and filters when language changes
      setSearchQuery('');
      setSelectedCategory(null);
    }
  };

  const handleWordSelect = (word: MasterWord) => {
    onWordSelect(word);
    setIsWordExpanded(false);
    setSearchQuery('');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Render functions
  const renderLanguageItem = ({ item }: { item: ApiLanguage }) => (
    <List.Item
      title={item.name}
      description={item.status ? `Status: ${item.status}` : undefined}
      onPress={() => handleLanguageSelect(item)}
      style={styles.listItem}
    />
  );

  const renderWordItem = ({ item }: { item: MasterWord }) => (
    <List.Item
      title={item.english}
      description={
        <View>
          {item.marathi && (
            <Text style={styles.translation}>मराठी: {item.marathi}</Text>
          )}
          {item.hindi && (
            <Text style={styles.translation}>हिंदी: {item.hindi}</Text>
          )}
          <Text style={styles.category}>Category: {item.category}</Text>
        </View>
      }
      onPress={() => handleWordSelect(item)}
      style={styles.listItem}
    />
  );

  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    selectedContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginBottom: 8,
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
    listContainer: {
      maxHeight: 200,
    },
    listItem: {
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
    searchBar: {
      marginBottom: 16,
    },
    categoryContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    clearFilters: {
      color: theme.colors.primary,
      textAlign: 'center',
      marginTop: 8,
      textDecorationLine: 'underline',
    },
    translation: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    category: {
      fontSize: 10,
      color: theme.colors.outline,
      marginTop: 4,
      fontStyle: 'italic',
    },
    disabled: {
      opacity: 0.6,
    },
  });

  return (
    <Card style={[styles.card, disabled && styles.disabled]}>
      <Card.Content>
        {/* Language Selection Section */}
        <Text style={styles.sectionTitle}>Language & Word Selection *</Text>
        <Text style={styles.sectionSubtitle}>
          First select a language, then choose a word for data collection
        </Text>

        {/* Selected Language */}
        {selectedLanguage && (
          <View style={styles.selectedContainer}>
            <List.Item
              title={`Language: ${selectedLanguage.name}`}
              description={
                selectedLanguage.status
                  ? `Status: ${selectedLanguage.status}`
                  : undefined
              }
              left={props => <List.Icon {...props} icon="translate" />}
              right={props => (
                <List.Icon
                  {...props}
                  icon={isLanguageExpanded ? 'chevron-up' : 'chevron-down'}
                />
              )}
              onPress={() =>
                !disabled && setIsLanguageExpanded(!isLanguageExpanded)
              }
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
                icon={isLanguageExpanded ? 'chevron-up' : 'chevron-down'}
              />
            )}
            onPress={() =>
              !disabled && setIsLanguageExpanded(!isLanguageExpanded)
            }
            disabled={disabled}
          />
        )}

        {/* Expanded Language List */}
        {isLanguageExpanded && (
          <View style={styles.expandedContainer}>
            {loadingLanguages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading languages...</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                <FlatList
                  data={languages}
                  renderItem={renderLanguageItem}
                  keyExtractor={item => item.languageId}
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

        {/* Word Selection Section */}
        {selectedLanguage && (
          <>
            {/* Selected Word */}
            {selectedWord && (
              <View style={[styles.selectedContainer, { marginTop: 16 }]}>
                <List.Item
                  title={`Word: ${selectedWord.english}`}
                  description={`${selectedWord.marathi || ''} ${
                    selectedWord.hindi || ''
                  }`.trim()}
                  left={props => (
                    <List.Icon {...props} icon="book-open-variant" />
                  )}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={isWordExpanded ? 'chevron-up' : 'chevron-down'}
                    />
                  )}
                  onPress={() =>
                    !disabled && setIsWordExpanded(!isWordExpanded)
                  }
                  disabled={disabled}
                />
              </View>
            )}

            {/* No Word Selected */}
            {!selectedWord && (
              <List.Item
                title="Select a word"
                description={`${words.length} words available`}
                left={props => (
                  <List.Icon {...props} icon="book-open-variant" />
                )}
                right={props => (
                  <List.Icon
                    {...props}
                    icon={isWordExpanded ? 'chevron-up' : 'chevron-down'}
                  />
                )}
                onPress={() => !disabled && setIsWordExpanded(!isWordExpanded)}
                disabled={disabled}
                style={{ marginTop: 16 }}
              />
            )}

            {/* Expanded Word List */}
            {isWordExpanded && (
              <View style={styles.expandedContainer}>
                {loadingWords ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Loading words...</Text>
                  </View>
                ) : (
                  <>
                    {/* Search Bar */}
                    <Searchbar
                      placeholder="Search words..."
                      onChangeText={setSearchQuery}
                      value={searchQuery}
                      style={styles.searchBar}
                    />

                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <View style={styles.categoryContainer}>
                        <Text style={styles.label}>Filter by Category</Text>
                        <View style={styles.chipContainer}>
                          {categories.map(category => (
                            <Chip
                              key={category}
                              selected={selectedCategory === category}
                              onPress={() => handleCategorySelect(category)}
                              style={styles.chip}
                            >
                              {category}
                            </Chip>
                          ))}
                        </View>
                        {(searchQuery || selectedCategory) && (
                          <Text
                            style={styles.clearFilters}
                            onPress={clearFilters}
                          >
                            Clear Filters
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Words List */}
                    <View style={styles.listContainer}>
                      <FlatList
                        data={filteredWords}
                        renderItem={renderWordItem}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={true}
                        ListEmptyComponent={
                          <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                              {words.length === 0
                                ? 'No words available for this language'
                                : 'No words match your search'}
                            </Text>
                          </View>
                        }
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
};

export default LanguageWordSelector;
