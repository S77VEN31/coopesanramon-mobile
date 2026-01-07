import { create } from 'zustand';
import { listAccounts, type DtoCuenta } from '../../services/api/accounts.api';

interface AccountsState {
  accounts: DtoCuenta[];
  isLoading: boolean;
  error: string | null;
  
  loadAccounts: () => Promise<void>;
  clearAccounts: () => void;
  setError: (error: string | null) => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  loadAccounts: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await listAccounts();
      
      if (response.cuentas && response.cuentas.length > 0) {
        set({ 
          accounts: response.cuentas, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          accounts: [], 
          isLoading: false, 
          error: null 
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Error al cargar las cuentas";
      
      set({ 
        accounts: [], 
        isLoading: false, 
        error: errorMessage 
      });
    }
  },

  clearAccounts: () => {
    set({ 
      accounts: [], 
      error: null 
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

