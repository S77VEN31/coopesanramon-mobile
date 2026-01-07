// Shared TypeScript types
export type { UserData } from '@/lib/states/auth.store';
export type { TokenResponse, LoginRequest, ApiError, GetProductBalancesResponse, DtoProductoResumen } from '@/services/api/shared.api';
export type { MovementType } from '@/constants/enums';
export type { TabType } from '@/components/cards/SummaryCard';
export type { DtoProductoResumen as DtoProductoResumenUtil, CurrencyTotals } from '@/lib/utils/dashboard.utils';

