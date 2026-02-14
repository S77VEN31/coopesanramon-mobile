import { useState, useEffect, useRef } from 'react';
import { validateAccount, type GetCuentaDestinoInternaResponse } from '../services/api/transfers.api';
import type { DtoCuenta } from '../services/api/accounts.api';
import { IBAN_LENGTH, validateIbanFormat, extractBankCodeFromIban } from '../lib/utils/iban.utils';
import { validateEmail } from '../lib/utils/email.utils';
import { formatCurrency } from '../lib/utils/format.utils';

// Re-export from API layer for backwards compatibility
import type { CuentaFavoritaInternaItem } from '@/services/api/favorites.api';
export type { CuentaFavoritaInternaItem } from '@/services/api/favorites.api';

export function useLocalTransfer(
  selectedSourceAccount: DtoCuenta | null, 
  transferType: 'local' | 'sinpe' | 'sinpe-mobile'
): {
  destinationType: 'favorites' | 'own' | 'manual';
  setDestinationType: (value: 'favorites' | 'own' | 'manual') => void;
  selectedFavoriteAccount: CuentaFavoritaInternaItem | null;
  setSelectedFavoriteAccount: (account: CuentaFavoritaInternaItem | null) => void;
  selectedOwnAccount: DtoCuenta | null;
  setSelectedOwnAccount: (account: DtoCuenta | null) => void;
  destinationIban: string;
  setDestinationIban: (value: string) => void;
  amount: string;
  amountError: string | null;
  setAmount: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  email: string;
  emailError: string | null;
  setEmail: (value: string) => void;
  destinationFormatError: string | null;
  isValidatingAccount: boolean;
  accountValidationError: string | null;
  validatedAccountInfo: GetCuentaDestinoInternaResponse | null;
  resetForm: () => void;
} {
  const [destinationType, setDestinationType] = useState<'favorites' | 'own' | 'manual'>('favorites');
  const [selectedFavoriteAccount, setSelectedFavoriteAccount] = useState<CuentaFavoritaInternaItem | null>(null);
  const [selectedOwnAccount, setSelectedOwnAccount] = useState<DtoCuenta | null>(null);
  const [destinationIban, setDestinationIban] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [destinationFormatError, setDestinationFormatError] = useState<string | null>(null);
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);
  const [accountValidationError, setAccountValidationError] = useState<string | null>(null);
  const [validatedAccountInfo, setValidatedAccountInfo] = useState<GetCuentaDestinoInternaResponse | null>(null);
  
  const validationInProgressRef = useRef<string | null>(null);

  const resetForm = () => {
    setSelectedFavoriteAccount(null);
    setSelectedOwnAccount(null);
    setDestinationIban('');
    setAmount('');
    setAmountError(null);
    setEmail('');
    setEmailError(null);
    setDestinationFormatError(null);
    setAccountValidationError(null);
    setValidatedAccountInfo(null);
    setIsValidatingAccount(false);
    setDestinationType('favorites');
    validationInProgressRef.current = null;
  };

  const handleDestinationIbanChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    
    if (!cleaned) {
      setDestinationIban('');
      setDestinationFormatError(null);
      setAccountValidationError(null);
      setValidatedAccountInfo(null);
      setIsValidatingAccount(false);
      return;
    }
    
    let processedValue = cleaned;
    if (/^[0-9]+$/.test(cleaned) && cleaned.length >= 8) {
      processedValue = 'CR' + cleaned;
    }
    
    let validated = '';
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
    
    const sourceIban = selectedSourceAccount?.numeroCuentaIban || selectedSourceAccount?.numeroCuenta || '';
    const sourceBankCode = extractBankCodeFromIban(sourceIban);
    const error = validateIbanFormat(limited, true, sourceBankCode);
    setDestinationFormatError(error);
    
    if (/^[A-Z]{2}/.test(limited)) {
      const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
      setDestinationIban(formatted);
    } else {
      setDestinationIban(limited);
    }
  };

  useEffect(() => {
    if (destinationType !== 'manual' || transferType !== 'local') {
      setIsValidatingAccount(false);
      setAccountValidationError(null);
      setValidatedAccountInfo(null);
      validationInProgressRef.current = null;
      return;
    }

    const cleanedIban = destinationIban.replace(/\s/g, '');
    
    if (!cleanedIban || !cleanedIban.startsWith('CR') || cleanedIban.length !== IBAN_LENGTH || destinationFormatError) {
      setIsValidatingAccount(false);
      setAccountValidationError(null);
      setValidatedAccountInfo(null);
      validationInProgressRef.current = null;
      return;
    }

    if (validationInProgressRef.current === cleanedIban) {
      return;
    }

    validationInProgressRef.current = cleanedIban;
    setIsValidatingAccount(true);
    setAccountValidationError(null);
    setValidatedAccountInfo(null);

    const validateAccountAsync = async () => {
      try {
        const accountInfo = await validateAccount(cleanedIban);
        
        if (selectedSourceAccount) {
          const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
          const destinationCurrency = accountInfo.codigoMoneda || 'CRC';
          
          if (sourceCurrency !== destinationCurrency) {
            setAccountValidationError(
              `La cuenta destino es en ${destinationCurrency === 'USD' ? 'dólares' : 'colones'}, pero la cuenta origen es en ${sourceCurrency === 'USD' ? 'dólares' : 'colones'}. Las monedas deben coincidir.`
            );
            setValidatedAccountInfo(null);
            return;
          }
        }
        
        setValidatedAccountInfo(accountInfo);
        setAccountValidationError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al validar la cuenta';
        setAccountValidationError(errorMessage);
        setValidatedAccountInfo(null);
      } finally {
        setIsValidatingAccount(false);
        if (validationInProgressRef.current === cleanedIban) {
          validationInProgressRef.current = null;
        }
      }
    };

    validateAccountAsync();
  }, [destinationIban, destinationType, transferType, destinationFormatError, selectedSourceAccount]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const { error } = validateEmail(value);
      setEmailError(error);
    } else {
      setEmailError(null);
    }
  };

  useEffect(() => {
    if (selectedFavoriteAccount?.email && destinationType === 'favorites') {
      setEmail(selectedFavoriteAccount.email);
      const { error } = validateEmail(selectedFavoriteAccount.email);
      setEmailError(error);
    } else if (!selectedFavoriteAccount && destinationType === 'favorites') {
      setEmail('');
      setEmailError(null);
    }
  }, [selectedFavoriteAccount, destinationType]);

  useEffect(() => {
    if (destinationType === 'favorites' && selectedFavoriteAccount?.montoMaximo && selectedFavoriteAccount.montoMaximo > 0) {
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue) && amountValue > selectedFavoriteAccount.montoMaximo) {
        const currency = selectedFavoriteAccount.codigoMoneda || 'CRC';
        const maxAmountFormatted = formatCurrency(selectedFavoriteAccount.montoMaximo, currency);
        setAmountError(`El monto máximo permitido para esta cuenta favorita es ${maxAmountFormatted}`);
      } else {
        setAmountError(null);
      }
    } else {
      setAmountError(null);
    }
  }, [amount, selectedFavoriteAccount, destinationType]);

  const handleDestinationTypeChange = (value: 'favorites' | 'own' | 'manual') => {
    setDestinationType(value);
    setSelectedFavoriteAccount(null);
    setSelectedOwnAccount(null);
    setDestinationIban('');
    setAmount('');
    setAmountError(null);
    setEmail('');
    setEmailError(null);
    setDestinationFormatError(null);
    setAccountValidationError(null);
    setValidatedAccountInfo(null);
    setIsValidatingAccount(false);
  };

  return {
    destinationType,
    setDestinationType: handleDestinationTypeChange,
    selectedFavoriteAccount,
    setSelectedFavoriteAccount,
    selectedOwnAccount,
    setSelectedOwnAccount,
    destinationIban,
    setDestinationIban: handleDestinationIbanChange,
    amount,
    amountError,
    setAmount,
    description,
    setDescription,
    email,
    emailError,
    setEmail: handleEmailChange,
    destinationFormatError,
    isValidatingAccount,
    accountValidationError,
    validatedAccountInfo,
    resetForm,
  };
}

