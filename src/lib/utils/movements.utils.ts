import {
  DtoMovimientoCuenta,
} from '../../services/api/accounts.api';
import { MovementType, TipoMovimiento } from '../../constants/enums';

export function getMovementType(
  tipoMovimiento?: TipoMovimiento | null
): MovementType {
  if (!tipoMovimiento) {
    return "debito";
  }

  switch (tipoMovimiento) {
    case TipoMovimiento.Credito:
      return "credito";
    case TipoMovimiento.Debito:
      return "debito";
    case TipoMovimiento.Reversion:
      return "reversion";
    default:
      return "debito";
  }
}

export function areDatesValid(
  dateFrom?: Date | null,
  dateTo?: Date | null
): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    if (toDate > today) return false;
  }
  
  if (!dateFrom || !dateTo) return true;
  
  const fromDate = new Date(dateFrom);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(dateTo);
  toDate.setHours(0, 0, 0, 0);
  return fromDate <= toDate;
}

export function filterMovements(
  movements: DtoMovimientoCuenta[],
  searchTerm: string
): DtoMovimientoCuenta[] {
  let filtered = movements;
  
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    
    filtered = filtered.filter((movement) => {
      return (
        (movement.descripcion?.toLowerCase().includes(searchLower)) ||
        (movement.tipoMovimiento?.toString().includes(searchLower)) ||
        (movement.codigoTransaccion?.toLowerCase().includes(searchLower)) ||
        (movement.idReferencia?.toLowerCase().includes(searchLower)) ||
        (movement.nombreComercio?.toLowerCase().includes(searchLower)) ||
        (movement.numeroCuenta?.toLowerCase().includes(searchLower)) ||
        (movement.transaccion?.toLowerCase().includes(searchLower))
      );
    });
  }
  
  return filtered;
}

export function calculateTotalIngresos(movements: DtoMovimientoCuenta[]): number {
  return movements
    .filter((m) => getMovementType(m.tipoMovimiento) === "credito")
    .reduce((sum, m) => sum + Math.abs(m.monto), 0);
}

export function calculateTotalEgresos(movements: DtoMovimientoCuenta[]): number {
  return movements
    .filter((m) => getMovementType(m.tipoMovimiento) === "debito")
    .reduce((sum, m) => sum + Math.abs(m.monto), 0);
}

export function calculateFlujoNeto(movements: DtoMovimientoCuenta[]): number {
  const ingresos = calculateTotalIngresos(movements);
  const egresos = calculateTotalEgresos(movements);
  return ingresos - egresos;
}

export function countCreditos(movements: DtoMovimientoCuenta[]): number {
  return movements.filter((m) => {
    return getMovementType(m.tipoMovimiento) === "credito";
  }).length;
}

export function countDebitos(movements: DtoMovimientoCuenta[]): number {
  return movements.filter((m) => {
    return getMovementType(m.tipoMovimiento) === "debito";
  }).length;
}

export function sortMovementsByDate(
  movements: DtoMovimientoCuenta[],
  order: "asc" | "desc" = "desc"
): DtoMovimientoCuenta[] {
  const sorted = [...movements].sort((a, b) => {
    const dateA = new Date(a.fechaHora).getTime();
    const dateB = new Date(b.fechaHora).getTime();
    
    if (order === "desc") {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  return sorted;
}

