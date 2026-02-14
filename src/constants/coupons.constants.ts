import { EstadoCupon } from './enums';

export const ESTADO_CUPON_LABELS: Record<EstadoCupon, string> = {
  [EstadoCupon.Activo]: 'Activo',
  [EstadoCupon.Pagado]: 'Pagado',
};

export const ESTADO_CUPON_STYLE: Record<EstadoCupon, 'success' | 'default'> = {
  [EstadoCupon.Activo]: 'success',
  [EstadoCupon.Pagado]: 'default',
};

export const COUPONS_PAGE_TEXT = {
  title: 'Cupones',
  description: 'Consulta el historial de cupones de tus inversiones',
  searchPlaceholder: 'Buscar cupón...',
  investmentLabel: 'Inversión',
  investmentPlaceholder: 'Seleccionar inversión',
  investmentAll: 'Todas las inversiones',
  emptyMessage: 'No se encontraron cupones.',
  emptyMessageSearch: 'No se encontraron cupones que coincidan con tu búsqueda.',
} as const;

export const COUPONS_METRICS = {
  totalCupones: 'Total Cupones',
  montoTotal: 'Monto Total',
  interesTotal: 'Interés Total',
} as const;

export const COUPONS_ERROR_MESSAGES = {
  notAuthenticated: 'Debes iniciar sesión para ver tus cupones',
  loadError: 'Error al cargar los cupones',
  sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
} as const;
