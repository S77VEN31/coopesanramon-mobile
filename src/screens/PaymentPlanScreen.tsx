import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LoanSelect from '../components/inputs/LoanSelect';
import PaymentPlanCard from '../components/cards/PaymentPlanCard';
import MessageCard from '../components/cards/MessageCard';
import { useLoansStore } from '../lib/states/loans.store';
import { usePaymentPlanStore } from '../lib/states/paymentPlan.store';
import { useAuthStore } from '../lib/states/auth.store';
import { getBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../App';
import { PAYMENT_PLAN_PAGE_TEXT } from '../constants/loans.constants';
import { formatDate } from '../lib/utils/format.utils';

export default function PaymentPlanScreen() {
  const [selectedLoan, setSelectedLoan] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const { loans, isLoading: isLoadingLoans, loadLoans } = useLoansStore();
  const { planPagos, isLoading, error, loadPaymentPlan, clearPaymentPlan } = usePaymentPlanStore();
  const { isAuthenticated } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadLoans();
      }
      setSelectedLoan('');
    }, [isAuthenticated, loadLoans])
  );

  useEffect(() => {
    if (selectedLoan && isAuthenticated) {
      loadPaymentPlan(selectedLoan);
    } else if (!selectedLoan) {
      clearPaymentPlan();
    }
  }, [selectedLoan, isAuthenticated, loadPaymentPlan, clearPaymentPlan]);

  const selectedLoanData = loans.find((l) => l.numeroOperacion === selectedLoan);
  const moneda = selectedLoanData?.moneda || 'CRC';
  const cuotas = planPagos?.cuotas || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedLoan) {
        await loadPaymentPlan(selectedLoan);
      } else {
        await loadLoans();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <MessageCard message="Cargando plan de pagos..." type="loading" />;
    }
    if (error) {
      return <MessageCard message={error} type="error" />;
    }
    if (!selectedLoan) {
      return <MessageCard message={PAYMENT_PLAN_PAGE_TEXT.selectLoan} type="info" />;
    }
    if (cuotas.length === 0) {
      return <MessageCard message={PAYMENT_PLAN_PAGE_TEXT.emptyMessage} type="info" />;
    }
    return (
      <View style={styles.cuotasList}>
        {cuotas.map((cuota) => (
          <PaymentPlanCard key={`cuota-${cuota.numeroCuota}`} cuota={cuota} moneda={moneda} />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#a61612"
            colors={['#a61612']}
          />
        }
      >
        <View style={styles.content}>
          <LoanSelect
            loans={loans}
            value={selectedLoan}
            onValueChange={setSelectedLoan}
            placeholder={PAYMENT_PLAN_PAGE_TEXT.selectLoan}
            disabled={isLoadingLoans || loans.length === 0}
          />

          {planPagos && (
            <View style={[styles.planSummary, { borderColor }]}>
              <View style={styles.summaryDates}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>{PAYMENT_PLAN_PAGE_TEXT.fechaInicio}</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatDate(planPagos.fechaInicio)}</Text>
                </View>
                <Text style={[styles.summarySep, { color: secondaryTextColor }]}>→</Text>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>{PAYMENT_PLAN_PAGE_TEXT.fechaFin}</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatDate(planPagos.fechaFinalizacion)}</Text>
                </View>
              </View>
              <Text style={[styles.totalCuotas, { color: secondaryTextColor }]}>
                {PAYMENT_PLAN_PAGE_TEXT.totalCuotas}: {planPagos.totalCuotas}
              </Text>
            </View>
          )}

          {renderContent()}
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  planSummary: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  summaryDates: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
  },
  summarySep: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalCuotas: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  cuotasList: {
    gap: 4,
  },
});
