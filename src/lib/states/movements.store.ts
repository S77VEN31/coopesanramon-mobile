import { create } from 'zustand';
import { listMovements, type DtoMovimientoCuenta, type ListAccountMovementsResponse, type TipoMovimiento } from '../../services/api/accounts.api';

interface MovementsState {
  movements: DtoMovimientoCuenta[];
  response: ListAccountMovementsResponse | null;
  isLoading: boolean;
  error: string | null;
  
  numeroCuenta: string | undefined;
  fechaInicial: string | undefined;
  fechaFinal: string | undefined;
  tipoMovimiento: TipoMovimiento | undefined;
  
  loadMovements: (numeroCuenta?: string, fechaInicial?: string, fechaFinal?: string, tipoMovimiento?: TipoMovimiento) => Promise<void>;
  clearMovements: () => void;
  setError: (error: string | null) => void;
  setFilters: (numeroCuenta?: string, fechaInicial?: string, fechaFinal?: string, tipoMovimiento?: TipoMovimiento) => void;
}

export const useMovementsStore = create<MovementsState>((set) => ({
  movements: [],
  response: null,
  isLoading: false,
  error: null,
  numeroCuenta: undefined,
  fechaInicial: undefined,
  fechaFinal: undefined,
  tipoMovimiento: undefined,

  loadMovements: async (numeroCuenta?: string, fechaInicial?: string, fechaFinal?: string, tipoMovimiento?: TipoMovimiento) => {
    set({ isLoading: true, error: null });

    try {
      const response = await listMovements(numeroCuenta, fechaInicial, fechaFinal, tipoMovimiento);
      
      if (response.movimientos && response.movimientos.length > 0) {
        set({ 
          movements: response.movimientos, 
          response: response,
          isLoading: false, 
          error: null,
          numeroCuenta,
          fechaInicial,
          fechaFinal,
          tipoMovimiento,
        });
      } else {
        set({ 
          movements: [], 
          response: response,
          isLoading: false, 
          error: null,
          numeroCuenta,
          fechaInicial,
          fechaFinal,
          tipoMovimiento,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Error al cargar los movimientos";
      
      set({ 
        movements: [], 
        response: null,
        isLoading: false, 
        error: errorMessage,
        numeroCuenta,
        fechaInicial,
        fechaFinal,
        tipoMovimiento,
      });
    }
  },

  setFilters: (numeroCuenta?: string, fechaInicial?: string, fechaFinal?: string, tipoMovimiento?: TipoMovimiento) => {
    set({ numeroCuenta, fechaInicial, fechaFinal, tipoMovimiento });
  },

  clearMovements: () => {
    set({ 
      movements: [], 
      response: null,
      error: null,
      numeroCuenta: undefined,
      fechaInicial: undefined,
      fechaFinal: undefined,
      tipoMovimiento: undefined,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));


