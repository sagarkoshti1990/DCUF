import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Menu } from 'react-native-paper';
import { District, Tehsil, Village } from '../types';
import {
  mockDistricts,
  mockTehsils,
  mockVillages,
} from '../data/mockLocations';

interface LocationSelectorProps {
  selectedDistrict: District | null;
  selectedTehsil: Tehsil | null;
  selectedVillage: Village | null;
  onDistrictChange: (district: District | null) => void;
  onTehsilChange: (tehsil: Tehsil | null) => void;
  onVillageChange: (village: Village | null) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedDistrict,
  selectedTehsil,
  selectedVillage,
  onDistrictChange,
  onTehsilChange,
  onVillageChange,
}) => {
  const [availableTehsils, setAvailableTehsils] = useState<Tehsil[]>([]);
  const [availableVillages, setAvailableVillages] = useState<Village[]>([]);

  // Menu visibility states
  const [districtMenuVisible, setDistrictMenuVisible] = useState(false);
  const [tehsilMenuVisible, setTehsilMenuVisible] = useState(false);
  const [villageMenuVisible, setVillageMenuVisible] = useState(false);

  // Update available tehsils when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const filteredTehsils = mockTehsils.filter(
        tehsil => tehsil.districtId === selectedDistrict.id,
      );
      setAvailableTehsils(filteredTehsils);
    } else {
      setAvailableTehsils([]);
    }
    // Reset tehsil and village when district changes
    onTehsilChange(null);
    onVillageChange(null);
  }, [selectedDistrict, onTehsilChange, onVillageChange]);

  // Update available villages when tehsil changes
  useEffect(() => {
    if (selectedTehsil) {
      const filteredVillages = mockVillages.filter(
        village => village.tehsilId === selectedTehsil.id,
      );
      setAvailableVillages(filteredVillages);
    } else {
      setAvailableVillages([]);
    }
    // Reset village when tehsil changes
    onVillageChange(null);
  }, [selectedTehsil, onVillageChange]);

  const handleDistrictSelect = (district: District) => {
    onDistrictChange(district);
    setDistrictMenuVisible(false);
  };

  const handleTehsilSelect = (tehsil: Tehsil) => {
    onTehsilChange(tehsil);
    setTehsilMenuVisible(false);
  };

  const handleVillageSelect = (village: Village) => {
    onVillageChange(village);
    setVillageMenuVisible(false);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Select Location
        </Text>

        {/* District Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>District *</Text>
          <Menu
            visible={districtMenuVisible}
            onDismiss={() => setDistrictMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDistrictMenuVisible(true)}
                style={styles.dropdownButton}
                contentStyle={styles.dropdownButtonContent}
                icon="chevron-down"
              >
                {selectedDistrict
                  ? selectedDistrict.name
                  : 'Select District...'}
              </Button>
            }
          >
            {mockDistricts.map(district => (
              <Menu.Item
                key={district.id}
                title={district.name}
                onPress={() => handleDistrictSelect(district)}
              />
            ))}
          </Menu>
        </View>

        {/* Tehsil Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Tehsil *</Text>
          <Menu
            visible={tehsilMenuVisible}
            onDismiss={() => setTehsilMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setTehsilMenuVisible(true)}
                style={styles.dropdownButton}
                contentStyle={styles.dropdownButtonContent}
                icon="chevron-down"
                disabled={!selectedDistrict}
              >
                {selectedTehsil
                  ? selectedTehsil.name
                  : selectedDistrict
                  ? 'Select Tehsil...'
                  : 'Select District first'}
              </Button>
            }
          >
            {availableTehsils.map(tehsil => (
              <Menu.Item
                key={tehsil.id}
                title={tehsil.name}
                onPress={() => handleTehsilSelect(tehsil)}
              />
            ))}
          </Menu>
        </View>

        {/* Village Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Village *</Text>
          <Menu
            visible={villageMenuVisible}
            onDismiss={() => setVillageMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setVillageMenuVisible(true)}
                style={styles.dropdownButton}
                contentStyle={styles.dropdownButtonContent}
                icon="chevron-down"
                disabled={!selectedTehsil}
              >
                {selectedVillage
                  ? selectedVillage.name
                  : selectedTehsil
                  ? 'Select Village...'
                  : 'Select Tehsil first'}
              </Button>
            }
          >
            {availableVillages.map(village => (
              <Menu.Item
                key={village.id}
                title={village.name}
                onPress={() => handleVillageSelect(village)}
              />
            ))}
          </Menu>
        </View>
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
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  dropdownButton: {
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});

export default LocationSelector;
