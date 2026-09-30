import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useWorkerStore } from '../../store/workerStore';
import { useLocationStore } from '../../store/locationStore';
import { workerApi } from '../../services/workerApi';
import { uploadApi } from '../../services/uploadApi';
import { Avatar } from '../../components/Avatar';
import { Rating } from '../../components/Rating';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Loading } from '../../components/Loading';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { profile, setProfile, updateAvailability } = useWorkerStore();
  const { latitude, longitude, address, requestCurrentLocation } = useLocationStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    workerApi
      .getMyProfile()
      .then((res) => {
        if (res.success && res.data) setProfile(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploadingImage(true);
        const upRes = await uploadApi.uploadImage(result.assets[0].uri);
        if (upRes.success && upRes.data && user) {
          const newUrl = upRes.data.url;
          updateUser({ ...user, profileImage: newUrl });
          await workerApi.updateMyProfile({ profileImage: newUrl });
        }
      }
    } catch (e) {
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleAvailability = async (val: boolean) => {
    try {
      const res = await workerApi.updateAvailability(val);
      if (res.success) {
        updateAvailability(val);
      }
    } catch (e) {}
  };

  const handleUpdateLocation = async () => {
    await requestCurrentLocation();
    try {
      await workerApi.updateMyProfile({
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        address,
      });
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (isLoading) return <Loading message="Loading profile..." />;

  const isOnline = profile?.isAvailable ?? false;
  const serviceList = Array.isArray(profile?.services)
    ? profile?.services.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Worker Profile" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
            <Avatar uri={user?.profileImage} name={user?.name || 'Worker'} size={76} />
            <View style={styles.camBadge}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.name}</Text>
            {profile?.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.servicesText}>{serviceList || 'No services configured'}</Text>
          <Rating rating={profile?.rating || 0} reviewCount={profile?.reviewCount || 0} size={16} />

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.experienceYears || 0} Yrs</Text>
              <Text style={styles.statLbl}>Exp</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.completedJobs || 0}</Text>
              <Text style={styles.statLbl}>Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>₹{profile?.startingPrice || 0}</Text>
              <Text style={styles.statLbl}>Starting</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile?.serviceRadius || 10} km</Text>
              <Text style={styles.statLbl}>Radius</Text>
            </View>
          </View>
        </View>

        {/* Availability Switch */}
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Working Status</Text>
              <Text style={styles.switchSub}>
                {isOnline ? 'Available for new customer bookings' : 'Currently Offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Management Buttons */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Profile Controls</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/(worker)/services')}
          >
            <Ionicons name="construct-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuText}>Edit Services & Pricing</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={handleUpdateLocation}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Update Base Location</Text>
              <Text style={styles.menuSub} numberOfLines={1}>{address}</Text>
            </View>
            <Ionicons name="refresh" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <Button
          title="Sign Out"
          variant="danger"
          onPress={() => setIsLogoutModalOpen(true)}
          style={{ marginTop: 16 }}
        />
      </ScrollView>

      <ConfirmDialog
        visible={isLogoutModalOpen}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDanger
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
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
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 12,
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
    fontSize: 13,
    color: COLORS.muted,
    marginVertical: 4,
  },
  statsBar: {
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
});
