import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking, UserRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { COLORS } from '../constants/colors';

interface BookingCardProps {
  booking: Booking;
  userRole: UserRole;
  onPress: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  userRole,
  onPress,
}) => {
  const otherUser = userRole === 'customer' ? booking.worker : booking.customer;
  const serviceName = booking.service?.name || 'Service';
  const serviceIcon = booking.service?.icon || '🛠️';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.serviceRow}>
          <Text style={styles.icon}>{serviceIcon}</Text>
          <Text style={styles.serviceName}>{serviceName}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.body}>
        <Avatar uri={otherUser?.profileImage} name={otherUser?.name || 'User'} size={40} />
        <View style={styles.userDetails}>
          <Text style={styles.roleLabel}>
            {userRole === 'customer' ? 'Worker:' : 'Customer:'}
          </Text>
          <Text style={styles.userName}>{otherUser?.name || 'N/A'}</Text>
        </View>
        <Text style={styles.price}>₹{booking.price}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.codeText}>Code: {booking.bookingCode}</Text>
        <Text style={styles.dateTimeText}>
          {booking.scheduledDate} at {booking.scheduledTime}
        </Text>
      </View>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
    marginLeft: 10,
  },
  roleLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  codeText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
