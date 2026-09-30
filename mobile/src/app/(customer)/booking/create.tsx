import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useBookingStore } from '@/store/bookingStore';
import { useLocationStore } from '@/store/locationStore';
import { bookingApi } from '@/services/bookingApi';
import { uploadApi } from '@/services/uploadApi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const bookingSchema = z.object({
  description: z.string().min(5, 'Please describe your problem (min 5 chars)'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  scheduledTime: z.string().min(2, 'Time is required (e.g. 10:00 AM)'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function CreateBookingScreen() {
  const router = useRouter();
  const { draft, clearDraft } = useBookingStore();
  const { latitude, longitude, address } = useLocationStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      description: '',
      scheduledDate: defaultDateStr,
      scheduledTime: '10:00 AM',
    },
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {}
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!draft.worker || !draft.service) {
      setErrorMsg('Worker or service selection missing.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    let uploadedUrl = '';
    if (imageUri) {
      try {
        const upRes = await uploadApi.uploadImage(imageUri);
        if (upRes.success && upRes.data) {
          uploadedUrl = upRes.data.url;
        }
      } catch (e) {
        // Optional image upload failure should NOT block booking creation!
      }
    }

    try {
      const res = await bookingApi.create({
        workerId: draft.worker.id,
        serviceId: draft.service._id,
        description: data.description,
        image: uploadedUrl,
        latitude,
        longitude,
        address,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
      });

      if (res.success && res.data) {
        clearDraft();
        router.replace(`/(customer)/booking/${res.data._id}`);
      } else {
        setErrorMsg('Booking failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!draft.worker || !draft.service) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Book Service" showBack />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No worker selected for booking.</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Book Service" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.serviceTitle}>
              {draft.service.icon} {draft.service.name}
            </Text>
            <Text style={styles.workerName}>Professional: {draft.worker.name}</Text>
            <Text style={styles.priceTag}>Estimated Starting Price: ₹{draft.worker.startingPrice}</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Problem Description"
                placeholder="Describe the issue (e.g., AC not cooling, leaking water)"
                multiline
                numberOfLines={3}
                style={styles.textArea}
                value={value}
                onChangeText={onChange}
                error={errors.description?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="scheduledDate"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Preferred Date"
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    error={errors.scheduledDate?.message}
                  />
                )}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="scheduledTime"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Preferred Time"
                    placeholder="e.g. 10:00 AM"
                    value={value}
                    onChangeText={onChange}
                    error={errors.scheduledTime?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Location Summary */}
          <View style={styles.locCard}>
            <Text style={styles.locLabel}>Service Location:</Text>
            <Text style={styles.locAddress}>{address}</Text>
          </View>

          {/* Image Upload */}
          <Text style={styles.inputLabel}>Attach Issue Photo (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={28} color={COLORS.muted} />
                <Text style={styles.imageText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Button
            title="BOOK SERVICE"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  workerName: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  locCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  locLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  locAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  imagePicker: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    marginTop: 8,
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
  },
});
