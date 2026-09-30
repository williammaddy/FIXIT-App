import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { useBookingStore } from '../../store/bookingStore';
import { serviceApi } from '../../services/serviceApi';
import { workerApi } from '../../services/workerApi';
import { Service, Worker } from '../../types';
import { LocationHeader } from '../../components/LocationHeader';
import { SearchBar } from '../../components/SearchBar';
import { ServiceCard } from '../../components/ServiceCard';
import { WorkerCard } from '../../components/WorkerCard';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../constants/colors';
import * as Linking from 'expo-linking';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { latitude, longitude, setLocation, requestCurrentLocation } = useLocationStore();
  const { setDraft } = useBookingStore();

  const [services, setServices] = useState<Service[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<Worker[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Location Modal State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [manualLat, setManualLat] = useState(latitude.toString());
  const [manualLng, setManualLng] = useState(longitude.toString());
  const [manualAddr, setManualAddr] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(async () => {
    setErrorMsg(null);
    try {
      const sRes = await serviceApi.getServices();
      if (sRes.success && sRes.data) {
        setServices(sRes.data);

        // Load nearby workers for default service (e.g. AC Repair)
        const defaultService = sRes.data.find((s) => s.name === 'AC Repair') || sRes.data[0];
        if (defaultService) {
          const wRes = await workerApi.getNearby({
            service: defaultService.name,
            latitude,
            longitude,
            radius: 10000,
          });
          if (wRes.success && wRes.data) {
            setNearbyWorkers(wRes.data);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg('Unable to load services or workers.');
    } finally {
      setIsLoadingServices(false);
      setIsLoadingWorkers(false);
      setRefreshing(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSelectService = (service: Service) => {
    router.push({
      pathname: '/(customer)/workers',
      params: { service: service.name },
    });
  };

  const handleSaveLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation(lat, lng, manualAddr || `${lat}, ${lng}`);
      setIsLocModalOpen(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.nameText}>{user?.name || 'Customer'}</Text>
          </View>
          <LocationHeader onPressChange={() => setIsLocModalOpen(true)} />
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.9}
          style={styles.searchTouchable}
        >
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="What service do you need?"
          />
        </TouchableOpacity>

        {errorMsg ? <ErrorMessage message={errorMsg} onRetry={loadData} /> : null}

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingServices ? (
          <Loading message="Loading categories..." />
        ) : (
          <View style={styles.servicesGrid}>
            {services.slice(0, 8).map((service) => (
              <View key={service._id} style={styles.serviceItem}>
                <ServiceCard service={service} onPress={() => handleSelectService(service)} />
              </View>
            ))}
          </View>
        )}

        {/* Nearby Professionals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Professionals</Text>
        </View>

        {isLoadingWorkers ? (
          <Loading message="Finding professionals near you..." />
        ) : nearbyWorkers.length === 0 ? (
          <Text style={styles.emptyText}>No workers found nearby for popular services.</Text>
        ) : (
          nearbyWorkers.slice(0, 5).map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onViewProfile={() => router.push(`/(customer)/worker/${worker.id}`)}
              onCall={() => Linking.openURL(`tel:${worker.phone}`)}
              onBook={() => {
                const defaultSvc = services[0];
                if (defaultSvc) {
                  setDraft(worker, defaultSvc);
                  router.push('/(customer)/booking/create');
                }
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Manual Location Modal */}
      <Modal visible={isLocModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Your Location</Text>
            <Input label="Latitude" value={manualLat} onChangeText={setManualLat} keyboardType="numeric" />
            <Input label="Longitude" value={manualLng} onChangeText={setManualLng} keyboardType="numeric" />
            <Input label="Address / Landmark" value={manualAddr} onChangeText={setManualAddr} placeholder="e.g. Tiruppur Central" />
            
            <View style={styles.modalButtons}>
              <Button title="Use GPS Location" variant="outline" onPress={requestCurrentLocation} style={{ flex: 1 }} />
              <Button title="Save Location" onPress={handleSaveLocation} style={{ flex: 1 }} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsLocModalOpen(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  searchTouchable: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  serviceItem: {
    width: '25%',
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
});
