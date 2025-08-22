import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  List,
  ActivityIndicator,
  useTheme,
  Searchbar,
} from 'react-native-paper';
import { ApiLanguage } from '../types/api';
import { MasterWord } from '../types';
import { ApiWord } from '../types/api';
import { apiService } from '../services/apiService';

interface LanguageWordSelectorProps {
  selectedLanguage: ApiLanguage | null;
  selectedWord: MasterWord | null;
  onLanguageSelect: (language: ApiLanguage) => void;
  onWordSelect: (word: MasterWord) => void;
  disabled?: boolean;
  useApi?: boolean;
}

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
  const [searchQuery, setSearchQuery] = useState('');

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
      console.log('📝 API disabled, clearing words');
      setWords([]);
      return;
    }

    const isAuthenticated = await apiService.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, clearing words');
      setWords([]);
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
        // Ensure the API response matches MasterWord structure
        const wordsData: MasterWord[] = response.data.map(
          (apiWord: ApiWord) => ({
            wordId: apiWord.wordId,
            languageId: apiWord.languageId,
            word: apiWord.word,
            categoryId: apiWord.categoryId || 'N/A',
            status: apiWord.status,
          }),
        );
        setWords(wordsData);
        console.log(
          `✅ Loaded ${wordsData.length} words for language ${selectedLanguage.languageId}`,
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
  }, [useApi, selectedLanguage]);

  // Filter words based on search query only (removed category filter)
  const filteredWords = useMemo(() => {
    if (!words || !Array.isArray(words)) {
      return [];
    }

    let filtered = words;

    // Filter by search query only
    if (searchQuery) {
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [words, searchQuery]);

  // Load data effects
  useEffect(() => {
    if (useApi) {
      loadLanguages();
    }
  }, [useApi, loadLanguages]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // Handlers
  const handleLanguageSelect = (language: ApiLanguage) => {
    onLanguageSelect(language);
    setIsLanguageExpanded(false);
    // Clear word selection when language changes
    if (selectedWord) {
      // Reset search when language changes
      setSearchQuery('');
    }
  };

  const handleWordSelect = (word: MasterWord) => {
    onWordSelect(word);
    setIsWordExpanded(false);
    setSearchQuery('');
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

  const renderWordItem = ({ item }: { item: MasterWord }) => {
    const isSelected = selectedWord?.wordId === item.wordId;

    return (
      <List.Item
        title={item.word}
        description={
          <View>
            <Text style={styles.status}>Status: {item.status}</Text>
          </View>
        }
        onPress={() => handleWordSelect(item)}
        style={[styles.listItem, isSelected && styles.selectedListItem]}
        titleStyle={isSelected ? styles.selectedItemTitle : undefined}
        left={
          isSelected
            ? props => (
                <List.Icon
                  {...props}
                  icon="check-circle"
                  color={theme.colors.primary}
                />
              )
            : undefined
        }
      />
    );
  };

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
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
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
    status: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
      fontStyle: 'italic',
    },
    disabled: {
      opacity: 0.6,
    },
    selectedListItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginBottom: 8,
    },
    selectedItemTitle: {
      fontWeight: 'bold',
      color: theme.colors.primary,
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
                  title={`Word: ${selectedWord.word}`}
                  description={`Status: ${selectedWord.status}`}
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

                    {/* Words List */}
                    <View style={styles.listContainer}>
                      <FlatList
                        data={filteredWords}
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
