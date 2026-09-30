import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { bookingApi } from '@/services/bookingApi';
import { Booking } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Loading } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

export default function WorkerJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    setErrorMsg(null);
    try {
      const res = await bookingApi.getById(id as string);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setErrorMsg('Unable to load job details.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load job details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJob();
  };

  const handleAction = async (action: 'accept' | 'reject' | 'start' | 'complete') => {
    if (!booking) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await bookingApi.updateStatus(booking._id, action);
      if (res.success && res.data) {
        setBooking(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || `Failed to ${action} job.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <Loading message="Loading job..." />;
  if (errorMsg || !booking) return <ErrorMessage message={errorMsg || 'Job not found'} onRetry={fetchJob} />;

  const customer = booking.customer;
  const service = booking.service;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={`Job #${booking.bookingCode}`} showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Header */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.serviceTitle}>{service?.icon || '🛠️'} {service?.name}</Text>
            <StatusBadge status={booking.status} />
          </View>
          <Text style={styles.priceTag}>Earnings: ₹{booking.price}</Text>
        </View>

        {/* Customer Contact */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Contact</Text>
          <View style={styles.custRow}>
            <Avatar uri={customer?.profileImage} name={customer?.name || 'Customer'} size={50} />
            <View style={styles.custInfo}>
              <Text style={styles.custName}>{customer?.name}</Text>
              <Text style={styles.custPhone}>{customer?.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${customer?.phone}`)}
            >
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Scheduled Date & Time:</Text>
            <Text style={styles.detailVal}>{booking.scheduledDate} at {booking.scheduledTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>Location Address:</Text>
            <Text style={styles.detailVal}>{booking.address}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLbl}>Problem Description:</Text>
            <Text style={styles.detailVal}>{booking.description}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {booking.status === 'ACCEPTED' && (
          <Button
            title="START SERVICE"
            onPress={() => handleAction('start')}
            isLoading={actionLoading}
            style={styles.actionBtn}
          />
        )}

        {booking.status === 'STARTED' && (
          <Button
            title="COMPLETE SERVICE"
            variant="secondary"
            onPress={() => handleAction('complete')}
            isLoading={actionLoading}
            style={styles.actionBtn}
          />
        )}

        {booking.status === 'PENDING' && (
          <View style={styles.pendingActions}>
            <Button
              title="Decline"
              variant="outline"
              onPress={() => handleAction('reject')}
              isLoading={actionLoading}
              style={{ flex: 1 }}
            />
            <Button
              title="Accept Job"
              variant="secondary"
              onPress={() => handleAction('accept')}
              isLoading={actionLoading}
              style={{ flex: 1 }}
            />
          </View>
        )}
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  custInfo: {
    flex: 1,
    marginLeft: 12,
  },
  custName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  custPhone: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLbl: {
    fontSize: 12,
    color: COLORS.muted,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 8,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
