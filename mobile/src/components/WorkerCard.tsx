import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Worker } from '../types';
import { Avatar } from './Avatar';
import { Rating } from './Rating';
import { Button } from './Button';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface WorkerCardProps {
  worker: Worker;
  onViewProfile: () => void;
  onCall: () => void;
  onBook: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onViewProfile,
  onCall,
  onBook,
}) => {
  const serviceNames = Array.isArray(worker.services)
    ? worker.services.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')
    : '';

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.topSection} onPress={onViewProfile} activeOpacity={0.85}>
        <Avatar uri={worker.profileImage} name={worker.name} size={54} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            {worker.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.servicesText} numberOfLines={1}>
            {serviceNames}
          </Text>
          <View style={styles.metaRow}>
            <Rating rating={worker.rating} reviewCount={worker.reviewCount} />
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{worker.experienceYears} yrs exp</Text>
            {worker.distance !== undefined && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.distanceText}>{worker.distance} km away</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>₹{worker.startingPrice}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onCall}>
            <Ionicons name="call" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <Button title="Book Now" onPress={onBook} style={styles.bookBtn} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  servicesText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  dot: {
    color: COLORS.muted,
    marginHorizontal: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  bookBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
