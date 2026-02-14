import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  listCuentasFavoritasInternas,
  getCuentaDestinoInterna,
  createCuentaFavoritaInterna,
  updateCuentaFavoritaInterna,
  deleteCuentaFavoritaInterna,
  type CuentaFavoritaInternaItem,
  type CreateCuentaInternaFavoritaRequest,
  type UpdateCuentaInternaFavoritaRequest,
} from '@/services/api/favorites.api';
import type { GetCuentaDestinoInternaResponse } from '@/services/api/transfers.api';

interface FavoriteAccountsState {
  internalAccounts: CuentaFavoritaInternaItem[];
  destinationAccount: GetCuentaDestinoInternaResponse | null;
  isLoading: boolean;
  isLoadingDestination: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  destinationError: string | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedAccount: CuentaFavoritaInternaItem | null;

  loadInternalAccounts: () => Promise<void>;
  searchDestinationAccount: (numeroCuenta: string) => Promise<boolean>;
  createFavoriteAccount: (request: CreateCuentaInternaFavoritaRequest) => Promise<boolean>;
  updateFavoriteAccount: (request: UpdateCuentaInternaFavoritaRequest) => Promise<boolean>;
  deleteFavoriteAccount: (id: number) => Promise<boolean>;
  clearDestinationAccount: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (account: CuentaFavoritaInternaItem) => void;
  closeEditModal: () => void;
}

export const useFavoriteAccountsStore = create<FavoriteAccountsState>()(
  devtools(
    (set, get) => ({
      internalAccounts: [],
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

      loadInternalAccounts: async () => {
        set({ isLoading: true, error: null }, false, 'favoriteAccounts/loadStart');
        try {
          const response = await listCuentasFavoritasInternas();
          set(
            { internalAccounts: response.cuentasFavoritas || [], isLoading: false },
            false,
            'favoriteAccounts/loadSuccess'
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cargar cuentas favoritas';
          set({ error: message, isLoading: false }, false, 'favoriteAccounts/loadError');
        }
      },

      searchDestinationAccount: async (numeroCuenta: string) => {
        set({ isLoadingDestination: true, destinationError: null, destinationAccount: null }, false, 'favoriteAccounts/searchStart');
        try {
          const response = await getCuentaDestinoInterna(numeroCuenta);
          set(
            { destinationAccount: response, isLoadingDestination: false },
            false,
            'favoriteAccounts/searchSuccess'
          );
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al buscar cuenta destino';
          set({ destinationError: message, isLoadingDestination: false }, false, 'favoriteAccounts/searchError');
          return false;
        }
      },

      createFavoriteAccount: async (request) => {
        set({ isCreating: true, error: null }, false, 'favoriteAccounts/createStart');
        try {
          await createCuentaFavoritaInterna(request);
          set({ isCreating: false }, false, 'favoriteAccounts/createSuccess');
          await get().loadInternalAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al crear cuenta favorita';
          set({ error: message, isCreating: false }, false, 'favoriteAccounts/createError');
          throw err;
        }
      },

      updateFavoriteAccount: async (request) => {
        set({ isUpdating: true, error: null }, false, 'favoriteAccounts/updateStart');
        try {
          await updateCuentaFavoritaInterna(request);
          set({ isUpdating: false }, false, 'favoriteAccounts/updateSuccess');
          await get().loadInternalAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al actualizar cuenta favorita';
          set({ error: message, isUpdating: false }, false, 'favoriteAccounts/updateError');
          throw err;
        }
      },

      deleteFavoriteAccount: async (id) => {
        set({ isDeleting: true, error: null }, false, 'favoriteAccounts/deleteStart');
        try {
          await deleteCuentaFavoritaInterna(id);
          set({ isDeleting: false }, false, 'favoriteAccounts/deleteSuccess');
          await get().loadInternalAccounts();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al eliminar cuenta favorita';
          set({ error: message, isDeleting: false }, false, 'favoriteAccounts/deleteError');
          return false;
        }
      },

      clearDestinationAccount: () => {
        set({ destinationAccount: null, destinationError: null }, false, 'favoriteAccounts/clearDestination');
      },

      openCreateModal: () => {
        set({
          isCreateModalOpen: true,
          destinationAccount: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteAccounts/openCreateModal');
      },

      closeCreateModal: () => {
        set({
          isCreateModalOpen: false,
          destinationAccount: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteAccounts/closeCreateModal');
      },

      openEditModal: (account) => {
        set({
          isEditModalOpen: true,
          selectedAccount: account,
          error: null,
        }, false, 'favoriteAccounts/openEditModal');
      },

      closeEditModal: () => {
        set({
          isEditModalOpen: false,
          selectedAccount: null,
          error: null,
        }, false, 'favoriteAccounts/closeEditModal');
      },
    }),
    { name: 'FavoriteAccountsStore', enabled: __DEV__ }
  )
);
