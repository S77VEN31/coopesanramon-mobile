import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, RefreshControl, StyleSheet, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, X, ArrowDown, ArrowUp } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInvestmentsStore } from '../lib/states/investments.store';
import { useAuthStore } from '../lib/states/auth.store';
import InvestmentCard from '../components/cards/InvestmentCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import InvestmentDetailsModal from '../components/modals/InvestmentDetailsModal';
import { MY_INVESTMENTS_PAGE_TEXT } from '../constants/investments.constants';
import { filterInvestments, sortInvestmentsByDate, getInvestmentIdentifier } from '../lib/utils/investments.utils';
import { getBackgroundColor, getSecondaryTextColor, getBorderColor } from '../../App';
import type { DtoInversion } from '../services/api/investments.api';
import type { MainStackParamList } from '../navigation/types';
import CustomHeader from '../components/header/CustomHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'MyInvestments'>;

export default function MyInvestmentsScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInvestment, setSelectedInvestment] = useState<DtoInversion | null>(null);
  const colorScheme = useColorScheme();
  const { investments, isLoading, error, loadInvestments, setError } = useInvestmentsStore();
  const { isAuthenticated } = useAuthStore();
  const searchInputRef = useRef<TextInput>(null);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={MY_INVESTMENTS_PAGE_TEXT.title}
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
                  placeholder={MY_INVESTMENTS_PAGE_TEXT.searchPlaceholder}
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

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (showSearch) {
        searchInputRef.current?.blur();
      }
    });
    return () => keyboardDidHideListener.remove();
  }, [showSearch]);

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
        loadInvestments();
      }

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadInvestments, setError])
  );

  const filteredInvestments = useMemo(() => {
    const filtered = filterInvestments(investments, searchTerm);
    return sortInvestmentsByDate(filtered, sortOrder);
  }, [investments, searchTerm, sortOrder]);

  const handleRefresh = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try {
      await loadInvestments();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewCoupons = (numeroInversion: string) => {
    navigation.navigate('Coupons', { numeroInversion });
  };

  const renderEmpty = () => {
    if (error) {
      return <MessageCard message={error} type="error" />;
    }
    return (
      <MessageCard
        message={searchTerm ? MY_INVESTMENTS_PAGE_TEXT.emptyMessageSearch : MY_INVESTMENTS_PAGE_TEXT.emptyMessage}
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
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              style={[styles.sortButton, { borderColor }]}
              activeOpacity={0.7}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown size={18} color={secondaryTextColor} />
              ) : (
                <ArrowUp size={18} color={secondaryTextColor} />
              )}
              <Text style={[styles.sortLabel, { color: secondaryTextColor }]}>
                {sortOrder === 'desc' ? 'Reciente' : 'Antiguo'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <MessageCard message="Cargando inversiones..." type="loading" />
          ) : filteredInvestments.length > 0 ? (
            <View style={styles.investmentsList}>
              {filteredInvestments.map((investment, index) => (
                <InvestmentCard
                  key={getInvestmentIdentifier(investment) || `investment-${index}`}
                  investment={investment}
                  onPress={() => setSelectedInvestment(investment)}
                />
              ))}
            </View>
          ) : (
            renderEmpty()
          )}
        </ContentCard>
      </View>

      <InvestmentDetailsModal
        visible={selectedInvestment !== null}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
        onViewCoupons={handleViewCoupons}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexShrink: 0,
  },
  sortLabel: {
    fontSize: 13,
  },
  investmentsList: {
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
