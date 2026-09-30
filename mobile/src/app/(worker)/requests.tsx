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
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS } from '../../constants/colors';

export default function WorkerRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reject Modal
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await bookingApi.getAll('PENDING');
      if (res.success && res.data) {
        setRequests(res.data);
      } else {
        setErrorMsg('Unable to load requests.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load requests.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAccept = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await bookingApi.updateStatus(bookingId, 'accept');
      if (res.success) {
        fetchRequests();
      }
    } catch (e) {
      setErrorMsg('Failed to accept booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingBookingId) return;
    setActionLoadingId(rejectingBookingId);
    try {
      const res = await bookingApi.updateStatus(rejectingBookingId, 'reject');
      if (res.success) {
        setRejectingBookingId(null);
        fetchRequests();
      }
    } catch (e) {
      setErrorMsg('Failed to reject booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Pending Requests" showBack={false} />

      {isLoading ? (
        <Loading message="Loading pending requests..." />
      ) : errorMsg ? (
        <ErrorMessage message={errorMsg} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No Requests"
          message="You have no pending booking requests right now."
          icon="notifications-off-outline"
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(worker)/job/${item._id}`)}
              activeOpacity={0.9}
            >
              <View style={styles.header}>
                <Text style={styles.serviceName}>
                  {item.service?.icon || '🛠️'} {item.service?.name}
                </Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>

              <View style={styles.customerRow}>
                <Avatar uri={item.customer?.profileImage} name={item.customer?.name || 'Customer'} size={40} />
                <View style={styles.custInfo}>
                  <Text style={styles.custName}>{item.customer?.name}</Text>
                  <Text style={styles.custPhone}>{item.customer?.phone}</Text>
                </View>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.descText} numberOfLines={2}>
                  Problem: {item.description}
                </Text>
                <Text style={styles.dateTimeText}>
                  Scheduled: {item.scheduledDate} at {item.scheduledTime}
                </Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  Location: {item.address}
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Reject"
                  variant="outline"
                  onPress={() => setRejectingBookingId(item._id)}
                  style={styles.btn}
                />
                <Button
                  title="Accept"
                  variant="secondary"
                  onPress={() => handleAccept(item._id)}
                  isLoading={actionLoadingId === item._id}
                  style={styles.btn}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Confirm Reject Modal */}
      <ConfirmDialog
        visible={Boolean(rejectingBookingId)}
        title="Decline Request"
        message="Are you sure you want to decline this booking request?"
        confirmText="Decline"
        isDanger
        onConfirm={handleReject}
        onCancel={() => setRejectingBookingId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  custInfo: {
    marginLeft: 10,
  },
  custName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  custPhone: {
    fontSize: 12,
    color: COLORS.muted,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  descText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});
