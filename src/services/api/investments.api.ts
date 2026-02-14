import { api } from '../api';
import { ApiException } from './shared.api';
import { TipoInversion, TipoTasaInteres, EstadoCupon } from '../../constants/enums';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface DtoInversion {
  numeroInversion?: string | null;
  moneda?: string | null;
  nombreTitular?: string | null;
  monto: number;
  fechaValor: string;
  fechaVencimiento: string;
  plazo: number;
  tipoInversion: TipoInversion;
  tipoTasaInteres: TipoTasaInteres;
}

export interface ListInvestmentsResponse {
  inversiones?: DtoInversion[] | null;
  totalInversiones: number;
  fechaConsulta: string;
}

export interface DtoCupon {
  numeroCupon?: string | null;
  fechaVencimiento: string;
  fechaPagado?: string | null;
  estado: EstadoCupon;
  interesNeto: number;
  montoNeto: number;
}

export interface GetInvestmentCouponsResponse {
  numeroInversion?: string | null;
  cupones?: DtoCupon[] | null;
  totalCupones: number;
  fechaConsulta: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * List all investments for the authenticated user
 */
export async function listInversiones(): Promise<ListInvestmentsResponse> {
  try {
    const data = await api.get<ListInvestmentsResponse>('/api/Inversiones/listar', true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_INVESTMENTS,
      statusCode: 0,
    });
  }
}

/**
 * Get coupons for an investment (or all investments)
 */
export async function getCuponesInversion(
  numeroInversion?: string
): Promise<GetInvestmentCouponsResponse> {
  try {
    const params = new URLSearchParams();
    if (numeroInversion) {
      params.append('numeroInversion', numeroInversion);
    }
    const queryString = params.toString();
    const endpoint = `/api/Inversiones/cupones${queryString ? `?${queryString}` : ''}`;
    const data = await api.get<GetInvestmentCouponsResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_COUPONS,
      statusCode: 0,
    });
  }
}
