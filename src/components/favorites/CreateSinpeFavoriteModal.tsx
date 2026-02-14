import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { IbanInput } from '@/components/ui/IbanInput';
import TransferWizard from '@/components/wizard/TransferWizard';
import { useFavoriteSinpeAccountsStore } from '@/lib/states/favoriteSinpeAccounts.store';
import { useSecondFactorStore } from '@/lib/states/secondFactor.store';
import { TipoOperacion } from '@/constants/enums';
import { FAVORITE_TEXTS } from '@/constants/favorite-accounts.constants';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

export default function CreateSinpeFavoriteModal() {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const {
    isCreateModalOpen,
    closeCreateModal,
    destinationAccount,
    isLoadingDestination,
    destinationError,
    searchDestinationAccount,
    createFavoriteAccount,
    clearDestinationAccount,
    isCreating,
  } = useFavoriteSinpeAccountsStore();

  const { openModal: open2FAModal } = useSecondFactorStore();

  const [iban, setIban] = useState('');
  const [unmaskedIban, setUnmaskedIban] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [montoMaximo, setMontoMaximo] = useState('');

  const resetForm = () => {
    setIban('');
    setUnmaskedIban('');
    setAlias('');
    setEmail('');
    setTelefono('');
    setMontoMaximo('');
    clearDestinationAccount();
  };

  const handleClose = () => {
    resetForm();
    closeCreateModal();
  };

  const handleSearch = async () => {
    if (unmaskedIban.length < 4) return;
    await searchDestinationAccount(unmaskedIban);
  };

  const handleSave = () => {
    open2FAModal(TipoOperacion.CreacionCuentaFavoritaSinpe, async (idDesafio) => {
      await createFavoriteAccount({
        numeroCuentaDestino: unmaskedIban,
        email: email || null,
        telefono: telefono || null,
        alias: alias || null,
        montoMaximo: montoMaximo ? parseFloat(montoMaximo) : null,
        idDesafio: idDesafio,
      });
      handleClose();
      Alert.alert('Exito', FAVORITE_TEXTS.SUCCESS_CREATE);
    });
  };

  const handleIbanChange = (masked: string, unmasked: string) => {
    setIban(masked);
    setUnmaskedIban(unmasked);
    clearDestinationAccount();
  };

  const handleIbanBlur = async () => {
    // Si el IBAN está completo (22 caracteres), buscar automáticamente
    if (unmaskedIban.length === 22 && !destinationAccount) {
      await handleSearch();
    }
  };

  // Escuchar cuando el teclado se oculta (botón atrás)
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (unmaskedIban.length === 22 && !destinationAccount && !isLoadingDestination) {
        handleSearch();
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [unmaskedIban, destinationAccount, isLoadingDestination]);

  const wizardSteps = useMemo(() => [
    {
      id: 'search',
      title: FAVORITE_TEXTS.STEP_SEARCH,
      component: (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
          <View style={styles.fieldsContainer}>
            <IbanInput
              label={FAVORITE_TEXTS.SEARCH_IBAN_LABEL}
              placeholder="12 3456 7890 1234 5678 90"
              value={iban}
              onChangeText={handleIbanChange}
              onClear={clearDestinationAccount}
              onBlur={handleIbanBlur}
              colorScheme={colorScheme}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {destinationError && <Text style={styles.errorText}>{destinationError}</Text>}

            {destinationAccount && (
              <View style={[styles.accountCard, { borderColor }]}>
                <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Titular</Text>
                <Text style={[styles.accountValue, { color: textColor }]}>{destinationAccount.titularDestino || '-'}</Text>
                <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>IBAN</Text>
                <Text style={[styles.accountValue, { color: textColor }]}>{destinationAccount.numeroCuentaDestino || '-'}</Text>
                <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Banco</Text>
                <Text style={[styles.accountValue, { color: textColor }]}>{destinationAccount.codigoBancoDestino || '-'}</Text>
                <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Moneda</Text>
                <Text style={[styles.accountValue, { color: textColor }]}>{destinationAccount.codigoMonedaDestino || '-'}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ),
      canGoNext: () => !!destinationAccount,
    },
    {
      id: 'data',
      title: FAVORITE_TEXTS.STEP_DATA,
      component: (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
          <View style={styles.fieldsContainer}>
            <Input label={FAVORITE_TEXTS.FIELD_ALIAS} placeholder="Ej: Mi cuenta SINPE" value={alias} onChangeText={setAlias} colorScheme={colorScheme} />
            <Input label={FAVORITE_TEXTS.FIELD_EMAIL} placeholder="correo@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" colorScheme={colorScheme} />
            <Input label={FAVORITE_TEXTS.FIELD_PHONE} placeholder="88887777" value={telefono} onChangeText={(v) => setTelefono(v.replace(/\D/g, '').slice(0, 8))} keyboardType="phone-pad" colorScheme={colorScheme} />
            <Input label={FAVORITE_TEXTS.FIELD_MAX_AMOUNT} placeholder="0.00" value={montoMaximo} onChangeText={(v) => { if (v === '' || /^\d*\.?\d*$/.test(v)) setMontoMaximo(v); }} keyboardType="numeric" colorScheme={colorScheme} />
          </View>
        </ScrollView>
      ),
      canGoNext: () => true,
    },
  ], [iban, unmaskedIban, alias, email, telefono, montoMaximo, destinationAccount, destinationError, isLoadingDestination, colorScheme, textColor, secondaryTextColor, borderColor]);

  if (!isCreateModalOpen) return null;

  return (
    <Modal visible={isCreateModalOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable style={[styles.modalContent, { backgroundColor }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: '#a61612' }]}>{FAVORITE_TEXTS.CREATE_SINPE_TITLE}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <TransferWizard
            steps={wizardSteps}
            onComplete={handleSave}
            onCancel={handleClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    height: '80%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  fieldsContainer: {
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  accountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
});
