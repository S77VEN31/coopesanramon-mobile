import { TipoInversion, TipoTasaInteres } from './enums';

export const TIPO_INVERSION_LABELS: Record<TipoInversion, string> = {
  [TipoInversion.CertificadoPlazoColones]: 'Certificado Plazo Colones',
  [TipoInversion.CertificadoDesmaterializadoColones]: 'Certificado Desmaterializado Colones',
  [TipoInversion.CertificadoPlazoDolares]: 'Certificado Plazo Dólares',
  [TipoInversion.CertificadoDesmaterializadoDolares]: 'Certificado Desmaterializado Dólares',
};

export const TIPO_TASA_INTERES_LABELS: Record<TipoTasaInteres, string> = {
  [TipoTasaInteres.Fijo]: 'Fijo',
  [TipoTasaInteres.Variable]: 'Variable',
};

export const INVESTMENTS_PAGE_TEXT = {
  title: 'Inversiones',
  description: 'Administra y consulta tus inversiones',
  categoryMyInvestments: 'Mis Inversiones',
  categoryMyInvestmentsDescription: 'Consulta tus certificados activos',
  categoryCoupons: 'Cupones',
  categoryCouponsDescription: 'Revisa los cupones de tus inversiones',
} as const;

export const INVESTMENTS_SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Recientes' },
  { value: 'asc', label: 'Antiguos' },
];

export const MY_INVESTMENTS_PAGE_TEXT = {
  title: 'Mis Inversiones',
  description: 'Consulta tus certificados de inversión activos',
  searchPlaceholder: 'Buscar inversión...',
  sortLabel: 'Ordenar por',
  searchButton: 'Buscar',
  filtersTitle: 'Filtros',
  emptyMessage: 'No se encontraron inversiones.',
  emptyMessageSearch: 'No se encontraron inversiones que coincidan con tu búsqueda.',
} as const;

export const INVESTMENT_DETAIL_LABELS = {
  numeroInversion: 'No. Inversión',
  tipoInversion: 'Tipo Inversión',
  moneda: 'Moneda',
  tipoTasaInteres: 'Tipo Tasa Interés',
  fechaValor: 'Fecha Valor',
  fechaVencimiento: 'Fecha Vencimiento',
  plazo: 'Plazo',
  monto: 'Monto',
  nombreTitular: 'Nombre Titular',
  viewCoupons: 'Ver Cupones',
  close: 'Cerrar',
} as const;

export const INVESTMENTS_ERROR_MESSAGES = {
  notAuthenticated: 'Debes iniciar sesión para ver tus inversiones',
  loadError: 'Error al cargar las inversiones',
  sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
} as const;
