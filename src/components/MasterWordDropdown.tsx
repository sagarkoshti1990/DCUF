import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  List,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { MasterWord } from '../types';
import { ApiWord } from '../types/api';
import { apiService } from '../services/apiService';

interface MasterWordDropdownProps {
  selectedWord: MasterWord | null;
  onWordSelect: (word: MasterWord) => void;
  disabled?: boolean;
  useApi?: boolean; // Flag to switch between API and mock data
  languageId?: string; // For API filtering
}

// Helper function to convert API word to legacy format
const convertApiWordToLegacy = (apiWord: ApiWord): MasterWord => {
  return {
    wordId: apiWord.wordId,
    languageId: apiWord.languageId,
    word: apiWord.word || '',
    categoryId: apiWord.categoryId || null,
    status: apiWord.status || 'active',
    createdAt: apiWord.createdAt,
    updatedAt: apiWord.updatedAt,
  };
};

const MasterWordDropdown: React.FC<MasterWordDropdownProps> = ({
  selectedWord,
  onWordSelect,
  disabled = false,
  useApi = true,
  languageId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // API state
  const [words, setWords] = useState<MasterWord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Loading states
  const [loadingWords, setLoadingWords] = useState(false);
  const [_loadingCategories, _setLoadingCategories] = useState(false);

  // Load words based on selected language
  const loadWords = useCallback(async () => {
    if (!useApi) {
      setWords([]); // Set empty array when API is disabled
      return;
    }

    // Check if user is authenticated before making API calls
    const isAuthenticated = await apiService.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, using empty word list');
      setWords([]);
      return;
    }

    if (!languageId) {
      console.log('📝 No language selected, clearing words');
      setWords([]);
      return;
    }

    setLoadingWords(true);
    try {
      const response = await apiService.words.getAllWordsForLanguage(
        languageId,
      );
      if (response.success && response.data) {
        const legacyWords = response.data.map(convertApiWordToLegacy);
        setWords(legacyWords);
        console.log(
          `✅ Loaded ${legacyWords.length} words for language ${languageId}`,
        );
      } else {
        console.warn('Failed to load words from API:', response.error);
        setWords([]);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      setWords([]);
    } finally {
      setLoadingWords(false);
    }
  }, [useApi, languageId]);

  // Load categories based on current words
  const loadCategories = useCallback(() => {
    if (words.length === 0) {
      setCategories([]);
      return;
    }

    // Extract unique categories from loaded words
    const uniqueCategories = Array.from(
      new Set(
        words
          .map(word => word.categoryId)
          .filter((cat): cat is string => cat !== null),
      ),
    );
    setCategories(uniqueCategories.sort());
  }, [words]);

  // Load words when language changes
  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // Load categories when words change
  useEffect(() => {
    if (words.length > 0) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [loadCategories, words.length]);

  // Add fallback effect to ensure words are always loaded
  useEffect(() => {
    if (!useApi && words.length === 0) {
      setWords([]);
    }
  }, [useApi, words.length]);

  // Combined filter for words based on search query and selected category
  const filteredWords = useMemo(() => {
    if (!words || !Array.isArray(words)) {
      return [];
    }

    return words.filter(
      word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedCategory || word.categoryId === selectedCategory),
    );
  }, [words, searchQuery, selectedCategory]);

  const handleWordSelect = (word: MasterWord) => {
    onWordSelect(word);
    setIsExpanded(false);
    setSearchQuery('');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const renderWordItem = ({ item }: { item: MasterWord }) => {
    const isSelected = selectedWord?.wordId === item.wordId;

    return (
      <List.Item
        title={item.word || 'Unknown Word'}
        description={
          <View>
            <Text style={styles.category}>
              Category: {item.categoryId || 'General'}
            </Text>
            <Text style={styles.wordId}>ID: {item.wordId}</Text>
          </View>
        }
        onPress={() => handleWordSelect(item)}
        style={[styles.wordItem, isSelected && styles.selectedWordItem]}
        titleStyle={isSelected ? styles.selectedWordTitle : undefined}
        left={
          isSelected
            ? props => (
                <List.Icon {...props} icon="check-circle" color="#1976d2" />
              )
            : undefined
        }
      />
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Select Word *</Text>
        <Text style={styles.subtitle}>
          {languageId
            ? `Choose a word from the selected language${
                words.length > 0 ? ` (${words.length} available)` : ''
              }`
            : 'Please select a language first to view available words'}
        </Text>

        {/* Selected Word */}
        {selectedWord && (
          <View style={styles.selectedWordContainer}>
            <List.Item
              title={selectedWord.word || 'Selected Word'}
              description={`Category: ${selectedWord.categoryId || 'General'}`}
              left={props => <List.Icon {...props} icon="book-open-variant" />}
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

        {/* No Word Selected */}
        {!selectedWord && (
          <List.Item
            title={disabled ? 'Select a language first' : 'Select a word'}
            left={props => <List.Icon {...props} icon="book-open-variant" />}
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

        {/* Expanded Word List */}
        {isExpanded && !disabled && (
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
                      <Text style={styles.clearFilters} onPress={clearFilters}>
                        Clear Filters
                      </Text>
                    )}
                  </View>
                )}

                {/* Words List */}
                <View style={styles.searchResults}>
                  <Text style={styles.resultCount}>
                    {filteredWords && Array.isArray(filteredWords)
                      ? `${filteredWords.length} words found`
                      : 'Loading words...'}
                  </Text>
                  <View style={styles.wordsList}>
                    <FlatList
                      data={
                        filteredWords && Array.isArray(filteredWords)
                          ? filteredWords
                          : []
                      }
                      renderItem={renderWordItem}
                      keyExtractor={item => item.wordId.toString()}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      initialNumToRender={8}
                      getItemLayout={(data, index) => ({
                        length: 56, // Approximate height of each item
                        offset: 56 * index,
                        index,
                      })}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>
                            {words && Array.isArray(words) && words.length === 0
                              ? !languageId
                                ? 'Select a language to view words'
                                : 'No words available for this language'
                              : 'No words match your search'}
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

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
    color: '#666',
    marginBottom: 16,
  },
  languageContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
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
  selectedWordContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  expandedContainer: {
    marginTop: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  clearFilters: {
    color: '#1976d2',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  searchResults: {
    marginTop: 8,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  wordsList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  wordItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedWordItem: {
    backgroundColor: '#e0f2f7', // A light blue background for selected items
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2', // A blue border for selected items
  },
  selectedWordTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  translation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  category: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  wordId: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MasterWordDropdown;
