/**
 * Configuración de variables de entorno
 * Centraliza el acceso a las variables definidas en .env
 */

import { API_BASE_URL } from '@env';

// Valores por defecto (fallback) en caso de que las variables no estén definidas
const DEFAULT_API_BASE_URL = 'https://backend-qa.csr.didi.cr';

export const config = {
  /**
   * URL base del backend API
   */
  apiBaseUrl: API_BASE_URL || DEFAULT_API_BASE_URL,

  /**
   * Modo de desarrollo
   */
  isDev: __DEV__,
} as const;

export default config;

