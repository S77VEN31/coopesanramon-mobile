import { type DtoPagoEfectuado } from '../../services/api/loans.api';
import { formatCurrency, formatDate } from './format.utils';

export function filterPayments(payments: DtoPagoEfectuado[], searchTerm: string): DtoPagoEfectuado[] {
  if (!searchTerm.trim()) {
    return payments;
  }

  const searchLower = searchTerm.toLowerCase();

  return payments.filter((payment) => {
    const cuota = payment.numeroCuota.toString();
    const fecha = formatDate(payment.fechaPago);
    const monto = formatCurrency(payment.montoPagado);

    return (
      cuota.includes(searchLower) ||
      fecha.toLowerCase().includes(searchLower) ||
      monto.toLowerCase().includes(searchLower)
    );
  });
}

export function calculateTotalMontoPagado(payments: DtoPagoEfectuado[]): number {
  return payments.reduce((total, payment) => total + payment.montoPagado, 0);
}

export function calculateTotalIntereses(payments: DtoPagoEfectuado[]): number {
  return payments.reduce((total, payment) => total + payment.montoInteres, 0);
}

export function sortPaymentsByDate(
  payments: DtoPagoEfectuado[],
  order: 'asc' | 'desc' = 'desc'
): DtoPagoEfectuado[] {
  return [...payments].sort((a, b) => {
    const dateA = new Date(a.fechaPago).getTime();
    const dateB = new Date(b.fechaPago).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
