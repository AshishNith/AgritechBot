import { IconMap } from '../components/IconMap';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';

import { apiService } from '../api/services';
import { AppText, GlassCard, Pill, PulseMic, Screen, ScreenCard } from '../components/ui';
import { LeafletMap, MapMarker } from '../components/LeafletMap';
import { WeatherDashboardWidget } from '../components/WeatherDashboardWidget';
import { homeWeatherCard, marketplaceFallback, quickChips } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { AIAssistantWidget } from '../components/AIAssistantWidget';
import { PlannerWidget } from '../components/planner/PlannerWidget';
import { buildWeatherSuggestions } from '../utils/weatherSuggestions';
import { HeroWeatherCard } from '../components/HeroWeatherCard';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { WalletCreditBadge } from '../components/WalletCreditBadge';
import { useWallet } from '../hooks/useWallet';

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c21" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "on" }, { "saturation": -60 }, { "lightness": -20 }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8de2b2" }, { "opacity": 0.8 }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a251e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#2c3e32" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#a5d6a7" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#1d2c21" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#233529" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6fb08b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c3e32" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8de2b2" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#384f40" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#233529" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1611" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d5c49" }] }
];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const { t: tx } = useI18n();
  const { refetchWallet } = useWallet();
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [liveLocationName, setLiveLocationName] = useState(t(language, 'mandi'));
  const lightLogo = 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1775306310/image-removebg-preview_ifr7nb.png';
  const darkLogo = 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1774369551/Printable_Logo_nim1ca.svg';
  
  const logoUrl = isDark ? darkLogo : lightLogo;
  const logoImageUrl = logoUrl.endsWith('.svg') ? logoUrl.replace(/\.svg$/, '.png') : logoUrl;

  const { data } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => apiService.getProducts(),
  });

  const setUnreadCount = useAppStore((state) => state.setUnreadNotificationCount);
  const unreadCount = useAppStore((state) => state.unreadNotificationCount);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => apiService.getUnreadCount(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    void refetchWallet();
  }, [refetchWallet]);

  useEffect(() => {
    if (unreadData?.unreadCount != null) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData?.unreadCount, setUnreadCount]);

  const featured = data?.products?.[0] ?? marketplaceFallback[0];

  // Random recommendations
  const recommendedProducts = useMemo(() => {
    if (!data?.products) return marketplaceFallback;
    const shuffled = [...data.products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [data?.products]);

  const weatherCoordinates = useMemo(
    () => ({
      latitude: liveCoords?.latitude ?? user?.location?.latitude ?? 28.6139,
      longitude: liveCoords?.longitude ?? user?.location?.longitude ?? 77.209,
    }),
    [liveCoords, user?.location?.latitude, user?.location?.longitude]
  );

  // Generate random vendors for the map
  const mockVendors = useMemo<MapMarker[]>(() => {
    const { latitude, longitude } = weatherCoordinates;
    return [
      {
        latitude: latitude + 0.005,
        longitude: longitude + 0.003,
        title: t(language, 'mandiSeedBank'),
        type: 'vendor'
      },
      {
        latitude: latitude - 0.004,
        longitude: longitude + 0.006,
        title: t(language, 'equipmentRental'),
        type: 'vendor'
      },
      {
        latitude: latitude + 0.002,
        longitude: longitude - 0.005,
        title: t(language, 'fertilizerStore'),
        type: 'vendor'
      }
    ];
  }, [weatherCoordinates]);

  const { data: liveWeather } = useQuery({
    queryKey: ['home-live-weather', weatherCoordinates.latitude, weatherCoordinates.longitude],
    queryFn: async () => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${weatherCoordinates.latitude}&longitude=${weatherCoordinates.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=soil_moisture_0_to_7cm,precipitation_probability&timezone=auto`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const weatherCodeMap: Record<number, string> = {
    0: tx('weatherClear'),
    1: tx('weatherClear'),
    2: tx('weatherPartlyCloudy'),
    3: tx('weatherCloudy'),
    45: tx('weatherFoggy'),
    48: tx('weatherFoggy'),
    51: tx('weatherRainy'),
    53: tx('weatherRainy'),
    55: tx('weatherRainy'),
    61: tx('weatherRainy'),
    63: tx('weatherRainy'),
    65: tx('weatherRainy'),
    71: tx('weatherClear'),
    73: tx('weatherClear'),
    75: tx('weatherClear'),
    95: tx('weatherStormy'),
  };

  const weatherTemperature = liveWeather?.current?.temperature_2m != null
    ? Math.round(liveWeather.current.temperature_2m)
    : homeWeatherCard.temperature;
  const weatherCondition = weatherCodeMap[liveWeather?.current?.weather_code] || homeWeatherCard.condition;
  const weatherHumidity = liveWeather?.current?.relative_humidity_2m != null
    ? liveWeather.current.relative_humidity_2m
    : homeWeatherCard.moisture;
  const weatherWind = liveWeather?.current?.wind_speed_10m != null
    ? Math.round(liveWeather.current.wind_speed_10m)
    : 8;
  const soilMoisture = liveWeather?.hourly?.soil_moisture_0_to_7cm?.[0] != null
    ? Math.round(liveWeather.hourly.soil_moisture_0_to_7cm[0])
    : weatherHumidity;
  const autoSuggestions = buildWeatherSuggestions({
    temperature: liveWeather?.current?.temperature_2m,
    humidity: liveWeather?.current?.relative_humidity_2m,
    windSpeed: liveWeather?.current?.wind_speed_10m,
    rainProbability: liveWeather?.hourly?.precipitation_probability?.[0],
    soilMoisture: liveWeather?.hourly?.soil_moisture_0_to_7cm?.[0],
    weatherCode: liveWeather?.current?.weather_code,
  }, tx);

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t(language, 'goodMorning')
    : hour < 17
      ? t(language, 'goodAfternoon')
      : hour < 21
        ? t(language, 'goodEvening')
        : t(language, 'goodNight');

  useEffect(() => {
    let active = true;

    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          return;
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) {
          return;
        }

        setLiveCoords({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        const reverse = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        const area = reverse[0];
        if (area) {
          const label = [area.subregion, area.region].filter(Boolean).join(', ');
          if (label) {
            setLiveLocationName(label);
          }
        }
      } catch {
        // Keep dashboard usable even if permissions/network fail.
      }
    };

    loadLocation();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (featured) {
      setFeaturedProduct(featured);
    }
  }, [featured, setFeaturedProduct]);

  return (
    <Screen scrollable withTabBar>
      <LinearGradient colors={isDark ? [colors.backgroundAlt, colors.background] : ['#edf7f0', '#f6f7f7']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Image
            source={{ uri: logoImageUrl }}
            style={isDark ? styles.logoImageDark : styles.logoImage}
            resizeMode="contain"
          />
          {isDark && (
            <AppText weight="bold" style={{ fontSize: 26, color: colors.textOnDark, marginLeft: 4, lineHeight: 32, flexShrink: 0 }}>
              Anaaj.ai
            </AppText>
          )}
        </View>
        <Pill
          label={unreadCount > 0 ? `${tx('alerts')} (${unreadCount})` : tx('alerts')}
          icon={(() => { const IconComp = IconMap['Bell']; return IconComp ? <IconComp size={16} color={isDark ? colors.textOnDark : colors.text} /> : null; })()}
          onPress={() => navigation.navigate('Notifications')}
          active={unreadCount > 0}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <WalletCreditBadge type="chat" />
          <WalletCreditBadge type="scan" />
        </View>
      </View>

      <View style={styles.header}>
        <AppText variant="display">{greeting}, {user?.name ?? 'Ram'}</AppText>
      </View>

      {/* New Hero Weather Card */}
      <HeroWeatherCard
        temperature={weatherTemperature}
        condition={weatherCondition}
        locationName={liveLocationName}
        humidity={weatherHumidity}
        windSpeed={weatherWind}
        soilMoisture={soilMoisture}
        weatherCode={liveWeather?.current?.weather_code ?? 0}
        advice={autoSuggestions[0]}
        onPress={() =>
          navigation.navigate('WeatherDashboard', {
            latitude: weatherCoordinates.latitude,
            longitude: weatherCoordinates.longitude,
            locationName: liveLocationName,
          })
        }
      />

      {/* Farm Map Directly Below Weather */}
      <ScreenCard style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <AppText variant="label">{t(language, 'farmMap')}</AppText>
          <AppText color={colors.textMuted}>{liveLocationName}</AppText>
        </View>
        <TouchableOpacity 
          style={styles.mapContainer} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FullMap', {
            latitude: weatherCoordinates.latitude,
            longitude: weatherCoordinates.longitude,
            locationName: liveLocationName,
            markers: mockVendors
          })}
        >
          <LeafletMap 
            latitude={weatherCoordinates.latitude} 
            longitude={weatherCoordinates.longitude} 
            isDark={isDark} 
            height={180} 
            zoom={14}
            mapType="satellite"
            markers={mockVendors}
          />
        </TouchableOpacity>
      </ScreenCard>

      {/* AI Assistant */}
     

      {/* Recommendations */}
      <View style={{ marginTop: 24, marginBottom: 8 }}>
        <AppText variant="label" style={{ marginLeft: 4 }}>{t(language, 'recommendedForYou')}</AppText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingVertical: 12, gap: 14 }}
        >
          {recommendedProducts.map((product) => (
            <TouchableOpacity 
              key={product.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <GlassCard style={styles.recommendationCard}>
                <Image 
                  source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }} 
                  style={styles.recommendationImage} 
                />
                <View style={{ padding: 12 }}>
                  <AppText variant="label" numberOfLines={1} style={{ fontSize: 13 }}>{product.name}</AppText>
                  <AppText color={colors.primary} style={{ fontWeight: '700', marginTop: 4 }}>₹{product.price}</AppText>
                  
                  <View style={styles.recommendationFooter}>
                    <AppText variant="caption" color={colors.textMuted}>{product.brand || 'Anaaj'}</AppText>
                    <View style={[styles.ratingTag, { backgroundColor: colors.primary + '15' }]}>
                      {(() => { const Star = IconMap['Star']; return Star ? <Star size={10} color={colors.primary} fill={colors.primary} /> : null; })()}
                      <AppText variant="caption" color={colors.primary} style={{ fontSize: 10, fontWeight: '700' }}>
                        {product.ratings?.average || '4.5'}
                      </AppText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Action Grid - Moved to last above mic */}
      <View style={{ marginBottom: 12, marginTop: 24 }}>
        <AppText variant="label" style={{ marginLeft: 4, marginBottom: 8 }}>{t(language, 'quickServices')}</AppText>
        <QuickActionGrid />
      </View>

      {/* Mic Area */}
      <View style={styles.micArea}>
        <PulseMic />
        <AppText color={colors.textMuted} style={{ marginTop: 18 }}>{t(language, 'voiceFarmingHelp')}</AppText>
        <Pill label={t(language, 'startListening')} active onPress={() => navigation.navigate('Voice')} style={{ marginTop: 18 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 4,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  logoImage: {
    width: 140,
    height: 42,
  },
  logoImageDark: {
    width: 36,
    height: 36,
  },
  header: {
    marginTop: 12,
    marginBottom: 16,
  },
  weatherInsightPanel: {
    marginTop: 22,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.2)',
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  weatherCard: {
    marginTop: 14,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  mapCard: {
    marginTop: 16,
    padding: 0,
    overflow: 'hidden',
    height: 250,
  },
  mapHeader: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    height: 180,
    width: '100%',
  },
  mapView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },
  splitDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(82,183,129,0.35)',
  },
  soilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
  },
  productMeta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  micArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
    paddingTop: 12,
  },
  recommendationCard: {
    width: 180,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 18,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
