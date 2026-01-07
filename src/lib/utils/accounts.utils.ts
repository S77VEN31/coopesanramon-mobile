import { TipoCuenta, EstadoCuenta, type DtoCuenta } from '../../services/api/accounts.api';
import { ACCOUNT_TYPE_LABELS } from '../../constants/accounts.constants';
import { formatCurrency } from './format.utils';

export function formatAccountCurrency(
  amount: number,
  currency: string = "CRC"
): string {
  return formatCurrency(amount, currency);
}

export function filterAccounts(
  accounts: DtoCuenta[],
  searchTerm: string
): DtoCuenta[] {
  if (!searchTerm.trim()) {
    return accounts;
  }

  const searchLower = searchTerm.toLowerCase();

  return accounts.filter((account) => {
    const iban = account.numeroCuentaIban || account.numeroCuenta || "";
    const accountNumber = account.numeroCuenta || "";
    const typeLabel = ACCOUNT_TYPE_LABELS[account.tipoCuenta] || "";
    const currency = account.moneda || "";

    return (
      iban.toLowerCase().includes(searchLower) ||
      accountNumber.toLowerCase().includes(searchLower) ||
      typeLabel.toLowerCase().includes(searchLower) ||
      currency.toLowerCase().includes(searchLower)
    );
  });
}

export function calculatePagination(
  accounts: DtoCuenta[],
  currentPage: number,
  itemsPerPage: number
) {
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = accounts.slice(startIndex, endIndex);

  return {
    totalPages,
    startIndex,
    endIndex,
    paginatedAccounts,
  };
}

export function isAccountActive(accountStatus: EstadoCuenta): boolean {
  return (
    accountStatus === EstadoCuenta.Activa ||
    accountStatus === EstadoCuenta.ActivaSoloParaAcreditar ||
    accountStatus === EstadoCuenta.ActivaSoloParaDebitar
  );
}

export function isAccountBlocked(accountStatus: EstadoCuenta): boolean {
  return (
    accountStatus === EstadoCuenta.Bloqueada ||
    accountStatus === EstadoCuenta.Cerrada
  );
}

export function formatAccountDate(
  dateString: string,
  includeTime: boolean = false
): string {
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString("es-CR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }
  
  return date.toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function getAccountIdentifier(account: DtoCuenta): string {
  return account.numeroCuentaIban || account.numeroCuenta || "";
}

