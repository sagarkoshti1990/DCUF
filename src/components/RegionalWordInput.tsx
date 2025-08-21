import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, HelperText } from 'react-native-paper';

interface RegionalWordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  error?: string;
  selectedMasterWord?: string;
}

const RegionalWordInput: React.FC<RegionalWordInputProps> = ({
  value,
  onChangeText,
  disabled = false,
  error,
  selectedMasterWord,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const validateInput = (text: string): string | undefined => {
    if (!text.trim()) {
      return 'Regional word is required';
    }

    if (text.trim().length < 2) {
      return 'Regional word must be at least 2 characters';
    }

    if (text.trim().length > 50) {
      return 'Regional word cannot exceed 50 characters';
    }

    // Basic validation for unwanted characters (keeping it simple for tribal languages)
    const hasInvalidChars = /[0-9!@#$%^&*()_+={}[\]|\\:";'<>?,./]/.test(text);
    if (hasInvalidChars) {
      return 'Please enter only letters and basic punctuation';
    }

    return undefined;
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const validationError = validateInput(value);
  const displayError = error || validationError;
  const hasError = Boolean(displayError && value.length > 0);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Regional/Tribal Word
        </Text>

        {selectedMasterWord && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextLabel}>Translation for:</Text>
            <Text style={styles.contextWord}>{selectedMasterWord}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            label="Enter word in your local language"
            value={value}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            mode="outlined"
            multiline={false}
            disabled={disabled}
            error={hasError}
            style={styles.textInput}
            contentStyle={styles.textInputContent}
            placeholder="Type the regional word here..."
            placeholderTextColor="#999"
            maxLength={50}
            autoCapitalize="words"
            autoCorrect={false}
            spellCheck={false}
          />

          <HelperText
            type={hasError ? 'error' : 'info'}
            visible={isFocused || hasError || value.length > 0}
            style={styles.helperText}
          >
            {hasError
              ? displayError
              : `${value.length}/50 characters${
                  isFocused
                    ? ' • Enter the word as spoken in your local dialect'
                    : ''
                }`}
          </HelperText>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>
            • Type the word exactly as it is spoken in your local
            language/dialect
          </Text>
          <Text style={styles.instructionText}>
            • Use the script you are most comfortable with
          </Text>
          <Text style={styles.instructionText}>
            • If unsure about spelling, write it phonetically
          </Text>
          <Text style={styles.instructionText}>
            • The audio recording will capture the correct pronunciation
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  contextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  contextLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  contextWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  textInputContent: {
    fontSize: 18,
    paddingVertical: 8,
  },
  helperText: {
    fontSize: 12,
  },
  instructionsContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default RegionalWordInput;
