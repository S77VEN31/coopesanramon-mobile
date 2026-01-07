export const IBAN_LENGTH = 22;

export function extractBankCodeFromIban(iban: string): string | null {
  if (!iban || iban.length < 8) return null;
  if (!/^CR/i.test(iban)) return null;
  
  try {
    const bankCode = iban.substring(4, 7);
    if (/^\d{3}$/.test(bankCode)) {
      return bankCode;
    }
  } catch {
    return null;
  }
  return null;
}

export function formatIban(value: string): string {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  
  if (!cleaned) {
    return "";
  }
  
  let processedValue = cleaned;
  if (/^[0-9]+$/.test(cleaned) && cleaned.length >= 8) {
    processedValue = "CR" + cleaned;
  }
  
  let validated = "";
  for (let i = 0; i < processedValue.length; i++) {
    const char = processedValue[i];
    if (i < 2) {
      if (/[A-Z]/.test(char)) {
        validated += char;
      }
    } else {
      if (/[0-9]/.test(char)) {
        validated += char;
      }
    }
  }
  
  const maxIbanLength = IBAN_LENGTH;
  const limited = validated.slice(0, maxIbanLength);
  
  if (/^[A-Z]{2}/.test(limited)) {
    return limited
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }
  
  return limited;
}

export function validateIbanFormat(
  iban: string,
  isLocal: boolean,
  sourceBankCode: string | null
): string | null {
  const cleaned = iban.replace(/\s/g, "");
  
  if (cleaned.length === 0) {
    return null;
  }
  
  if (!/^CR/.test(cleaned)) {
    return "Debe ingresar un IBAN válido";
  }
  
  if (cleaned.length < 8) {
    return "El IBAN debe tener al menos 8 caracteres";
  }
  
  if (cleaned.length < 10) {
    return "El IBAN parece incompleto";
  }
  
  if (cleaned.length > IBAN_LENGTH) {
    return "El IBAN excede la longitud máxima permitida";
  }
  
  if (sourceBankCode) {
    const destinationBankCode = extractBankCodeFromIban(cleaned);
    
    if (isLocal) {
      if (destinationBankCode && destinationBankCode !== sourceBankCode) {
        return "Esta cuenta pertenece a otro banco. Solo se permiten transferencias locales al mismo banco.";
      }
    } else {
      if (destinationBankCode && destinationBankCode === sourceBankCode) {
        return "Esta cuenta pertenece al mismo banco. Use \"Transferencias Locales\" para cuentas del mismo banco.";
      }
    }
  }
  
  return null;
}
