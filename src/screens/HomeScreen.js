import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

// Safely import DataEntryForm with error handling
let DataEntryForm;
try {
  DataEntryForm = require('../components/forms/DataEntryForm').default;
} catch (error) {
  console.warn('DataEntryForm not available:', error);
  // Fallback component
  DataEntryForm = () => (
    <Text style={{ textAlign: 'center', padding: 20 }}>
      Form component is loading...
    </Text>
  );
}

const HomeScreen = ({ navigation }) => {
  try {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.welcomeCard}>
            <Card.Content>
              <Title style={styles.title}>Welcome to DCUF</Title>
              <Paragraph style={styles.description}>
                Data Collection and User Feedback application
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.formCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Data Entry Form</Title>
              <DataEntryForm />
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => console.log('Button pressed')}
              style={styles.button}
            >
              Get Started
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  } catch (error) {
    console.error('Error rendering HomeScreen:', error);
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Error loading home screen. Please restart the app.</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  formCard: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 8,
  },
});

export default HomeScreen;
