import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '../types';

interface StatusBadgeProps {
  status: BookingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'ACCEPTED':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'STARTED':
        return { bg: '#E0E7FF', text: '#4F46E5' };
      case 'COMPLETED':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'REJECTED':
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const { bg, text } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
