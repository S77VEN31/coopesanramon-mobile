import { api } from '../api';
import { ApiException } from './shared.api';
import {
  TipoDestinoTransferencia,
  EstadoTransferencia,
} from '../../constants/enums';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';

// Request/Response interfaces for internal transfers
export interface EnviarTransferenciaInternaRequest {
  tipoDestino: TipoDestinoTransferencia;
  idCuentaFavorita: number | null;
  numeroCuentaOrigen: string | null;
  numeroCuentaDestino: string | null;
  monto: number;
  detalle: string | null;
  email: string | null;
  idDesafio: string | null;
}

export interface TransferParticipante {
  cuentaIBAN: string;
  identificacion: string;
  cliente: string;
  email: string;
}

export interface EnviarTransferenciaInternaResponse {
  id: number;
  numeroDocumentoCore: string | null;
  estado: number;
  monto: number;
  montoComision: number | null;
  fechaCreacion: string;
  tipoDestino: string | null;
  detalle: string | null;
  codigoMoneda: string | null;
  origen: TransferParticipante | null;
  destino: TransferParticipante | null;
}

// Request/Response interfaces for SINPE transfers
export interface EnviarTransferenciaSinpeRequest {
  tipoDestino: TipoDestinoTransferencia;
  idCuentaFavorita: number | null;
  numeroCuentaOrigen: string | null;
  numeroCuentaDestino: string | null;
  monto: number;
  detalle: string | null;
  idDesafio: string | null;
  emailDestino: string | null;
}

export interface EnviarTransferenciaSinpeResponse {
  id: number;
  idCliente: number;
  idDesafio: string | null;
  numeroCuentaOrigen: string | null;
  codigoMonedaOrigen: string | null;
  identificacionOrigen: string | null;
  titularOrigen: string | null;
  codigoBancoOrigen: string | null;
  numeroCuentaDestino: string | null;
  codigoMonedaDestino: string | null;
  identificacionDestino: string | null;
  titularDestino: string | null;
  codigoBancoDestino: string | null;
  detalle: string | null;
  monto: number;
  email: string | null;
  estado: EstadoTransferencia;
  codigoReferenciaSinpe: string | null;
  codigoReferenciaCanal: string | null;
  numeroTransCore: number | null;
  observaciones: string | null;
  fechaCreacion: string;
}

export interface EnviarTransferenciaCreditosDirectosRequest {
  tipoDestino: TipoDestinoTransferencia;
  idCuentaFavorita: number | null;
  numeroCuentaOrigen: string | null;
  numeroCuentaDestino: string | null;
  monto: number;
  detalle: string | null;
  idDesafio: string | null;
  emailDestino: string | null;
}

export interface EnviarTransferenciaCreditosDirectosResponse {
  id: number;
  idCliente: number;
  idDesafio: string | null;
  numeroCuentaOrigen: string | null;
  codigoMonedaOrigen: string | null;
  identificacionOrigen: string | null;
  titularOrigen: string | null;
  codigoBancoOrigen: string | null;
  numeroCuentaDestino: string | null;
  codigoMonedaDestino: string | null;
  identificacionDestino: string | null;
  titularDestino: string | null;
  codigoBancoDestino: string | null;
  detalle: string | null;
  monto: number;
  email: string | null;
  estado: EstadoTransferencia;
  codigoReferenciaSinpe: string | null;
  codigoReferenciaCanal: string | null;
  numeroTransCore: number | null;
  observaciones: string | null;
  fechaCreacion: string;
}

export interface EnviarTransferenciaDebitosTiempoRealRequest {
  tipoDestino: TipoDestinoTransferencia;
  idCuentaFavorita: number | null;
  numeroCuentaOrigen: string | null;
  numeroCuentaDestino: string | null;
  monto: number;
  detalle: string | null;
  idDesafio: string | null;
  emailDestino: string | null;
}

export interface EnviarTransferenciaDebitosTiempoRealResponse {
  id: number;
  idCliente: number;
  idDesafio: string | null;
  numeroCuentaOrigen: string | null;
  codigoMonedaOrigen: string | null;
  identificacionOrigen: string | null;
  titularOrigen: string | null;
  codigoBancoOrigen: string | null;
  numeroCuentaDestino: string | null;
  codigoMonedaDestino: string | null;
  identificacionDestino: string | null;
  titularDestino: string | null;
  codigoBancoDestino: string | null;
  detalle: string | null;
  monto: number;
  email: string | null;
  estado: EstadoTransferencia;
  codigoReferenciaSinpe: string | null;
  codigoReferenciaCanal: string | null;
  numeroTransCore: number | null;
  observaciones: string | null;
  fechaCreacion: string;
}

// Request/Response interfaces for SINPE Móvil transfers
export interface EnviarSinpeMovilRequest {
  tipoDestino: TipoDestinoTransferencia;
  idMonederoFavorito: number | null;
  numeroCuentaOrigen: string | null;
  monederoDestino: string | null;
  monto: number;
  detalle: string | null;
  idDesafio: string | null;
  emailDestino: string | null;
}

export interface EnviarSinpeMovilResponse {
  id: number;
  idCliente: number;
  idDesafio: string | null;
  numeroCuentaOrigen: string | null;
  codigoMonedaOrigen: string | null;
  identificacionOrigen: string | null;
  titularOrigen: string | null;
  codigoBancoOrigen: string | null;
  monederoDestino: string | null;
  codigoMonedaDestino: string | null;
  identificacionDestino: string | null;
  titularDestino: string | null;
  codigoEntidadDestino: string | null;
  detalle: string | null;
  monto: number;
  email: string | null;
  estado: EstadoTransferencia;
  codigoReferenciaSinpe: string | null;
  codigoReferenciaCanal: string | null;
  numeroTransCore: number | null;
  observaciones: string | null;
  fechaCreacion: string;
}

export interface ObtenerMonederoSinpeResponse {
  titular: string | null;
  monedero: string | null;
  codigoBanco: string | null;
  identificacion: string | null;
}

/**
 * Send internal transfer
 */
export async function sendTransferenciaInterna(
  request: EnviarTransferenciaInternaRequest
): Promise<EnviarTransferenciaInternaResponse> {
  try {
    const data = await api.post<EnviarTransferenciaInternaResponse>(
      '/api/TransferenciasInternas/enviar',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.SEND_INTERNAL_TRANSFER,
      statusCode: 0,
    });
  }
}

/**
 * Send SINPE transfer (Pagos Inmediatos)
 */
export async function sendTransferenciaSinpe(
  request: EnviarTransferenciaSinpeRequest
): Promise<EnviarTransferenciaSinpeResponse> {
  try {
    const data = await api.post<EnviarTransferenciaSinpeResponse>(
      '/api/TransferenciasPagosInmediatos/enviar',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.SEND_SINPE_TRANSFER,
      statusCode: 0,
    });
  }
}

/**
 * Send SINPE transfer (Créditos Directos)
 */
export async function sendTransferenciaCreditosDirectos(
  request: EnviarTransferenciaCreditosDirectosRequest
): Promise<EnviarTransferenciaCreditosDirectosResponse> {
  try {
    const data = await api.post<EnviarTransferenciaCreditosDirectosResponse>(
      '/api/TransferenciasCreditosDirectos/enviar',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.SEND_SINPE_TRANSFER,
      statusCode: 0,
    });
  }
}

/**
 * Send SINPE transfer (Débitos Tiempo Real)
 */
export async function sendTransferenciaDebitosTiempoReal(
  request: EnviarTransferenciaDebitosTiempoRealRequest
): Promise<EnviarTransferenciaDebitosTiempoRealResponse> {
  try {
    const data = await api.post<EnviarTransferenciaDebitosTiempoRealResponse>(
      '/api/TransferenciasDebitosTiempoReal/enviar',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.SEND_SINPE_TRANSFER,
      statusCode: 0,
    });
  }
}

/**
 * Send SINPE Móvil transfer
 */
export async function sendSinpeMovilTransfer(
  request: EnviarSinpeMovilRequest
): Promise<EnviarSinpeMovilResponse> {
  try {
    const data = await api.post<EnviarSinpeMovilResponse>(
      '/api/TransferenciasSinpeMovil/enviar',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.SEND_SINPE_MOVIL_TRANSFER,
      statusCode: 0,
    });
  }
}

/**
 * Validate internal destination account
 */
export interface GetCuentaDestinoInternaResponse {
  numeroCuenta: string | null;
  codigoMoneda: string | null;
  titular: string | null;
  celular: string | null;
  alias: string | null;
  identificacion: string | null;
  email: string | null;
  cuentaIBAN: string | null;
}

export async function validateAccount(
  numeroCuenta: string
): Promise<GetCuentaDestinoInternaResponse> {
  try {
    const requestBody = {
      numeroCuenta,
    };
    const data = await api.post<GetCuentaDestinoInternaResponse>(
      '/api/CuentasFavoritasInternas/obtener-cuenta-destino',
      requestBody,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_DESTINATION_ACCOUNT,
      statusCode: 0,
    });
  }
}

/**
 * Validate SINPE destination account
 */
export interface GetCuentaDestinoSinpeResponse {
  numeroCuentaDestino: string;
  codigoBancoDestino: string;
  codigoMonedaDestino: string;
  titularDestino: string;
  identificacionDestino: string | null;
  tipoIdentificacionDestino: number | null;
}

export async function validateSinpeAccount(
  numeroCuentaDestino: string
): Promise<GetCuentaDestinoSinpeResponse> {
  try {
    const params = new URLSearchParams();
    params.append('numeroCuentaDestino', numeroCuentaDestino);
    const endpoint = `/api/CuentasFavoritasSinpe/obtener-cuenta-destino?${params.toString()}`;
    const data = await api.get<GetCuentaDestinoSinpeResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_DESTINATION_SINPE_ACCOUNT,
      statusCode: 0,
    });
  }
}

/**
 * Validate SINPE Móvil wallet (monedero)
 */
export async function validateSinpeMovilMonedero(
  monedero: string
): Promise<ObtenerMonederoSinpeResponse> {
  try {
    const params = new URLSearchParams();
    params.append('monedero', monedero);
    const endpoint = `/api/TransferenciasSinpeMovil/obtener-monedero?${params.toString()}`;
    const data = await api.get<ObtenerMonederoSinpeResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_SINPE_WALLET,
      statusCode: 0,
    });
  }
}

