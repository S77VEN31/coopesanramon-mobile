import { create } from 'zustand';
import { getCuota, type DtoCuotaPrestamo } from '../../services/api/loans.api';

interface InstallmentDetailState {
  installmentDetail: DtoCuotaPrestamo | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  numeroOperacion: string | null;
  numeroCuota: number | null;

  loadInstallmentDetail: (numeroOperacion: string, numeroCuota: number) => Promise<void>;
  setModalOpen: (open: boolean) => void;
  resetState: () => void;
}

export const useInstallmentDetailStore = create<InstallmentDetailState>((set) => ({
  installmentDetail: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  numeroOperacion: null,
  numeroCuota: null,

  loadInstallmentDetail: async (numeroOperacion: string, numeroCuota: number) => {
    set({ isLoading: true, error: null, numeroOperacion, numeroCuota });

    try {
      const response = await getCuota(numeroOperacion, numeroCuota);

      set({
        installmentDetail: response.cuota || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar el detalle de la cuota';

      set({
        installmentDetail: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  setModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },

  resetState: () => {
    set({
      installmentDetail: null,
      isLoading: false,
      error: null,
      isModalOpen: false,
      numeroOperacion: null,
      numeroCuota: null,
    });
  },
}));
