import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import { config } from '../../config/env';

const TOKEN_KEY = 'auth_token';

export const API_BASE_URL = config.apiBaseUrl;

export interface LoginRequest {
  grantType: string;
  username: string;
  password: string;
  metadatosNavegadorCanal?: {
    canalDigital?: string;
    tipoDispositivo?: string;
    userAgent?: string;
    idioma?: string;
    plataforma?: string;
    versionAplicacion?: string;
    [key: string]: string | undefined;
  };
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface ApiError {
  error?: string;
  error_description?: string;
  detail?: string;
  title?: string;
  status?: number;
  type?: string;
  instance?: string;
  codigoRespuesta?: string;
  idOperacion?: string;
  timestamp?: string;
  mensajes?: {
    'es-CR'?: string;
    'en-US'?: string;
    [key: string]: string | undefined;
  };
}

export class ApiException extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(error: { message: string; statusCode: number; errors?: Record<string, string[]> }) {
    super(error.message);
    this.statusCode = error.statusCode;
    this.errors = error.errors;
    this.name = 'ApiException';
  }
}

// Re-export enums from constants
export {
  TipoRelacion,
  TipoCuenta,
  EstadoCuenta,
  EstadoTarjetaDebito,
  Franquicia,
  TipoMovimiento,
  TipoProducto,
  TipoPrestamo,
  EstadoCuota,
  TipoInversion,
  TipoTasaInteres,
  EstadoCupon,
  TipoOperacion,
  TipoDesafio,
  EstadoDesafio,
  EstadoDispositivo,
  TipoCuentaFavorita,
  TipoDestinoTransferencia,
  TipoDestinoSinpeMovil,
  EstadoTransferencia,
} from '../../constants/enums';

export type { MovementType } from '../../constants/enums';

/**
 * Save authentication token to secure storage
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Get authentication token from secure storage
 */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Remove authentication token from secure storage
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = await getToken();
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
  const { API_ERROR_MESSAGES } = await import('../../constants/api.errors');
  const message = statusCode === 403 
    ? 'No tienes permisos para realizar esta acción.'
    : 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  
  throw new ApiException({
    message,
    statusCode,
  });
}

/**
 * Check if a 403 error should trigger logout
 */
export function shouldLogoutOn403(errorData: ApiError): boolean {
  const nonLogoutCodes = [
    'CSRDB-FAVORITOS_007', 
  ];
  
  if (errorData.codigoRespuesta && nonLogoutCodes.includes(errorData.codigoRespuesta)) {
    return false;
  }
  
  return true;
}

/**
 * Collects device metadata for authentication request
 */
function getDeviceMetadata(): LoginRequest['metadatosNavegadorCanal'] {
  const deviceType = Device.deviceType || 'unknown';
  let tipoDispositivo: string;
  
  switch (deviceType) {
    case Device.DeviceType.PHONE:
      tipoDispositivo = 'mobile';
      break;
    case Device.DeviceType.TABLET:
      tipoDispositivo = 'tablet';
      break;
    default:
      tipoDispositivo = 'mobile';
  }

  const locales = Localization.getLocales();
  const locale = locales && locales.length > 0 ? locales[0].languageTag : 'es-CR';

  const metadata: LoginRequest['metadatosNavegadorCanal'] = {
    canalDigital: 'Mobile',
    tipoDispositivo,
    userAgent: `${Device.manufacturer || 'Unknown'} ${Device.modelName || 'Device'}`,
    idioma: locale,
    plataforma: Device.osName || 'unknown',
    versionAplicacion: Application.nativeApplicationVersion || '1.0.0',
  };

  return metadata;
}

/**
 * Login function with mobile device metadata
 */
export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  // Collect device metadata
  const metadatosNavegadorCanal = getDeviceMetadata();

  const requestBody: LoginRequest = {
    grantType: 'password',
    username: username,
    password: password,
    metadatosNavegadorCanal: metadatosNavegadorCanal,
  };

  // Prepare headers with device information
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Device-Type': metadatosNavegadorCanal?.tipoDispositivo || 'mobile',
    'X-App-Version': metadatosNavegadorCanal?.versionAplicacion || '1.0.0',
    'X-Platform': 'mobile',
  };

  const response = await fetch(`${API_BASE_URL}/api/Auth/token`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const { API_ERROR_MESSAGES } = await import('../../constants/api.errors');
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'unknown_error',
      error_description: API_ERROR_MESSAGES.UNKNOWN_ERROR.LOGIN,
    }));

    throw new ApiException({
      message: errorData.error_description || errorData.error || API_ERROR_MESSAGES.ERROR.LOGIN,
      statusCode: response.status,
    });
  }

  const data: TokenResponse = await response.json();
  return data;
}

export interface DtoProductoResumen {
  tipoProducto: number;
  cantidad: number;
  saldoTotal: number | { source: string; parsedValue: number };
  codigoMoneda?: string | null;
  descripcion?: string | null;
}

export interface GetProductBalancesResponse {
  productos?: DtoProductoResumen[] | null;
  totalProductos: number;
  saldoTotalConsolidado: number;
  fechaConsulta: string;
}

/**
 * Get product balances (accounts, savings, loans, investments)
 */
export async function getProductBalances(): Promise<GetProductBalancesResponse> {
  const { api } = await import('../api');
  
  try {
    const data = await api.get<GetProductBalancesResponse>('/api/SaldosProductos/resumen', true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: 'Error al obtener saldos de productos',
      statusCode: 0,
    });
  }
}

