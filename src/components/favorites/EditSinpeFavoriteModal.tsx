import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFavoriteSinpeAccountsStore } from '@/lib/states/favoriteSinpeAccounts.store';
import { useSecondFactorStore } from '@/lib/states/secondFactor.store';
import { TipoOperacion } from '@/constants/enums';
import { FAVORITE_TEXTS } from '@/constants/favorite-accounts.constants';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

export default function EditSinpeFavoriteModal() {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const {
    isEditModalOpen,
    closeEditModal,
    selectedAccount,
    updateFavoriteAccount,
    isUpdating,
  } = useFavoriteSinpeAccountsStore();

  const { openModal: open2FAModal } = useSecondFactorStore();

  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [montoMaximo, setMontoMaximo] = useState('');

  useEffect(() => {
    if (selectedAccount) {
      setAlias(selectedAccount.alias || '');
      setEmail(selectedAccount.email || '');
      setTelefono(selectedAccount.telefono || '');
      setMontoMaximo(selectedAccount.montoMaximo?.toString() || '');
    }
  }, [selectedAccount]);

  const handleClose = () => {
    closeEditModal();
  };

  const handleSave = () => {
    if (!selectedAccount) return;
    open2FAModal(TipoOperacion.EdicionCuentaFavoritaSinpe, async (idDesafio) => {
      await updateFavoriteAccount({
        id: selectedAccount.id,
        email: email || null,
        telefono: telefono || null,
        alias: alias || null,
        montoMaximo: montoMaximo ? parseFloat(montoMaximo) : null,
        idDesafio: idDesafio,
      });
      handleClose();
      Alert.alert('Exito', FAVORITE_TEXTS.SUCCESS_UPDATE);
    });
  };

  if (!isEditModalOpen || !selectedAccount) return null;

  return (
    <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable style={[styles.modalContent, { backgroundColor }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: '#a61612' }]}>{FAVORITE_TEXTS.EDIT_SINPE_TITLE}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.accountCard, { borderColor }]}>
              <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Titular</Text>
              <Text style={[styles.accountValue, { color: textColor }]}>{selectedAccount.titularDestino || '-'}</Text>
              <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>IBAN</Text>
              <Text style={[styles.accountValue, { color: textColor }]}>{selectedAccount.numeroCuentaDestino || '-'}</Text>
            </View>

            <View style={styles.fieldsContainer}>
              <Input label={FAVORITE_TEXTS.FIELD_ALIAS} placeholder="Ej: Mi cuenta SINPE" value={alias} onChangeText={setAlias} colorScheme={colorScheme} />
              <Input label={FAVORITE_TEXTS.FIELD_EMAIL} placeholder="correo@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" colorScheme={colorScheme} />
              <Input label={FAVORITE_TEXTS.FIELD_PHONE} placeholder="88887777" value={telefono} onChangeText={(v) => setTelefono(v.replace(/\D/g, '').slice(0, 8))} keyboardType="phone-pad" colorScheme={colorScheme} />
              <Input label={FAVORITE_TEXTS.FIELD_MAX_AMOUNT} placeholder="0.00" value={montoMaximo} onChangeText={(v) => { if (v === '' || /^\d*\.?\d*$/.test(v)) setMontoMaximo(v); }} keyboardType="numeric" colorScheme={colorScheme} />
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
            <Button variant="outline" size="sm" onPress={handleClose} disabled={isUpdating} style={styles.footerButton}>
              {FAVORITE_TEXTS.CANCEL_BUTTON}
            </Button>
            <Button size="sm" onPress={handleSave} loading={isUpdating} disabled={isUpdating} style={styles.footerButton}>
              {FAVORITE_TEXTS.SAVE_BUTTON}
            </Button>
          </View>
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
    maxHeight: '60%',
    height: '60%',
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
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  fieldsContainer: {
    gap: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
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
