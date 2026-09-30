import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { bookingApi } from '../../services/bookingApi';
import { Booking } from '../../types';
import { BookingCard } from '../../components/BookingCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS } from '../../constants/colors';

type TabKey = 'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setErrorMsg(null);
    try {
      const statusArg = activeTab === 'ALL' ? undefined : activeTab;
      const res = await bookingApi.getAll(statusArg);
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setErrorMsg('Unable to load bookings.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load bookings.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const tabs: { label: string; key: TabKey }[] = [
    { label: 'All', key: 'ALL' },
    { label: 'Pending', key: 'PENDING' },
    { label: 'Active', key: 'ACCEPTED' },
    { label: 'Completed', key: 'COMPLETED' },
    { label: 'Cancelled', key: 'CANCELLED' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My Bookings" showBack={false} />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Loading message="Loading bookings..." />
      ) : errorMsg ? (
        <ErrorMessage message={errorMsg} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          message="You have no bookings under this filter."
          icon="calendar-outline"
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              userRole="customer"
              onPress={() => router.push(`/(customer)/booking/${item._id}`)}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
});
