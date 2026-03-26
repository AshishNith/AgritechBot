import { StyleSheet, View, Pressable, Image } from 'react-native';
import { AppText } from '../ui';
import { CartItem as CartItemType } from '../../store/useMarketplaceStore';
import { IconMap } from '../IconMap';
import { useTheme } from '../../providers/ThemeContext';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const { isDark, colors } = useTheme();
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
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
          borderColor: colors.border,
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
        <AppText color={colors.textMuted} style={styles.unit}>
          {product.unit}
        </AppText>
        <AppText variant="label" color={colors.primary} style={styles.price}>
          ₹{product.price.toFixed(0)}
        </AppText>
      </View>

      <View style={[styles.quantitySection, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceMuted }]}>
        <Pressable
          onPress={() => onQuantityChange(Math.max(0, quantity - 1))}
          style={styles.quantityButton}
        >
          {MinusIcon ? <MinusIcon size={18} color={colors.primary} /> : null}
        </Pressable>
        <AppText style={styles.quantityText}>{quantity}</AppText>
        <Pressable
          onPress={() => onQuantityChange(quantity + 1)}
          style={styles.quantityButton}
        >
          {PlusIcon ? <PlusIcon size={18} color={colors.primary} /> : null}
        </Pressable>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="label" color={colors.primary}>
          ₹{itemTotal.toFixed(0)}
        </AppText>
        <Pressable onPress={onRemove} style={styles.removeButton}>
          {TrashIcon ? <TrashIcon size={16} color={colors.danger} /> : null}
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
    paddingVertical: 2,
  },
  quantityButton: {
    width: 24,
    height: 32,
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
    height: '100%',
    paddingVertical: 2,
  },
  removeButton: {
    marginTop: 8,
  },
});
