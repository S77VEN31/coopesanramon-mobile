import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import { useColorScheme } from 'react-native';
import {
  CreditCard,
  Banknote,
  FileText,
} from 'lucide-react-native';
import BankCard from '../cards/BankCard';
import { Card, CardContent } from '../ui/Card';
import DetailField from '../ui/DetailField';
import { type DtoTarjetaDebito } from '../../services/api/accounts.api';
import { EstadoTarjetaDebito } from '../../constants/enums';
import { 
  ESTADO_TARJETA_LABELS, 
  FRANQUICIA_LABELS,
  CURRENCY_LABELS,
} from '../../constants/accounts.constants';
import { getTextColor } from '../../../App';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 32;
const CARD_GAP = 16;

interface BankCardCarouselProps {
  tarjetas: DtoTarjetaDebito[];
  nombreTitular?: string;
  onSlideChange?: (index: number, tarjeta: DtoTarjetaDebito) => void;
}

export default function BankCardCarousel({
  tarjetas,
  nombreTitular = "COOPE SAN RAMÓN",
  onSlideChange,
}: BankCardCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);

  const cardWidth = screenWidth - CARD_PADDING;
  const snapInterval = cardWidth + CARD_GAP;

  // Update screen width on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Reset current index when tarjetas change
  useEffect(() => {
    setCurrentIndex(0);
  }, [tarjetas]);

  // Handle scroll end to update current page
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / snapInterval);
    
    if (newIndex >= 0 && newIndex < tarjetas.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (onSlideChange) {
        onSlideChange(newIndex, tarjetas[newIndex]);
      }
    }
  }, [snapInterval, currentIndex, onSlideChange, tarjetas]);

  const handleDotPress = useCallback((index: number) => {
    if (scrollViewRef.current) {
      const scrollX = index * snapInterval;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      setCurrentIndex(index);
      if (onSlideChange) {
        onSlideChange(index, tarjetas[index]);
      }
    }
  }, [onSlideChange, snapInterval, tarjetas]);

  // Don't render if no cards
  if (tarjetas.length === 0) {
    return null;
  }

  const currentCard = tarjetas[currentIndex];

  const getStatusInfo = () => {
    const estado = currentCard.estado;
    const label = ESTADO_TARJETA_LABELS[estado];
    const isActive =
      estado === EstadoTarjetaDebito.Activa ||
      estado === EstadoTarjetaDebito.ActivaSoloParaAcreditar ||
      estado === EstadoTarjetaDebito.ActivaSoloParaDebitar;
    const isBlocked =
      estado === EstadoTarjetaDebito.Bloqueada ||
      estado === EstadoTarjetaDebito.Cerrada;

    if (isActive) return { label, bg: '#16a34a', text: '#ffffff' };
    if (isBlocked) return { label, bg: '#dc2626', text: '#ffffff' };
    return { label, bg: '#737373', text: '#ffffff' };
  };

  const statusInfo = getStatusInfo();

  const getCurrencyLabel = (moneda: string | null | undefined) => {
    if (!moneda) return "Colones CR";
    return CURRENCY_LABELS[moneda] || moneda;
  };

  return (
    <View style={styles.container}>
      {/* Carousel de tarjetas */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {tarjetas.map((tarjeta, index) => (
          <View 
            key={`card-${index}-${tarjeta.numeroTarjeta || index}`} 
            style={[
              styles.cardWrapper, 
              { 
                width: cardWidth,
                marginLeft: index === 0 ? CARD_PADDING / 2 : 0,
                marginRight: index === tarjetas.length - 1 ? CARD_PADDING / 2 : CARD_GAP,
              }
            ]}
          >
            <BankCard
              numeroTarjeta={tarjeta.numeroTarjeta ?? undefined}
              franquicia={tarjeta.franquicia}
              estado={tarjeta.estado}
              saldoDisponible={tarjeta.saldoDisponible}
              moneda={tarjeta.moneda ?? undefined}
              descripcion={tarjeta.descripcion ?? undefined}
              nombreTitular={nombreTitular}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots indicators */}
      {tarjetas.length > 1 && (
        <View style={styles.dotsContainer}>
          {tarjetas.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          ))}
        </View>
      )}

      {/* Card details section - using DetailField like AccountDetailCard */}
      {currentCard && (
        <Card style={styles.detailsCard} colorScheme={colorScheme}>
          <CardContent style={styles.detailsContent}>
            {/* Estado */}
            <DetailField
              icon={CreditCard}
              label="Estado de la Tarjeta"
              value={
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              }
            />

            {/* Franquicia */}
            <DetailField
              icon={CreditCard}
              label="Franquicia"
              value={
                <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                  {FRANQUICIA_LABELS[currentCard.franquicia]}
                </Text>
              }
            />

            {/* Moneda */}
            <DetailField
              icon={Banknote}
              label="Moneda"
              value={
                <View style={styles.currencyValueRow}>
                  <Text style={[styles.valueText, { color: textColor }]}>
                    {getCurrencyLabel(currentCard.moneda)}
                  </Text>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.badgeText}>{currentCard.moneda || "CRC"}</Text>
                  </View>
                </View>
              }
            />

            {/* Descripción (si existe) */}
            {currentCard.descripcion && (
              <DetailField 
                icon={FileText} 
                label="Descripción"
                value={
                  <Text style={[styles.valueText, { color: textColor }]}>
                    {currentCard.descripcion}
                  </Text>
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#a61612',
  },
  detailsCard: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  detailsContent: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  valueText: {
    fontSize: 14,
  },
  valueBold: {
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  currencyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    backgroundColor: '#a61612',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
