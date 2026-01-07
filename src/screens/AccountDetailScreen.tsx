import React, { useEffect } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccountDetailStore } from '../lib/states/accountDetail.store';
import { useAuthStore } from '../lib/states/auth.store';
import AccountDetailCard from '../components/account-info/AccountDetailCard';
import BankCardCarousel from '../components/carousels/BankCardCarousel';
import MessageCard from '../components/cards/MessageCard';
import { Button } from '../components/ui/Button';
import { 
  ACCOUNT_DETAIL_INFO_MESSAGES, 
  ACCOUNT_DETAIL_BUTTONS,
  ACCOUNT_DETAIL_FIELD_LABELS,
} from '../constants/accounts.constants';
import { getBackgroundColor, getBorderColor } from '../../App';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'AccountDetail'>;

export default function AccountDetailScreen({ route, navigation }: Props) {
  const { numeroCuenta } = route.params;
  const colorScheme = useColorScheme();
  const { accountDetail, isLoading, error, loadAccountDetail } = useAccountDetailStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadAccountDetail(numeroCuenta);
  }, [numeroCuenta, loadAccountDetail]);

  // Dismiss keyboard when navigating away (back gesture)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      Keyboard.dismiss();
    });

    return unsubscribe;
  }, [navigation]);

  const handleViewMovements = () => {
    navigation.navigate('Movements', { numeroCuenta });
  };

  const account = accountDetail?.cuenta || null;
  const tarjetas = accountDetail?.tarjetas || [];
  const backgroundColor = getBackgroundColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  // Get user name for card holder display
  const userName = user?.name || 'COOPE SAN RAMÓN';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <MessageCard
            message={ACCOUNT_DETAIL_INFO_MESSAGES.loadingDetail}
            type="loading"
          />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <MessageCard
            message={error}
            type="error"
          />
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <MessageCard
            message="No se encontró el detalle de la cuenta"
            type="error"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Card */}
        <View style={styles.section}>
          <AccountDetailCard account={account} />
        </View>
        
        {/* Associated Debit Cards Section */}
        {tarjetas.length > 0 && (
          <View style={styles.cardsSection}>
            <Text style={[styles.sectionTitle, { color: '#a61612' }]}>
              {ACCOUNT_DETAIL_FIELD_LABELS.associatedDebitCards}
            </Text>
            
            <BankCardCarousel
              tarjetas={tarjetas}
              nombreTitular={userName}
            />
          </View>
        )}
      </ScrollView>
      
      <SafeAreaView 
        style={[styles.buttonContainer, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff', borderTopColor: borderColor }]} 
        edges={['bottom']}
      >
        <View style={styles.buttonWrapper}>
          <Button
            onPress={handleViewMovements}
            variant="default"
            disabled={false}
            style={styles.viewMovementsButton}
          >
            {ACCOUNT_DETAIL_BUTTONS.viewMovements}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardsSection: {
    marginTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonWrapper: {
    padding: 16,
    paddingTop: 12,
  },
  viewMovementsButton: {
    width: '100%',
  },
});
