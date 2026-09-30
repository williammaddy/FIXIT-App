import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useLocationStore } from '../store/locationStore';

interface LocationHeaderProps {
  onPressChange?: () => void;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({ onPressChange }) => {
  const { address } = useLocationStore();

  return (
    <TouchableOpacity style={styles.container} onPress={onPressChange} activeOpacity={0.7}>
      <Ionicons name="location-sharp" size={18} color={COLORS.primary} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>Your Location</Text>
        <Text style={styles.address} numberOfLines={1}>
          {address || 'Select location'}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  address: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
