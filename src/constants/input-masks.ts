import { Mask } from 'react-native-mask-input';

// Máscara para IBAN de Costa Rica: CR12 3456 7890 1234 5678 90
export const IBAN_MASK: Mask = [
  'C', 'R',
  /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/
];

// Máscara para teléfono de Costa Rica: 8888-7777
export const PHONE_MASK: Mask = [
  /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/
];
