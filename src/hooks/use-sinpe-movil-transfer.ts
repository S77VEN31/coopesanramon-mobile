import { useState, useRef, useEffect } from 'react';
import { validateSinpeMovilMonedero, type ObtenerMonederoSinpeResponse } from '../services/api/transfers.api';
import { validateEmail } from '../lib/utils/email.utils';
import { formatCurrency } from '../lib/utils/format.utils';

// Simplified favorite wallet interface
export interface MonederoFavoritoItem {
  id: number;
  monedero: string | null;
  titular: string | null;
  codigoBanco: string | null;
  email: string | null;
  alias: string | null;
  montoMaximo: number | null;
}

export function useSinpeMovilTransfer() {
  const [sinpeMovilDestinationType, setSinpeMovilDestinationType] = useState<'favorites' | 'manual'>('favorites');
  const [selectedSinpeMovilFavoriteWallet, setSelectedSinpeMovilFavoriteWallet] = useState<MonederoFavoritoItem | null>(null);
  const [sinpeMovilPhoneNumber, setSinpeMovilPhoneNumber] = useState('');
  const [sinpeMovilAmount, setSinpeMovilAmount] = useState('');
  const [sinpeMovilAmountError, setSinpeMovilAmountError] = useState<string | null>(null);
  const [sinpeMovilDescription, setSinpeMovilDescription] = useState('');
  const [sinpeMovilEmail, setSinpeMovilEmail] = useState('');
  const [sinpeMovilEmailError, setSinpeMovilEmailError] = useState<string | null>(null);
  const [sinpeMovilMonederoInfo, setSinpeMovilMonederoInfo] = useState<ObtenerMonederoSinpeResponse | null>(null);
  const [sinpeMovilMonederoError, setSinpeMovilMonederoError] = useState<string | null>(null);
  const [isValidatingSinpeMovilMonedero, setIsValidatingSinpeMovilMonedero] = useState(false);
  
  const validationInProgressRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetForm = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setSinpeMovilPhoneNumber('');
    setSinpeMovilAmount('');
    setSinpeMovilAmountError(null);
    setSinpeMovilDescription('');
    setSinpeMovilEmail('');
    setSinpeMovilEmailError(null);
    setSinpeMovilMonederoInfo(null);
    setSinpeMovilMonederoError(null);
    setIsValidatingSinpeMovilMonedero(false);
    setSelectedSinpeMovilFavoriteWallet(null);
    setSinpeMovilDestinationType('favorites');
    validationInProgressRef.current = null;
  };

  const handleSinpeMovilPhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 8) {
      setSinpeMovilPhoneNumber(cleaned);
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      if (!cleaned) {
        setSinpeMovilMonederoInfo(null);
        setSinpeMovilMonederoError(null);
        setIsValidatingSinpeMovilMonedero(false);
        validationInProgressRef.current = null;
        return;
      }
      
      setSinpeMovilMonederoInfo(null);
      setSinpeMovilMonederoError(null);
      
      debounceTimeoutRef.current = setTimeout(async () => {
        if (validationInProgressRef.current === cleaned) {
          return;
        }
        
        validationInProgressRef.current = cleaned;
        setIsValidatingSinpeMovilMonedero(true);
        try {
          const monederoInfo = await validateSinpeMovilMonedero(cleaned);
          if (validationInProgressRef.current === cleaned) {
            setSinpeMovilMonederoInfo(monederoInfo);
            setSinpeMovilMonederoError(null);
          }
        } catch (error) {
          if (validationInProgressRef.current === cleaned) {
            const errorMessage = error instanceof Error ? error.message : 'Error al validar el monedero';
            setSinpeMovilMonederoError(errorMessage);
            setSinpeMovilMonederoInfo(null);
          }
        } finally {
          if (validationInProgressRef.current === cleaned) {
            setIsValidatingSinpeMovilMonedero(false);
            validationInProgressRef.current = null;
          }
        }
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSinpeMovilFavoriteWallet?.email && sinpeMovilDestinationType === 'favorites') {
      setSinpeMovilEmail(selectedSinpeMovilFavoriteWallet.email);
      const { error } = validateEmail(selectedSinpeMovilFavoriteWallet.email);
      setSinpeMovilEmailError(error);
    } else if (!selectedSinpeMovilFavoriteWallet && sinpeMovilDestinationType === 'favorites') {
      setSinpeMovilEmail('');
      setSinpeMovilEmailError(null);
    }
  }, [selectedSinpeMovilFavoriteWallet, sinpeMovilDestinationType]);

  useEffect(() => {
    if (sinpeMovilDestinationType === 'favorites' && selectedSinpeMovilFavoriteWallet?.montoMaximo && selectedSinpeMovilFavoriteWallet.montoMaximo > 0) {
      const amountValue = parseFloat(sinpeMovilAmount);
      if (!isNaN(amountValue) && amountValue > selectedSinpeMovilFavoriteWallet.montoMaximo) {
        const maxAmountFormatted = formatCurrency(selectedSinpeMovilFavoriteWallet.montoMaximo, 'CRC');
        setSinpeMovilAmountError(`El monto máximo permitido para esta cuenta favorita es ${maxAmountFormatted}`);
      } else {
        setSinpeMovilAmountError(null);
      }
    } else {
      setSinpeMovilAmountError(null);
    }
  }, [sinpeMovilAmount, selectedSinpeMovilFavoriteWallet, sinpeMovilDestinationType]);

  const handleSinpeMovilEmailChange = (value: string) => {
    setSinpeMovilEmail(value);
    if (value) {
      const { error } = validateEmail(value);
      setSinpeMovilEmailError(error);
    } else {
      setSinpeMovilEmailError(null);
    }
  };

  const handleSinpeMovilDestinationTypeChange = (value: 'favorites' | 'manual') => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setSinpeMovilDestinationType(value);
    setSelectedSinpeMovilFavoriteWallet(null);
    setSinpeMovilPhoneNumber('');
    setSinpeMovilAmount('');
    setSinpeMovilAmountError(null);
    setSinpeMovilMonederoInfo(null);
    setSinpeMovilMonederoError(null);
    setIsValidatingSinpeMovilMonedero(false);
    setSinpeMovilEmail('');
    setSinpeMovilEmailError(null);
    validationInProgressRef.current = null;
  };

  return {
    sinpeMovilDestinationType,
    setSinpeMovilDestinationType: handleSinpeMovilDestinationTypeChange,
    selectedSinpeMovilFavoriteWallet,
    setSelectedSinpeMovilFavoriteWallet,
    sinpeMovilPhoneNumber,
    setSinpeMovilPhoneNumber: handleSinpeMovilPhoneChange,
    sinpeMovilAmount,
    sinpeMovilAmountError,
    setSinpeMovilAmount: (value: string) => {
      const cleaned = value.replace(/^-/, '');
      if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
        setSinpeMovilAmount(cleaned);
      }
    },
    sinpeMovilDescription,
    setSinpeMovilDescription,
    sinpeMovilEmail,
    sinpeMovilEmailError,
    setSinpeMovilEmail: handleSinpeMovilEmailChange,
    isValidatingSinpeMovilMonedero,
    sinpeMovilMonederoError,
    sinpeMovilMonederoInfo,
    resetForm,
  };
}

