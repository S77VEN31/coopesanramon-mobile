import * as SecureStore from 'expo-secure-store';
import { config } from '../config/env';
import { ApiException } from './api/shared.api';

const API_BASE_URL = config.apiBaseUrl;
const TOKEN_KEY = 'auth_token';

// Enable/disable logging
const DEBUG_LOGGING = false;

function logRequest(method: string, url: string, headers: Record<string, string>, body?: unknown) {
  if (!DEBUG_LOGGING) return;
  
  console.log('\n📤 ═══════════════════════════════════════════════════════');
  console.log(`📤 REQUEST: ${method} ${url}`);
  console.log('📤 Headers:', JSON.stringify(headers, null, 2));
  if (body) {
    console.log('📤 Body:', JSON.stringify(body, null, 2));
  }
  console.log('📤 ═══════════════════════════════════════════════════════\n');
}

function logResponse(status: number, statusText: string, data: unknown, duration: number) {
  if (!DEBUG_LOGGING) return;
  
  const emoji = status >= 200 && status < 300 ? '✅' : '❌';
  console.log('\n📥 ═══════════════════════════════════════════════════════');
  console.log(`${emoji} RESPONSE: ${status} ${statusText} (${duration}ms)`);
  console.log('📥 Data:', JSON.stringify(data, null, 2));
  console.log('📥 ═══════════════════════════════════════════════════════\n');
}

function logError(error: unknown, duration: number) {
  if (!DEBUG_LOGGING) return;
  
  console.log('\n🔴 ═══════════════════════════════════════════════════════');
  console.log(`🔴 ERROR (${duration}ms):`, error);
  console.log('🔴 ═══════════════════════════════════════════════════════\n');
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function hasAuthToken(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle authentication errors from API responses
 * For mobile, we don't redirect - the navigation system handles auth state
 */
export async function handleAuthError(statusCode: number = 401): Promise<never> {
  const { API_ERROR_MESSAGES } = await import('../constants/api.errors');
  const message = statusCode === 403 
    ? 'No tienes permisos para realizar esta acción.'
    : 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  
  throw new ApiException({
    message,
    statusCode,
  });
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  requiresAuth?: boolean;
  customToken?: string; // Token específico a usar (en lugar del token del usuario)
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, body, requiresAuth = true, customToken } = options;
  const startTime = Date.now();
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Si hay un token personalizado, usarlo; si no, usar el token del usuario
  if (customToken) {
    headers['Authorization'] = `Bearer ${customToken}`;
  } else if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Log request
  logRequest(method, fullUrl, headers, body);

  try {
    const response = await fetch(fullUrl, config);
    const duration = Date.now() - startTime;

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    let data: unknown = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    }

    // Log response
    logResponse(response.status, response.statusText, data, duration);

    if (!response.ok) {
      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        await handleAuthError(response.status);
      }

      const errorData = data as { message?: string; errors?: Record<string, string[]> } | null;
      throw new ApiException({
        message: errorData?.message || `Error ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        errors: errorData?.errors,
      });
    }

    return data as T;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ApiException) {
      throw error;
    }

    // Log error
    logError(error, duration);

    // Network error or other fetch error
    throw new ApiException({
      message: error instanceof Error ? error.message : 'Error de conexión',
      statusCode: 0,
    });
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'GET', requiresAuth }),

  post: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth }),

  put: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth }),

  delete: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'DELETE', requiresAuth }),
};

