import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export const Rating: React.FC<RatingProps> = ({ rating, reviewCount, size = 14 }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="star" size={size} color="#F59E0B" />
      <Text style={[styles.ratingText, { fontSize: size }]}>
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </Text>
      {reviewCount !== undefined && (
        <Text style={[styles.reviewCountText, { fontSize: size - 2 }]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewCountText: {
    color: COLORS.muted,
    marginLeft: 4,
  },
});
