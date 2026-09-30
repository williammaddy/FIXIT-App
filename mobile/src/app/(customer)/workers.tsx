import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workerApi } from '../../services/workerApi';
import { serviceApi } from '../../services/serviceApi';
import { useLocationStore } from '../../store/locationStore';
import { useBookingStore } from '../../store/bookingStore';
import { Worker, Service } from '../../types';
import { WorkerCard } from '../../components/WorkerCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS } from '../../constants/colors';
import * as Linking from 'expo-linking';

type SortOption = 'nearest' | 'rating' | 'price' | 'experience';

export default function WorkersListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceName = (params.service as string) || 'AC Repair';
  const { latitude, longitude } = useLocationStore();
  const { setDraft } = useBookingStore();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [sort, setSort] = useState<SortOption>('nearest');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Find service object
      const sRes = await serviceApi.getServices();
      if (sRes.success && sRes.data) {
        const found = sRes.data.find(
          (s) => s.name.toLowerCase() === serviceName.toLowerCase()
        );
        if (found) setSelectedService(found);
      }

      const res = await workerApi.getNearby({
        service: serviceName,
        latitude,
        longitude,
        radius: 10000,
        sort,
      });
      if (res.success && res.data) {
        setWorkers(res.data);
      } else {
        setErrorMsg('Unable to load workers.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load workers.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceName, latitude, longitude, sort]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleBook = (worker: Worker) => {
    if (selectedService) {
      setDraft(worker, selectedService);
      router.push('/(customer)/booking/create');
    }
  };

  const sortChips: { label: string; value: SortOption }[] = [
    { label: 'Nearest', value: 'nearest' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Price (Low)', value: 'price' },
    { label: 'Experience', value: 'experience' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={`${serviceName} Experts`} showBack />

      {/* Sort Filter Chips */}
      <View style={styles.filterBar}>
        {sortChips.map((chip) => (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, sort === chip.value && styles.chipActive]}
            onPress={() => setSort(chip.value)}
          >
            <Text style={[styles.chipText, sort === chip.value && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Loading message="Finding professionals near you..." />
      ) : errorMsg ? (
        <ErrorMessage message={errorMsg} onRetry={fetchWorkers} />
      ) : workers.length === 0 ? (
        <EmptyState
          title="No Workers Found"
          message="No workers found for this service."
          icon="people-outline"
        />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onViewProfile={() => router.push(`/(customer)/worker/${item.id}`)}
              onCall={() => Linking.openURL(`tel:${item.phone}`)}
              onBook={() => handleBook(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
  },
});
