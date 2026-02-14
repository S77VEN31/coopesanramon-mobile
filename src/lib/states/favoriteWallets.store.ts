import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  listMonederosFavoritos,
  getMonederoDestino,
  createMonederoFavorito,
  updateMonederoFavorito,
  deleteMonederoFavorito,
  type MonederoFavoritoItem,
  type GetMonederoDestinoResponse,
  type CreateMonederoFavoritoRequest,
  type UpdateMonederoFavoritoRequest,
} from '@/services/api/favorites.api';

interface FavoriteWalletsState {
  wallets: MonederoFavoritoItem[];
  destinationWallet: GetMonederoDestinoResponse | null;
  isLoading: boolean;
  isLoadingDestination: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  destinationError: string | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedWallet: MonederoFavoritoItem | null;

  loadWallets: () => Promise<void>;
  searchDestinationWallet: (monedero: string) => Promise<boolean>;
  createFavoriteWallet: (request: CreateMonederoFavoritoRequest) => Promise<boolean>;
  updateFavoriteWallet: (request: UpdateMonederoFavoritoRequest) => Promise<boolean>;
  deleteFavoriteWallet: (id: number) => Promise<boolean>;
  clearDestinationWallet: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (wallet: MonederoFavoritoItem) => void;
  closeEditModal: () => void;
}

export const useFavoriteWalletsStore = create<FavoriteWalletsState>()(
  devtools(
    (set, get) => ({
      wallets: [],
      destinationWallet: null,
      isLoading: false,
      isLoadingDestination: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      destinationError: null,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      selectedWallet: null,

      loadWallets: async () => {
        set({ isLoading: true, error: null }, false, 'favoriteWallets/loadStart');
        try {
          const response = await listMonederosFavoritos();
          set(
            { wallets: response.monederosFavoritos || [], isLoading: false },
            false,
            'favoriteWallets/loadSuccess'
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cargar monederos favoritos';
          set({ error: message, isLoading: false }, false, 'favoriteWallets/loadError');
        }
      },

      searchDestinationWallet: async (monedero: string) => {
        set({ isLoadingDestination: true, destinationError: null, destinationWallet: null }, false, 'favoriteWallets/searchStart');
        try {
          const response = await getMonederoDestino(monedero);
          set(
            { destinationWallet: response, isLoadingDestination: false },
            false,
            'favoriteWallets/searchSuccess'
          );
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al buscar monedero destino';
          set({ destinationError: message, isLoadingDestination: false }, false, 'favoriteWallets/searchError');
          return false;
        }
      },

      createFavoriteWallet: async (request) => {
        set({ isCreating: true, error: null }, false, 'favoriteWallets/createStart');
        try {
          await createMonederoFavorito(request);
          set({ isCreating: false }, false, 'favoriteWallets/createSuccess');
          await get().loadWallets();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al crear monedero favorito';
          set({ error: message, isCreating: false }, false, 'favoriteWallets/createError');
          throw err;
        }
      },

      updateFavoriteWallet: async (request) => {
        set({ isUpdating: true, error: null }, false, 'favoriteWallets/updateStart');
        try {
          await updateMonederoFavorito(request);
          set({ isUpdating: false }, false, 'favoriteWallets/updateSuccess');
          await get().loadWallets();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al actualizar monedero favorito';
          set({ error: message, isUpdating: false }, false, 'favoriteWallets/updateError');
          throw err;
        }
      },

      deleteFavoriteWallet: async (id) => {
        set({ isDeleting: true, error: null }, false, 'favoriteWallets/deleteStart');
        try {
          await deleteMonederoFavorito(id);
          set({ isDeleting: false }, false, 'favoriteWallets/deleteSuccess');
          await get().loadWallets();
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al eliminar monedero favorito';
          set({ error: message, isDeleting: false }, false, 'favoriteWallets/deleteError');
          return false;
        }
      },

      clearDestinationWallet: () => {
        set({ destinationWallet: null, destinationError: null }, false, 'favoriteWallets/clearDestination');
      },

      openCreateModal: () => {
        set({
          isCreateModalOpen: true,
          destinationWallet: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteWallets/openCreateModal');
      },

      closeCreateModal: () => {
        set({
          isCreateModalOpen: false,
          destinationWallet: null,
          destinationError: null,
          error: null,
        }, false, 'favoriteWallets/closeCreateModal');
      },

      openEditModal: (wallet) => {
        set({
          isEditModalOpen: true,
          selectedWallet: wallet,
          error: null,
        }, false, 'favoriteWallets/openEditModal');
      },

      closeEditModal: () => {
        set({
          isEditModalOpen: false,
          selectedWallet: null,
          error: null,
        }, false, 'favoriteWallets/closeEditModal');
      },
    }),
    { name: 'FavoriteWalletsStore', enabled: __DEV__ }
  )
);
