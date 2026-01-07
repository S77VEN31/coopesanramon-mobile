import {
  API_BASE_URL,
  getToken,
  getAuthHeaders,
  handleAuthError,
  shouldLogoutOn403,
  ApiError,
  TipoOperacion,
  TipoDesafio,
  EstadoDesafio,
  EstadoDispositivo,
} from './shared.api';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';
import { apiRequest } from '../api';

export interface CreateDesafioRequest {
  tipoOperacion: TipoOperacion;
  metadatos: string | null;
  codigoCanal: string | null;
  direccionIpCliente: string | null;
}

export interface CreateChallengeResponse {
  idDesafioPublico: string | null;
  retosSolicitados: TipoDesafio[] | null;
  fechaExpiracion: string;
  tiempoExpiracionSegundos: number;
  tiempoConfirmacionMaxSegundos: number;
  maxIntentos: number;
}

export interface ValidateDesafioRequest {
  idDesafioPublico: string | null;
  codigoEmail: string | null;
  codigoOtp: string | null;
}

export interface ValidateChallengeResponse {
  idDesafioPublico: string | null;
  estado: EstadoDesafio;
  validado: boolean;
  fechaValidacion: string | null;
}

export interface DisableDeviceResponse {
  idDispositivo: number;
  estado: EstadoDispositivo;
  deshabilitado: boolean;
  fechaDeshabilitacion: string | null;
}

export interface OperacionConDesafio {
  tipoOperacion: TipoOperacion;
  tieneDesafio: boolean;
}

export interface ListarOperacionesConDesafioResponse {
  operaciones: OperacionConDesafio[] | null;
  totalOperaciones: number;
}

export async function createdesafio(
  request: CreateDesafioRequest
): Promise<CreateChallengeResponse> {
  const token = await getToken();
  
  if (!token) {
    throw new Error(API_ERROR_MESSAGES.NO_TOKEN);
  }

  try {
    const data = await apiRequest<CreateChallengeResponse>(
      '/api/SegundoFactor/desafio/crear',
      {
        method: 'POST',
        body: request,
        requiresAuth: true,
      }
    );
    return data;
  } catch (error: any) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(
      API_ERROR_MESSAGES.ERROR.CREATE_CHALLENGE
    );
  }
}

export async function validatedesafio(
  request: ValidateDesafioRequest
): Promise<ValidateChallengeResponse> {
  const token = await getToken();
  
  if (!token) {
    throw new Error(API_ERROR_MESSAGES.NO_TOKEN);
  }

  try {
    const data = await apiRequest<ValidateChallengeResponse>(
      '/api/SegundoFactor/desafio/validar',
      {
        method: 'POST',
        body: request,
        requiresAuth: true,
      }
    );
    return data;
  } catch (error: any) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(
      API_ERROR_MESSAGES.ERROR.VALIDATE_CHALLENGE
    );
  }
}

export async function disabledispositivo(): Promise<DisableDeviceResponse> {
  const token = await getToken();
  
  if (!token) {
    throw new Error(API_ERROR_MESSAGES.NO_TOKEN);
  }

  try {
    const data = await apiRequest<DisableDeviceResponse>(
      '/api/SegundoFactor/dispositivo/deshabilitar',
      {
        method: 'POST',
        requiresAuth: true,
      }
    );
    return data;
  } catch (error: any) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(
      API_ERROR_MESSAGES.ERROR.DISABLE_DEVICE
    );
  }
}

export async function listarOperacionesConDesafio(): Promise<ListarOperacionesConDesafioResponse> {
  const token = await getToken();
  
  if (!token) {
    throw new Error(API_ERROR_MESSAGES.NO_TOKEN);
  }

  try {
    const data = await apiRequest<ListarOperacionesConDesafioResponse>(
      '/api/SegundoFactor/operaciones-con-desafio',
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
    return data;
  } catch (error: any) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(
      'Error al obtener las operaciones con desafío'
    );
  }
}

