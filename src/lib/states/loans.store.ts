import { create } from 'zustand';
import { listPrestamos, type DtoPrestamo } from '../../services/api/loans.api';

interface LoansState {
  loans: DtoPrestamo[];
  isLoading: boolean;
  error: string | null;

  loadLoans: () => Promise<void>;
  clearLoans: () => void;
  setError: (error: string | null) => void;
}

export const useLoansStore = create<LoansState>((set) => ({
  loans: [],
  isLoading: false,
  error: null,

  loadLoans: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await listPrestamos();

      set({
        loans: response.prestamos || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar los préstamos';

      set({
        loans: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  clearLoans: () => {
    set({
      loans: [],
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
