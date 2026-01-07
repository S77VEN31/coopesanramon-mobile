import {
  CreditCard,
  FileText,
  PiggyBank,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";
import { getCurrencyTotalsByTabType } from "../lib/utils/dashboard.utils";
import { formatCurrency } from "../lib/utils/format.utils";
import type { DtoProductoResumen } from "../lib/utils/dashboard.utils";
import type { TabType } from "../components/cards/SummaryCard";

export const ITEMS_PER_PAGE = 3;

export interface TabConfigItem {
  id: TabType;
  title: string;
  description: string;
  icon: LucideIcon;
  summaryIcon: LucideIcon;
  moneyColor?: string;
  showExtraInfo: boolean;
  label: { singular: string; plural: string };
  getSummaryValue: (productos?: DtoProductoResumen[] | null) => string;
  getSummaryValueUSD: (productos?: DtoProductoResumen[] | null) => string | undefined;
  getSummarySubtitle: (productos?: DtoProductoResumen[] | null) => string;
}

const TAB_CONFIG_LIST: TabConfigItem[] = [
  {
    id: "accounts",
    title: "Cuentas",
    description: "Resumen de tus cuentas de efectivo y depósitos",
    icon: CreditCard,
    summaryIcon: Wallet,
    moneyColor: undefined,
    showExtraInfo: false,
    label: { singular: "cuenta", plural: "cuentas" },
    getSummaryValue: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "accounts");
      return formatCurrency(totals.CRC.total, "CRC");
    },
    getSummaryValueUSD: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "accounts");
      return formatCurrency(totals.USD.total, "USD");
    },
    getSummarySubtitle: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "accounts");
      const count = totals.CRC.count + totals.USD.count;
      return `${count} ${count === 1 ? "cuenta" : "cuentas"}`;
    },
  },
  {
    id: "savings",
    title: "Ahorros",
    description: "Tus productos de ahorro y capital social",
    icon: PiggyBank,
    summaryIcon: PiggyBank,
    moneyColor: undefined,
    showExtraInfo: false,
    label: { singular: "ahorro", plural: "ahorros" },
    getSummaryValue: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "savings");
      return formatCurrency(totals.CRC.total, "CRC");
    },
    getSummaryValueUSD: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "savings");
      return formatCurrency(totals.USD.total, "USD");
    },
    getSummarySubtitle: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "savings");
      const count = totals.CRC.count + totals.USD.count;
      return `${count} ${count === 1 ? "ahorro" : "ahorros"}`;
    },
  },
  {
    id: "loans",
    title: "Préstamos",
    description: "Estado de tus créditos activos",
    icon: FileText,
    summaryIcon: FileText,
    moneyColor: undefined,
    showExtraInfo: true,
    label: { singular: "préstamo", plural: "préstamos" },
    getSummaryValue: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "loans");
      return formatCurrency(totals.CRC.total, "CRC");
    },
    getSummaryValueUSD: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "loans");
      return formatCurrency(totals.USD.total, "USD");
    },
    getSummarySubtitle: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "loans");
      const count = totals.CRC.count + totals.USD.count;
      return `${count} ${count === 1 ? "préstamo" : "préstamos"}`;
    },
  },
  {
    id: "investments",
    title: "Inversiones",
    description: "Tus certificados desmaterializados y productos de inversión",
    icon: TrendingUp,
    summaryIcon: TrendingUp,
    moneyColor: undefined,
    showExtraInfo: false,
    label: { singular: "inversión", plural: "inversiones" },
    getSummaryValue: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "investments");
      return formatCurrency(totals.CRC.total, "CRC");
    },
    getSummaryValueUSD: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "investments");
      return formatCurrency(totals.USD.total, "USD");
    },
    getSummarySubtitle: (productos) => {
      const totals = getCurrencyTotalsByTabType(productos, "investments");
      const count = totals.CRC.count + totals.USD.count;
      return `${count} ${count === 1 ? "inversión" : "inversiones"}`;
    },
  },
];

export const TAB_CONFIG: Record<TabType, TabConfigItem> = TAB_CONFIG_LIST.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<TabType, TabConfigItem>
);

