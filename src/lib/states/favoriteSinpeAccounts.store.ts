import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  listCuentasFavoritasSinpe,
  getCuentaDestinoSinpe,
  createCuentaFavoritaSinpe,
  updateCuentaFavoritaSinpe,
  deleteCuentaFavoritaSinpe,
  type CuentaSinpeFavoritaItem,
  type CreateCuentaSinpeFavoritaRequest,
  type UpdateCuentaSinpeFavoritaRequest,
} from '@/services/api/favorites.api';
import type { GetCuentaDestinoSinpeResponse } from '@/services/api/transfers.api';

interface FavoriteSinpeAccountsState {
  sinpeAccounts: CuentaSinpeFavoritaItem[];
  destinationAccount: GetCuentaDestinoSinpeResponse | null;
  isLoading: boolean;
  isLoadingDestination: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  destinationError: string | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedAccount: CuentaSinpeFavoritaItem | null;

  loadSinpeAccounts: () => Promise<void>;
  searchDestinationAccount: (numeroCuentaDestino: string) => Promise<boolean>;
  createFavoriteAccount: (request: CreateCuentaSinpeFavoritaRequest) => Promise<boolean>;
  updateFavoriteAccount: (request: UpdateCuentaSinpeFavoritaRequest) => Promise<boolean>;
  deleteFavoriteAccount: (id: number) => Promise<boolean>;
  clearDestinationAccount: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (account: CuentaSinpeFavoritaItem) => void;
  closeEditModal: () => void;
}

export const useFavoriteSinpeAccountsStore = create<FavoriteSinpeAccountsState>()(
  devtools(
    (set, get) => ({
      sinpeAccounts: [],
      destinationAccount: null,
      isLoading: false,
      isLoadingDestination: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      destinationError: null,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      selectedAccount: null,

      loadSinpeAccounts: async () => {
        set({ isLoading: true, error: null }, false, 'favoriteSinpe/loadStart');
        try {
          const response = await listCuentasFavoritasSinpe();
          set(
            { sinpeAccounts: response.cuentasFavoritas || [], isLoading: false },
            false,
            'favoriteSinpe/loadSuccess'
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cargar cuentas SINPE favoritas';
          set({ error: message, isLoading: false }, false, 'favoriteSinpe/loadError');
        }
      },

      searchDestinationAccount: async (numeroCuentaDestino: string) => {
        set({ isLoadingDestination: true, destinationError: null, destinationAccount: null }, false, 'favoriteSinpe/searchStart');
        try {
          const response = await getCuentaDestinoSinpe(numeroCuentaDestino);
          set(
            { destinationAccount: response, isLoadingDestination: false },
            false,
            'favoriteSinpe/searchSuccess'
          );
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al buscar cuenta destino SINPE';
          set({ destinationError: message, isLoadingDestination: false }, false, 'favoriteSinpe/searchError');
          return false;
        }
      },

      createFavoriteAccount: async (request) => {
        set({ isCreating: true, error: null }, false, 'favoriteSinpe/createStart');
        try {
          await createCuentaFavoritaSinpe(request);
          set({ isCreating: false }, false, 'favoriteSinpe/createSuccess');
          await get().loadSinpeAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al crear cuenta SINPE favorita';
          set({ error: message, isCreating: false }, false, 'favoriteSinpe/createError');
          throw err;
        }
      },

      updateFavoriteAccount: async (request) => {
        set({ isUpdating: true, error: null }, false, 'favoriteSinpe/updateStart');
        try {
          await updateCuentaFavoritaSinpe(request);
          set({ isUpdating: false }, false, 'favoriteSinpe/updateSuccess');
          await get().loadSinpeAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al actualizar cuenta SINPE favorita';
          set({ error: message, isUpdating: false }, false, 'favoriteSinpe/updateError');
          throw err;
        }
      },

      deleteFavoriteAccount: async (id) => {
        set({ isDeleting: true, error: null }, false, 'favoriteSinpe/deleteStart');
        try {
          await deleteCuentaFavoritaSinpe(id);
          set({ isDeleting: false }, false, 'favoriteSinpe/deleteSuccess');
          await get().loadSinpeAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al eliminar cuenta SINPE favorita';
          set({ error: message, isDeleting: false }, false, 'favoriteSinpe/deleteError');
          return false;
        }
      },

      clearDestinationAccount: () => {
        set({ destinationAccount: null, destinationError: null }, false, 'favoriteSinpe/clearDestination');
      },

      openCreateModal: () => {
        set({
          isCreateModalOpen: true,
          destinationAccount: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteSinpe/openCreateModal');
      },

      closeCreateModal: () => {
        set({
          isCreateModalOpen: false,
          destinationAccount: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteSinpe/closeCreateModal');
      },

      openEditModal: (account) => {
        set({
          isEditModalOpen: true,
          selectedAccount: account,
          error: null,
        }, false, 'favoriteSinpe/openEditModal');
      },

      closeEditModal: () => {
        set({
          isEditModalOpen: false,
          selectedAccount: null,
          error: null,
        }, false, 'favoriteSinpe/closeEditModal');
      },
    }),
    { name: 'FavoriteSinpeAccountsStore', enabled: __DEV__ }
  )
);
