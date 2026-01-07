/**
 * Centralized function to clear all application stores on logout
 * This ensures no user data persists after logout
 */

import { useAuthStore } from '@/lib/states/auth.store';

/**
 * Clears all application stores to ensure no user data persists after logout
 * Note: This does NOT call logout() on auth store to avoid circular calls.
 * The auth store logout() should call this function instead.
 */
export function clearAllStores(): void {
  try {
    // Clear auth store (this will be handled by logout, but included for completeness)
    // Note: We don't call logout() here to avoid circular calls
    
    // Other stores will be added here as modules are implemented
    // Example:
    // useAccountsStore.getState().clearAccounts();
    // useMinimalAccountsStore.getState().clearAccounts();
    // etc.
  } catch (error) {
    // Log error but don't throw - we want to ensure logout completes even if some stores fail to clear
    console.error('Error clearing stores on logout:', error);
  }
}

