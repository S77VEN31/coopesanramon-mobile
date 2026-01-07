import { create } from 'zustand';
import type { GetProductBalancesResponse } from '../../services/api/shared.api';

interface ProductBalancesState {
  productBalances: GetProductBalancesResponse | null;
  isLoading: boolean;
  error: string | null;
  setProductBalances: (data: GetProductBalancesResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProductBalancesStore = create<ProductBalancesState>((set) => ({
  productBalances: null,
  isLoading: false,
  error: null,
  setProductBalances: (data) => set({ productBalances: data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ productBalances: null, isLoading: false, error: null }),
}));

