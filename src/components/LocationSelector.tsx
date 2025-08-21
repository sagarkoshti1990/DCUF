import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Divider,
  Surface,
} from 'react-native-paper';
import { District, Tehsil, Village } from '../types';
import { apiService } from '../services/apiService';
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
  useApi?: boolean; // Flag to switch between API and mock data
}

// Custom Modal Picker Component
interface ModalPickerProps {
  visible: boolean;
  title: string;
  items: Array<{ id: string; name: string }>;
  selectedItem: { id: string; name: string } | null;
  onSelect: (item: any) => void;
  onDismiss: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

const ModalPicker: React.FC<ModalPickerProps> = ({
  visible,
  title,
  items,
  selectedItem,
  onSelect,
  onDismiss,
  loading = false,
  emptyMessage = 'No items available',
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <Surface style={styles.modalSurface}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Divider style={styles.modalDivider} />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : items?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalScroll}>
              {items?.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.modalItem,
                    selectedItem?.id === item.id && styles.selectedModalItem,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onDismiss();
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedItem?.id === item.id &&
                        styles.selectedModalItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Divider style={styles.modalDivider} />
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Surface>
      </View>
    </Modal>
  );
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedDistrict,
  selectedTehsil,
  selectedVillage,
  onDistrictChange,
  onTehsilChange,
  onVillageChange,
  useApi = true, // Default to using API
}) => {
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableTehsils, setAvailableTehsils] = useState<Tehsil[]>([]);
  const [availableVillages, setAvailableVillages] = useState<Village[]>([]);

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTehsils, setLoadingTehsils] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Menu visibility states
  const [districtMenuVisible, setDistrictMenuVisible] = useState(false);
  const [tehsilMenuVisible, setTehsilMenuVisible] = useState(false);
  const [villageMenuVisible, setVillageMenuVisible] = useState(false);

  // Load districts
  const loadDistricts = useCallback(async () => {
    if (!useApi) {
      setAvailableDistricts(mockDistricts);
      return;
    }

    setLoadingDistricts(true);
    try {
      const response = await apiService.locations.getAllDistricts();
      if (response.success && response.data) {
        const legacyDistricts = response.data;
        setAvailableDistricts(legacyDistricts);
      } else {
        console.warn(
          'Failed to load districts from API, falling back to mock data',
        );
        setAvailableDistricts(mockDistricts);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      setAvailableDistricts(mockDistricts);
    } finally {
      setLoadingDistricts(false);
    }
  }, [useApi]);

  // Load tehsils for selected district
  const loadTehsils = useCallback(
    async (districtId: string) => {
      console.log('🛑 Loading tehsils for district: sagar', districtId);
      if (!useApi) {
        const filteredTehsils = mockTehsils.filter(
          tehsil => tehsil.districtId === districtId,
        );
        setAvailableTehsils(filteredTehsils);
        return;
      }

      setLoadingTehsils(true);
      try {
        const response = await apiService.locations.getTehsilsByDistrict(
          districtId,
        );
        if (response.success && response.data) {
          const legacyTehsils = response.data?.data.tehsils;
          setAvailableTehsils(legacyTehsils);
        } else {
          console.warn(
            'Failed to load tehsils from API, falling back to mock data',
          );
          const filteredTehsils = mockTehsils.filter(
            tehsil => tehsil.districtId === districtId,
          );
          setAvailableTehsils(filteredTehsils);
        }
      } catch (error) {
        console.error('Error loading tehsils:', error);
        const filteredTehsils = mockTehsils.filter(
          tehsil => tehsil.districtId === districtId,
        );
        setAvailableTehsils(filteredTehsils);
      } finally {
        setLoadingTehsils(false);
      }
    },
    [useApi],
  );

  // Load villages for selected tehsil
  const loadVillages = useCallback(
    async (tehsilId: string) => {
      if (!useApi) {
        const filteredVillages = mockVillages.filter(
          village => village.tehsilId === tehsilId,
        );
        setAvailableVillages(filteredVillages);
        return;
      }

      setLoadingVillages(true);
      try {
        const response = await apiService.locations.getVillagesByTehsil(
          tehsilId,
        );
        if (response.success && response.data) {
          const legacyVillages = response.data.data.villages;
          setAvailableVillages(legacyVillages);
        } else {
          console.warn(
            'Failed to load villages from API, falling back to mock data',
          );
          const filteredVillages = mockVillages.filter(
            village => village.tehsilId === tehsilId,
          );
          setAvailableVillages(filteredVillages);
        }
      } catch (error) {
        console.error('Error loading villages:', error);
        const filteredVillages = mockVillages.filter(
          village => village.tehsilId === tehsilId,
        );
        setAvailableVillages(filteredVillages);
      } finally {
        setLoadingVillages(false);
      }
    },
    [useApi],
  );

  // Handle district selection
  const handleDistrictSelect = useCallback(
    (district: District) => {
      onDistrictChange(district);
      setDistrictMenuVisible(false);
      setTehsilMenuVisible(false);
      setVillageMenuVisible(false);
      loadTehsils(district.districtId);
      onTehsilChange(null);
      onVillageChange(null);
    },
    [onDistrictChange, loadTehsils, onTehsilChange, onVillageChange],
  );

  // Handle tehsil selection
  const handleTehsilSelect = useCallback(
    (tehsil: Tehsil) => {
      onTehsilChange(tehsil);
      setTehsilMenuVisible(false);
      setVillageMenuVisible(false);
      loadVillages(tehsil.tehsilId);
      onVillageChange(null);
    },
    [onTehsilChange, loadVillages, onVillageChange],
  );

  // Handle village selection
  const handleVillageSelect = useCallback(
    (village: Village) => {
      onVillageChange(village);
      setVillageMenuVisible(false);
    },
    [onVillageChange],
  );

  // Load districts on component mount
  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  // Update available tehsils when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadTehsils(selectedDistrict.districtId);
    } else {
      setAvailableTehsils([]);
    }
    // Reset tehsil and village when district changes
    onTehsilChange(null);
    onVillageChange(null);
  }, [selectedDistrict, loadTehsils, onTehsilChange, onVillageChange]);

  // Update available villages when tehsil changes
  useEffect(() => {
    if (selectedTehsil) {
      loadVillages(selectedTehsil.tehsilId);
    } else {
      setAvailableVillages([]);
    }
    // Reset village when tehsil changes
    onVillageChange(null);
  }, [selectedTehsil, loadVillages, onVillageChange]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Select Location</Text>
        <Text style={styles.subtitle}>Choose District → Tehsil → Village</Text>

        {/* District Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>District</Text>
          <Button
            mode="outlined"
            onPress={() => setDistrictMenuVisible(true)}
            style={styles.button}
            disabled={loadingDistricts}
            icon={loadingDistricts ? undefined : 'chevron-down'}
          >
            {loadingDistricts ? (
              <ActivityIndicator size="small" />
            ) : (
              selectedDistrict?.name || 'Select District'
            )}
          </Button>
        </View>

        {/* Tehsil Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Tehsil</Text>
          <Button
            mode="outlined"
            onPress={() => setTehsilMenuVisible(true)}
            style={styles.button}
            disabled={!selectedDistrict || loadingTehsils}
            icon={loadingTehsils ? undefined : 'chevron-down'}
          >
            {loadingTehsils ? (
              <ActivityIndicator size="small" />
            ) : !selectedDistrict ? (
              'Select District First'
            ) : (
              selectedTehsil?.name || 'Select Tehsil'
            )}
          </Button>
        </View>

        {/* Village Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Village</Text>
          <Button
            mode="outlined"
            onPress={() => setVillageMenuVisible(true)}
            style={styles.button}
            disabled={!selectedTehsil || loadingVillages}
            icon={loadingVillages ? undefined : 'chevron-down'}
          >
            {loadingVillages ? (
              <ActivityIndicator size="small" />
            ) : !selectedTehsil ? (
              'Select Tehsil First'
            ) : (
              selectedVillage?.name || 'Select Village'
            )}
          </Button>
        </View>
      </Card.Content>

      <ModalPicker
        visible={districtMenuVisible}
        title="Select District"
        items={availableDistricts.map(d => ({
          id: d.districtId,
          name: d.name,
        }))}
        selectedItem={
          selectedDistrict
            ? { id: selectedDistrict.districtId, name: selectedDistrict.name }
            : null
        }
        onSelect={handleDistrictSelect}
        onDismiss={() => setDistrictMenuVisible(false)}
        loading={loadingDistricts}
        emptyMessage="No districts available"
      />

      <ModalPicker
        visible={tehsilMenuVisible}
        title="Select Tehsil"
        items={availableTehsils?.map(t => ({ id: t.tehsilId, name: t.name }))}
        selectedItem={
          selectedTehsil
            ? { id: selectedTehsil.tehsilId, name: selectedTehsil.name }
            : null
        }
        onSelect={handleTehsilSelect}
        onDismiss={() => setTehsilMenuVisible(false)}
        loading={loadingTehsils}
        emptyMessage="No tehsils available for this district"
      />

      <ModalPicker
        visible={villageMenuVisible}
        title="Select Village"
        items={availableVillages.map(v => ({ id: v.villageId, name: v.name }))}
        selectedItem={
          selectedVillage
            ? { id: selectedVillage.villageId, name: selectedVillage.name }
            : null
        }
        onSelect={handleVillageSelect}
        onDismiss={() => setVillageMenuVisible(false)}
        loading={loadingVillages}
        emptyMessage="No villages available for this tehsil"
      />
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
  selectorContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    justifyContent: 'flex-start',
  },
  menuContent: {
    maxHeight: 300,
  },
  emptyOptionText: {
    color: '#999',
    fontStyle: 'italic',
  },
  // New styles for ModalPicker
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSurface: {
    width: '90%',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDivider: {
    marginVertical: 10,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 250,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectedModalItem: {
    backgroundColor: '#e0e0e0',
  },
  modalItemText: {
    fontSize: 16,
  },
  selectedModalItemText: {
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 15,
  },
});

export default LocationSelector;
