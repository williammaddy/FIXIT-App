import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Service } from '../types';
import { COLORS } from '../constants/colors';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>{service.icon || '🛠️'}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {service.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 90,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});
