import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workerApi } from '@/services/workerApi';
import { useBookingStore } from '@/store/bookingStore';
import { Worker, Service, Review } from '@/types';
import { Avatar } from '@/components/Avatar';
import { Rating } from '@/components/Rating';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Loading } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setDraft } = useBookingStore();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      workerApi
        .getProfile(id as string)
        .then((res) => {
          if (res.success && res.data) {
            setWorker(res.data);
          } else {
            setErrorMsg('Unable to load worker profile.');
          }
        })
        .catch(() => setErrorMsg('Unable to load worker profile.'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleBook = () => {
    if (worker && worker.services && worker.services.length > 0) {
      const firstSvc = worker.services[0];
      setDraft(worker, typeof firstSvc === 'object' ? (firstSvc as Service) : ({ _id: firstSvc, name: 'Service', icon: '🛠️' } as Service));
      router.push('/(customer)/booking/create');
    }
  };

  if (isLoading) return <Loading message="Loading profile..." />;
  if (errorMsg || !worker) return <ErrorMessage message={errorMsg || 'Worker not found'} />;

  const serviceList = Array.isArray(worker.services)
    ? worker.services.map((s: string | Service) => (typeof s === 'string' ? s : s.name)).join(', ')
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Professional Profile" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info */}
        <View style={styles.card}>
          <Avatar uri={worker.profileImage} name={worker.name} size={72} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            {worker.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.servicesText}>{serviceList}</Text>
          <Rating rating={worker.rating} reviewCount={worker.reviewCount} size={16} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{worker.experienceYears} Yrs</Text>
              <Text style={styles.statLbl}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{worker.completedJobs || 0}</Text>
              <Text style={styles.statLbl}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>₹{worker.startingPrice}</Text>
              <Text style={styles.statLbl}>Starting</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {worker.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{worker.bio}</Text>
          </View>
        ) : null}

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews ({worker.reviewCount})</Text>
          {worker.recentReviews && worker.recentReviews.length > 0 ? (
            worker.recentReviews.map((rev: Review) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{(rev.customer as any)?.name || 'Customer'}</Text>
                  <Rating rating={rev.rating} size={12} />
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet for this professional.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${worker.phone}`)}>
          <Ionicons name="call" size={20} color={COLORS.primary} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
        <Button title="Book Now" onPress={handleBook} style={styles.bookBtn} />
      </View>
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  servicesText: {
    fontSize: 14,
    color: COLORS.muted,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  section: {
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
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewComment: {
    fontSize: 13,
    color: COLORS.muted,
  },
  noReviews: {
    fontSize: 13,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookBtn: {
    flex: 1,
  },
});
