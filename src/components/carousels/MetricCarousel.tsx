import React, { useRef, useState, useEffect, useCallback } from 'react';
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
import MetricCard from '../cards/MetricCard';
import { getBackgroundColor } from '../../../App';
import { LucideIcon } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PEEK = 32; // How much of adjacent cards to show
const CARD_GAP = 16; // Gap between cards
const SIDE_PADDING = CARD_PEEK; // Padding on sides

interface MetricCardData {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  valueClassName?: string;
  iconClassName?: string;
}

interface MetricCarouselProps {
  cards: MetricCardData[];
}

export default function MetricCarousel({
  cards,
}: MetricCarouselProps) {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate card width: screen - peek on both sides - half gap on each side for centering
  const cardWidth = screenWidth - (SIDE_PADDING * 2);
  const snapInterval = cardWidth + CARD_GAP;

  // Update screen width on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Handle scroll end to update current page
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / snapInterval);
    
    if (newIndex >= 0 && newIndex < cards.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [snapInterval, currentIndex, cards.length]);

  const handleDotPress = useCallback((index: number) => {
    if (scrollViewRef.current) {
      const scrollX = index * snapInterval;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      setCurrentIndex(index);
    }
  }, [snapInterval]);

  // Don't render if no cards
  if (cards.length === 0) {
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
        {cards.map((card, index) => (
          <View 
            key={index} 
            style={[
              styles.cardWrapper, 
              { 
                width: cardWidth,
                marginLeft: index === 0 ? SIDE_PADDING : 0,
                marginRight: index === cards.length - 1 ? SIDE_PADDING : CARD_GAP,
              }
            ]}
          >
            <MetricCard
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              valueClassName={card.valueClassName}
              iconClassName={card.iconClassName}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots indicators */}
      {cards.length > 1 && (
        <View style={styles.dotsContainer}>
          {cards.map((_, index) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingVertical: 4,
  },
  cardWrapper: {
    flexShrink: 0,
    overflow: 'visible',
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

