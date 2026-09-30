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

type TabKey = 'ALL' | 'ACCEPTED' | 'STARTED' | 'COMPLETED';

export default function WorkerJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setErrorMsg(null);
    try {
      const statusArg = activeTab === 'ALL' ? undefined : activeTab;
      const res = await bookingApi.getAll(statusArg);
      if (res.success && res.data) {
        // Exclude pending and rejected from jobs view if ALL is selected
        const filtered = activeTab === 'ALL'
          ? res.data.filter((b) => ['ACCEPTED', 'STARTED', 'COMPLETED'].includes(b.status))
          : res.data;
        setJobs(filtered);
      } else {
        setErrorMsg('Unable to load jobs.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load jobs.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const tabs: { label: string; key: TabKey }[] = [
    { label: 'All Jobs', key: 'ALL' },
    { label: 'Upcoming', key: 'ACCEPTED' },
    { label: 'Active', key: 'STARTED' },
    { label: 'Completed', key: 'COMPLETED' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Assigned Jobs" showBack={false} />

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
        <Loading message="Loading jobs..." />
      ) : errorMsg ? (
        <ErrorMessage message={errorMsg} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Jobs Found"
          message="You have no jobs matching this status."
          icon="briefcase-outline"
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              userRole="worker"
              onPress={() => router.push(`/(worker)/job/${item._id}`)}
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
