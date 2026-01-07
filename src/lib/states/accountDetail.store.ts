import { create } from 'zustand';
import { getAccountDetail, type AccountDetailResponse } from '../../services/api/accounts.api';

interface AccountDetailState {
  accountDetail: AccountDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  numeroCuenta: string | null;
  
  loadAccountDetail: (numeroCuenta: string) => Promise<void>;
  clearAccountDetail: () => void;
  setError: (error: string | null) => void;
}

export const useAccountDetailStore = create<AccountDetailState>((set) => ({
  accountDetail: null,
  isLoading: false,
  error: null,
  numeroCuenta: null,

  loadAccountDetail: async (numeroCuenta: string) => {
    set({ isLoading: true, error: null, numeroCuenta });

    try {
      const response = await getAccountDetail(numeroCuenta);
      
      set({ 
        accountDetail: response, 
        isLoading: false, 
        error: null,
        numeroCuenta,
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Error al cargar el detalle de la cuenta";
      
      set({ 
        accountDetail: null, 
        isLoading: false, 
        error: errorMessage,
        numeroCuenta,
      });
    }
  },

  clearAccountDetail: () => {
    set({ 
      accountDetail: null, 
      error: null,
      numeroCuenta: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

