import { api } from '../api';
import { ApiException } from './shared.api';
import { API_ERROR_MESSAGES } from '../../constants/api.errors';
import type { GetCuentaDestinoInternaResponse, GetCuentaDestinoSinpeResponse } from './transfers.api';

// ============================================================
// Internal Favorite Accounts
// ============================================================

export interface CuentaFavoritaInternaItem {
  id: number;
  numeroCuenta: string | null;
  codigoMoneda: string | null;
  titular: string | null;
  telefono: string | null;
  alias: string | null;
  identificacion: string | null;
  email: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
}

export interface ListInternalFavoriteAccountsResponse {
  cuentasFavoritas: CuentaFavoritaInternaItem[] | null;
  total: number;
}

export interface CreateCuentaInternaFavoritaRequest {
  numeroCuenta: string | null;
  email: string | null;
  telefono: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface CreateCuentaInternaFavoritaResponse {
  id: number;
  numeroCuenta: string | null;
  codigoMoneda: string | null;
  titular: string | null;
  fechaCreacion: string;
}

export interface UpdateCuentaInternaFavoritaRequest {
  id: number;
  email: string | null;
  telefono: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface UpdateCuentaInternaFavoritaResponse {
  id: number;
  numeroCuenta: string | null;
  email: string | null;
  telefono: string | null;
  alias: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
}

export interface DeleteCuentaInternaFavoritaResponse {
  id: number;
  numeroCuenta: string | null;
  eliminada: boolean;
  fechaEliminacion: string;
}

// ============================================================
// SINPE Favorite Accounts
// ============================================================

export interface CuentaSinpeFavoritaItem {
  id: number;
  numeroCuentaDestino: string;
  codigoBancoDestino: string;
  codigoMonedaDestino: string;
  titularDestino: string;
  identificacionDestino: string;
  telefono: string | null;
  alias: string | null;
  email: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export interface ListSinpeFavoriteAccountsResponse {
  cuentasFavoritas: CuentaSinpeFavoritaItem[];
  total: number;
}

export interface CreateCuentaSinpeFavoritaRequest {
  numeroCuentaDestino: string;
  email: string | null;
  telefono: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface CreateCuentaSinpeFavoritaResponse {
  id: number;
  numeroCuentaDestino: string;
  codigoBancoDestino: string;
  codigoMonedaDestino: string;
  titularDestino: string;
  fechaCreacion: string;
}

export interface UpdateCuentaSinpeFavoritaRequest {
  id: number;
  email: string | null;
  telefono: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface UpdateCuentaSinpeFavoritaResponse {
  id: number;
  numeroCuentaDestino: string;
  email: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export interface DeleteCuentaSinpeFavoritaResponse {
  id: number;
  numeroCuentaDestino: string;
  eliminada: boolean;
  fechaEliminacion: string;
}

// ============================================================
// Favorite Wallets (SINPE Movil)
// ============================================================

export interface MonederoFavoritoItem {
  id: number;
  monedero: string | null;
  codigoBanco: string | null;
  identificacion: string | null;
  titular: string | null;
  alias: string | null;
  email: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
  nombreEntidad: string | null;
}

export interface ListFavoriteWalletsResponse {
  monederosFavoritos: MonederoFavoritoItem[] | null;
  total: number;
}

export interface GetMonederoDestinoResponse {
  monedero: string | null;
  codigoBanco: string | null;
  nombreBanco: string | null;
  identificacion: string | null;
  titular: string | null;
}

export interface CreateMonederoFavoritoRequest {
  monedero: string | null;
  email: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface CreateMonederoFavoritoResponse {
  id: number;
  monedero: string | null;
  codigoBanco: string | null;
  titular: string | null;
  fechaCreacion: string;
}

export interface UpdateMonederoFavoritoRequest {
  id: number;
  email: string | null;
  alias: string | null;
  montoMaximo: number | null;
  idDesafio: string | null;
}

export interface UpdateMonederoFavoritoResponse {
  id: number;
  monedero: string | null;
  email: string | null;
  alias: string | null;
  montoMaximo: number | null;
  fechaCreacion: string;
}

export interface DeleteMonederoFavoritoResponse {
  id: number;
  monedero: string | null;
  eliminado: boolean;
  fechaEliminacion: string;
}

// ============================================================
// API Functions - Internal Favorites
// ============================================================

export async function listCuentasFavoritasInternas(): Promise<ListInternalFavoriteAccountsResponse> {
  try {
    return await api.get<ListInternalFavoriteAccountsResponse>(
      '/api/CuentasFavoritasInternas/listar',
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_INTERNAL_FAVORITE_ACCOUNTS,
      statusCode: 0,
    });
  }
}

export async function getCuentaDestinoInterna(
  numeroCuenta: string
): Promise<GetCuentaDestinoInternaResponse> {
  try {
    return await api.post<GetCuentaDestinoInternaResponse>(
      '/api/CuentasFavoritasInternas/obtener-cuenta-destino',
      { numeroCuenta },
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_DESTINATION_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function createCuentaFavoritaInterna(
  request: CreateCuentaInternaFavoritaRequest
): Promise<CreateCuentaInternaFavoritaResponse> {
  try {
    return await api.post<CreateCuentaInternaFavoritaResponse>(
      '/api/CuentasFavoritasInternas/crear',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.CREATE_INTERNAL_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function updateCuentaFavoritaInterna(
  request: UpdateCuentaInternaFavoritaRequest
): Promise<UpdateCuentaInternaFavoritaResponse> {
  try {
    return await api.post<UpdateCuentaInternaFavoritaResponse>(
      '/api/CuentasFavoritasInternas/actualizar',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.UPDATE_INTERNAL_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function deleteCuentaFavoritaInterna(
  id: number
): Promise<DeleteCuentaInternaFavoritaResponse> {
  try {
    return await api.post<DeleteCuentaInternaFavoritaResponse>(
      '/api/CuentasFavoritasInternas/eliminar',
      { id },
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.DELETE_INTERNAL_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

// ============================================================
// API Functions - SINPE Favorites
// ============================================================

export async function listCuentasFavoritasSinpe(): Promise<ListSinpeFavoriteAccountsResponse> {
  try {
    return await api.get<ListSinpeFavoriteAccountsResponse>(
      '/api/CuentasFavoritasSinpe/listar',
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_SINPE_FAVORITE_ACCOUNTS,
      statusCode: 0,
    });
  }
}

export async function getCuentaDestinoSinpe(
  numeroCuentaDestino: string
): Promise<GetCuentaDestinoSinpeResponse> {
  try {
    const params = new URLSearchParams({ numeroCuentaDestino });
    return await api.get<GetCuentaDestinoSinpeResponse>(
      `/api/CuentasFavoritasSinpe/obtener-cuenta-destino?${params.toString()}`,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_DESTINATION_SINPE_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function createCuentaFavoritaSinpe(
  request: CreateCuentaSinpeFavoritaRequest
): Promise<CreateCuentaSinpeFavoritaResponse> {
  try {
    return await api.post<CreateCuentaSinpeFavoritaResponse>(
      '/api/CuentasFavoritasSinpe/crear',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.CREATE_SINPE_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function updateCuentaFavoritaSinpe(
  request: UpdateCuentaSinpeFavoritaRequest
): Promise<UpdateCuentaSinpeFavoritaResponse> {
  try {
    return await api.post<UpdateCuentaSinpeFavoritaResponse>(
      '/api/CuentasFavoritasSinpe/actualizar',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.UPDATE_SINPE_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

export async function deleteCuentaFavoritaSinpe(
  id: number
): Promise<DeleteCuentaSinpeFavoritaResponse> {
  try {
    return await api.post<DeleteCuentaSinpeFavoritaResponse>(
      '/api/CuentasFavoritasSinpe/eliminar',
      { id },
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.DELETE_SINPE_FAVORITE_ACCOUNT,
      statusCode: 0,
    });
  }
}

// ============================================================
// API Functions - Favorite Wallets
// ============================================================

export async function listMonederosFavoritos(): Promise<ListFavoriteWalletsResponse> {
  try {
    return await api.get<ListFavoriteWalletsResponse>(
      '/api/MonederosFavoritos/listar',
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_FAVORITE_WALLETS,
      statusCode: 0,
    });
  }
}

export async function getMonederoDestino(
  monedero: string
): Promise<GetMonederoDestinoResponse> {
  try {
    const params = new URLSearchParams({ monedero });
    return await api.get<GetMonederoDestinoResponse>(
      `/api/MonederosFavoritos/obtener-monedero-destino?${params.toString()}`,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.GET_DESTINATION_WALLET,
      statusCode: 0,
    });
  }
}

export async function createMonederoFavorito(
  request: CreateMonederoFavoritoRequest
): Promise<CreateMonederoFavoritoResponse> {
  try {
    return await api.post<CreateMonederoFavoritoResponse>(
      '/api/MonederosFavoritos/crear',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.CREATE_FAVORITE_WALLET,
      statusCode: 0,
    });
  }
}

export async function updateMonederoFavorito(
  request: UpdateMonederoFavoritoRequest
): Promise<UpdateMonederoFavoritoResponse> {
  try {
    return await api.post<UpdateMonederoFavoritoResponse>(
      '/api/MonederosFavoritos/actualizar',
      request,
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.UPDATE_FAVORITE_WALLET,
      statusCode: 0,
    });
  }
}

export async function deleteMonederoFavorito(
  id: number
): Promise<DeleteMonederoFavoritoResponse> {
  try {
    return await api.post<DeleteMonederoFavoritoResponse>(
      '/api/MonederosFavoritos/eliminar',
      { id },
      true
    );
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException({
      message: API_ERROR_MESSAGES.ERROR.DELETE_FAVORITE_WALLET,
      statusCode: 0,
    });
  }
}
