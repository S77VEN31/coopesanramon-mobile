import { TipoCuenta, TipoRelacion, EstadoCuenta, EstadoTarjetaDebito, Franquicia } from './enums';
import { type DtoCuenta } from '../services/api/accounts.api';

export const ACCOUNTS_ITEMS_PER_PAGE = 8;

export const ACCOUNT_TYPE_LABELS: Record<TipoCuenta, string> = {
  [TipoCuenta.Corriente]: "Cuenta Corriente",
  [TipoCuenta.Ahorros]: "Cuenta de Ahorros",
  [TipoCuenta.Inversion]: "Cuenta de Inversión",
  [TipoCuenta.Empresarial]: "Cuenta Empresarial",
  [TipoCuenta.Nomina]: "Cuenta de Nómina",
  [TipoCuenta.DepositoPlazo]: "Depósito a Plazo",
};

export const CURRENCY_LABELS: Record<string, string> = {
  CRC: "Colones CR",
  USD: "Dólares US",
  CLP: "Pesos CL",
};

export const RELATIONSHIP_TYPE_LABELS: Record<TipoRelacion, string> = {
  [TipoRelacion.Dueno]: "Dueño",
  [TipoRelacion.Autorizado]: "Autorizado",
};

export const FRANQUICIA_LABELS: Record<Franquicia, string> = {
  [Franquicia.Visa]: "VISA",
  [Franquicia.MasterCard]: "MasterCard",
  [Franquicia.AmericanExpress]: "American Express",
  [Franquicia.DinnersClub]: "Diners Club",
};

export const ESTADO_CUENTA_LABELS: Record<EstadoCuenta, string> = {
  [EstadoCuenta.NoExiste]: "No Existe",
  [EstadoCuenta.Activa]: "Activa",
  [EstadoCuenta.Inactiva]: "Inactiva",
  [EstadoCuenta.Bloqueada]: "Bloqueada",
  [EstadoCuenta.Cerrada]: "Cerrada",
  [EstadoCuenta.ActivaSoloParaAcreditar]: "Solo Acreditar",
  [EstadoCuenta.ActivaSoloParaDebitar]: "Solo Debitar",
};

export const ESTADO_CUENTA_STYLE: Record<EstadoCuenta, "Activa" | "Inactiva" | "Bloqueada"> = {
  [EstadoCuenta.Activa]: "Activa",
  [EstadoCuenta.ActivaSoloParaAcreditar]: "Activa",
  [EstadoCuenta.ActivaSoloParaDebitar]: "Activa",
  [EstadoCuenta.Inactiva]: "Inactiva",
  [EstadoCuenta.NoExiste]: "Inactiva",
  [EstadoCuenta.Bloqueada]: "Bloqueada",
  [EstadoCuenta.Cerrada]: "Bloqueada",
};

export const ESTADO_TARJETA_LABELS: Record<EstadoTarjetaDebito, string> = {
  [EstadoTarjetaDebito.NoExiste]: "No Existe",
  [EstadoTarjetaDebito.Activa]: "Activa",
  [EstadoTarjetaDebito.Inactiva]: "Inactiva",
  [EstadoTarjetaDebito.Bloqueada]: "Bloqueada",
  [EstadoTarjetaDebito.Cerrada]: "Cerrada",
  [EstadoTarjetaDebito.ActivaSoloParaAcreditar]: "Activa (Solo Acreditar)",
  [EstadoTarjetaDebito.ActivaSoloParaDebitar]: "Activa (Solo Debitar)",
};

export const ACCOUNTS_PAGE_TEXT = {
  title: "Mis Cuentas",
  description: "Consulta el estado de todas tus cuentas de efectivo",
  breadcrumbTitle: "Mis Cuentas",
  breadcrumbDescription: "Consulta el estado de todas tus cuentas de efectivo",
  searchPlaceholder: "Buscar cuenta...",
  searchLabel: "Buscar cuenta",
  emptyMessage: "No se encontraron cuentas.",
  emptyMessageSearch: "No se encontraron cuentas que coincidan con tu búsqueda.",
  loadingMessage: "Cargando cuentas...",
  detailsTitle: "Detalles de Cuenta",
  detailsDescription: "Información completa de tu cuenta bancaria",
  labelSingular: "registro",
  labelPlural: "registros",
} as const;

export const ACCOUNTS_ERROR_MESSAGES = {
  notAuthenticated: "Debes iniciar sesión para ver tus cuentas",
  loadError: "Error al cargar las cuentas",
  sessionExpired: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
} as const;

export const ACCOUNTS_INFO_MESSAGES = {
  noAccountsAvailable: "No hay cuentas disponibles",
  noAccountsAvailableDescription: "No se encontraron cuentas asociadas a tu perfil. Por favor contacta con soporte para más información.",
} as const;

export const ACCOUNT_DETAIL_ERROR_MESSAGES = {
  notAuthenticated: "Debes iniciar sesión para ver el detalle de la cuenta",
  loadError: "Error al cargar el detalle de la cuenta",
  sessionExpired: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  accountNotFound: "No se encontró el detalle de la cuenta",
} as const;

export const ACCOUNT_DETAIL_INFO_MESSAGES = {
  loadingDetail: "Cargando detalle de la cuenta...",
} as const;

export const ACCOUNT_DETAIL_FIELD_LABELS = {
  accountInfo: "Información de la Cuenta",
  availableBalance: "Saldo Disponible",
  accountStatus: "Estado de la Cuenta",
  accountIban: "Cuenta IBAN",
  accountNumber: "Número de Cuenta",
  accountType: "Tipo de Cuenta",
  currency: "Moneda",
  alias: "Alias",
  relationshipType: "Tipo de Relación",
  associatedDebitCards: "Tarjetas de Débito Asociadas",
} as const;

export const ACCOUNT_DETAIL_STATUS_LABELS = {
  active: "Activa",
  activeCreditOnly: "Activa (Solo Acreditar)",
  activeDebitOnly: "Activa (Solo Debitar)",
  closed: "Cerrada",
  blocked: "Bloqueada",
  inactive: "Inactiva",
  notExists: "No Existe",
} as const;

export const ACCOUNT_DETAIL_BUTTONS = {
  viewMovements: "Ver Movimientos",
  close: "Cerrar",
} as const;

export const ACCOUNT_DETAIL_DEFAULTS = {
  notAvailable: "N/A",
  accountTypeFallback: "Cuenta",
  relationshipTypeFallback: "No Especificado",
  defaultHolderName: "TITULAR",
} as const;

