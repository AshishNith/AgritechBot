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

function normalizeCategory(product: Product): string {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const subCat = (product.subCategory || '').toLowerCase();

  if (
    cat.includes('fert') || cat === 'npk' || cat === 'potash' || cat.includes('zinc') || 
    cat.includes('humic') || cat.includes('humik') || cat.includes('acid') || cat.includes('urea') ||
    cat.includes('nitrogen') || cat.includes('phosph') || cat.includes('micronutrient') ||
    name.includes('fert') || name.includes('npk') || name.includes('potash') || name.includes('zinc') || 
    name.includes('urea') || name.includes('phosphate') || name.includes('manure') || name.includes('compost') ||
    brand.includes('fert') || brand.includes('zinc') || brand.includes('pgr') || subCat.includes('pgr') || 
    name.includes('poshan') || name.includes('groshakti') || name.includes('drop') || name.includes('promoter')
  ) {
    return 'Fertilizers';
  }

  if (cat.includes('seed') || name.includes('seed') || brand.includes('seed') || subCat.includes('seed')) {
    return 'Seeds';
  }

  if (
    cat.includes('tool') || cat.includes('machin') || cat.includes('equip') || cat === 'irrigation' ||
    name.includes('tool') || name.includes('sensor') || name.includes('drip') || name.includes('sprayer') || 
    name.includes('cutter') || name.includes('pump') || name.includes('meter')
  ) {
    return 'Tools';
  }

  if (
    cat.includes('pestic') || cat.includes('fungic') || cat.includes('herbic') || cat.includes('neem') || 
    cat.includes('protect') || cat.includes('weed') || cat.includes('insect') ||
    name.includes('pestic') || name.includes('fungic') || name.includes('herbic') || name.includes('neem') || 
    name.includes('poison') || name.includes('weed') || name.includes('insect') || name.includes('bio-')
  ) {
    return 'Pesticides';
  }

  return 'General';
}

export function MarketplaceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const cartCount = useMarketplaceStore((state) => state.getCartItemsCount());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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

  const normalizedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      category: normalizeCategory(product),
    }));
  }, [products]);

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(normalizedProducts.map((item) => item.category).filter(Boolean)));
    const ordered = [
      ...priorityCategories.filter((item) => dynamic.includes(item)),
      ...dynamic.filter((item) => !priorityCategories.includes(item)),
    ];
    return ['all', ...ordered];
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    if (category === 'all') {
      return normalizedProducts;
    }
    return normalizedProducts.filter((item) => item.category.toLowerCase() === category.toLowerCase() || 
      (category === 'Fertilizers' && item.category.toLowerCase().includes('fert')) ||
      (category === 'Seeds' && item.category.toLowerCase().includes('seed')) ||
      (category === 'Tools' && item.category.toLowerCase().includes('tool')) ||
      (category === 'Pesticides' && item.category.toLowerCase().includes('pestic'))
    );
  }, [normalizedProducts, category]);

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

  const aiRecommendations = useMemo(() => {
    const organicPicks = filteredProducts.filter((item) =>
      item.aiMetadata?.tags?.some((tag) => tag.toLowerCase().includes('organic'))
    );
    const combined = [...organicPicks, ...filteredProducts.filter(item => !organicPicks.includes(item))];
    return combined.slice(0, 5);
  }, [filteredProducts]);

  const showAiRecommendations = !search || search.trim().length === 0;

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
          const displayLabel = item === 'all' ? t(language, 'viewAll') : (
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
          {showAiRecommendations && aiRecommendations.length > 0 ? (
            <View style={{ marginBottom: 24 }}>
              <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <SectionHeader title={t(language || 'English', 'aiPick') || 'AI Recommendations'} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiScroller}>
                {aiRecommendations.map((product) => {
                  const localized = getLocalizedProductContent(product, language || 'English');
                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => {
                        setFeaturedProduct(product);
                        navigation.navigate('ProductDetail', { productId: product.id });
                      }}
                      style={[
                        styles.recommendationCard, 
                        { 
                          backgroundColor: isDark ? 'rgba(109,207,150,0.1)' : colors.primary + '10', 
                          borderColor: colors.primary + '30',
                          borderWidth: 1,
                          width: 320,
                          marginRight: 12,
                          flexDirection: 'row',
                          gap: 12,
                          alignItems: 'center',
                        }
                      ]}
                    >
                      <Image source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }} style={styles.recImage} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <View style={[styles.aiBadge, { backgroundColor: colors.primary, width: 18, height: 18, borderRadius: 9 }]}>
                            {(() => { const IconComp = IconMap['Sparkles']; return IconComp ? <IconComp size={9} color="#fff" /> : null; })()}
                          </View>
                          <AppText variant="caption" color={colors.primary} weight="bold" style={{ letterSpacing: 0.5, fontSize: 10 }}>
                            {product.category.toUpperCase()}
                          </AppText>
                        </View>

                        <AppText variant="label" color={isDark ? colors.textOnDark : colors.text} style={{ fontSize: 14 }} numberOfLines={1}>
                          {localized.name}
                        </AppText>
                        
                        <AppText color={isDark ? colors.textOnDark : colors.textMuted} style={{ marginTop: 2, fontSize: 11, lineHeight: 14, opacity: 0.8 }} numberOfLines={2}>
                          {localized.whyUse ?? localized.description}
                        </AppText>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <AppText variant="label" color={colors.primaryDark} style={{ fontSize: 13 }}>
                            ₹{product.price}
                          </AppText>
                          <View style={[styles.miniActionBtn, { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
                            <AppText variant="caption" color="#fff" style={{ fontSize: 10 }}>{t(language || 'English', 'viewNow')}</AppText>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
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
  aiScroller: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  miniActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
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
