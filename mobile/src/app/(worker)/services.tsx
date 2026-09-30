import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { serviceApi } from '../../services/serviceApi';
import { workerApi } from '../../services/workerApi';
import { useWorkerStore } from '../../store/workerStore';
import { Service } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS } from '../../constants/colors';

const profileSchema = z.object({
  bio: z.string().optional(),
  experienceYears: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Experience must be a positive number'),
  startingPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Starting price must be a positive number'),
  serviceRadius: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Radius must be greater than 0'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function WorkerServicesManageScreen() {
  const router = useRouter();
  const { profile, setProfile } = useWorkerStore();

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      experienceYears: '0',
      startingPrice: '300',
      serviceRadius: '10',
    },
  });

  useEffect(() => {
    Promise.all([serviceApi.getServices(), workerApi.getMyProfile()])
      .then(([sRes, pRes]) => {
        if (sRes.success && sRes.data) {
          setAllServices(sRes.data);
        }
        if (pRes.success && pRes.data) {
          const prof = pRes.data;
          setProfile(prof);
          setValue('bio', prof.bio || '');
          setValue('experienceYears', (prof.experienceYears || 0).toString());
          setValue('startingPrice', (prof.startingPrice || 0).toString());
          setValue('serviceRadius', (prof.serviceRadius || 10).toString());

          if (prof.services && Array.isArray(prof.services)) {
            const ids = prof.services.map((s) => (typeof s === 'string' ? s : s._id));
            setSelectedServiceIds(ids);
          }
        }
      })
      .catch(() => setErrorMsg('Unable to load services configuration.'))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (selectedServiceIds.length === 0) {
      setErrorMsg('Please select at least one service you offer.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        bio: data.bio,
        experienceYears: parseFloat(data.experienceYears),
        startingPrice: parseFloat(data.startingPrice),
        serviceRadius: parseFloat(data.serviceRadius),
        services: selectedServiceIds,
      };

      const res = await workerApi.updateMyProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMsg('Profile and services updated successfully!');
      } else {
        setErrorMsg('Failed to update profile.');
      }
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading message="Loading service configuration..." />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Manage Services & Pricing" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Service Selector */}
          <Text style={styles.sectionTitle}>Services You Offer (Select all that apply)</Text>
          <View style={styles.serviceChipsGrid}>
            {allServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service._id);
              return (
                <TouchableOpacity
                  key={service._id}
                  style={[styles.serviceChip, isSelected && styles.serviceChipActive]}
                  onPress={() => toggleService(service._id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipIcon}>{service.icon}</Text>
                  <Text style={[styles.chipTitle, isSelected && styles.chipTitleActive]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pricing & Details */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Pricing & Info</Text>

          <Controller
            control={control}
            name="startingPrice"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Starting Price (₹)"
                placeholder="e.g. 400"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                error={errors.startingPrice?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="experienceYears"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Experience (Years)"
                placeholder="e.g. 5"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                error={errors.experienceYears?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="serviceRadius"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Service Radius (km)"
                placeholder="e.g. 10"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                error={errors.serviceRadius?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Professional Bio"
                placeholder="Describe your expertise and qualifications..."
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
                error={errors.bio?.message}
              />
            )}
          />

          <Button
            title="SAVE CHANGES"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSaving}
            style={{ marginTop: 12 }}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  serviceChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  serviceChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  chipTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
  successBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
