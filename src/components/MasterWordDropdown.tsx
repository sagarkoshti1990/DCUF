import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Searchbar, List, Chip } from 'react-native-paper';
import { MasterWord } from '../types';
import { mockWords } from '../data/mockWords';

interface MasterWordDropdownProps {
  selectedWord: MasterWord | null;
  onWordSelect: (word: MasterWord) => void;
  disabled?: boolean;
}

const MasterWordDropdown: React.FC<MasterWordDropdownProps> = ({
  selectedWord,
  onWordSelect,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(mockWords.map(word => word.category)),
    );
    return uniqueCategories.sort();
  }, []);

  // Filter words based on search query and category
  const filteredWords = useMemo(() => {
    return mockWords.filter(word => {
      const matchesSearch =
        word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.marathi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.hindi?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || word.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleWordSelect = (word: MasterWord) => {
    onWordSelect(word);
    setIsExpanded(false);
    setSearchQuery('');
  };

  const renderWordItem = ({ item }: { item: MasterWord }) => (
    <List.Item
      title={item.english}
      description={`${item.marathi || ''} • ${item.hindi || ''}`}
      right={() => (
        <Chip compact mode="outlined" style={styles.categoryChip}>
          {item.category}
        </Chip>
      )}
      onPress={() => handleWordSelect(item)}
      style={styles.wordItem}
    />
  );

  const renderCategoryChip = (category: string) => (
    <Chip
      key={category}
      mode={selectedCategory === category ? 'flat' : 'outlined'}
      onPress={() =>
        setSelectedCategory(selectedCategory === category ? null : category)
      }
      style={[
        styles.filterChip,
        selectedCategory === category && styles.selectedFilterChip,
      ]}
      compact
    >
      {category}
    </Chip>
  );

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Select Master Word
        </Text>

        {/* Selected word display */}
        {selectedWord && !isExpanded && (
          <View style={styles.selectedWordContainer}>
            <List.Item
              title={selectedWord.english}
              description={`${selectedWord.marathi || ''} • ${
                selectedWord.hindi || ''
              }`}
              right={() => (
                <Chip compact mode="outlined" style={styles.categoryChip}>
                  {selectedWord.category}
                </Chip>
              )}
              onPress={() => !disabled && setIsExpanded(true)}
              style={[styles.selectedWord, disabled && styles.disabled]}
            />
          </View>
        )}

        {/* Word selection interface */}
        {(!selectedWord || isExpanded) && (
          <View style={styles.selectionContainer}>
            {/* Search bar */}
            <Searchbar
              placeholder="Search words in English, Marathi, or Hindi..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              editable={!disabled}
            />

            {/* Category filters */}
            <View style={styles.filtersContainer}>
              <Text style={styles.filtersLabel}>Filter by category:</Text>
              <View style={styles.categoryChips}>
                {categories.map(renderCategoryChip)}
              </View>
            </View>

            {/* Words list */}
            <View style={styles.wordsContainer}>
              <Text style={styles.resultsText}>
                {filteredWords.length} words found
              </Text>
              <View style={styles.wordsListContainer}>
                <FlatList
                  data={filteredWords}
                  renderItem={renderWordItem}
                  keyExtractor={item => item.id.toString()}
                  style={styles.wordsList}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                />
              </View>
            </View>

            {/* Cancel button for expanded state */}
            {selectedWord && isExpanded && (
              <List.Item
                title="Cancel"
                left={props => <List.Icon {...props} icon="close" />}
                onPress={() => setIsExpanded(false)}
                style={styles.cancelButton}
              />
            )}
          </View>
        )}

        {/* Placeholder when no word selected */}
        {!selectedWord && !isExpanded && (
          <List.Item
            title="Tap to select a word"
            left={props => <List.Icon {...props} icon="plus" />}
            onPress={() => !disabled && setIsExpanded(true)}
            style={[styles.placeholder, disabled && styles.disabled]}
          />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  selectedWordContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  selectedWord: {
    backgroundColor: 'transparent',
  },
  selectionContainer: {
    minHeight: 200,
  },
  searchBar: {
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  selectedFilterChip: {
    backgroundColor: '#e3f2fd',
  },
  wordsContainer: {
    flex: 1,
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  wordsListContainer: {
    height: 300,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  wordsList: {
    flex: 1,
  },
  wordItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryChip: {
    marginLeft: 8,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default MasterWordDropdown;
