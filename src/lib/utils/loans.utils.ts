import { type DtoPrestamo } from '../../services/api/loans.api';
import { TIPO_PRESTAMO_LABELS } from '../../constants/loans.constants';

export function filterLoans(loans: DtoPrestamo[], searchTerm: string): DtoPrestamo[] {
  if (!searchTerm.trim()) {
    return loans;
  }

  const searchLower = searchTerm.toLowerCase();

  return loans.filter((loan) => {
    const operacion = loan.numeroOperacion || '';
    const iban = loan.cuentaIBAN || '';
    const typeLabel = TIPO_PRESTAMO_LABELS[loan.tipoPrestamo] || '';
    const currency = loan.moneda || '';

    return (
      operacion.toLowerCase().includes(searchLower) ||
      iban.toLowerCase().includes(searchLower) ||
      typeLabel.toLowerCase().includes(searchLower) ||
      currency.toLowerCase().includes(searchLower)
    );
  });
}

export function getLoanIdentifier(loan: DtoPrestamo): string {
  return loan.numeroOperacion || '';
}
