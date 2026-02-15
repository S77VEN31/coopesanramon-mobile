import React from 'react';
import { View } from 'react-native';
import MessageCard from '@/components/cards/MessageCard';
import FavoriteListItem from './FavoriteListItem';
import { FAVORITE_TEXTS } from '@/constants/favorite-accounts.constants';
import type { FavoriteType } from '@/constants/favorite-accounts.constants';
import type { CuentaFavoritaInternaItem, CuentaSinpeFavoritaItem, MonederoFavoritoItem } from '@/services/api/favorites.api';

type FavoriteAccount = CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem;

interface FavoriteListProps {
  items: FavoriteAccount[];
  type: FavoriteType;
  isLoading: boolean;
  onEdit: (item: FavoriteAccount) => void;
  onDelete: (item: FavoriteAccount) => void;
  searchTerm?: string;
}

export default function FavoriteList({ items, type, isLoading, onEdit, onDelete, searchTerm }: FavoriteListProps) {
  if (isLoading) {
    return (
      <MessageCard
        type="loading"
        message="Cargando favoritos..."
      />
    );
  }

  if (items.length === 0) {
    return (
      <MessageCard
        message={searchTerm ? FAVORITE_TEXTS.EMPTY_SEARCH : FAVORITE_TEXTS.EMPTY_LIST}
        type="info"
      />
    );
  }

  return (
    <View>
      {items.map((item) => (
        <FavoriteListItem
          key={item.id.toString()}
          item={item}
          type={type}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </View>
  );
}
