import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import type { DtoProductoResumen } from '../../lib/utils/dashboard.utils';

interface ProductCardProps {
  producto: DtoProductoResumen;
  icon: LucideIcon;
  formattedValue: string;
  moneyColor?: string;
  onPress?: () => void;
}

export default function ProductCard({
  producto,
  icon: Icon,
  formattedValue,
  moneyColor,
  onPress,
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const renderContent = (isPressed: boolean = false) => (
    <Card style={styles.card} colorScheme={colorScheme}>
      <CardContent style={styles.content}>
        <View style={styles.column}>
          {/* First row: Icon and Description */}
          <View style={styles.descriptionRow}>
            <View style={styles.iconContainer}>
              <Icon size={20} color="#a61612" />
            </View>
            <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
              {producto.descripcion || "Producto"}
            </Text>
          </View>
          {/* Second row: Value and Currency */}
          <View style={styles.valueRow}>
            <Text style={[styles.value, moneyColor ? { color: '#a61612' } : { color: textColor }]}>
              {formattedValue}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {producto.codigoMoneda || "CRC"}
              </Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 }
        ]}
      >
        {({ pressed }) => renderContent(pressed)}
      </Pressable>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  column: {
    flexDirection: 'column',
    gap: 12,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    flexShrink: 0,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a61612',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
});

