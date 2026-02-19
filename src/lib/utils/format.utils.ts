/**
 * Format currency amount according to currency code
 * Supports CRC, USD, and CLP currencies
 */
export function formatCurrency(amount: number, currency: string = "CRC"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  }
  
  if (currency === "CLP") {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  }
  
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
}

/**
 * Format IBAN with spaces every 4 characters
 */
export function formatIBAN(iban: string | null | undefined): string {
  if (!iban) return "";
  
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Format date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date-time string for display.
 * The API returns dates without timezone suffix (local CR time),
 * so we append the Costa Rica offset to prevent UTC misinterpretation.
 */
export function formatDateTime(dateString: string): string {
  try {
    const normalized = dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)
      ? dateString
      : dateString + '-06:00';
    const date = new Date(normalized);
    return date.toLocaleString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a Date for API requests as the START of the day in local time.
 * Returns format: "YYYY-MM-DDTHH:mm:ss" (no timezone suffix)
 * This ensures the server interprets the date in local time (Costa Rica).
 * 
 * Example: Dec 19, 2025 -> "2025-12-19T00:00:00"
 */
export function formatDateForApiStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

/**
 * Formats a Date for API requests as the END of the day in local time.
 * Returns format: "YYYY-MM-DDTHH:mm:ss.sss" (no timezone suffix)
 * This ensures the server interprets the date in local time (Costa Rica).
 * 
 * Example: Dec 19, 2025 -> "2025-12-19T23:59:59.999"
 */
export function formatDateForApiEnd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59.999`;
}
