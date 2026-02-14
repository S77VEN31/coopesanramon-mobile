import { useState, useEffect, useRef } from 'react';
import { validateSinpeAccount, type GetCuentaDestinoSinpeResponse } from '../services/api/transfers.api';
import type { DtoCuenta } from '../services/api/accounts.api';
import { IBAN_LENGTH, validateIbanFormat, extractBankCodeFromIban } from '../lib/utils/iban.utils';
import { validateEmail } from '../lib/utils/email.utils';
import { formatCurrency } from '../lib/utils/format.utils';
import { useAuthStore } from '../lib/states/auth.store';

// Re-export from API layer for backwards compatibility
import type { CuentaSinpeFavoritaItem } from '@/services/api/favorites.api';
export type { CuentaSinpeFavoritaItem } from '@/services/api/favorites.api';

export function useSinpeTransfer(
  selectedSourceAccount: DtoCuenta | null, 
  transferType: 'local' | 'sinpe' | 'sinpe-mobile',
  sinpeTransferType?: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real'
) {
  const user = useAuthStore((state) => state.user);
  
  const [sinpeDestinationType, setSinpeDestinationType] = useState<'favorites' | 'manual'>('favorites');
  const [selectedSinpeFavoriteAccount, setSelectedSinpeFavoriteAccount] = useState<CuentaSinpeFavoritaItem | null>(null);
  const [sinpeDestinationIban, setSinpeDestinationIban] = useState('');
  const [sinpeAmount, setSinpeAmount] = useState('');
  const [sinpeAmountError, setSinpeAmountError] = useState<string | null>(null);
  const [sinpeDescription, setSinpeDescription] = useState('');
  const [sinpeEmail, setSinpeEmail] = useState('');
  const [sinpeEmailError, setSinpeEmailError] = useState<string | null>(null);
  const [sinpeDestinationFormatError, setSinpeDestinationFormatError] = useState<string | null>(null);
  const [isValidatingSinpeAccount, setIsValidatingSinpeAccount] = useState(false);
  const [sinpeAccountValidationError, setSinpeAccountValidationError] = useState<string | null>(null);
  const [validatedSinpeAccountInfo, setValidatedSinpeAccountInfo] = useState<GetCuentaDestinoSinpeResponse | null>(null);
  
  const validationInProgressRef = useRef<string | null>(null);

  const resetForm = () => {
    setSelectedSinpeFavoriteAccount(null);
    setSinpeDestinationIban('');
    setSinpeAmount('');
    setSinpeAmountError(null);
    setSinpeDescription('');
    setSinpeEmail('');
    setSinpeEmailError(null);
    setSinpeDestinationFormatError(null);
    setSinpeAccountValidationError(null);
    setValidatedSinpeAccountInfo(null);
    setIsValidatingSinpeAccount(false);
    setSinpeDestinationType('favorites');
    validationInProgressRef.current = null;
  };

  const handleSinpeDestinationIbanChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    
    if (!cleaned) {
      setSinpeDestinationIban('');
      setSinpeDestinationFormatError(null);
      setSinpeAccountValidationError(null);
      setValidatedSinpeAccountInfo(null);
      setIsValidatingSinpeAccount(false);
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
    const error = validateIbanFormat(limited, false, sourceBankCode);
    setSinpeDestinationFormatError(error);
    
    if (/^[A-Z]{2}/.test(limited)) {
      const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
      setSinpeDestinationIban(formatted);
    } else {
      setSinpeDestinationIban(limited);
    }
  };

  useEffect(() => {
    if (sinpeDestinationType !== 'manual' || transferType !== 'sinpe') {
      setIsValidatingSinpeAccount(false);
      setSinpeAccountValidationError(null);
      setValidatedSinpeAccountInfo(null);
      validationInProgressRef.current = null;
      return;
    }

    const cleanedIban = sinpeDestinationIban.replace(/\s/g, '');
    
    if (!cleanedIban || !cleanedIban.startsWith('CR') || cleanedIban.length !== IBAN_LENGTH || sinpeDestinationFormatError) {
      setIsValidatingSinpeAccount(false);
      setSinpeAccountValidationError(null);
      setValidatedSinpeAccountInfo(null);
      validationInProgressRef.current = null;
      return;
    }

    const validationKey = `${cleanedIban}-${sinpeTransferType || 'none'}`;
    if (validationInProgressRef.current === validationKey) {
      return;
    }

    validationInProgressRef.current = validationKey;
    setIsValidatingSinpeAccount(true);
    setSinpeAccountValidationError(null);
    setValidatedSinpeAccountInfo(null);

    const validateSinpeAccountAsync = async () => {
      try {
        const accountInfo = await validateSinpeAccount(cleanedIban);
        
        if (selectedSourceAccount) {
          const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
          const destinationCurrency = accountInfo.codigoMonedaDestino || 'CRC';
          
          if (sourceCurrency !== destinationCurrency) {
            setSinpeAccountValidationError(
              `La cuenta destino es en ${destinationCurrency === 'USD' ? 'dólares' : 'colones'}, pero la cuenta origen es en ${sourceCurrency === 'USD' ? 'dólares' : 'colones'}. Las monedas deben coincidir.`
            );
            setValidatedSinpeAccountInfo(null);
            return;
          }

          // Validation for débitos tiempo real (simplified - can be enhanced later)
          if (sinpeTransferType === 'debitos-tiempo-real') {
            const identificacionCliente = user?.identificacion_cliente as string | undefined;
            if (identificacionCliente && accountInfo.identificacionDestino) {
              const normalizeCedula = (cedula: string): string => cedula.replace(/[^0-9]/g, '');
              const clienteCedula = normalizeCedula(identificacionCliente);
              const destinationCedula = normalizeCedula(accountInfo.identificacionDestino);
              
              if (clienteCedula !== destinationCedula) {
                setSinpeAccountValidationError(
                  'Para transferencias de débitos en tiempo real, la cuenta destino debe pertenecer al mismo titular que las cuentas de la cooperativa.'
                );
                setValidatedSinpeAccountInfo(null);
                return;
              }
            }
          }
        }
        
        setValidatedSinpeAccountInfo(accountInfo);
        setSinpeAccountValidationError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al validar la cuenta SINPE';
        setSinpeAccountValidationError(errorMessage);
        setValidatedSinpeAccountInfo(null);
      } finally {
        setIsValidatingSinpeAccount(false);
        if (validationInProgressRef.current === validationKey) {
          validationInProgressRef.current = null;
        }
      }
    };

    validateSinpeAccountAsync();
  }, [sinpeDestinationIban, sinpeDestinationType, transferType, sinpeDestinationFormatError, selectedSourceAccount, sinpeTransferType, user]);

  useEffect(() => {
    if (selectedSinpeFavoriteAccount?.email && sinpeDestinationType === 'favorites') {
      setSinpeEmail(selectedSinpeFavoriteAccount.email);
      const { error } = validateEmail(selectedSinpeFavoriteAccount.email);
      setSinpeEmailError(error);
    } else if (!selectedSinpeFavoriteAccount && sinpeDestinationType === 'favorites') {
      setSinpeEmail('');
      setSinpeEmailError(null);
    }
  }, [selectedSinpeFavoriteAccount, sinpeDestinationType]);

  useEffect(() => {
    if (sinpeDestinationType === 'favorites' && selectedSinpeFavoriteAccount?.montoMaximo && selectedSinpeFavoriteAccount.montoMaximo > 0) {
      const amountValue = parseFloat(sinpeAmount);
      if (!isNaN(amountValue) && amountValue > selectedSinpeFavoriteAccount.montoMaximo) {
        const currency = selectedSinpeFavoriteAccount.codigoMonedaDestino || 'CRC';
        const maxAmountFormatted = formatCurrency(selectedSinpeFavoriteAccount.montoMaximo, currency);
        setSinpeAmountError(`El monto máximo permitido para esta cuenta favorita es ${maxAmountFormatted}`);
      } else {
        setSinpeAmountError(null);
      }
    } else {
      setSinpeAmountError(null);
    }
  }, [sinpeAmount, selectedSinpeFavoriteAccount, sinpeDestinationType]);

  const handleSinpeEmailChange = (value: string) => {
    setSinpeEmail(value);
    if (value) {
      const { error } = validateEmail(value);
      setSinpeEmailError(error);
    } else {
      setSinpeEmailError(null);
    }
  };

  const handleSinpeDestinationTypeChange = (value: 'favorites' | 'manual') => {
    setSinpeDestinationType(value);
    setSelectedSinpeFavoriteAccount(null);
    setSinpeDestinationIban('');
    setSinpeAmount('');
    setSinpeAmountError(null);
    setSinpeEmail('');
    setSinpeEmailError(null);
    setSinpeDestinationFormatError(null);
    setSinpeAccountValidationError(null);
    setValidatedSinpeAccountInfo(null);
    setIsValidatingSinpeAccount(false);
  };

  return {
    sinpeDestinationType,
    setSinpeDestinationType: handleSinpeDestinationTypeChange,
    selectedSinpeFavoriteAccount,
    setSelectedSinpeFavoriteAccount,
    sinpeDestinationIban,
    setSinpeDestinationIban: handleSinpeDestinationIbanChange,
    sinpeAmount,
    sinpeAmountError,
    setSinpeAmount,
    sinpeDescription,
    setSinpeDescription,
    sinpeEmail,
    sinpeEmailError,
    setSinpeEmail: handleSinpeEmailChange,
    sinpeDestinationFormatError,
    isValidatingSinpeAccount,
    sinpeAccountValidationError,
    validatedSinpeAccountInfo,
    resetForm,
  };
}

