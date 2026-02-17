import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Phone, Star, Hash } from 'lucide-react-native';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { PHONE_MASK } from '@/constants/input-masks';
import { FavoriteAccountSelect } from '@/components/inputs/FavoriteAccountSelect';
import { getTextColor, getSecondaryTextColor } from '../../../../App';
import type { MonederoFavoritoItem } from '@/services/api/favorites.api';
import type { ObtenerMonederoSinpeResponse } from '@/services/api/transfers.api';

interface SinpeMovilDestinationSectionProps {
  sinpeMovilDestinationType: 'favorites' | 'manual';
  onSinpeMovilDestinationTypeChange: (value: 'favorites' | 'manual') => void;
  selectedSinpeMovilFavoriteWallet: MonederoFavoritoItem | null;
  sinpeMovilFavoriteWallets: MonederoFavoritoItem[];
  onSinpeMovilFavoriteSelect: (wallet: MonederoFavoritoItem) => void;
  sinpeMovilPhoneNumber: string;
  onSinpeMovilPhoneChange: (value: string) => void;
  sinpeMovilMonederoError: string | null;
  sinpeMovilMonederoInfo: ObtenerMonederoSinpeResponse | null;
  isLoadingFavorites: boolean;
}

export default function SinpeMovilDestinationSection({
  sinpeMovilDestinationType,
  onSinpeMovilDestinationTypeChange,
  selectedSinpeMovilFavoriteWallet,
  sinpeMovilFavoriteWallets,
  onSinpeMovilFavoriteSelect,
  sinpeMovilPhoneNumber,
  onSinpeMovilPhoneChange,
  sinpeMovilMonederoError,
  isLoadingFavorites,
}: SinpeMovilDestinationSectionProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const [maskedPhone, setMaskedPhone] = useState('');

  useEffect(() => {
    if (!sinpeMovilPhoneNumber) {
      setMaskedPhone('');
    }
  }, [sinpeMovilPhoneNumber]);

  const handlePhoneChange = (masked: string, unmasked: string) => {
    setMaskedPhone(masked);
    onSinpeMovilPhoneChange(unmasked);
  };

  return (
    <>
      <View style={styles.field}>
        <Text style={[styles.inputLabel, { color: textColor }]}>
          Cuenta Destino
        </Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, sinpeMovilDestinationType === 'favorites' && styles.tabActive]}
            onPress={() => onSinpeMovilDestinationTypeChange('favorites')}
          >
            <Star size={16} color={sinpeMovilDestinationType === 'favorites' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeMovilDestinationType === 'favorites' ? '#a61612' : secondaryTextColor }]}>
              Favorito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, sinpeMovilDestinationType === 'manual' && styles.tabActive]}
            onPress={() => onSinpeMovilDestinationTypeChange('manual')}
          >
            <Hash size={16} color={sinpeMovilDestinationType === 'manual' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeMovilDestinationType === 'manual' ? '#a61612' : secondaryTextColor }]}>
              Manual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sinpeMovilDestinationType === 'favorites' && (
        <View style={styles.field}>
          <FavoriteAccountSelect<MonederoFavoritoItem>
            items={sinpeMovilFavoriteWallets}
            value={selectedSinpeMovilFavoriteWallet}
            onSelect={onSinpeMovilFavoriteSelect}
            label="Monedero Favorito"
            placeholder="Seleccionar monedero favorito"
            disabled={isLoadingFavorites || sinpeMovilFavoriteWallets.length === 0}
            modalTitle="Seleccionar Monedero Favorito"
            emptyMessage="No hay monederos favoritos disponibles"
            getKey={(item) => item.id?.toString() || item.monedero || ''}
            getDisplayText={(item) => item.monedero || ''}
            getAlias={(item) => item.alias}
            getTitular={(item) => item.titular}
            formatAsIban={false}
            icon={<Phone size={18} />}
          />
        </View>
      )}

      {sinpeMovilDestinationType === 'manual' && (
        <View style={styles.field}>
          <MaskedInput
            label="Numero de Telefono"
            placeholder="8888-7777"
            value={maskedPhone}
            onChangeText={handlePhoneChange}
            mask={PHONE_MASK}
            maxLength={9}
            keyboardType="phone-pad"
            error={sinpeMovilMonederoError || undefined}
            leftIcon={<Phone size={16} color={secondaryTextColor} />}
            colorScheme={colorScheme}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#a61612',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
