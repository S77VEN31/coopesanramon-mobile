import { create } from 'zustand';
import { getCuponesInversion, type DtoCupon, type GetInvestmentCouponsResponse } from '../../services/api/investments.api';

interface CouponsState {
  coupons: DtoCupon[];
  response: GetInvestmentCouponsResponse | null;
  isLoading: boolean;
  error: string | null;
  numeroInversion: string | undefined;

  loadCoupons: (numeroInversion?: string) => Promise<void>;
  clearCoupons: () => void;
  setError: (error: string | null) => void;
  setFilters: (numeroInversion?: string) => void;
}

export const useCouponsStore = create<CouponsState>((set) => ({
  coupons: [],
  response: null,
  isLoading: false,
  error: null,
  numeroInversion: undefined,

  loadCoupons: async (numeroInversion?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getCuponesInversion(numeroInversion);

      set({
        coupons: response.cupones || [],
        response,
        isLoading: false,
        error: null,
        numeroInversion,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar los cupones';

      set({
        coupons: [],
        response: null,
        isLoading: false,
        error: errorMessage,
        numeroInversion,
      });
    }
  },

  setFilters: (numeroInversion?: string) => {
    set({ numeroInversion });
  },

  clearCoupons: () => {
    set({
      coupons: [],
      response: null,
      isLoading: false,
      error: null,
      numeroInversion: undefined,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
