import { api } from '../api';
import { ApiException } from './shared.api';
import {
  TipoRelacion,
  TipoCuenta,
  EstadoCuenta,
  EstadoTarjetaDebito,
  Franquicia,
  TipoMovimiento,
} from '../../constants/enums';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';

export interface DtoCuenta {
  numeroCuenta?: string | null;
  numeroCuentaIban?: string | null;
  alias?: string | null;
  tipoRelacion?: TipoRelacion;
  tipoCuenta: TipoCuenta;
  estadoCuenta: EstadoCuenta;
  moneda?: string | null;
  saldo: number;
}

export interface ListAccountsResponse {
  cuentas?: DtoCuenta[] | null;
  totalCuentas: number;
  fechaConsulta: string;
}

export interface DtoDetalleCuenta {
  numeroCuenta?: string | null;
  saldoCongelado: number;
  saldoTransito: number;
  saldoPromedio: number;
  creditosPeriodo: number;
  debitosPeriodo: number;
  creditosTransito: number;
  debitosTransito: number;
  tasaInteres: number;
}

export interface DtoTarjetaDebito {
  numeroTarjeta?: string | null;
  numeroCuenta?: string | null;
  cuentaIBAN?: string | null;
  descripcion?: string | null;
  franquicia: Franquicia;
  estado: EstadoTarjetaDebito;
  moneda?: string | null;
  saldoDisponible: number;
}

export interface AccountDetailResponse {
  cuenta?: DtoCuenta | null;
  detalleCuenta?: DtoDetalleCuenta | null;
  tarjetas?: DtoTarjetaDebito[] | null;
  fechaConsulta: string;
}

export interface DtoMovimientoCuenta {
  numeroCuenta?: string | null;
  numeroTarjeta?: string | null;
  fechaHora: string;
  monto: number;
  saldo: number;
  descripcion?: string | null;
  tipoMovimiento?: TipoMovimiento | null;
  codigoTransaccion?: string | null;
  transaccion?: string | null;
  idReferencia?: string | null;
  idDocumento?: string | null;
  nombreComercio?: string | null;
  tipoComercio?: string | null;
}

export interface ListAccountMovementsResponse {
  numeroCuenta?: string | null;
  fechaInicial: string;
  fechaFinal: string;
  totalMovimientos: number;
  movimientos?: DtoMovimientoCuenta[] | null;
  fechaConsulta: string;
}

/**
 * List all accounts for the authenticated user
 */
export async function listAccounts(): Promise<ListAccountsResponse> {
  try {
    const data = await api.get<ListAccountsResponse>('/api/Cuentas/listar', true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_ACCOUNTS,
      statusCode: 0,
    });
  }
}

/**
 * Get detailed information for a specific account
 */
export async function getAccountDetail(numeroCuenta: string): Promise<AccountDetailResponse> {
  try {
    const params = new URLSearchParams();
    params.append('numeroCuenta', numeroCuenta);
    const endpoint = `/api/Cuentas/detalle?${params.toString()}`;
    const data = await api.get<AccountDetailResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_ACCOUNT_DETAIL,
      statusCode: 0,
    });
  }
}

/**
 * List movements for a specific account
 */
export async function listMovements(
  numeroCuenta?: string,
  fechaInicial?: string,
  fechaFinal?: string,
  tipoMovimiento?: TipoMovimiento
): Promise<ListAccountMovementsResponse> {
  try {
    const params = new URLSearchParams();
    if (numeroCuenta) {
      params.append('numeroCuenta', numeroCuenta);
    }
    if (fechaInicial) {
      params.append('fechaInicial', fechaInicial);
    }
    if (fechaFinal) {
      params.append('fechaFinal', fechaFinal);
    }
    if (tipoMovimiento !== undefined) {
      params.append('tipoMovimiento', tipoMovimiento.toString());
    }
    
    const queryString = params.toString();
    const endpoint = `/api/Cuentas/movimientos${queryString ? `?${queryString}` : ''}`;
    const data = await api.get<ListAccountMovementsResponse>(endpoint, true);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_MOVEMENTS,
      statusCode: 0,
    });
  }
}

