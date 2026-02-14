import { api } from '../api';
import { ApiException } from './shared.api';
import { TipoPrestamo, EstadoCuota, TipoPagoPrestamo } from '../../constants/enums';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface DtoProximaCuota {
  numeroCuota: number;
  fechaPago: string;
  montoTotal: number;
  estado: EstadoCuota;
}

export interface DtoPrestamo {
  numeroOperacion?: string | null;
  cuentaIBAN?: string | null;
  tipoPrestamo: TipoPrestamo;
  monto: number;
  saldo: number;
  tasaInteres: number;
  tipoTasaInteres?: string | null;
  moneda?: string | null;
  fechaApertura: string;
  fechaVencimiento: string;
  fechaProxCuota: string;
  proxCuota: DtoProximaCuota;
}

export interface ListLoansResponse {
  prestamos?: DtoPrestamo[] | null;
  totalPrestamos: number;
  fechaConsulta: string;
}

export interface DtoPagoEfectuado {
  numeroCuota: number;
  fechaPago: string;
  montoPagado: number;
  montoInteres: number;
}

export interface GetPaymentsMadeResponse {
  numeroOperacion?: string | null;
  pagos?: DtoPagoEfectuado[] | null;
  totalPagos: number;
  montoTotalPagado: number;
  fechaConsulta: string;
}

export interface DtoRubroCuota {
  descripcionRubro?: string | null;
  monto: number;
  montoPagado: number;
}

export interface DtoCuotaPrestamo {
  numeroOperacion?: string | null;
  numeroCuota: number;
  moneda?: string | null;
  fechaPago: string;
  estado: EstadoCuota;
  montoTotal: number;
  rubros?: DtoRubroCuota[] | null;
}

export interface GetInstallmentResponse {
  cuota?: DtoCuotaPrestamo | null;
  fechaConsulta: string;
}

export interface DtoCuotaPlanPagos {
  numeroCuota: number;
  fechaPago: string;
  montoTotal: number;
  estado: EstadoCuota;
}

export interface DtoPlanPagos {
  numeroOperacion: string | null;
  totalCuotas: number;
  fechaInicio: string;
  fechaFinalizacion: string;
  cuotas: DtoCuotaPlanPagos[] | null;
}

export interface ObtenerPlanPagosResponse {
  planPagos: DtoPlanPagos;
  fechaConsulta: string;
}

// ─── Payment Request/Response ────────────────────────────────────────────────

export interface PagarCuotaPrestamoRequest {
  numeroOperacion?: string | null;
  numeroCuenta?: string | null;
  monto: number;
  numeroCuota?: number | null;
  tipoPago: TipoPagoPrestamo;
  numeroCuentaDestino?: string | null;
  idDesafio?: string | null;
}

export interface PagarCuotaPrestamoResponse {
  numeroOperacion?: string | null;
  numeroCuota: number;
  montoPagado: number;
  saldoRestante: number;
  numeroRecibo?: string | null;
  fechaPago: string;
  mensaje?: string | null;
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * List all loans for the authenticated user
 */
export async function listPrestamos(): Promise<ListLoansResponse> {
  try {
    const data = await api.get<ListLoansResponse>('/api/Prestamos/listar', true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_LOANS,
      statusCode: 0,
    });
  }
}

/**
 * Get payments made for a loan
 */
export async function getPagosEfectuados(
  numeroOperacion?: string
): Promise<GetPaymentsMadeResponse> {
  try {
    const params = new URLSearchParams();
    if (numeroOperacion) {
      params.append('numeroOperacion', numeroOperacion);
    }
    const queryString = params.toString();
    const endpoint = `/api/Prestamos/pagos-efectuados${queryString ? `?${queryString}` : ''}`;
    const data = await api.get<GetPaymentsMadeResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_PAYMENTS,
      statusCode: 0,
    });
  }
}

/**
 * Get specific installment details
 */
export async function getCuota(
  numeroOperacion: string,
  numeroCuota: number
): Promise<GetInstallmentResponse> {
  try {
    const params = new URLSearchParams();
    params.append('numeroOperacion', numeroOperacion);
    params.append('numeroCuota', numeroCuota.toString());
    const endpoint = `/api/Prestamos/cuota?${params.toString()}`;
    const data = await api.get<GetInstallmentResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_INSTALLMENT,
      statusCode: 0,
    });
  }
}

/**
 * Get payment plan for a loan
 */
export async function getPlanPagos(
  numeroOperacion?: string
): Promise<ObtenerPlanPagosResponse> {
  try {
    const params = new URLSearchParams();
    if (numeroOperacion) {
      params.append('numeroOperacion', numeroOperacion);
    }
    const queryString = params.toString();
    const endpoint = `/api/Prestamos/plan-pagos${queryString ? `?${queryString}` : ''}`;
    const data = await api.get<ObtenerPlanPagosResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_PAYMENT_PLAN,
      statusCode: 0,
    });
  }
}

/**
 * Pay a loan installment
 */
export async function pagarCuota(
  request: PagarCuotaPrestamoRequest
): Promise<PagarCuotaPrestamoResponse> {
  try {
    const data = await api.post<PagarCuotaPrestamoResponse>(
      '/api/Prestamos/pagar-cuota',
      request,
      true
    );
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.PAY_INSTALLMENT,
      statusCode: 0,
    });
  }
}
