import { create } from 'zustand';
import { listInversiones, type DtoInversion } from '../../services/api/investments.api';

interface InvestmentsState {
  investments: DtoInversion[];
  isLoading: boolean;
  error: string | null;

  loadInvestments: () => Promise<void>;
  clearInvestments: () => void;
  setError: (error: string | null) => void;
}

export const useInvestmentsStore = create<InvestmentsState>((set) => ({
  investments: [],
  isLoading: false,
  error: null,

  loadInvestments: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await listInversiones();

      set({
        investments: response.inversiones || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar las inversiones';

      set({
        investments: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  clearInvestments: () => {
    set({
      investments: [],
      isLoading: false,
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
