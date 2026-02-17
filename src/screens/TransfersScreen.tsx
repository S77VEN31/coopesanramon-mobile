import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import CustomHeader from '@/components/header/CustomHeader';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { MainDrawerParamList } from '@/navigation/types';
import { getBackgroundColor } from '../../App';
import ContentCard from '@/components/cards/ContentCard';
import { TransferTypeStep } from '@/components/wizard/steps';
import TransferSuccessModal from '@/components/modals/TransferSuccessModal';
import LocalTransferFlow from '@/components/transfers/LocalTransferFlow';
import SinpeTransferFlow from '@/components/transfers/SinpeTransferFlow';
import SinpeMovilTransferFlow from '@/components/transfers/SinpeMovilTransferFlow';
import type { EnviarTransferenciaInternaResponse, EnviarTransferenciaSinpeResponse, EnviarTransferenciaCreditosDirectosResponse, EnviarTransferenciaDebitosTiempoRealResponse, EnviarSinpeMovilResponse } from '@/services/api/transfers.api';

type TransferType = 'local' | 'sinpe' | 'sinpe-mobile';

type TransferResponse =
  | EnviarTransferenciaInternaResponse
  | EnviarTransferenciaSinpeResponse
  | EnviarTransferenciaCreditosDirectosResponse
  | EnviarTransferenciaDebitosTiempoRealResponse
  | EnviarSinpeMovilResponse;

const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  local: 'Transferencia Local',
  sinpe: 'Otros Bancos (SINPE)',
  'sinpe-mobile': 'SINPE Movil',
};

type Props = DrawerScreenProps<MainDrawerParamList, 'Transfers'>;

export default function TransfersScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);

  const [transferType, setTransferType] = useState<TransferType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTransfer, setSuccessTransfer] = useState<TransferResponse | null>(null);
  const [successTransferEmailDestino, setSuccessTransferEmailDestino] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={transferType ? TRANSFER_TYPE_LABELS[transferType] : 'Transferencias'}
          showDrawerButton={!transferType}
          showBackButton={!!transferType}
          onBackPress={transferType ? () => setTransferType(null) : undefined}
        />
      ),
    });
  }, [navigation, transferType]);

  const handleTransferComplete = (transfer: TransferResponse, emailDestino: string | null) => {
    setSuccessTransfer(transfer);
    setSuccessTransferEmailDestino(emailDestino);
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessTransfer(null);
    setSuccessTransferEmailDestino(null);
    setTransferType(null);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard fullHeight disableScroll>
          {!transferType ? (
            <TransferTypeStep
              selectedType={null}
              onTypeSelect={setTransferType}
            />
          ) : transferType === 'local' ? (
            <LocalTransferFlow
              onComplete={handleTransferComplete}
              onCancel={() => setTransferType(null)}
            />
          ) : transferType === 'sinpe' ? (
            <SinpeTransferFlow
              onComplete={handleTransferComplete}
              onCancel={() => setTransferType(null)}
            />
          ) : (
            <SinpeMovilTransferFlow
              onComplete={handleTransferComplete}
              onCancel={() => setTransferType(null)}
            />
          )}
        </ContentCard>
      </View>

      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        transfer={successTransfer}
        emailDestino={successTransferEmailDestino}
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
});
