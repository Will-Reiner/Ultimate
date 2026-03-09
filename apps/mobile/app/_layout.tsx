// Required by NativeWind — import global CSS before any component
import '../global.css';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@hooks/useAuth';

export default function RootLayout() {
  const { hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
