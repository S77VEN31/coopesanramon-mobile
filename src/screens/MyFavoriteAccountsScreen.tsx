import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, useColorScheme, RefreshControl, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/lib/states/auth.store';
import { useFavoriteAccountsStore } from '@/lib/states/favoriteAccounts.store';
import { useFavoriteSinpeAccountsStore } from '@/lib/states/favoriteSinpeAccounts.store';
import { useFavoriteWalletsStore } from '@/lib/states/favoriteWallets.store';
import { getBackgroundColor, getTextColor, getSecondaryTextColor } from '../../App';
import ContentCard from '@/components/cards/ContentCard';
import CustomHeader from '@/components/header/CustomHeader';
import { Search, Plus, X } from 'lucide-react-native';
import FavoriteList from '@/components/favorites/FavoriteList';
import DeleteFavoriteModal from '@/components/favorites/DeleteFavoriteModal';
import CreateLocalFavoriteModal from '@/components/favorites/CreateLocalFavoriteModal';
import CreateSinpeFavoriteModal from '@/components/favorites/CreateSinpeFavoriteModal';
import CreateWalletFavoriteModal from '@/components/favorites/CreateWalletFavoriteModal';
import EditLocalFavoriteModal from '@/components/favorites/EditLocalFavoriteModal';
import EditSinpeFavoriteModal from '@/components/favorites/EditSinpeFavoriteModal';
import EditWalletFavoriteModal from '@/components/favorites/EditWalletFavoriteModal';
import TwoFAVerificationModal from '@/components/modals/TwoFAVerificationModal';
import { FAVORITE_TEXTS, type FavoriteType } from '@/constants/favorite-accounts.constants';
import type { CuentaFavoritaInternaItem, CuentaSinpeFavoritaItem, MonederoFavoritoItem } from '@/services/api/favorites.api';

type Props = NativeStackScreenProps<MainStackParamList, 'MyFavoriteAccounts'>;

const TYPE_LABELS = {
  local: 'Cuentas Locales',
  sinpe: 'Cuentas SINPE',
  wallets: 'SINPE Móvil',
};

export default function MyFavoriteAccountsScreen({ route, navigation }: Props) {
  const { type } = route.params;
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const { isAuthenticated } = useAuthStore();
  const searchInputRef = useRef<TextInput>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    internalAccounts,
    isLoading: isLoadingInternal,
    loadInternalAccounts,
    openCreateModal: openCreateLocalModal,
    openEditModal: openEditLocalModal,
    deleteFavoriteAccount: deleteInternalAccount,
    isDeleting: isDeletingInternal,
  } = useFavoriteAccountsStore();

  const {
    sinpeAccounts,
    isLoading: isLoadingSinpe,
    loadSinpeAccounts,
    openCreateModal: openCreateSinpeModal,
    openEditModal: openEditSinpeModal,
    deleteFavoriteAccount: deleteSinpeAccount,
    isDeleting: isDeletingSinpe,
  } = useFavoriteSinpeAccountsStore();

  const {
    wallets,
    isLoading: isLoadingWallets,
    loadWallets,
    openCreateModal: openCreateWalletModal,
    openEditModal: openEditWalletModal,
    deleteFavoriteWallet,
    isDeleting: isDeletingWallet,
  } = useFavoriteWalletsStore();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: number;
    name: string;
    number: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={TYPE_LABELS[type]}
          showBackButton
          titleComponent={
            showSearch ? (
              <View style={styles.headerSearchWrapper}>
                <View style={styles.searchIconContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchInput}
                  placeholder={FAVORITE_TEXTS.SEARCH_PLACEHOLDER}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoFocus
                  selectionColor="rgba(255,255,255,0.5)"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.7}
                  style={styles.clearButton}
                >
                  <X size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
          rightComponent={
            !showSearch ? (
              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Search size={22} color="#ffffff" />
              </TouchableOpacity>
            ) : null
          }
        />
      ),
    });
  }, [navigation, type, showSearch, searchTerm]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setShowSearch(false);
      setSearchTerm('');
    });
    return unsubscribeBlur;
  }, [navigation]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (showSearch) {
        searchInputRef.current?.blur();
      }
    });
    return () => keyboardDidHideListener.remove();
  }, [showSearch]);

  useEffect(() => {
    if (isAuthenticated) {
      if (type === 'local') {
        loadInternalAccounts();
      } else if (type === 'sinpe') {
        loadSinpeAccounts();
      } else if (type === 'wallets') {
        loadWallets();
      }
    }
  }, [isAuthenticated, type]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (type === 'local') {
      await loadInternalAccounts();
    } else if (type === 'sinpe') {
      await loadSinpeAccounts();
    } else if (type === 'wallets') {
      await loadWallets();
    }
    setRefreshing(false);
  };

  const filteredInternal = useMemo(() => {
    if (!searchTerm) return internalAccounts;
    const lower = searchTerm.toLowerCase();
    return internalAccounts.filter(
      (acc) =>
        acc.titular?.toLowerCase().includes(lower) ||
        acc.numeroCuenta?.toLowerCase().includes(lower) ||
        acc.alias?.toLowerCase().includes(lower)
    );
  }, [internalAccounts, searchTerm]);

  const filteredSinpe = useMemo(() => {
    if (!searchTerm) return sinpeAccounts;
    const lower = searchTerm.toLowerCase();
    return sinpeAccounts.filter(
      (acc) =>
        acc.titularDestino?.toLowerCase().includes(lower) ||
        acc.numeroCuentaDestino?.toLowerCase().includes(lower) ||
        acc.alias?.toLowerCase().includes(lower)
    );
  }, [sinpeAccounts, searchTerm]);

  const filteredWallets = useMemo(() => {
    if (!searchTerm) return wallets;
    const lower = searchTerm.toLowerCase();
    return wallets.filter(
      (w) =>
        w.titular?.toLowerCase().includes(lower) ||
        w.monedero?.toLowerCase().includes(lower) ||
        w.alias?.toLowerCase().includes(lower)
    );
  }, [wallets, searchTerm]);

  const handleAdd = () => {
    if (type === 'local') {
      openCreateLocalModal();
    } else if (type === 'sinpe') {
      openCreateSinpeModal();
    } else if (type === 'wallets') {
      openCreateWalletModal();
    }
  };

  const handleEdit = (item: CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem) => {
    if (type === 'local') {
      openEditLocalModal(item as CuentaFavoritaInternaItem);
    } else if (type === 'sinpe') {
      openEditSinpeModal(item as CuentaSinpeFavoritaItem);
    } else if (type === 'wallets') {
      openEditWalletModal(item as MonederoFavoritoItem);
    }
  };

  const handleDelete = (item: CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem) => {
    let name = '';
    let number = '';
    if (type === 'local') {
      const acc = item as CuentaFavoritaInternaItem;
      name = acc.titular || 'Sin titular';
      number = acc.numeroCuenta || '';
    } else if (type === 'sinpe') {
      const acc = item as CuentaSinpeFavoritaItem;
      name = acc.titularDestino || 'Sin titular';
      number = acc.numeroCuentaDestino || '';
    } else if (type === 'wallets') {
      const acc = item as MonederoFavoritoItem;
      name = acc.titular || 'Sin titular';
      number = acc.monedero || '';
    }
    setAccountToDelete({ id: item.id, name, number });
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    let success = false;
    if (type === 'local') {
      success = await deleteInternalAccount(accountToDelete.id);
    } else if (type === 'sinpe') {
      success = await deleteSinpeAccount(accountToDelete.id);
    } else if (type === 'wallets') {
      success = await deleteFavoriteWallet(accountToDelete.id);
    }
    if (success) {
      setDeleteModalVisible(false);
      setAccountToDelete(null);
    }
  };

  const isLoading = type === 'local' ? isLoadingInternal : type === 'sinpe' ? isLoadingSinpe : isLoadingWallets;
  const isDeleting = isDeletingInternal || isDeletingSinpe || isDeletingWallet;
  const items = type === 'local' ? filteredInternal : type === 'sinpe' ? filteredSinpe : filteredWallets;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
          fullHeight
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a61612" colors={['#a61612']} />
          }
        >
          <FavoriteList
            items={items}
            type={type}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
          />
        </ContentCard>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      <CreateLocalFavoriteModal />
      <CreateSinpeFavoriteModal />
      <CreateWalletFavoriteModal />
      <EditLocalFavoriteModal />
      <EditSinpeFavoriteModal />
      <EditWalletFavoriteModal />

      <DeleteFavoriteModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        accountName={accountToDelete?.name || ''}
        accountNumber={accountToDelete?.number || ''}
      />

      <TwoFAVerificationModal title="Confirmar Operacion" />
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
  headerSearchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  searchIconContainer: {
    marginRight: 4,
  },
  headerSearchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 6,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  headerButton: {
    padding: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a61612',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
