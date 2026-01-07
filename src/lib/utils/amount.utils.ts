/**
 * Format amount string to allow only valid numeric input
 */
export function formatAmount(value: string): string {
  const cleaned = value.replace(/^-/, '');
  if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
    return cleaned;
  }
  return value;
}

/**
 * Prevent invalid amount keys (for React Native TextInput)
 * Returns true if key should be allowed, false if it should be blocked
 */
export function isValidAmountKey(key: string): boolean {
  // Allow backspace, delete, tab, escape, enter
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
    return true;
  }
  
  // Allow numbers and decimal point
  if (/^[0-9.]$/.test(key)) {
    return true;
  }
  
  // Allow arrow keys and other navigation keys
  if (key.startsWith('Arrow') || key === 'Home' || key === 'End') {
    return true;
  }
  
  // Block minus, e, E, +
  if (['-', 'e', 'E', '+'].includes(key)) {
    return false;
  }
  
  // Allow Ctrl/Cmd + A, C, V, X (copy/paste/cut/select all)
  return false; // Default: block if not explicitly allowed
}

