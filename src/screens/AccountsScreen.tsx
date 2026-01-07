import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, RefreshControl, StyleSheet, TextInput, Keyboard, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { useAccountsStore } from '../lib/states/accounts.store';
import { useAuthStore } from '../lib/states/auth.store';
import AccountCard from '../components/cards/AccountCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import { ACCOUNTS_PAGE_TEXT, ACCOUNTS_INFO_MESSAGES } from '../constants/accounts.constants';
import { filterAccounts, getAccountIdentifier } from '../lib/utils/accounts.utils';
import { getBackgroundColor } from '../../App';
import type { DtoCuenta } from '../services/api/accounts.api';
import type { MainDrawerParamList, MainStackParamList } from '../navigation/types';
import CustomHeader from '../components/header/CustomHeader';

type Props = DrawerScreenProps<MainDrawerParamList, 'Accounts'>;

export default function AccountsScreen({ navigation: routeNavigation }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const colorScheme = useColorScheme();
  const { accounts, isLoading, error, loadAccounts, setError } = useAccountsStore();
  const { isAuthenticated } = useAuthStore();
  const searchInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  // Configure header with search
  useLayoutEffect(() => {
    routeNavigation.setOptions({
      header: () => (
        <CustomHeader
          title="Cuentas"
          showDrawerButton={true}
          titleComponent={
            showSearch ? (
              <View style={styles.headerSearchWrapper}>
                <View style={styles.searchIconContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchInput}
                  placeholder={ACCOUNTS_PAGE_TEXT.searchPlaceholder}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoFocus
                  selectionColor="rgba(255,255,255,0.5)"
                  returnKeyType="search"
                />
                <TouchableOpacity 
                  onPress={() => {
                    if (searchTerm.length > 0) {
                      setSearchTerm('');
                    } else {
                      setShowSearch(false);
                      Keyboard.dismiss();
                    }
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
                onPress={() => {
                  setShowSearch(true);
                }}
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
  }, [routeNavigation, showSearch, searchTerm]);

  // Dismiss keyboard when navigating away
  useEffect(() => {
    const unsubscribeBlur = routeNavigation.addListener('blur', () => {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setShowSearch(false);
      setSearchTerm('');
    });

    return unsubscribeBlur;
  }, [routeNavigation]);

  // Load accounts on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Blur input and dismiss keyboard when screen gains focus (returning from navigation)
      // Use setTimeout to ensure the blur happens after the screen transition completes
      const timer = setTimeout(() => {
        if (!showSearch) {
          searchInputRef.current?.blur();
          Keyboard.dismiss();
        }
      }, 100);
      
      if (isAuthenticated) {
        setError(null);
        loadAccounts();
      }

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadAccounts, setError])
  );

  // Filter accounts based on search term
  const filteredAccounts = useMemo(() => {
    return filterAccounts(accounts, searchTerm);
  }, [accounts, searchTerm]);

  const handleRefresh = async () => {
    if (!isAuthenticated) {
      return;
    }

    setRefreshing(true);
    try {
      await loadAccounts();
    } catch (error) {
      // Error is handled by the store
    } finally {
      setRefreshing(false);
    }
  };

  const handleAccountPress = (account: DtoCuenta) => {
    const accountId = getAccountIdentifier(account);
    if (accountId) {
      // Navigate to AccountDetail in the parent MainStack
      const parent = routeNavigation.getParent();
      if (parent) {
        parent.navigate('AccountDetail', { numeroCuenta: accountId });
      } else {
        // Fallback: try direct navigation
        (routeNavigation as any).navigate('AccountDetail', { numeroCuenta: accountId });
      }
    }
  };

  const backgroundColor = getBackgroundColor(colorScheme);

  const renderEmpty = () => {
    if (error) {
      return (
        <MessageCard
          message={error}
          type="error"
        />
      );
    }

    return (
      <MessageCard
        message={searchTerm ? ACCOUNTS_PAGE_TEXT.emptyMessageSearch : ACCOUNTS_PAGE_TEXT.emptyMessage}
        type="info"
        description={searchTerm ? undefined : ACCOUNTS_INFO_MESSAGES.noAccountsAvailableDescription}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
          description={ACCOUNTS_PAGE_TEXT.description}
          fullHeight={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#a61612"
              colors={['#a61612']}
            />
          }
        >
          {isLoading ? (
            <MessageCard
              message={ACCOUNTS_PAGE_TEXT.loadingMessage}
              type="loading"
            />
          ) : filteredAccounts.length > 0 ? (
                <View style={styles.accountsList}>
                  {filteredAccounts.map((account, index) => (
                    <AccountCard
                      key={getAccountIdentifier(account) || `account-${index}`}
                      account={account}
                      onPress={() => handleAccountPress(account)}
                    />
                  ))}
                </View>
          ) : (
            renderEmpty()
          )}
        </ContentCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSearchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
    minWidth: 0,
  },
  searchIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerSearchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: '#ffffff',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  clearButton: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerButton: {
    padding: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  accountsList: {
    gap: 8,
  },
});


