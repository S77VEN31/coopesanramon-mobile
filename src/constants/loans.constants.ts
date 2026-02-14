import { TipoPrestamo, EstadoCuota } from './enums';

export const LOANS_ITEMS_PER_PAGE = 8;

export const TIPO_PRESTAMO_LABELS: Record<TipoPrestamo, string> = {
  [TipoPrestamo.NoDefinido]: 'No Definido',
  [TipoPrestamo.Personal]: 'Personal',
  [TipoPrestamo.Hipotecario]: 'Hipotecario',
  [TipoPrestamo.Vehiculo]: 'Vehículo',
  [TipoPrestamo.Empresarial]: 'Empresarial',
  [TipoPrestamo.Consumo]: 'Consumo',
};

export const ESTADO_CUOTA_LABELS: Record<EstadoCuota, string> = {
  [EstadoCuota.NoDefinido]: 'No Definido',
  [EstadoCuota.Pendiente]: 'Pendiente',
  [EstadoCuota.Pagada]: 'Pagada',
  [EstadoCuota.Vencida]: 'Vencida',
  [EstadoCuota.Parcial]: 'Parcial',
  [EstadoCuota.Cancelada]: 'Cancelada',
};

export const ESTADO_CUOTA_STYLE: Record<EstadoCuota, 'success' | 'warning' | 'danger' | 'default'> = {
  [EstadoCuota.NoDefinido]: 'default',
  [EstadoCuota.Pendiente]: 'warning',
  [EstadoCuota.Pagada]: 'success',
  [EstadoCuota.Vencida]: 'danger',
  [EstadoCuota.Parcial]: 'warning',
  [EstadoCuota.Cancelada]: 'default',
};

export const LOANS_PAGE_TEXT = {
  title: 'Préstamos',
  description: 'Consulta y gestiona tus préstamos',
  categoryMyLoans: 'Mis Préstamos',
  categoryPaymentPlan: 'Plan de Pagos',
  categoryPaymentsHistory: 'Pagos Efectuados',
} as const;

export const MY_LOANS_PAGE_TEXT = {
  title: 'Mis Préstamos',
  searchPlaceholder: 'Buscar préstamo...',
  emptyMessage: 'No se encontraron préstamos.',
  emptyMessageSearch: 'No se encontraron préstamos que coincidan con tu búsqueda.',
} as const;

export const LOAN_DETAIL_LABELS = {
  numeroOperacion: 'Número de Operación',
  cuentaIBAN: 'Cuenta IBAN',
  tipoPrestamo: 'Tipo de Préstamo',
  monto: 'Monto Original',
  saldo: 'Saldo Pendiente',
  tasaInteres: 'Tasa de Interés',
  moneda: 'Moneda',
  fechaApertura: 'Fecha de Apertura',
  fechaVencimiento: 'Fecha de Vencimiento',
  proxCuota: 'Próxima Cuota',
  proxCuotaFecha: 'Fecha Próxima Cuota',
  proxCuotaMonto: 'Monto Próxima Cuota',
  proxCuotaEstado: 'Estado Próxima Cuota',
  pay: 'Pagar',
  viewPayments: 'Ver Pagos',
} as const;

export const PAYMENT_PLAN_PAGE_TEXT = {
  title: 'Plan de Pagos',
  selectLoan: 'Selecciona un préstamo',
  emptyMessage: 'No hay cuotas en el plan de pagos.',
  fechaInicio: 'Fecha inicio',
  fechaFin: 'Fecha fin',
  totalCuotas: 'Total de cuotas',
} as const;
