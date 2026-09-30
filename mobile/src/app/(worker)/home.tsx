import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useWorkerStore } from '../../store/workerStore';
import { workerApi } from '../../services/workerApi';
import { bookingApi } from '../../services/bookingApi';
import { Booking } from '../../types';
import { BookingCard } from '../../components/BookingCard';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, setProfile, updateAvailability } = useWorkerStore();

  const [stats, setStats] = useState({
    pendingRequests: 0,
    todaysJobs: 0,
    completedJobs: 0,
    rating: 0,
  });
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMsg(null);
    try {
      // Load Profile
      const pRes = await workerApi.getMyProfile();
      if (pRes.success && pRes.data) {
        setProfile(pRes.data);
      }

      // Load Stats
      const stRes = await workerApi.getStats();
      if (stRes.success && stRes.data) {
        setStats(stRes.data);
      }

      // Load Pending & Active Bookings
      const bRes = await bookingApi.getAll();
      if (bRes.success && bRes.data) {
        const pending = bRes.data.filter((b) => b.status === 'PENDING');
        const active = bRes.data.find((b) => ['ACCEPTED', 'STARTED'].includes(b.status));
        setPendingBookings(pending);
        setActiveBooking(active || null);
      }
    } catch (err: any) {
      setErrorMsg('Unable to load worker dashboard.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [setProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleAvailability = async (val: boolean) => {
    setIsToggling(true);
    try {
      const res = await workerApi.updateAvailability(val);
      if (res.success) {
        updateAvailability(val);
      }
    } catch (e) {
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) return <Loading message="Loading dashboard..." />;

  const isOnline = profile?.isAvailable ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.name || 'Worker'}</Text>
          </View>
          <View style={styles.toggleWrap}>
            <Text style={[styles.toggleText, isOnline && styles.toggleTextOnline]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleAvailability}
              disabled={isToggling}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {errorMsg ? <ErrorMessage message={errorMsg} onRetry={loadData} /> : null}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{stats.pendingRequests}</Text>
            <Text style={styles.statLbl}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{stats.todaysJobs}</Text>
            <Text style={styles.statLbl}>Today's Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{stats.completedJobs}</Text>
            <Text style={styles.statLbl}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>
              {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.statLbl}>Rating</Text>
          </View>
        </View>

        {/* Active Job Preview */}
        {activeBooking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Job</Text>
            <BookingCard
              booking={activeBooking}
              userRole="worker"
              onPress={() => router.push(`/(worker)/job/${activeBooking._id}`)}
            />
          </View>
        )}

        {/* Pending Requests Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests ({pendingBookings.length})</Text>
            <TouchableOpacity onPress={() => router.push('/(worker)/requests')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {pendingBookings.length === 0 ? (
            <Text style={styles.emptyText}>No pending requests right now.</Text>
          ) : (
            pendingBookings.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                userRole="worker"
                onPress={() => router.push(`/(worker)/job/${booking._id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.muted,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },
  toggleTextOnline: {
    color: COLORS.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
});
