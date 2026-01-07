import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
} from 'react-native';
import SummaryCard, { type SummaryCardData, type TabType } from '../cards/SummaryCard';
import { getBackgroundColor } from '../../../App';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PEEK = 32; // How much of adjacent cards to show
const CARD_GAP = 16; // Gap between cards
const SIDE_PADDING = CARD_PEEK; // Padding on sides

interface SummaryCarouselProps {
  cards: SummaryCardData[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCardPress: (cardId: TabType, index: number) => void;
}

export default function SummaryCarousel({
  cards,
  activeTab,
  onTabChange,
  onCardPress,
}: SummaryCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);

  // Calculate card width: screen - peek on both sides - half gap on each side for centering
  const cardWidth = screenWidth - (SIDE_PADDING * 2);
  const snapInterval = cardWidth + CARD_GAP;

  // Sort cards: ones with 0 value go to the end (memoized)
  const sortedCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return [...cards].sort((a, b) => {
      const getNumericValue = (value: string) => {
        const numeric = value.replace(/[^0-9.-]/g, '');
        return parseFloat(numeric) || 0;
      };

      const valueA = getNumericValue(a.value);
      const valueB = getNumericValue(b.value);

      if (valueA === 0 && valueB !== 0) return 1;
      if (valueB === 0 && valueA !== 0) return -1;
      return 0;
    });
  }, [cards]);

  // Store sortedCards in a ref for stable callback access
  const sortedCardsRef = useRef(sortedCards);
  sortedCardsRef.current = sortedCards;

  // Find the active card index
  const activeIndex = sortedCards.findIndex((card) => card.id === activeTab);

  // Update screen width on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Scroll to active card when activeTab changes externally
  useEffect(() => {
    if (activeIndex >= 0 && activeIndex !== currentIndex && scrollViewRef.current && sortedCards.length > 0) {
      const scrollX = activeIndex * snapInterval;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      setCurrentIndex(activeIndex);
    }
  }, [activeTab, activeIndex, currentIndex, sortedCards.length, snapInterval]);

  // Handle scroll end to update current page
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / snapInterval);
    
    if (newIndex >= 0 && newIndex < sortedCardsRef.current.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const card = sortedCardsRef.current[newIndex];
      if (card) {
        onTabChange(card.id);
      }
    }
  }, [snapInterval, currentIndex, onTabChange]);

  const handleCardPress = useCallback((cardId: TabType, index: number) => {
    onTabChange(cardId);
    const originalIndex = cards.findIndex((c) => c.id === cardId);
    onCardPress(cardId, originalIndex);
  }, [cards, onTabChange, onCardPress]);

  const handleDotPress = useCallback((index: number) => {
    const card = sortedCardsRef.current[index];
    if (card && scrollViewRef.current) {
      const scrollX = index * snapInterval;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      setCurrentIndex(index);
      onTabChange(card.id);
    }
  }, [onTabChange, snapInterval]);

  // Don't render if no cards
  if (sortedCards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
        {sortedCards.map((card, index) => (
          <View 
            key={card.id} 
            style={[
              styles.cardWrapper, 
              { 
                width: cardWidth,
                marginLeft: index === 0 ? SIDE_PADDING : 0,
                marginRight: index === sortedCards.length - 1 ? SIDE_PADDING : CARD_GAP,
              }
            ]}
          >
            <SummaryCard
              card={card}
              activeTab={activeTab}
              index={index}
              onCardPress={handleCardPress}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots indicators */}
      {sortedCards.length > 1 && (
        <View style={styles.dotsContainer}>
          {sortedCards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  cardWrapper: {
    // Height is auto based on content
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
});
