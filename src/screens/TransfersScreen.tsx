import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { MainDrawerParamList } from '@/navigation/types';
import { useAuthStore } from '@/lib/states/auth.store';
import { useAccountsStore } from '@/lib/states/accounts.store';
import { useInternalTransfersStore, transferRequires2FA } from '@/lib/states/internalTransfers.store';
import { useSinpeTransfersStore, sinpeTransferRequires2FA, getSinpeOperationType } from '@/lib/states/sinpeTransfers.store';
import { useSinpeMovilTransfersStore, sinpeMovilTransferRequires2FA, getSinpeMovilOperationType } from '@/lib/states/sinpeMovilTransfers.store';
import { useSecondFactorStore } from '@/lib/states/secondFactor.store';
import { TipoOperacion, TipoDestinoTransferencia } from '@/constants/enums';
import { formatAmount } from '@/lib/utils/amount.utils';
import { isEmailValid } from '@/lib/utils/email.utils';
import { getAccountIdentifier } from '@/lib/utils/accounts.utils';
import { getBackgroundColor } from '../../App';
import ContentCard from '@/components/cards/ContentCard';
import MessageCard from '@/components/cards/MessageCard';
import SourceAccountSelectionModal from '@/components/modals/SourceAccountSelectionModal';
import DestinationAccountSelectionModal from '@/components/modals/DestinationAccountSelectionModal';
import TwoFAVerificationModal from '@/components/modals/TwoFAVerificationModal';
import TransferSuccessModal from '@/components/modals/TransferSuccessModal';
import TransferWizard from '@/components/wizard/TransferWizard';
import {
  TransferTypeStep,
  AccountSelectionStep,
  TransferDetailsStep,
  ConfirmationStep,
} from '@/components/wizard/steps';
import { useLocalTransfer, type CuentaFavoritaInternaItem } from '@/hooks/use-local-transfer';
import { useSinpeTransfer, type CuentaSinpeFavoritaItem } from '@/hooks/use-sinpe-transfer';
import { useSinpeMovilTransfer, type MonederoFavoritoItem } from '@/hooks/use-sinpe-movil-transfer';
import type { DtoCuenta } from '@/services/api/accounts.api';
import { api } from '@/services/api';
import type { EnviarTransferenciaInternaResponse, EnviarTransferenciaSinpeResponse, EnviarTransferenciaSinpeMovilResponse } from '@/services/api/transfers.api';

type Props = DrawerScreenProps<MainDrawerParamList, 'Transfers'>;

// Interfaces for favorite accounts/wallets
interface ListInternalFavoriteAccountsResponse {
  cuentasFavoritas: CuentaFavoritaInternaItem[] | null;
  total: number;
}

interface ListSinpeFavoriteAccountsResponse {
  cuentasFavoritas: CuentaSinpeFavoritaItem[] | null;
  total: number;
}

interface ListFavoriteWalletsResponse {
  monederosFavoritos: MonederoFavoritoItem[] | null;
  total: number;
}

export default function TransfersScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);

  const { isAuthenticated } = useAuthStore();
  const {
    accounts: userAccounts,
    isLoading: isLoadingAccounts,
    error: accountsError,
    loadAccounts,
  } = useAccountsStore();

  const {
    isSending,
    error: transferError,
    lastTransfer,
    sendTransfer,
    resetState: resetTransferState,
  } = useInternalTransfersStore();

  const {
    isSending: isSendingSinpe,
    error: sinpeTransferError,
    lastTransfer: lastSinpeTransfer,
    lastTransferEmailDestino: lastSinpeTransferEmailDestino,
    sendtransferenciaSinpe,
    sendtransferenciaCreditosDirectos,
    sendtransferenciaDebitosTiempoReal,
    sinpeTransferType,
    setSinpeTransferType,
    resetState: resetSinpeTransferState,
  } = useSinpeTransfersStore();

  const {
    isSending: isSendingSinpeMovil,
    error: sinpeMovilTransferError,
    lastTransfer: lastSinpeMovilTransfer,
    lastTransferEmailDestino: lastSinpeMovilTransferEmailDestino,
    sendSinpeMovilTransfer,
    resetState: resetSinpeMovilTransferState,
  } = useSinpeMovilTransfersStore();

  const { openModal: open2FAModal, isModalOpen: is2FAModalOpen, operationSuccess, closeModal: close2FAModal } = useSecondFactorStore();

  const [transferType, setTransferType] = useState<'local' | 'sinpe' | 'sinpe-mobile' | null>(null);
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<DtoCuenta | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sinpeFlowType, setSinpeFlowType] = useState<'enviar-fondos' | 'recibir-fondos'>('enviar-fondos');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTransfer, setSuccessTransfer] = useState<EnviarTransferenciaInternaResponse | EnviarTransferenciaSinpeResponse | EnviarTransferenciaSinpeMovilResponse | null>(null);
  const [successTransferEmailDestino, setSuccessTransferEmailDestino] = useState<string | null>(null);

  // Favorite accounts/wallets state
  const [favoriteAccounts, setFavoriteAccounts] = useState<CuentaFavoritaInternaItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [sinpeFavoriteAccounts, setSinpeFavoriteAccounts] = useState<CuentaSinpeFavoritaItem[]>([]);
  const [isLoadingSinpeFavorites, setIsLoadingSinpeFavorites] = useState(false);
  const [favoriteWallets, setFavoriteWallets] = useState<MonederoFavoritoItem[]>([]);
  const [isLoadingFavoriteWallets, setIsLoadingFavoriteWallets] = useState(false);

  const localTransfer = useLocalTransfer(selectedSourceAccount, transferType || 'local');
  const sinpeTransfer = useSinpeTransfer(selectedSourceAccount, transferType || 'sinpe', sinpeTransferType ?? undefined);
  const sinpeMovilTransfer = useSinpeMovilTransfer();

  // Load accounts and favorites on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
      loadInternalFavorites();
      loadSinpeFavorites();
      loadFavoriteWallets();
    }
  }, [isAuthenticated]);

  // Load internal favorite accounts
  const loadInternalFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await api.get<ListInternalFavoriteAccountsResponse>('/api/CuentasFavoritasInternas/listar', true);
      setFavoriteAccounts(response.cuentasFavoritas || []);
    } catch (error) {
      setFavoriteAccounts([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Load SINPE favorite accounts
  const loadSinpeFavorites = async () => {
    setIsLoadingSinpeFavorites(true);
    try {
      const response = await api.get<ListSinpeFavoriteAccountsResponse>('/api/CuentasFavoritasSinpe/listar', true);
      setSinpeFavoriteAccounts(response.cuentasFavoritas || []);
    } catch (error) {
      setSinpeFavoriteAccounts([]);
    } finally {
      setIsLoadingSinpeFavorites(false);
    }
  };

  // Load favorite wallets
  const loadFavoriteWallets = async () => {
    setIsLoadingFavoriteWallets(true);
    try {
      const response = await api.get<ListFavoriteWalletsResponse>('/api/MonederosFavoritos/listar', true);
      setFavoriteWallets(response.monederosFavoritos || []);
    } catch (error) {
      setFavoriteWallets([]);
    } finally {
      setIsLoadingFavoriteWallets(false);
    }
  };

  // Detect successful transfer and show success modal
  useEffect(() => {
    if (operationSuccess && transferType === 'local' && lastTransfer) {
      setSuccessTransfer(lastTransfer);
      setSuccessTransferEmailDestino(null);
      setShowSuccessModal(true);
    } else if (operationSuccess && transferType === 'sinpe' && lastSinpeTransfer) {
      setSuccessTransfer(lastSinpeTransfer);
      setSuccessTransferEmailDestino(lastSinpeTransferEmailDestino);
      setShowSuccessModal(true);
    } else if (operationSuccess && transferType === 'sinpe-mobile' && lastSinpeMovilTransfer) {
      setSuccessTransfer(lastSinpeMovilTransfer);
      setSuccessTransferEmailDestino(lastSinpeMovilTransferEmailDestino);
      setShowSuccessModal(true);
    }
  }, [operationSuccess, lastTransfer, lastSinpeTransfer, lastSinpeMovilTransfer, lastSinpeTransferEmailDestino, lastSinpeMovilTransferEmailDestino, transferType]);

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessTransfer(null);
    setSuccessTransferEmailDestino(null);
    close2FAModal();
    loadAccounts();
    setTransferType(null);
    setSelectedSourceAccount(null);
    localTransfer.resetForm();
    sinpeTransfer.resetForm();
    sinpeMovilTransfer.resetForm();
    resetTransferState();
    resetSinpeTransferState();
    resetSinpeMovilTransferState();
    setSinpeFlowType('enviar-fondos');
  };

  // Handle transfer type change
  const handleTransferTypeChange = (value: 'local' | 'sinpe' | 'sinpe-mobile') => {
    setTransferType(value);
    setSelectedSourceAccount(null);
    localTransfer.resetForm();
    sinpeTransfer.resetForm();
    sinpeMovilTransfer.resetForm();
    resetTransferState();
    resetSinpeTransferState();
    resetSinpeMovilTransferState();
    setSinpeFlowType('enviar-fondos');
    if (value === 'sinpe') {
      setSinpeTransferType('pagos-inmediatos');
    }
  };

  // Handle source account selection by identifier
  const handleSourceAccountSelect = (accountIdentifier: string) => {
    const account = userAccounts.find(
      (acc) => (acc.numeroCuentaIban || acc.numeroCuenta || '') === accountIdentifier
    );
    if (!account) return;

    setSelectedSourceAccount(account);

    const sourceCurrency = account.moneda || 'CRC';

    if (localTransfer.selectedFavoriteAccount) {
      const favoriteCurrency = localTransfer.selectedFavoriteAccount.codigoMoneda || 'CRC';
      if (sourceCurrency !== favoriteCurrency) {
        localTransfer.setSelectedFavoriteAccount(null);
        localTransfer.setDestinationIban('');
      }
    }

    if (localTransfer.selectedOwnAccount) {
      const ownCurrency = localTransfer.selectedOwnAccount.moneda || 'CRC';
      if (sourceCurrency !== ownCurrency) {
        localTransfer.setSelectedOwnAccount(null);
        localTransfer.setDestinationIban('');
      }
    }

    if (sinpeTransfer.selectedSinpeFavoriteAccount) {
      const sinpeCurrency = sinpeTransfer.selectedSinpeFavoriteAccount.codigoMonedaDestino || 'CRC';
      if (sourceCurrency !== sinpeCurrency) {
        sinpeTransfer.setSelectedSinpeFavoriteAccount(null);
        sinpeTransfer.setSinpeDestinationIban('');
      }
    }
  };

  // Handle destination selections
  const handleFavoriteAccountSelect = (account: CuentaFavoritaInternaItem) => {
    localTransfer.setSelectedFavoriteAccount(account);
    localTransfer.setDestinationIban(account.numeroCuenta || '');
    setIsDestinationModalOpen(false);
  };

  const handleOwnAccountSelect = (accountIdentifier: string) => {
    const account = getFilteredAccounts().find(
      (acc) => (acc.numeroCuentaIban || acc.numeroCuenta || '') === accountIdentifier
    );
    if (!account) return;
    
    localTransfer.setSelectedOwnAccount(account);
    localTransfer.setDestinationIban(account.numeroCuentaIban || account.numeroCuenta || '');
  };

  const handleSinpeFavoriteAccountSelect = (account: CuentaSinpeFavoritaItem) => {
    sinpeTransfer.setSelectedSinpeFavoriteAccount(account);
    sinpeTransfer.setSinpeDestinationIban(account.numeroCuentaDestino || '');
    setIsDestinationModalOpen(false);
  };

  const handleSinpeMovilFavoriteWalletSelect = (wallet: MonederoFavoritoItem) => {
    sinpeMovilTransfer.setSelectedSinpeMovilFavoriteWallet(wallet);
    if (wallet.monedero) {
      sinpeMovilTransfer.setSinpeMovilPhoneNumber(wallet.monedero);
    }
    setIsDestinationModalOpen(false);
  };

  // Filter accounts/favorites
  const getFilteredAccounts = () => {
    if (!selectedSourceAccount) return userAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    return userAccounts.filter(acc => acc.moneda === sourceCurrency);
  };

  const getFilteredFavorites = () => {
    if (!selectedSourceAccount) return favoriteAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    const searchLower = searchTerm.toLowerCase();
    return favoriteAccounts.filter(acc => {
      if (acc.codigoMoneda !== sourceCurrency) return false;
      return (
        acc.numeroCuenta?.toLowerCase().includes(searchLower) ||
        acc.alias?.toLowerCase().includes(searchLower) ||
        acc.titular?.toLowerCase().includes(searchLower)
      );
    });
  };

  const getFilteredSinpeFavorites = () => {
    if (!selectedSourceAccount) return sinpeFavoriteAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    const searchLower = searchTerm.toLowerCase();
    return sinpeFavoriteAccounts.filter(acc => {
      if (acc.codigoMonedaDestino !== sourceCurrency) return false;
      return (
        acc.numeroCuentaDestino?.toLowerCase().includes(searchLower) ||
        acc.alias?.toLowerCase().includes(searchLower) ||
        acc.titularDestino?.toLowerCase().includes(searchLower)
      );
    });
  };

  const getFilteredFavoriteWallets = () => {
    const searchLower = searchTerm.toLowerCase();
    return favoriteWallets.filter(wallet => (
      wallet.monedero?.toLowerCase().includes(searchLower) ||
      wallet.alias?.toLowerCase().includes(searchLower) ||
      wallet.titular?.toLowerCase().includes(searchLower)
    ));
  };

  // Validation functions
  const isAccountSelectionValid = () => {
    if (!selectedSourceAccount) return false;

    if (transferType === 'local') {
      if (localTransfer.destinationType === 'favorites') {
        return !!localTransfer.selectedFavoriteAccount;
      }
      if (localTransfer.destinationType === 'own') {
        return !!localTransfer.selectedOwnAccount;
      }
      if (localTransfer.destinationType === 'manual') {
        const cleanedIban = localTransfer.destinationIban.replace(/\s/g, '');
        return (
          !!localTransfer.destinationIban &&
          cleanedIban.startsWith('CR') &&
          cleanedIban.length >= 8 &&
          !localTransfer.destinationFormatError &&
          !localTransfer.accountValidationError &&
          !!localTransfer.validatedAccountInfo
        );
      }
    }

    if (transferType === 'sinpe') {
      if (sinpeTransfer.sinpeDestinationType === 'favorites') {
        return !!sinpeTransfer.selectedSinpeFavoriteAccount;
      }
      if (sinpeTransfer.sinpeDestinationType === 'manual') {
        const cleanedIban = sinpeTransfer.sinpeDestinationIban.replace(/\s/g, '');
        return (
          !!sinpeTransfer.sinpeDestinationIban &&
          cleanedIban.startsWith('CR') &&
          cleanedIban.length >= 8 &&
          !sinpeTransfer.sinpeDestinationFormatError &&
          !sinpeTransfer.sinpeAccountValidationError &&
          !!sinpeTransfer.validatedSinpeAccountInfo
        );
      }
    }

    if (transferType === 'sinpe-mobile') {
      if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites') {
        return !!sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet;
      }
      if (sinpeMovilTransfer.sinpeMovilDestinationType === 'manual') {
        return (
          sinpeMovilTransfer.sinpeMovilPhoneNumber.length === 8 &&
          !!sinpeMovilTransfer.sinpeMovilMonederoInfo &&
          !sinpeMovilTransfer.sinpeMovilMonederoError
        );
      }
    }

    return false;
  };

  const isTransferDetailsValid = () => {
    if (!selectedSourceAccount) return false;

    if (transferType === 'local') {
      if (!localTransfer.amount || parseFloat(localTransfer.amount) <= 0) return false;
      if (localTransfer.amountError) return false;
      const descriptionTrimmed = localTransfer.description?.trim() || '';
      if (!descriptionTrimmed || descriptionTrimmed.length < 15 || descriptionTrimmed.length > 255) return false;
      if (localTransfer.email && !isEmailValid(localTransfer.email)) return false;
      return true;
    }

    if (transferType === 'sinpe') {
      if (!sinpeTransfer.sinpeAmount || parseFloat(sinpeTransfer.sinpeAmount) <= 0) return false;
      if (sinpeTransfer.sinpeAmountError) return false;
      const descriptionTrimmed = sinpeTransfer.sinpeDescription?.trim() || '';
      if (!descriptionTrimmed || descriptionTrimmed.length < 15 || descriptionTrimmed.length > 255) return false;
      if (sinpeFlowType === 'enviar-fondos' && !sinpeTransferType) return false;
      if (sinpeTransfer.sinpeEmail && !isEmailValid(sinpeTransfer.sinpeEmail)) return false;
      return true;
    }

    if (transferType === 'sinpe-mobile') {
      if (!sinpeMovilTransfer.sinpeMovilAmount || parseFloat(sinpeMovilTransfer.sinpeMovilAmount) <= 0) return false;
      const accountCurrency = selectedSourceAccount.moneda || 'CRC';
      if (accountCurrency !== 'CRC') return false;
      if (sinpeMovilTransfer.sinpeMovilAmountError) return false;
      const descriptionTrimmed = sinpeMovilTransfer.sinpeMovilDescription?.trim() || '';
      if (descriptionTrimmed.length > 20) return false;
      if (sinpeMovilTransfer.sinpeMovilEmail && !isEmailValid(sinpeMovilTransfer.sinpeMovilEmail)) return false;
      if (parseFloat(sinpeMovilTransfer.sinpeMovilAmount) > selectedSourceAccount.saldo) return false;
      return true;
    }

    return false;
  };

  // Transfer execution functions
  const getTipoDestino = (): TipoDestinoTransferencia => {
    if (transferType === 'local') {
      if (localTransfer.destinationType === 'own') return TipoDestinoTransferencia.CuentaPropia;
      if (localTransfer.destinationType === 'favorites') return TipoDestinoTransferencia.CuentaFavorita;
      return TipoDestinoTransferencia.CuentaDigitada;
    }
    if (transferType === 'sinpe') {
      if (sinpeTransfer.sinpeDestinationType === 'favorites') return TipoDestinoTransferencia.CuentaFavorita;
      return TipoDestinoTransferencia.CuentaDigitada;
    }
    if (transferType === 'sinpe-mobile') {
      if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet) {
        return TipoDestinoTransferencia.CuentaFavorita;
      }
      return TipoDestinoTransferencia.CuentaDigitada;
    }
    return TipoDestinoTransferencia.CuentaDigitada;
  };

  const executeTransfer = async (idDesafio?: string) => {
    if (!selectedSourceAccount) return;

    if (transferType === 'local') {
      if (localTransfer.email && !isEmailValid(localTransfer.email)) {
        localTransfer.setEmail(localTransfer.email);
        return;
      }

      const tipoDestino = getTipoDestino();
      const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
      const parsedAmount = parseFloat(localTransfer.amount);

      let destinationAccountNumber: string | undefined;
      if (localTransfer.destinationType === 'manual') {
        destinationAccountNumber = localTransfer.destinationIban.replace(/\s/g, '');
      } else if (localTransfer.destinationType === 'own' && localTransfer.selectedOwnAccount) {
        destinationAccountNumber = localTransfer.selectedOwnAccount.numeroCuentaIban || localTransfer.selectedOwnAccount.numeroCuenta || undefined;
      } else if (localTransfer.destinationType === 'favorites' && localTransfer.selectedFavoriteAccount) {
        destinationAccountNumber = localTransfer.selectedFavoriteAccount.numeroCuenta || undefined;
      }

      await sendTransfer(
        tipoDestino,
        sourceAccountNumber,
        parsedAmount,
        localTransfer.description || undefined,
        localTransfer.email || undefined,
        idDesafio,
        localTransfer.destinationType === 'favorites' && localTransfer.selectedFavoriteAccount ? localTransfer.selectedFavoriteAccount.id : undefined,
        destinationAccountNumber
      );
    } else if (transferType === 'sinpe') {
      if (sinpeTransfer.sinpeEmail && !isEmailValid(sinpeTransfer.sinpeEmail)) {
        sinpeTransfer.setSinpeEmail(sinpeTransfer.sinpeEmail);
        return;
      }

      const tipoDestino = getTipoDestino();
      const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
      const parsedAmount = parseFloat(sinpeTransfer.sinpeAmount);

      let destinationAccountNumber: string | undefined;
      if (sinpeTransfer.sinpeDestinationType === 'manual') {
        destinationAccountNumber = sinpeTransfer.sinpeDestinationIban.replace(/\s/g, '');
      } else if (sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount) {
        destinationAccountNumber = sinpeTransfer.selectedSinpeFavoriteAccount.numeroCuentaDestino || undefined;
      }

      if (!sinpeTransferType) return;

      if (sinpeTransferType === 'creditos-directos') {
        await sendtransferenciaCreditosDirectos(
          tipoDestino,
          sourceAccountNumber,
          parsedAmount,
          sinpeTransfer.sinpeDescription || undefined,
          sinpeTransfer.sinpeEmail || undefined,
          idDesafio,
          sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount ? sinpeTransfer.selectedSinpeFavoriteAccount.id : undefined,
          destinationAccountNumber
        );
      } else if (sinpeTransferType === 'debitos-tiempo-real') {
        await sendtransferenciaDebitosTiempoReal(
          tipoDestino,
          sourceAccountNumber,
          parsedAmount,
          sinpeTransfer.sinpeDescription || undefined,
          sinpeTransfer.sinpeEmail || undefined,
          idDesafio,
          sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount ? sinpeTransfer.selectedSinpeFavoriteAccount.id : undefined,
          destinationAccountNumber
        );
      } else {
        await sendtransferenciaSinpe(
          tipoDestino,
          sourceAccountNumber,
          parsedAmount,
          sinpeTransfer.sinpeDescription || undefined,
          sinpeTransfer.sinpeEmail || undefined,
          idDesafio,
          sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount ? sinpeTransfer.selectedSinpeFavoriteAccount.id : undefined,
          destinationAccountNumber
        );
      }
    } else if (transferType === 'sinpe-mobile') {
      if (sinpeMovilTransfer.sinpeMovilEmail && !isEmailValid(sinpeMovilTransfer.sinpeMovilEmail)) {
        sinpeMovilTransfer.setSinpeMovilEmail(sinpeMovilTransfer.sinpeMovilEmail);
        return;
      }

      const tipoDestino = getTipoDestino();
      const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
      const parsedAmount = parseFloat(sinpeMovilTransfer.sinpeMovilAmount);

      let phoneNumberToUse: string;
      if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet) {
        phoneNumberToUse = sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet.monedero || '';
      } else {
        phoneNumberToUse = sinpeMovilTransfer.sinpeMovilPhoneNumber;
      }

      await sendSinpeMovilTransfer(
        tipoDestino,
        sourceAccountNumber,
        phoneNumberToUse,
        parsedAmount,
        sinpeMovilTransfer.sinpeMovilDescription || undefined,
        sinpeMovilTransfer.sinpeMovilEmail || undefined,
        idDesafio,
        sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet ? sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet.id : undefined
      );
    }
  };

  const handleWizardComplete = () => {
    const tipoDestino = getTipoDestino();
    let requires2FA = false;
    let operationType: TipoOperacion | null = null;

    if (transferType === 'local') {
      requires2FA = transferRequires2FA(tipoDestino);
      if (requires2FA) {
        if (tipoDestino === TipoDestinoTransferencia.CuentaPropia) {
          operationType = TipoOperacion.TransferenciaInternaCuentaPropia;
        } else if (tipoDestino === TipoDestinoTransferencia.CuentaFavorita) {
          operationType = TipoOperacion.TransferenciaInternaCuentaFavorita;
        } else {
          operationType = TipoOperacion.TransferenciaInternaCuentaDigitada;
        }
      }
    } else if (transferType === 'sinpe') {
      requires2FA = sinpeTransferRequires2FA();
      if (requires2FA) {
        operationType = getSinpeOperationType(tipoDestino, sinpeTransferType ?? undefined);
      }
    } else if (transferType === 'sinpe-mobile') {
      requires2FA = sinpeMovilTransferRequires2FA();
      if (requires2FA) {
        operationType = getSinpeMovilOperationType(tipoDestino);
      }
    }

    if (requires2FA && operationType) {
      open2FAModal(operationType, async (idDesafio: string | null) => {
        await executeTransfer(idDesafio || undefined);
      });
    } else {
      executeTransfer();
    }
  };

  // Get current transfer data for details step
  const getCurrentTransferData = () => {
    if (transferType === 'local') {
      return {
        amount: localTransfer.amount,
        description: localTransfer.description,
        email: localTransfer.email,
        amountError: localTransfer.amountError,
        onAmountChange: (value: string) => localTransfer.setAmount(formatAmount(value)),
        onDescriptionChange: localTransfer.setDescription,
        onEmailChange: localTransfer.setEmail,
        emailError: localTransfer.emailError,
      };
    }
    if (transferType === 'sinpe') {
      return {
        amount: sinpeTransfer.sinpeAmount,
        description: sinpeTransfer.sinpeDescription,
        email: sinpeTransfer.sinpeEmail,
        amountError: sinpeTransfer.sinpeAmountError,
        onAmountChange: (value: string) => sinpeTransfer.setSinpeAmount(formatAmount(value)),
        onDescriptionChange: sinpeTransfer.setSinpeDescription,
        onEmailChange: sinpeTransfer.setSinpeEmail,
        emailError: sinpeTransfer.sinpeEmailError,
      };
    }
    return {
      amount: sinpeMovilTransfer.sinpeMovilAmount,
      description: sinpeMovilTransfer.sinpeMovilDescription,
      email: sinpeMovilTransfer.sinpeMovilEmail,
      amountError: sinpeMovilTransfer.sinpeMovilAmountError,
      onAmountChange: (value: string) => sinpeMovilTransfer.setSinpeMovilAmount(formatAmount(value)),
      onDescriptionChange: sinpeMovilTransfer.setSinpeMovilDescription,
      onEmailChange: sinpeMovilTransfer.setSinpeMovilEmail,
      emailError: sinpeMovilTransfer.sinpeMovilEmailError,
    };
  };

  const transferData = getCurrentTransferData();

  // Wizard steps
  const wizardSteps = useMemo(() => {
    if (!transferType) return [];

    return [
      {
        id: 'accounts',
        title: 'Cuentas',
        component: (
          <AccountSelectionStep
            transferType={transferType}
            selectedSourceAccount={selectedSourceAccount}
            accounts={userAccounts}
            isLoadingAccounts={isLoadingAccounts}
            onSourceAccountSelect={handleSourceAccountSelect}
            localDestinationType={localTransfer.destinationType}
            onLocalDestinationTypeChange={localTransfer.setDestinationType}
            selectedFavoriteAccount={localTransfer.selectedFavoriteAccount}
            selectedOwnAccount={localTransfer.selectedOwnAccount}
            ownAccounts={getFilteredAccounts()}
            onOwnAccountSelect={handleOwnAccountSelect}
            destinationIban={localTransfer.destinationIban}
            onDestinationIbanChange={localTransfer.setDestinationIban}
            destinationFormatError={localTransfer.destinationFormatError}
            isValidatingAccount={localTransfer.isValidatingAccount}
            accountValidationError={localTransfer.accountValidationError}
            validatedAccountInfo={localTransfer.validatedAccountInfo}
            sinpeDestinationType={sinpeTransfer.sinpeDestinationType}
            onSinpeDestinationTypeChange={sinpeTransfer.setSinpeDestinationType}
            selectedSinpeFavoriteAccount={sinpeTransfer.selectedSinpeFavoriteAccount}
            sinpeDestinationIban={sinpeTransfer.sinpeDestinationIban}
            onSinpeDestinationIbanChange={sinpeTransfer.setSinpeDestinationIban}
            sinpeDestinationFormatError={sinpeTransfer.sinpeDestinationFormatError}
            isValidatingSinpeAccount={sinpeTransfer.isValidatingSinpeAccount}
            sinpeAccountValidationError={sinpeTransfer.sinpeAccountValidationError}
            validatedSinpeAccountInfo={sinpeTransfer.validatedSinpeAccountInfo}
            sinpeMovilDestinationType={sinpeMovilTransfer.sinpeMovilDestinationType}
            onSinpeMovilDestinationTypeChange={sinpeMovilTransfer.setSinpeMovilDestinationType}
            selectedSinpeMovilFavoriteWallet={sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet}
            sinpeMovilPhoneNumber={sinpeMovilTransfer.sinpeMovilPhoneNumber}
            onSinpeMovilPhoneChange={sinpeMovilTransfer.setSinpeMovilPhoneNumber}
            isValidatingSinpeMovilMonedero={sinpeMovilTransfer.isValidatingSinpeMovilMonedero}
            sinpeMovilMonederoError={sinpeMovilTransfer.sinpeMovilMonederoError}
            sinpeMovilMonederoInfo={sinpeMovilTransfer.sinpeMovilMonederoInfo}
            onDestinationSheetOpen={() => setIsDestinationModalOpen(true)}
            isLoadingFavorites={isLoadingFavorites || isLoadingSinpeFavorites || isLoadingFavoriteWallets}
          />
        ),
        canGoNext: isAccountSelectionValid,
      },
      {
        id: 'details',
        title: 'Detalles',
        component: (
          <TransferDetailsStep
            amount={transferData.amount}
            onAmountChange={transferData.onAmountChange}
            amountError={transferData.amountError}
            sourceAccount={selectedSourceAccount}
            transferType={transferType}
            description={transferData.description}
            onDescriptionChange={transferData.onDescriptionChange}
            email={transferData.email}
            onEmailChange={transferData.onEmailChange}
            emailError={transferData.emailError}
            isEmailRequired={false}
          />
        ),
        canGoNext: isTransferDetailsValid,
      },
      {
        id: 'confirmation',
        title: 'Confirmación',
        component: (
          <ConfirmationStep
            transferType={transferType}
            sourceAccount={selectedSourceAccount}
            localDestinationType={localTransfer.destinationType}
            selectedFavoriteAccount={localTransfer.selectedFavoriteAccount}
            selectedOwnAccount={localTransfer.selectedOwnAccount}
            destinationIban={localTransfer.destinationIban}
            sinpeDestinationType={sinpeTransfer.sinpeDestinationType}
            selectedSinpeFavoriteAccount={sinpeTransfer.selectedSinpeFavoriteAccount}
            sinpeDestinationIban={sinpeTransfer.sinpeDestinationIban}
            sinpeMovilDestinationType={sinpeMovilTransfer.sinpeMovilDestinationType}
            selectedSinpeMovilFavoriteWallet={sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet}
            sinpeMovilPhoneNumber={sinpeMovilTransfer.sinpeMovilPhoneNumber}
            amount={transferData.amount}
            description={transferData.description}
            email={transferData.email}
          />
        ),
        canGoNext: () => true,
      },
    ];
  }, [
    transferType,
    selectedSourceAccount,
    userAccounts,
    isLoadingAccounts,
    localTransfer,
    sinpeTransfer,
    sinpeMovilTransfer,
    transferData,
    isLoadingFavorites,
    isLoadingSinpeFavorites,
    isLoadingFavoriteWallets,
  ]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard>
        {(accountsError || transferError || sinpeTransferError || sinpeMovilTransferError) && (
          <MessageCard
            message={accountsError || transferError || sinpeTransferError || sinpeMovilTransferError || ''}
            type="error"
          />
        )}

        {!transferType ? (
          <TransferTypeStep
            selectedType={null}
            onTypeSelect={handleTransferTypeChange}
          />
        ) : (
          <TransferWizard
            steps={wizardSteps}
            onComplete={handleWizardComplete}
            onCancel={() => {
              setTransferType(null);
              setSelectedSourceAccount(null);
              localTransfer.resetForm();
              sinpeTransfer.resetForm();
              sinpeMovilTransfer.resetForm();
            }}
          />
        )}
        </ContentCard>
      </View>

      <SourceAccountSelectionModal
        visible={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        accounts={userAccounts}
        isLoading={isLoadingAccounts}
        transferType={transferType}
        onSelect={(account: DtoCuenta) => {
          const identifier = account.numeroCuentaIban || account.numeroCuenta || '';
          handleSourceAccountSelect(identifier);
        }}
      />

      <DestinationAccountSelectionModal
        visible={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        transferType={transferType}
        destinationType={localTransfer.destinationType}
        sinpeDestinationType={sinpeTransfer.sinpeDestinationType}
        sinpeMovilDestinationType={sinpeMovilTransfer.sinpeMovilDestinationType}
        ownAccounts={getFilteredAccounts()}
        isLoadingOwnAccounts={isLoadingAccounts}
        selectedSourceAccount={selectedSourceAccount}
        favoriteAccounts={favoriteAccounts}
        isLoadingFavorites={isLoadingFavorites}
        sinpeFavoriteAccounts={sinpeFavoriteAccounts}
        isLoadingSinpeFavorites={isLoadingSinpeFavorites}
        favoriteWallets={favoriteWallets}
        isLoadingFavoriteWallets={isLoadingFavoriteWallets}
        onSelectFavorite={handleFavoriteAccountSelect}
        onSelectOwnAccount={(account: DtoCuenta) => {
          const identifier = account.numeroCuentaIban || account.numeroCuenta || '';
          handleOwnAccountSelect(identifier);
        }}
        onSelectSinpeFavorite={handleSinpeFavoriteAccountSelect}
        onSelectSinpeMovilFavorite={handleSinpeMovilFavoriteWalletSelect}
      />

      <TwoFAVerificationModal title="Confirmar Transferencia" />

      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        transfer={successTransfer}
        emailDestino={successTransferEmailDestino}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
