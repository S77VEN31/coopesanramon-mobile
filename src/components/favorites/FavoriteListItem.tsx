import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Modal, TouchableWithoutFeedback } from 'react-native';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
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
    <Card style={styles.container} colorScheme={colorScheme}>
      <CardHeader style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {info.alias || info.account}
        </Text>
      </CardHeader>
      <CardContent style={styles.body}>
        <View style={styles.bodyRow}>
          <View style={styles.bodyContent}>
            <Text style={[styles.titular, { color: secondaryTextColor }]} numberOfLines={1}>
              {info.titular.toUpperCase()}
            </Text>
            <Text style={[styles.account, { color: '#ffffff' }]} numberOfLines={1}>
              {info.account}
            </Text>
            {info.currency && (
              <View style={styles.badges}>
                <View style={[styles.badge, styles.currencyBadge]}>
                  <Text style={styles.currencyBadgeText}>{info.currency}</Text>
                </View>
              </View>
            )}
          </View>
          <View ref={buttonRef} collapsable={false}>
            <TouchableOpacity onPress={handleOpenMenu} style={styles.moreButton} activeOpacity={0.7}>
              <MoreVertical size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </CardContent>

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
                <Trash2 size={16} color="#a61612" />
                <Text style={[styles.menuItemText, { color: '#a61612' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    backgroundColor: '#a61612',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bodyContent: {
    flex: 1,
  },
  titular: {
    fontSize: 12,
  },
  account: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
    marginBottom: 6,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  currencyBadge: {
    backgroundColor: '#a61612',
    borderColor: '#a61612',
  },
  currencyBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  moreButton: {
    padding: 6,
    borderRadius: 16,
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
