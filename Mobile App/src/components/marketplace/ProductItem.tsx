import { StyleSheet, View, Pressable, Image, ActivityIndicator } from 'react-native';
import { AppText } from '../ui';
import { theme } from '../../constants/theme';
import { Product } from '../../types/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ProductItemProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  style?: any;
  isLoading?: boolean;
}

export function ProductItem({ product, onPress, onAddToCart, style, isLoading }: ProductItemProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images?.[0] || 'https://via.placeholder.com/200' }}
          style={styles.image}
        />
        {onAddToCart && (
          <Pressable
            onPress={onAddToCart}
            style={styles.cartButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={18} color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name="shopping-outline"
                size={18}
                color={theme.colors.primary}
              />
            )}
          </Pressable>
        )}
      </View>
      <AppText variant="label" numberOfLines={1} style={styles.productName}>
        {product.name}
      </AppText>
      <AppText color={theme.colors.textMuted} style={styles.productUnit} numberOfLines={1}>
        {product.unit}
      </AppText>
      <AppText variant="label" color={theme.colors.primary} style={styles.price}>
        ₹{product.price.toFixed(0)}
      </AppText>
    </Pressable>
  );
}

interface ProductListItemProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  isLoading?: boolean;
}

export function ProductListItem({ product, onPress, onAddToCart, isLoading }: ProductListItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.listItemContainer}>
      <Image
        source={{ uri: product.images?.[0] || 'https://via.placeholder.com/80' }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemContent}>
        <AppText variant="label">{product.name}</AppText>
        <View style={styles.ratingRow}>
          <AppText color={theme.colors.textMuted} style={{ fontSize: 12, marginRight: 8 }}>
            ★ 4.8
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ fontSize: 12 }}>
            50+ Reviews
          </AppText>
        </View>
        <AppText variant="label" color={theme.colors.primary} style={{ marginTop: 4 }}>
          ₹{product.price.toFixed(0)}
        </AppText>
      </View>
      <Pressable
        onPress={onAddToCart}
        style={styles.listItemChevron}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={18} color={theme.colors.primary} />
        ) : (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.primary}
          />
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.textOnDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    marginBottom: 4,
  },
  productUnit: {
    marginBottom: 4,
    fontSize: 12,
  },
  price: {
    fontSize: 14,
  },

  // List item styles
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  listItemChevron: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
