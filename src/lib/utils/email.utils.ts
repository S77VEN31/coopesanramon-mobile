/**
 * Check if email is valid
 */
export function isEmailValid(email: string): boolean {
  if (!email) {
    return true; // Empty email is considered valid (optional field)
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email and return result with error message
 */
export function validateEmail(email: string): { isValid: boolean; error: string | null } {
  if (!email) {
    return { isValid: true, error: null }; // Empty email is valid (optional field)
  }
  
  const isValid = isEmailValid(email);
  if (!isValid) {
    return { isValid: false, error: 'Por favor ingresa un correo electrónico válido' };
  }
  
  return { isValid: true, error: null };
}

