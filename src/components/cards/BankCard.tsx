import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CreditCard as CreditCardIcon } from 'lucide-react-native';
import { Franquicia, EstadoTarjetaDebito } from '../../constants/enums';
import { formatAccountCurrency } from '../../lib/utils/accounts.utils';
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  DinersLogo,
  CardBackground,
} from './logos';
import CardChip from './CardChip';

interface BankCardProps {
  numeroTarjeta?: string | null;
  franquicia: Franquicia;
  estado: EstadoTarjetaDebito;
  saldoDisponible: number;
  moneda?: string | null;
  descripcion?: string | null;
  nombreTitular?: string;
}

const CardLogo = ({ franquicia }: { franquicia: Franquicia }) => {
  switch (franquicia) {
    case Franquicia.Visa:
      return <VisaLogo width={56} height={36} />;
    case Franquicia.MasterCard:
      return <MastercardLogo width={56} height={36} />;
    case Franquicia.AmericanExpress:
      return <AmexLogo width={56} height={36} />;
    case Franquicia.DinnersClub:
      return <DinersLogo width={56} height={36} />;
    default:
      return <CreditCardIcon size={36} color="#fff" />;
  }
};

// Format card number with mask
const formatCardNumber = (value: string | null | undefined): string => {
  if (!value) {
    return "**** **** **** ****";
  }

  // If already contains asterisks, return as is (already formatted from API)
  if (value.includes("*")) {
    return value;
  }

  // If it's an unformatted number, mask everything except last 4 digits
  const sanitized = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");

  if (sanitized.length < 4) {
    return "**** **** **** ****";
  }

  // Get last 4 digits
  const lastFour = sanitized.slice(-4);

  // Create masked number: **** **** **** XXXX
  return `**** **** **** ${lastFour}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_ASPECT_RATIO = 1.586;

export default function BankCard({
  numeroTarjeta,
  franquicia,
  estado,
  saldoDisponible,
  moneda = "CRC",
  nombreTitular = "COOPE SAN RAMÓN",
}: BankCardProps) {
  const isActive =
    estado === EstadoTarjetaDebito.Activa ||
    estado === EstadoTarjetaDebito.ActivaSoloParaAcreditar ||
    estado === EstadoTarjetaDebito.ActivaSoloParaDebitar;

  const formattedCardNumber = formatCardNumber(numeroTarjeta);
  const cardWidth = SCREEN_WIDTH - 64; // Account for padding
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  return (
    <View style={[styles.container, !isActive && styles.inactive]}>
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
        {/* Background */}
        <View style={StyleSheet.absoluteFill}>
          <CardBackground width={cardWidth} height={cardHeight} />
        </View>
        
        {/* Content Overlay */}
        <View style={styles.content}>
          {/* Chip - Positioned absolutely */}
          <View style={styles.chipContainer}>
            <CardChip width={40} height={32} />
          </View>

          {/* Header: Saldo */}
          <View style={styles.header}>
            <Text style={styles.balanceLabel}>
              Saldo · {(moneda ?? "CRC").toUpperCase()}
            </Text>
            <Text style={styles.balanceValue}>
              {formatAccountCurrency(saldoDisponible, moneda ?? "CRC")}
            </Text>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Card Number */}
          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumber}>
              {formattedCardNumber}
            </Text>
          </View>

          {/* Footer: Titular and Logo */}
          <View style={styles.footer}>
            <View style={styles.holderContainer}>
              <Text style={styles.holderLabel}>Titular</Text>
              <Text style={styles.holderName} numberOfLines={1}>
                {nombreTitular}
              </Text>
            </View>

            <View style={styles.logoContainer}>
              <CardLogo franquicia={franquicia} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inactive: {
    opacity: 0.7,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chipContainer: {
    position: 'absolute',
    top: 67,
    left: 28,
    zIndex: 1,
  },
  spacer: {
    flex: 1,
  },
  cardNumberContainer: {
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'monospace',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderContainer: {
    flex: 1,
    marginRight: 12,
  },
  holderLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  holderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
});
