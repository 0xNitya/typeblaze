'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/useStore';

export function PremiumStatusCheck() {
  const { isAuthenticated, refreshUserData } = useAuthStore();

  // Check premium status on component mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  // This is a utility component that doesn't render anything
  return null;
} 