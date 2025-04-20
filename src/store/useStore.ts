import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Define the types for the authentication store
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isPremium: boolean;
  login: (userData: User) => void;
  logout: () => void;
  upgradeToPremium: () => void;
  checkPremiumStatus: () => boolean;
  refreshUserData: () => Promise<void>;
}

// Define the type for the User (customize based on your requirements)
interface User {
  id?: string;
  fullname?: string;
  email?: string;
  token: string;
  isPremium?: boolean;
  // Add more fields if necessary
}

// Create the zustand store with type annotations and persist middleware
const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isPremium: false,
      login: (userData: User) => set({ 
        isAuthenticated: true, 
        user: userData,
        isPremium: userData.isPremium || false
      }),
      logout: () => set({ isAuthenticated: false, user: null, isPremium: false }),
      upgradeToPremium: () => set(state => ({ 
        isPremium: true,
        user: state.user ? { ...state.user, isPremium: true } : null
      })),
      checkPremiumStatus: () => get().isPremium,
      refreshUserData: async () => {
        try {
          if (get().isAuthenticated && get().user?.token) {
            const response = await axios.get('/api/user/me');
            if (response.data.success && response.data.data.user) {
              const userData = response.data.data.user;
              // Update user data but keep the token
              set(state => ({
                user: { 
                  ...userData,
                  token: state.user?.token || '',
                },
                isPremium: userData.isPremium || false
              }));
            }
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    }),
    {
      name: 'auth-storage', // Unique name for the store
    }
  )
);

// Initialize user data on app startup
if (typeof window !== 'undefined') {
  const state = useAuthStore.getState();
  if (state.isAuthenticated && state.user?.token) {
    setTimeout(() => {
      state.refreshUserData();
    }, 100);
  }
}

export default useAuthStore;
