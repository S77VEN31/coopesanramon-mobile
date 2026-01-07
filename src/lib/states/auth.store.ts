import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getToken, removeToken, saveToken } from '@/services/api/shared.api';
import { clearAllStores } from '@/lib/utils/store-cleanup';

export interface UserData {
  sub?: string; 
  email?: string;
  name?: string;
  username?: string;
  roles?: string[];
  exp?: number; 
  iat?: number; 
  [key: string]: unknown; 
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (token: string) => Promise<void>;
  logout: () => void;
  validateToken: (token: string) => Promise<UserData | null>;
  initializeAuth: () => Promise<void>;
}

/**
 * Decode base64 string (React Native compatible)
 */
function base64Decode(str: string): string {
  // Replace URL-safe base64 characters
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  
  // Use Buffer for React Native compatibility
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }
  
  // Fallback for environments with atob (web)
  if (typeof atob !== 'undefined') {
    return atob(padded);
  }
  
  throw new Error('No base64 decoder available');
}

/**
 * Decode JWT without verification (React Native compatible)
 * Only extracts payload to check expiration
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode base64 payload (second part)
    const payload = parts[1];
    const decoded = base64Decode(payload);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    
    if (!decoded || !decoded.exp) {
      // If we can't decode or no expiration, consider it expired for safety
      return true;
    }

    // Get current time in seconds (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const margin = 60; // 60 seconds margin to consider token expired before actual expiration
    
    // Token is expired if expiration time is less than (current time + margin)
    return expirationTime < (now + margin);
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

async function cleanupExpiredToken(): Promise<void> {
  await removeToken();
}

/**
 * Validate JWT token (check expiration only, no signature verification)
 * Signature verification is handled by the server
 */
async function validateJWT(token: string): Promise<UserData | null> {
  try {
    if (isTokenExpired(token)) {
      await cleanupExpiredToken();
      return null;
    }

    // Decode token to extract user data
    const decoded = decodeJWT(token);
    if (!decoded) {
      await cleanupExpiredToken();
      return null;
    }

    // Extract user data from token payload
    return {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      username: decoded.username,
      roles: decoded.roles,
      exp: decoded.exp,
      iat: decoded.iat,
    } as UserData;
  } catch (error) {
    await cleanupExpiredToken();
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      validateToken: async (token: string): Promise<UserData | null> => {
        set({ isLoading: true, error: null }, false, 'auth/validateToken');
        
        try {
          const userData = await validateJWT(token);
          
          if (userData) {
            set({ isLoading: false }, false, 'auth/validateTokenSuccess');
            return userData;
          } else {
            await removeToken();
            set({ 
              isLoading: false, 
              error: 'Token inválido o expirado',
              isAuthenticated: false,
              user: null,
              token: null,
            }, false, 'auth/validateTokenError');
            
            return null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Error al validar el token';
          
          await removeToken();
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          }, false, 'auth/validateTokenError');
          
          return null;
        }
      },

      login: async (token: string) => {
        set({ isLoading: true, error: null }, false, 'auth/loginStart');

        try {
          const userData = await get().validateToken(token);

          if (!userData) {
            throw new Error('Token inválido o expirado');
          }

          await saveToken(token);

          set({
            isAuthenticated: true,
            user: userData,
            token: token,
            isLoading: false,
            error: null,
          }, false, 'auth/loginSuccess');
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Error al iniciar sesión';
          
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          }, false, 'auth/loginError');
          
          throw error;
        }
      },

      logout: () => {
        // Clear all stores first to ensure no user data persists
        clearAllStores();
        
        // Then clear auth state
        removeToken();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        }, false, 'auth/logout');
      },

      initializeAuth: async () => {
        const token = await getToken();
        
        if (!token) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          }, false, 'auth/initializeAuthNoToken');
          return;
        }

        try {
          const userData = await get().validateToken(token);

          if (userData) {
            set({
              isAuthenticated: true,
              user: userData,
              token: token,
            }, false, 'auth/initializeAuthSuccess');
          } else {
            await removeToken();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            }, false, 'auth/initializeAuthInvalidToken');
          }
        } catch (error) {
          await removeToken();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          }, false, 'auth/initializeAuthError');
        }
      },
    }),
    {
      name: 'AuthStore', 
      enabled: __DEV__, 
    }
  )
);

