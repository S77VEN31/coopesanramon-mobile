import { create } from 'zustand';
import { getPlanPagos, type DtoPlanPagos } from '../../services/api/loans.api';

interface PaymentPlanState {
  planPagos: DtoPlanPagos | null;
  isLoading: boolean;
  error: string | null;

  loadPaymentPlan: (numeroOperacion?: string) => Promise<void>;
  clearPaymentPlan: () => void;
  setError: (error: string | null) => void;
}

export const usePaymentPlanStore = create<PaymentPlanState>((set) => ({
  planPagos: null,
  isLoading: false,
  error: null,

  loadPaymentPlan: async (numeroOperacion?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getPlanPagos(numeroOperacion);

      set({
        planPagos: response.planPagos,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar el plan de pagos';

      set({
        planPagos: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  clearPaymentPlan: () => {
    set({
      planPagos: null,
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
