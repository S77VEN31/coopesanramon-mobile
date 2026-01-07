import { formatCurrency } from "./format.utils";
import { TipoProducto } from "../../constants/enums";
import type { TabType } from "../../components/cards/SummaryCard";

export interface DtoProductoResumen {
  tipoProducto: number;
  cantidad: number;
  saldoTotal: number | { source: string; parsedValue: number };
  codigoMoneda?: string | null;
  descripcion?: string | null;
}

export interface CurrencyTotals {
  CRC: { total: number; count: number };
  USD: { total: number; count: number };
}

export function mapTipoProductoToTabType(tipoProducto: TipoProducto): TabType | null {
  switch (tipoProducto) {
    case TipoProducto.Cuentas:
      return "accounts";
    case TipoProducto.Ahorro:
      return "savings";
    case TipoProducto.Prestamos:
      return "loans";
    case TipoProducto.Inversiones:
      return "investments";
    case TipoProducto.TarjetasCredito:
      return "creditCards";
    case TipoProducto.ServiciosElectricos:
      return "electricServices";
    case TipoProducto.NoDefinido:
      return "others";
    default:
      return null;
  }
}

export function mapTabTypeToTipoProducto(tabType: TabType): TipoProducto {
  switch (tabType) {
    case "accounts":
      return TipoProducto.Cuentas;
    case "savings":
      return TipoProducto.Ahorro;
    case "loans":
      return TipoProducto.Prestamos;
    case "investments":
      return TipoProducto.Inversiones;
    case "creditCards":
      return TipoProducto.TarjetasCredito;
    case "electricServices":
      return TipoProducto.ServiciosElectricos;
    case "others":
      return TipoProducto.NoDefinido;
    default:
      return TipoProducto.NoDefinido;
  }
}

function normalizeSaldoTotal(saldoTotal: number | { source: string; parsedValue: number }): number {
  if (typeof saldoTotal === "number") {
    return saldoTotal;
  }
  if (typeof saldoTotal === "object" && saldoTotal !== null && "parsedValue" in saldoTotal) {
    return saldoTotal.parsedValue;
  }
  return 0;
}

export function getCurrencyTotalsByTabType(
  productos: DtoProductoResumen[] | null | undefined,
  tabType: TabType
): CurrencyTotals {
  const defaultTotals: CurrencyTotals = {
    CRC: { total: 0, count: 0 },
    USD: { total: 0, count: 0 },
  };

  if (!productos || productos.length === 0) return defaultTotals;

  const tipoProducto = mapTabTypeToTipoProducto(tabType);

  const matchingProducts = productos.filter((p) => p.tipoProducto === tipoProducto);

  matchingProducts.forEach((product) => {
    const currency = product.codigoMoneda || "CRC";
    const saldoTotal = normalizeSaldoTotal(product.saldoTotal);
    const cantidad = product.cantidad || 0;

    if (currency === "USD") {
      defaultTotals.USD.total += saldoTotal;
      defaultTotals.USD.count += cantidad;
    } else {
      defaultTotals.CRC.total += saldoTotal;
      defaultTotals.CRC.count += cantidad;
    }
  });

  return defaultTotals;
}

export function getProductosByTabType(
  productos: DtoProductoResumen[] | null | undefined,
  tabType: TabType
): DtoProductoResumen[] {
  if (!productos || productos.length === 0) return [];
  
  const tipoProducto = mapTabTypeToTipoProducto(tabType);
  
  return productos.filter((p) => p.tipoProducto === tipoProducto);
}

export function formatProductoSaldo(
  producto: DtoProductoResumen | undefined,
  defaultCurrency: string = "CRC"
): string {
  if (!producto) return formatCurrency(0, defaultCurrency);
  
  const currency = producto.codigoMoneda || defaultCurrency;
  const saldoTotal = normalizeSaldoTotal(producto.saldoTotal);
  return formatCurrency(saldoTotal, currency);
}

