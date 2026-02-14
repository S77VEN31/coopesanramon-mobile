import { create } from 'zustand';
import { getPagosEfectuados, type DtoPagoEfectuado, type GetPaymentsMadeResponse } from '../../services/api/loans.api';

interface PaymentsState {
  payments: DtoPagoEfectuado[];
  response: GetPaymentsMadeResponse | null;
  isLoading: boolean;
  error: string | null;
  numeroOperacion: string | undefined;

  loadPayments: (numeroOperacion?: string) => Promise<void>;
  clearPayments: () => void;
  setError: (error: string | null) => void;
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  response: null,
  isLoading: false,
  error: null,
  numeroOperacion: undefined,

  loadPayments: async (numeroOperacion?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getPagosEfectuados(numeroOperacion);

      set({
        payments: response.pagos || [],
        response,
        isLoading: false,
        error: null,
        numeroOperacion,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar los pagos efectuados';

      set({
        payments: [],
        response: null,
        isLoading: false,
        error: errorMessage,
        numeroOperacion,
      });
    }
  },

  clearPayments: () => {
    set({
      payments: [],
      response: null,
      error: null,
      numeroOperacion: undefined,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
