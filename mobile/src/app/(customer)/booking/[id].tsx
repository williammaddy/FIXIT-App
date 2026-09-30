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
import { reviewApi } from '@/services/reviewApi';
import { Booking, BookingStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Loading } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

export default function CustomerBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cancel Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review Form
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setErrorMsg(null);
    try {
      const res = await bookingApi.getById(id as string);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setErrorMsg('Unable to load booking details.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to load booking details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      const res = await bookingApi.updateStatus(booking._id, 'cancel');
      if (res.success && res.data) {
        setBooking(res.data);
        setIsCancelModalOpen(false);
      }
    } catch (e: any) {
      setErrorMsg('Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await reviewApi.create({
        bookingId: booking._id,
        rating: ratingVal,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewSubmitted(true);
      } else {
        setReviewError(res.message || 'Failed to submit review');
      }
    } catch (e: any) {
      setReviewError(e?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusMessage = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Request sent. Waiting for worker to accept.';
      case 'ACCEPTED':
        return 'Worker accepted your booking.';
      case 'STARTED':
        return 'Your service has started.';
      case 'COMPLETED':
        return 'Your service has been completed.';
      case 'REJECTED':
        return 'Worker declined your booking request.';
      case 'CANCELLED':
        return 'Booking has been cancelled.';
      default:
        return '';
    }
  };

  if (isLoading) return <Loading message="Loading booking..." />;
  if (errorMsg || !booking) return <ErrorMessage message={errorMsg || 'Booking not found'} onRetry={fetchBooking} />;

  const worker = booking.worker;
  const service = booking.service;

  // Timeline steps
  const steps = [
    { label: 'Request Sent', done: true },
    { label: 'Worker Accepted', done: ['ACCEPTED', 'STARTED', 'COMPLETED'].includes(booking.status) },
    { label: 'Service Started', done: ['STARTED', 'COMPLETED'].includes(booking.status) },
    { label: 'Completed', done: booking.status === 'COMPLETED' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={`Booking #${booking.bookingCode}`} showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.serviceName}>{service?.icon || '🛠️'} {service?.name}</Text>
            <StatusBadge status={booking.status} />
          </View>
          <Text style={styles.statusMessage}>{getStatusMessage(booking.status)}</Text>

          {/* Timeline */}
          {!['REJECTED', 'CANCELLED'].includes(booking.status) && (
            <View style={styles.timeline}>
              {steps.map((step, i) => (
                <View key={i} style={styles.timelineStep}>
                  <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                    {step.done && <Ionicons name="checkmark" size={10} color={COLORS.white} />}
                  </View>
                  <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                    {step.label}
                  </Text>
                  {i < steps.length - 1 && <View style={[styles.stepLine, step.done && styles.stepLineDone]} />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Worker Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assigned Professional</Text>
          <View style={styles.workerRow}>
            <Avatar uri={worker?.profileImage} name={worker?.name || 'Worker'} size={50} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker?.name}</Text>
              <Text style={styles.workerPhone}>{worker?.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callIconBtn}
              onPress={() => Linking.openURL(`tel:${worker?.phone}`)}
            >
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheduled Date & Time:</Text>
            <Text style={styles.detailVal}>{booking.scheduledDate} at {booking.scheduledTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailVal}>{booking.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Problem Description:</Text>
            <Text style={styles.detailVal}>{booking.description}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Total Price:</Text>
            <Text style={styles.priceVal}>₹{booking.price}</Text>
          </View>
        </View>

        {/* Review Form for COMPLETED bookings */}
        {booking.status === 'COMPLETED' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>
            {reviewSubmitted ? (
              <View style={styles.reviewSuccessBox}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.secondary} />
                <Text style={styles.reviewSuccessText}>Thank you! Your review has been submitted.</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.starLabel}>Select Rating (1 to 5 Stars):</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRatingVal(star)}>
                      <Ionicons
                        name={star <= ratingVal ? 'star' : 'star-outline'}
                        size={32}
                        color="#F59E0B"
                        style={{ marginHorizontal: 4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Input
                  placeholder="Write a comment about the service..."
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={2}
                />
                {reviewError ? <Text style={styles.reviewErr}>{reviewError}</Text> : null}
                <Button
                  title="Submit Review"
                  onPress={handleSubmitReview}
                  isLoading={isSubmittingReview}
                  style={{ marginTop: 8 }}
                />
              </View>
            )}
          </View>
        )}

        {/* Cancel Button */}
        {['PENDING', 'ACCEPTED'].includes(booking.status) && (
          <Button
            title="Cancel Booking"
            variant="danger"
            onPress={() => setIsCancelModalOpen(true)}
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        visible={isCancelModalOpen}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel"
        isDanger
        onConfirm={handleCancelBooking}
        onCancel={() => setIsCancelModalOpen(false)}
      />
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
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusMessage: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepDotDone: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  stepTextDone: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepLine: {
    position: 'absolute',
    top: 9,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepLineDone: {
    backgroundColor: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  workerPhone: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  callIconBtn: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
  },
  detailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  reviewSuccessBox: {
    alignItems: 'center',
    padding: 16,
  },
  reviewSuccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  starLabel: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewErr: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 8,
  },
});
