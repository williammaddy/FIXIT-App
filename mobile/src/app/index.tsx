import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'customer') {
    return <Redirect href="/(customer)/home" />;
  }

  if (user.role === 'worker') {
    return <Redirect href="/(worker)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
