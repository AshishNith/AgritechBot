import { StyleSheet, View, Pressable, Image, useColorScheme } from 'react-native';
import { AppText } from '../ui';
import { theme } from '../../constants/theme';
import { CartItem as CartItemType } from '../../store/useMarketplaceStore';
import { IconMap } from '../IconMap';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const isDark = useColorScheme() === 'dark';
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const MinusIcon = IconMap['Minus'];
  const PlusIcon = IconMap['Plus'];
  const TrashIcon = IconMap['Trash2'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border,
        },
      ]}
    >
      <Image
        source={{ uri: product.images?.[0] || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <AppText variant="label" numberOfLines={2}>
          {product.name}
        </AppText>
        <AppText color={theme.colors.textMuted} style={styles.unit}>
          {product.unit}
        </AppText>
        <AppText variant="label" color={theme.colors.primary} style={styles.price}>
          ₹{product.price.toFixed(0)}
        </AppText>
      </View>

      <View style={[styles.quantitySection, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.surfaceMuted }]}>
        <Pressable
          onPress={() => onQuantityChange(Math.max(0, quantity - 1))}
          style={styles.quantityButton}
        >
          {MinusIcon ? <MinusIcon size={18} color={theme.colors.primary} /> : null}
        </Pressable>
        <AppText style={styles.quantityText}>{quantity}</AppText>
        <Pressable
          onPress={() => onQuantityChange(quantity + 1)}
          style={styles.quantityButton}
        >
          {PlusIcon ? <PlusIcon size={18} color={theme.colors.primary} /> : null}
        </Pressable>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="label" color={theme.colors.primary}>
          ₹{itemTotal.toFixed(0)}
        </AppText>
        <Pressable onPress={onRemove} style={styles.removeButton}>
          {TrashIcon ? <TrashIcon size={18} color={theme.colors.danger} /> : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  unit: {
    fontSize: 12,
    marginTop: 4,
  },
  price: {
    marginTop: 4,
    fontSize: 14,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    marginTop: 4,
  },
});
