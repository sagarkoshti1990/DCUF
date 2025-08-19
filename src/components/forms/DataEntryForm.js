import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  RadioButton,
  Text,
} from 'react-native-paper';

// Import validation functions with error handling
let validateEmail, validatePhone;
try {
  const validation = require('../../utils/validation');
  validateEmail = validation.validateEmail;
  validatePhone = validation.validatePhone;
} catch (error) {
  console.warn('Validation functions not available:', error);
  // Fallback validation functions
  validateEmail = email => email && email.includes('@');
  validatePhone = phone => phone && phone.length >= 10;
}

const DataEntryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'feedback',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    try {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
    } catch (error) {
      console.error('Error in handleInputChange:', error);
    }
  };

  const validateForm = () => {
    try {
      const newErrors = {};

      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!formData.message || !formData.message.trim()) {
        newErrors.message = 'Message is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateForm:', error);
      return false;
    }
  };

  const handleSubmit = () => {
    try {
      if (validateForm()) {
        Alert.alert('Success', 'Form submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                phone: '',
                category: 'feedback',
                message: '',
              });
              setErrors({});
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  try {
    return (
      <View style={styles.container}>
        <TextInput
          label="Full Name"
          value={formData.name}
          onChangeText={text => handleInputChange('name', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="Email Address"
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!errors.email}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email}
        </HelperText>

        <TextInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          error={!!errors.phone}
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone}
        </HelperText>

        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Category:</Text>
          <RadioButton.Group
            onValueChange={value => handleInputChange('category', value)}
            value={formData.category}
          >
            <View style={styles.radioItem}>
              <RadioButton value="feedback" />
              <Text>Feedback</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="support" />
              <Text>Support</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="suggestion" />
              <Text>Suggestion</Text>
            </View>
          </RadioButton.Group>
        </View>

        <TextInput
          label="Message"
          value={formData.message}
          onChangeText={text => handleInputChange('message', text)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          error={!!errors.message}
        />
        <HelperText type="error" visible={!!errors.message}>
          {errors.message}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
        >
          Submit Form
        </Button>
      </View>
    );
  } catch (error) {
    console.error('Error rendering DataEntryForm:', error);
    return (
      <View style={styles.container}>
        <Text>Error loading form. Please restart the app.</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  radioContainer: {
    marginVertical: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  submitButton: {
    marginTop: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default DataEntryForm;
