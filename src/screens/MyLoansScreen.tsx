import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, RefreshControl, StyleSheet, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLoansStore } from '../lib/states/loans.store';
import { useAuthStore } from '../lib/states/auth.store';
import LoanCard from '../components/cards/LoanCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import LoanDetailsModal from '../components/modals/LoanDetailsModal';
import { MY_LOANS_PAGE_TEXT } from '../constants/loans.constants';
import { filterLoans, getLoanIdentifier } from '../lib/utils/loans.utils';
import { getBackgroundColor } from '../../App';
import type { DtoPrestamo } from '../services/api/loans.api';
import type { MainStackParamList } from '../navigation/types';
import CustomHeader from '../components/header/CustomHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'MyLoans'>;

export default function MyLoansScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<DtoPrestamo | null>(null);
  const colorScheme = useColorScheme();
  const { loans, isLoading, error, loadLoans, setError } = useLoansStore();
  const { isAuthenticated } = useAuthStore();
  const searchInputRef = useRef<TextInput>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={MY_LOANS_PAGE_TEXT.title}
          showBackButton={true}
          titleComponent={
            showSearch ? (
              <View style={styles.headerSearchWrapper}>
                <View style={styles.searchIconContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchInput}
                  placeholder={MY_LOANS_PAGE_TEXT.searchPlaceholder}
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
  }, [navigation, showSearch, searchTerm]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setShowSearch(false);
      setSearchTerm('');
    });
    return unsubscribeBlur;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        if (!showSearch) {
          searchInputRef.current?.blur();
          Keyboard.dismiss();
        }
      }, 100);

      if (isAuthenticated) {
        setError(null);
        loadLoans();
      }

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadLoans, setError])
  );

  const filteredLoans = useMemo(() => {
    return filterLoans(loans, searchTerm);
  }, [loans, searchTerm]);

  const handleRefresh = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try {
      await loadLoans();
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmpty = () => {
    if (error) {
      return <MessageCard message={error} type="error" />;
    }
    return (
      <MessageCard
        message={searchTerm ? MY_LOANS_PAGE_TEXT.emptyMessageSearch : MY_LOANS_PAGE_TEXT.emptyMessage}
        type="info"
      />
    );
  };

  const backgroundColor = getBackgroundColor(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
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
            <MessageCard message="Cargando préstamos..." type="loading" />
          ) : filteredLoans.length > 0 ? (
            <View style={styles.loansList}>
              {filteredLoans.map((loan, index) => (
                <LoanCard
                  key={getLoanIdentifier(loan) || `loan-${index}`}
                  loan={loan}
                  onPress={() => setSelectedLoan(loan)}
                />
              ))}
            </View>
          ) : (
            renderEmpty()
          )}
        </ContentCard>
      </View>

      <LoanDetailsModal
        visible={selectedLoan !== null}
        onClose={() => setSelectedLoan(null)}
        loan={selectedLoan}
      />
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
  loansList: {
    gap: 8,
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
});
