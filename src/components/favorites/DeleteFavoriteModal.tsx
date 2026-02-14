import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import MessageCard from '@/components/cards/MessageCard';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';
import { FAVORITE_TEXTS } from '@/constants/favorite-accounts.constants';

interface DeleteFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  accountName: string;
  accountNumber: string;
}

export default function DeleteFavoriteModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  accountName,
  accountNumber,
}: DeleteFavoriteModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBgColor = getCardBgColor(colorScheme);

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
            <View style={[styles.accountInfo, { borderColor, backgroundColor: cardBgColor }]}>
              <Text style={[styles.accountName, { color: textColor }]}>{accountName}</Text>
              <Text style={[styles.accountNumber, { color: secondaryTextColor }]}>{accountNumber}</Text>
            </View>
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
  accountInfo: {
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
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
