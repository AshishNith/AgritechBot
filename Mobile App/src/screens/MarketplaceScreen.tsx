import { useMutation, useQuery } from '@tanstack/react-query';
import { IconMap } from '../components/IconMap';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useMemo, useState } from 'react';

import { apiService } from '../api/services';
import { AppText, Pill, Screen, ScreenCard, SearchInput, SectionHeader } from '../components/ui';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { Product } from '../types/api';
import { useTheme } from '../providers/ThemeContext';
import { getLocalizedProductContent } from '../utils/localizationHelper';

const priorityCategories = ['Fertilizers', 'Seeds', 'Tools', 'Pesticides'];

export function MarketplaceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const cartCount = useMarketplaceStore((state) => state.getCartItemsCount());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(t(language, 'viewAll'));

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
    const categoryMap: Record<string, string> = {
      'Fertilizers': t(language, 'topFertilizers'),
      'Seeds': t(language, 'essentialSeeds'),
      'Tools': t(language, 'modernTools'),
      'Pesticides': t(language, 'cropCare'),
    };
    const dynamic = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));
    const ordered = [
      ...priorityCategories.filter((item) => dynamic.includes(item)),
      ...dynamic.filter((item) => !priorityCategories.includes(item)),
    ];
    return [t(language, 'viewAll'), ...ordered];
  }, [products, language]);

  const filteredProducts = useMemo(() => {
    if (category === t(language, 'viewAll')) {
      return products;
    }
    return products.filter((item) => item.category.toLowerCase() === category.toLowerCase() || 
      (category === t(language, 'topFertilizers') && item.category.toLowerCase().includes('fert')) ||
      (category === t(language, 'essentialSeeds') && item.category.toLowerCase().includes('seed')) ||
      (category === t(language, 'modernTools') && item.category.toLowerCase().includes('tool')) ||
      (category === t(language, 'cropCare') && item.category.toLowerCase().includes('pestic'))
    );
  }, [products, category, language]);

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
    <Screen scrollable withTabBar padded={false}>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="heading">{t(language, 'marketTitle')}</AppText>
          <AppText color={colors.textMuted}>{t(language, 'marketSubtitle')}</AppText>
        </View>
        <Pressable style={[styles.cartIndicator, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Cart')}>
          <AppText variant="label" color={colors.textOnDark}>{t(language, 'cart')} {cartCount}</AppText>
        </Pressable>
      </View>
      <View style={{ marginTop: 18, paddingHorizontal: 20 }}>
        <SearchInput value={search} onChangeText={setSearch} placeholder={t(language, 'searchPlaceholder')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {categories.map((item) => {
          const displayLabel = item === t(language, 'viewAll') ? item : (
            item === 'Fertilizers' ? t(language, 'topFertilizers') :
            item === 'Seeds' ? t(language, 'essentialSeeds') :
            item === 'Tools' ? t(language, 'modernTools') :
            item === 'Pesticides' ? t(language, 'cropCare') : item
          );
          return (
            <Pill key={item} label={displayLabel} active={item === category} onPress={() => setCategory(item)} />
          );
        })}
      </ScrollView>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {aiPick ? (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View 
                style={[
                  styles.recommendationCard, 
                  { 
                    backgroundColor: isDark ? 'rgba(109,207,150,0.1)' : colors.primary + '10', 
                    borderColor: colors.primary + '30',
                    borderWidth: 1,
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
                    {(() => { const IconComp = IconMap['Sparkles']; return IconComp ? <IconComp size={14} color="#fff" /> : null; })()}
                  </View>
                  <AppText variant="caption" color={colors.primary} weight="bold" style={{ letterSpacing: 1 }}>
                    {t(language, 'aiPick').toUpperCase()}
                  </AppText>
                </View>

                <AppText variant="title" color={isDark ? colors.textOnDark : colors.text} style={{ fontSize: 20 }}>
                  {getLocalizedProductContent(aiPick, language || 'English').name}
                </AppText>
                
                <AppText color={isDark ? colors.textOnDark : colors.textMuted} style={{ marginTop: 8, fontSize: 13, lineHeight: 18, opacity: 0.8 }}>
                  {getLocalizedProductContent(aiPick, language || 'English').whyUse ?? t(language || 'English', 'marketSubtitle')}
                </AppText>

                <Pressable
                  onPress={() => {
                    setFeaturedProduct(aiPick);
                    navigation.navigate('ProductDetail', { productId: aiPick.id });
                  }}
                  style={({ pressed }) => [
                    styles.aiCardAction,
                    { 
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                >
                  <AppText variant="label" color="#fff" style={{ fontSize: 13 }}>
                    {t(language || 'English', 'viewNow')}
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : null}

          {grouped.fertilizers.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 20 }}>
                <SectionHeader title={t(language || 'English', 'topFertilizers')} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
                {grouped.fertilizers.map((product) => {
                  const localized = getLocalizedProductContent(product, language || 'English');
                  return (
                    <ProductFlowCard
                      key={product.id}
                      name={localized.name}
                      price={product.price}
                      image={product.images[0]}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      onAddToCart={() => addToCartMutation.mutate(product)}
                    />
                  );
                })}
              </ScrollView>
            </>
          )}

          {grouped.seeds.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 20 }}>
                <SectionHeader title={t(language || 'English', 'essentialSeeds')} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
                {grouped.seeds.map((product) => {
                  const localized = getLocalizedProductContent(product, language || 'English');
                  return (
                    <ProductFlowCard
                      key={product.id}
                      name={localized.name}
                      price={product.price}
                      image={product.images[0]}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      onAddToCart={() => addToCartMutation.mutate(product)}
                    />
                  );
                })}
              </ScrollView>
            </>
          )}

          {grouped.tools.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 20 }}>
                <SectionHeader title={t(language || 'English', 'modernTools')} />
              </View>
              <View style={{ gap: 12, paddingHorizontal: 20 }}>
                {grouped.tools.map((product) => {
                  const localized = getLocalizedProductContent(product, language || 'English');
                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      style={[
                        styles.toolRow,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Image source={{ uri: product.images[0] }} style={styles.toolImage} />
                      <View style={{ flex: 1 }}>
                        <AppText variant="label">{localized.name}</AppText>
                        <AppText color={colors.textMuted} numberOfLines={2}>
                          {localized.description}
                        </AppText>
                      </View>
                      <AppText variant="label">₹{product.price}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {grouped.cropCare.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 20 }}>
                <SectionHeader title={t(language || 'English', 'cropCare')} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
                {grouped.cropCare.map((product) => {
                  const localized = getLocalizedProductContent(product, language || 'English');
                  return (
                    <ProductFlowCard
                      key={product.id}
                      name={localized.name}
                      price={product.price}
                      image={product.images[0]}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      onAddToCart={() => addToCartMutation.mutate(product)}
                    />
                  );
                })}
              </ScrollView>
            </>
          )}

          {filteredProducts.length === 0 && (
            <View style={{ paddingHorizontal: 20 }}>
              <ScreenCard style={styles.emptyWrap}>
                <AppText variant="label">{t(language || 'English', 'noProductsFound')}</AppText>
                <AppText color={colors.textMuted} style={{ marginTop: 6 }}>
                  {t(language || 'English', 'tryDifferentFilters')}
                </AppText>
              </ScreenCard>
            </View>
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
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.flowCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Image source={{ uri: image || 'https://via.placeholder.com/220' }} style={styles.flowImage} />
      <AppText variant="label">{name}</AppText>
      <View style={styles.cardFooter}>
        <AppText color={colors.primaryDark} variant="label">
          ₹{price}
        </AppText>
        <Pressable onPress={onAddToCart} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <AppText variant="label" color={colors.textOnDark}>+</AppText>
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
    paddingHorizontal: 20,
  },
  cartIndicator: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 24,
  },
  aiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardAction: {
    marginTop: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sectionScroller: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  emptyWrap: {
    marginBottom: 24,
    borderRadius: 16,
  },
  flowCard: {
    width: 170,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    ...theme.shadow.sm,
  },
  flowImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    ...theme.shadow.sm,
  },
  toolImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
});
