import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Layers } from 'lucide-react-native';
import { AppText } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { LeafletMap, MapType } from '../components/LeafletMap';

type FullMapScreenRouteProp = RouteProp<RootStackParamList, 'FullMap'>;

export function FullMapScreen() {
  const route = useRoute<FullMapScreenRouteProp>();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { latitude, longitude, locationName, markers } = route.params;
  const [mapType, setMapType] = React.useState<MapType>('terrain');

  const cycleMapType = () => {
    const types: MapType[] = ['standard', 'satellite', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <LeafletMap 
          latitude={latitude} 
          longitude={longitude} 
          isDark={isDark} 
          height="100%" 
          zoom={15} 
          mapType={mapType}
          markers={markers}
        />
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#444' }]} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={[styles.titleContainer, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#444' }]}>
            <AppText variant="label" style={styles.title}>{locationName}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Farm Location (${mapType})</AppText>
          </View>
        </View>
      </SafeAreaView>

      {/* Floating Layer Switcher */}
      <TouchableOpacity 
        style={[styles.layerButton, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#444' }]} 
        onPress={cycleMapType}
      >
        <Layers size={24} color={mapType === 'satellite' ? colors.primary : colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  headerSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  layerButton: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
