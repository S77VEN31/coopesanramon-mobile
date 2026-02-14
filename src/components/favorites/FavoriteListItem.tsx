import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Modal, TouchableWithoutFeedback } from 'react-native';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';
import type { FavoriteType } from '@/constants/favorite-accounts.constants';
import type { CuentaFavoritaInternaItem, CuentaSinpeFavoritaItem, MonederoFavoritoItem } from '@/services/api/favorites.api';

type FavoriteAccount = CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem;

interface FavoriteListItemProps {
  item: FavoriteAccount;
  type: FavoriteType;
  onEdit: () => void;
  onDelete: () => void;
}

function getDisplayInfo(item: FavoriteAccount, type: FavoriteType) {
  switch (type) {
    case 'local': {
      const acc = item as CuentaFavoritaInternaItem;
      return {
        titular: acc.titular || 'Sin titular',
        account: acc.numeroCuenta || '',
        alias: acc.alias,
        currency: acc.codigoMoneda || 'CRC',
      };
    }
    case 'sinpe': {
      const acc = item as CuentaSinpeFavoritaItem;
      return {
        titular: acc.titularDestino || 'Sin titular',
        account: acc.numeroCuentaDestino || '',
        alias: acc.alias,
        currency: acc.codigoMonedaDestino || 'CRC',
      };
    }
    case 'wallets': {
      const acc = item as MonederoFavoritoItem;
      return {
        titular: acc.titular || 'Sin titular',
        account: acc.monedero || '',
        alias: acc.alias,
        currency: null,
      };
    }
  }
}

export default function FavoriteListItem({ item, type, onEdit, onDelete }: FavoriteListItemProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBg = getCardBgColor(colorScheme);

  const info = getDisplayInfo(item, type);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<View>(null);

  const handleOpenMenu = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({ top: y + height + 4, right: 20 });
      setMenuVisible(true);
    });
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit();
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete();
  };

  return (
    <View style={[styles.container, { borderColor, backgroundColor: cardBg }]}>
      <View style={styles.info}>
        <Text style={[styles.titular, { color: textColor }]} numberOfLines={1}>
          {info.titular}
        </Text>
        <Text style={[styles.account, { color: secondaryTextColor }]} numberOfLines={1}>
          {info.account}
        </Text>
        <View style={styles.badges}>
          {info.alias && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{info.alias}</Text>
            </View>
          )}
          {info.currency && (
            <View style={[styles.badge, styles.currencyBadge]}>
              <Text style={[styles.badgeText, styles.currencyBadgeText]}>{info.currency}</Text>
            </View>
          )}
        </View>
      </View>
      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity onPress={handleOpenMenu} style={styles.moreButton} activeOpacity={0.7}>
          <MoreVertical size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBackdrop}>
            <View style={[styles.menu, { backgroundColor: cardBg, borderColor, top: menuPosition.top, right: menuPosition.right }]}>
              <TouchableOpacity onPress={handleEdit} style={styles.menuItem} activeOpacity={0.7}>
                <Pencil size={16} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>Editar</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
              <TouchableOpacity onPress={handleDelete} style={styles.menuItem} activeOpacity={0.7}>
                <Trash2 size={16} color="#dc2626" />
                <Text style={[styles.menuItemText, { color: '#dc2626' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  titular: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  account: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(166, 22, 18, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    color: '#a61612',
    fontWeight: '500',
  },
  currencyBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  currencyBadgeText: {
    color: '#2563eb',
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#a61612',
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
  },
});
