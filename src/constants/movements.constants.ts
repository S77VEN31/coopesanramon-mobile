import { TipoMovimiento, MovementType } from './enums';

export const MOVEMENTS_ITEMS_PER_PAGE = 20;

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  reversion: "Reversión",
  debito: "Débito",
  credito: "Crédito",
} as const;

export const MOVEMENTS_PAGE_TEXT = {
  title: "Historial de Movimientos",
  description: "Últimas transacciones realizadas en tus cuentas",
  breadcrumbTitle: "Historial",
  breadcrumbDescription: "Consulta el historial de transacciones de tus cuentas",
  searchPlaceholder: "Buscar movimiento...",
  searchLabel: "Buscar movimiento",
  searchButton: "Buscar",
  accountLabel: "Cuenta",
  accountPlaceholder: "Seleccionar cuenta",
  typeLabel: "Tipo",
  typePlaceholder: "Todos los tipos",
  typeAll: "Todos los tipos",
  dateFromLabel: "Fecha Desde",
  dateToLabel: "Fecha Hasta",
  datePlaceholder: "DD/MM/AAAA",
  clearButton: "Limpiar",
  emptyMessage: "No se encontraron movimientos.",
  emptyMessageSearch: "No se encontraron movimientos que coincidan con tu búsqueda.",
  loadingMessage: "Cargando movimientos...",
  labelSingular: "movimiento",
  labelPlural: "movimientos",
  resultSingular: "resultado",
  resultPlural: "resultados",
} as const;

export const MOVEMENTS_METRICS = {
  totalIngresos: {
    title: "Total Ingresos",
    description: (count: number) => 
      `${count} movimiento${count !== 1 ? "s" : ""}`,
  },
  totalEgresos: {
    title: "Total Egresos",
    description: (count: number) => 
      `${count} movimiento${count !== 1 ? "s" : ""}`,
  },
  flujoNeto: {
    title: "Flujo Neto",
    description: (count: number) => 
      `${count} movimiento${count !== 1 ? "s" : ""} total`,
  },
} as const;

export const MOVEMENTS_ERROR_MESSAGES = {
  notAuthenticated: "Debes iniciar sesión para ver tus movimientos",
  loadError: "Error al cargar los movimientos",
  noAccountSelected: "Por favor selecciona una cuenta para ver los movimientos",
  sessionExpired: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  invalidDateRange: "La fecha 'Desde' debe ser menor o igual a la fecha 'Hasta'",
  invalidDateRangeWithFuture: 'La fecha "Desde" debe ser menor o igual a la fecha "Hasta" y la fecha "Hasta" no puede ser futura.',
  selectAccountToSearch: 'Por favor selecciona una cuenta y presiona "Buscar" para ver los movimientos.',
} as const;

export const MOVEMENTS_INFO_MESSAGES = {
  noAccountsAvailable: "No hay cuentas disponibles",
  noAccountsAvailableDescription: "No se encontraron cuentas asociadas a tu perfil. Por favor contacta con soporte para más información.",
} as const;

export const MOVEMENT_TYPE_TO_TIPO_MOVIMIENTO: Record<MovementType, TipoMovimiento | undefined> = {
  credito: TipoMovimiento.Credito,
  debito: TipoMovimiento.Debito,
  reversion: TipoMovimiento.Reversion,
} as const;

export const ALL_TYPES_VALUE = "todos";

export const MOVEMENT_TYPE_FILTER_OPTIONS = [
  { value: ALL_TYPES_VALUE, label: "Todos los tipos" },
  { value: "credito", label: MOVEMENT_TYPE_LABELS.credito },
  { value: "debito", label: MOVEMENT_TYPE_LABELS.debito },
  { value: "reversion", label: MOVEMENT_TYPE_LABELS.reversion },
] as const;

