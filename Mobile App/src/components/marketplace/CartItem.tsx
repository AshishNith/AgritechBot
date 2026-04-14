import { StyleSheet, View, Pressable, Image } from 'react-native';
import { AppText } from '../ui';
import { CartItem as CartItemType } from '../../store/useMarketplaceStore';
import { IconMap } from '../IconMap';
import { useAppStore } from '../../store/useAppStore';
import { getLocalizedProductContent } from '../../utils/localizationHelper';
import { useTheme } from '../../providers/ThemeContext';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const localized = getLocalizedProductContent(product, language);

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
      
      <View style={styles.middleSection}>
        <View style={styles.content}>
          <AppText variant="label" numberOfLines={2}>
            {localized.name}
          </AppText>
          <AppText color={colors.textMuted} style={styles.unit}>
            {localized.unit || '1 unit'}
          </AppText>
          <AppText variant="label" color={colors.primary} style={styles.price}>
            ₹{product.price.toFixed(0)}
          </AppText>
        </View>

        <View style={styles.actionsRow}>
          <View style={[styles.quantitySection, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceMuted }]}>
            <Pressable
              onPress={() => onQuantityChange(Math.max(0, quantity - 1))}
              style={styles.quantityButton}
            >
              {MinusIcon ? <MinusIcon size={16} color={colors.primary} /> : null}
            </Pressable>
            <AppText style={styles.quantityText}>{quantity}</AppText>
            <Pressable
              onPress={() => onQuantityChange(quantity + 1)}
              style={styles.quantityButton}
            >
              {PlusIcon ? <PlusIcon size={16} color={colors.primary} /> : null}
            </Pressable>
          </View>

          <Pressable onPress={onRemove} style={styles.removeButton}>
            {TrashIcon ? <TrashIcon size={16} color={colors.danger} /> : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="label" color={colors.primary}>
          ₹{itemTotal.toFixed(0)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  middleSection: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  content: {
    marginBottom: 8,
  },
  unit: {
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    marginTop: 4,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 50,
  },
});
