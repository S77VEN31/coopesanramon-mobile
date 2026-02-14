import { type DtoInversion } from '../../services/api/investments.api';
import { TIPO_INVERSION_LABELS } from '../../constants/investments.constants';

export function filterInvestments(
  investments: DtoInversion[],
  searchTerm: string
): DtoInversion[] {
  if (!searchTerm.trim()) {
    return investments;
  }

  const searchLower = searchTerm.toLowerCase();

  return investments.filter((investment) => {
    const numeroInversion = investment.numeroInversion || '';
    const tipoLabel = TIPO_INVERSION_LABELS[investment.tipoInversion] || '';
    const moneda = investment.moneda || '';
    const nombreTitular = investment.nombreTitular || '';

    return (
      numeroInversion.toLowerCase().includes(searchLower) ||
      tipoLabel.toLowerCase().includes(searchLower) ||
      moneda.toLowerCase().includes(searchLower) ||
      nombreTitular.toLowerCase().includes(searchLower)
    );
  });
}

export function sortInvestmentsByDate(
  investments: DtoInversion[],
  order: 'asc' | 'desc' = 'desc'
): DtoInversion[] {
  return [...investments].sort((a, b) => {
    const dateA = new Date(a.fechaVencimiento).getTime();
    const dateB = new Date(b.fechaVencimiento).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export function getInvestmentIdentifier(investment: DtoInversion): string {
  return investment.numeroInversion || `investment-${investment.monto || 'unknown'}`;
}
