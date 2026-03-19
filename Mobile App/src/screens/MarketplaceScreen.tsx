import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { useMemo, useState } from 'react';

import { apiService } from '../api/services';
import { AppText, Pill, Screen, ScreenCard, SearchInput, SectionHeader } from '../components/ui';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { Product } from '../types/api';

const priorityCategories = ['Fertilizers', 'Seeds', 'Tools', 'Pesticides'];

export function MarketplaceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = useColorScheme() === 'dark';
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const cartCount = useMarketplaceStore((state) => state.getCartItemsCount());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['products-marketplace', search],
    queryFn: () => apiService.getProducts(search || undefined),
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      addToCart(product, 1);
      return product;
    },
  });

  const products = data?.products ?? [];

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));
    const ordered = [
      ...priorityCategories.filter((item) => dynamic.includes(item)),
      ...dynamic.filter((item) => !priorityCategories.includes(item)),
    ];
    return ['All', ...ordered];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (category === 'All') {
      return products;
    }
    return products.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }, [products, category]);

  const grouped = useMemo(
    () => ({
      fertilizers: filteredProducts.filter((item) => item.category.toLowerCase().includes('fert')),
      seeds: filteredProducts.filter((item) => item.category.toLowerCase().includes('seed')),
      tools: filteredProducts.filter((item) => item.category.toLowerCase().includes('tool')),
      cropCare: filteredProducts.filter((item) =>
        item.category.toLowerCase().includes('pestic') ||
        item.aiMetadata?.tags?.some((tag) => tag.toLowerCase().includes('pest'))
      ),
    }),
    [filteredProducts]
  );

  const aiPick = useMemo(() => {
    return (
      filteredProducts.find((item) =>
        item.aiMetadata?.tags?.some((tag) => tag.toLowerCase().includes('organic'))
      ) ?? filteredProducts[0]
    );
  }, [filteredProducts]);

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="heading">{t(language, 'marketTitle')}</AppText>
          <AppText color={theme.colors.textMuted}>{t(language, 'marketSubtitle')}</AppText>
        </View>
        <Pressable style={styles.cartIndicator} onPress={() => navigation.navigate('Cart')}>
          <AppText variant="label" color={theme.colors.textOnDark}>{t(language, 'cart')} {cartCount}</AppText>
        </Pressable>
      </View>
      <View style={{ marginTop: 18 }}>
        <SearchInput value={search} onChangeText={setSearch} placeholder={t(language, 'searchPlaceholder')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {categories.map((item) => (
          <Pill key={item} label={item} active={item === category} onPress={() => setCategory(item)} />
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          {aiPick ? (
            <ScreenCard style={styles.recommendationCard}>
              <AppText variant="caption" color="#dff5e9">
                {t(language, 'aiPick')}
              </AppText>
              <AppText variant="title" color={theme.colors.textOnDark} style={{ marginTop: 8 }}>
                {aiPick.name}
              </AppText>
              <AppText color="#dff5e9" style={{ marginTop: 8 }}>
                {aiPick.farmerFriendlyInfo?.whyUse ?? t(language, 'marketSubtitle')}
              </AppText>
              <Pressable
                onPress={() => {
                  setFeaturedProduct(aiPick);
                  navigation.navigate('ProductDetail', { productId: aiPick.id });
                }}
                style={styles.aiCardAction}
              >
                <AppText variant="label" color={theme.colors.primaryDark}>
                  {t(language, 'viewNow')}
                </AppText>
              </Pressable>
            </ScreenCard>
          ) : null}

          {grouped.fertilizers.length > 0 && (
            <>
              <SectionHeader title={t(language, 'topFertilizers')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
                {grouped.fertilizers.map((product) => (
                  <ProductFlowCard
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                    onAddToCart={() => addToCartMutation.mutate(product)}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {grouped.seeds.length > 0 && (
            <>
              <SectionHeader title={t(language, 'essentialSeeds')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
                {grouped.seeds.map((product) => (
                  <ProductFlowCard
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                    onAddToCart={() => addToCartMutation.mutate(product)}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {grouped.tools.length > 0 && (
            <>
              <SectionHeader title={t(language, 'modernTools')} />
              <View style={{ gap: 12, paddingBottom: grouped.cropCare.length ? 16 : 108 }}>
                {grouped.tools.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                    style={[
                      styles.toolRow,
                      {
                        backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border,
                      },
                    ]}
                  >
                    <Image source={{ uri: product.images[0] }} style={styles.toolImage} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="label">{product.name}</AppText>
                      <AppText color={theme.colors.textMuted} numberOfLines={2}>
                        {product.description}
                      </AppText>
                    </View>
                    <AppText variant="label">₹{product.price}</AppText>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {grouped.cropCare.length > 0 && (
            <>
              <SectionHeader title={t(language, 'cropCare')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.sectionScroller, { paddingBottom: 108 }]}>
                {grouped.cropCare.map((product) => (
                  <ProductFlowCard
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                    onAddToCart={() => addToCartMutation.mutate(product)}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {filteredProducts.length === 0 && (
            <ScreenCard style={styles.emptyWrap}>
              <AppText variant="label">{t(language, 'noProductsFound')}</AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 6 }}>
                {t(language, 'tryDifferentFilters')}
              </AppText>
            </ScreenCard>
          )}
        </>
      )}
    </Screen>
  );
}

function ProductFlowCard({
  image,
  name,
  price,
  onPress,
  onAddToCart,
}: {
  image?: string;
  name: string;
  price: number;
  onPress: () => void;
  onAddToCart: () => void;
}) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.flowCard,
        {
          backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border,
        },
      ]}
    >
      <Image source={{ uri: image || 'https://via.placeholder.com/220' }} style={styles.flowImage} />
      <AppText variant="label">{name}</AppText>
      <View style={styles.cardFooter}>
        <AppText color={theme.colors.primaryDark} variant="label">
          ₹{price}
        </AppText>
        <Pressable onPress={onAddToCart} style={styles.addButton}>
          <AppText variant="label" color={theme.colors.textOnDark}>+</AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartIndicator: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipsRow: {
    gap: 10,
    paddingVertical: 18,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  recommendationCard: {
    backgroundColor: theme.colors.primaryDark,
    marginBottom: 24,
  },
  aiCardAction: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: '#f4fff8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sectionScroller: {
    gap: 14,
    paddingBottom: 20,
  },
  emptyWrap: {
    marginBottom: 108,
  },
  flowCard: {
    width: 190,
    borderRadius: 28,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    ...theme.shadow.card,
  },
  flowImage: {
    width: '100%',
    height: 136,
    borderRadius: 22,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    ...theme.shadow.card,
  },
  toolImage: {
    width: 78,
    height: 78,
    borderRadius: 18,
  },
});
