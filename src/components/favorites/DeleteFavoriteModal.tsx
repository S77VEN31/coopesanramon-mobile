import React from 'react';
import { Modal, View, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import MessageCard from '@/components/cards/MessageCard';
import LocalInfoCard from '@/components/cards/LocalInfoCard';
import SinpeInfoCard from '@/components/cards/SinpeInfoCard';
import WalletInfoCard from '@/components/cards/WalletInfoCard';
import { getCardBackgroundColor, getBorderColor, getCardBgColor } from '../../../App';
import { FAVORITE_TEXTS, type FavoriteType } from '@/constants/favorite-accounts.constants';
import type { CuentaFavoritaInternaItem, CuentaSinpeFavoritaItem, MonederoFavoritoItem } from '@/services/api/favorites.api';

interface DeleteFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  type: FavoriteType;
  item: CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem | null;
}

export default function DeleteFavoriteModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  type,
  item,
}: DeleteFavoriteModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBgColor = getCardBgColor(colorScheme);

  const renderInfoCard = () => {
    if (!item) return null;

    if (type === 'local') {
      const acc = item as CuentaFavoritaInternaItem;
      return (
        <LocalInfoCard
          titular={acc.titular}
          numeroCuenta={acc.numeroCuenta}
          moneda={acc.codigoMoneda}
          style={styles.infoCard}
        />
      );
    }

    if (type === 'sinpe') {
      const acc = item as CuentaSinpeFavoritaItem;
      return (
        <SinpeInfoCard
          titular={acc.titularDestino}
          iban={acc.numeroCuentaDestino}
          moneda={acc.codigoMonedaDestino}
          style={styles.infoCard}
        />
      );
    }

    if (type === 'wallets') {
      const acc = item as MonederoFavoritoItem;
      return (
        <WalletInfoCard
          titular={acc.titular}
          monedero={acc.monedero}
          nombreBanco={acc.nombreEntidad}
          style={styles.infoCard}
        />
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.content, { backgroundColor }]}>
            <MessageCard
              type="error"
              icon={AlertTriangle}
              message={FAVORITE_TEXTS.DELETE_TITLE}
              description={FAVORITE_TEXTS.DELETE_CONFIRM}
              style={[styles.messageCard, { borderColor, backgroundColor: cardBgColor }]}
            />
            {renderInfoCard()}
            <View style={styles.buttonRow}>
              <Button variant="outline" onPress={onClose} disabled={isDeleting} style={styles.button}>
                {FAVORITE_TEXTS.CANCEL_BUTTON}
              </Button>
              <Button
                variant="destructive"
                onPress={onConfirm}
                loading={isDeleting}
                disabled={isDeleting}
                style={styles.button}
              >
                {FAVORITE_TEXTS.DELETE_BUTTON}
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 12,
    flex: 0,
    minHeight: 0,
    paddingVertical: 20,
  },
  infoCard: {
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
