import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';

const DataEntryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Title>Data Entry</Title>
      <Text>Data collection form will be implemented here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DataEntryScreen;
