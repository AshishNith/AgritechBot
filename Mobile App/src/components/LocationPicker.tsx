import { IconMap } from './IconMap';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { AppText, GradientButton, ScreenCard } from './ui';
import { theme } from '../constants/theme';
import { useLocationPicker } from '../hooks/useLocationPicker';

interface LocationData {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  address: string;
}

interface LocationPickerProps {
  initialLocation?: Partial<LocationData>;
  onLocationSelect: (location: LocationData) => void;
  onCancel: () => void;
}

export function LocationPicker({
  initialLocation,
  onLocationSelect,
  onCancel,
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const {
    hasPermission,
    permissionDenied,
    selectedLocation,
    locationData,
    address,
    loading,
    error,
    getCurrentLocation,
    debouncedReverseGeocode,
    setSelectedLocation,
  } = useLocationPicker(initialLocation);

  // Get current location on mount if no initial location
  useEffect(() => {
    if (!initialLocation?.latitude && hasPermission) {
      getCurrentLocation();
    }
  }, [hasPermission, initialLocation]);

  // Sync map camera with selectedLocation
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.animateToRegion(selectedLocation, 500);
    }
  }, [selectedLocation]);

  const handleConfirm = () => {
    if (locationData) {
      onLocationSelect(locationData);
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    setSelectedLocation(region);
    debouncedReverseGeocode(region.latitude, region.longitude);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">Select Location</AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
            Move map to select your farm location
          </AppText>
        </View>
        <Pressable onPress={onCancel} style={styles.closeButton}>
          {(() => { const IconComp = IconMap['X']; return IconComp ? <IconComp size={24} color={theme.colors.text} /> : null; })()}
        </Pressable>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={selectedLocation}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={hasPermission}
          showsMyLocationButton={false}
          provider="google"
        />
        
        {/* Fixed Center Marker */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.markerFixed}>
            {(() => { const IconComp = IconMap['MapPin']; return IconComp ? <IconComp size={42} color={theme.colors.primary} /> : null; })()}
            <View style={styles.markerShadow} />
          </View>
        </View>

        {/* Floating Controls */}
        <View style={styles.mapControls}>
          <Pressable 
            onPress={() => getCurrentLocation()} 
            style={styles.controlButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              (() => { const IconComp = IconMap['Locate']; return IconComp ? <IconComp size={22} color={theme.colors.primary} /> : null; })()
            )}
          </Pressable>
        </View>

        {/* Permission Warning */}
        {permissionDenied && (
          <View style={styles.permissionDenied}>
            <ScreenCard style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {(() => { const IconComp = IconMap['AlertTriangle']; return IconComp ? <IconComp size={20} color={theme.colors.danger} /> : null; })()}
                <AppText color={theme.colors.danger} variant="label">Permission Denied</AppText>
              </View>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                Please enable location permissions in settings.
              </AppText>
            </ScreenCard>
          </View>
        )}
      </View>

      {/* Address Panel */}
      <View style={styles.addressContainer}>
        <ScreenCard style={styles.addressCard}>
          <View style={styles.addressHeader}>
            {(() => { const IconComp = IconMap['MapPin']; return IconComp ? <IconComp size={18} color={theme.colors.primary} /> : null; })()}
            <AppText variant="label" style={{ marginLeft: 8 }}>
              Point of Interest
            </AppText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText color={theme.colors.textMuted} style={{ marginLeft: 8 }}>
                Fetching address...
              </AppText>
            </View>
          ) : (
            <>
              {error ? (
                <AppText color={theme.colors.danger} style={{ marginTop: 8 }}>
                  {error}
                </AppText>
              ) : (
                <AppText style={{ marginTop: 8, fontSize: 13 }} numberOfLines={2}>
                  {address}
                </AppText>
              )}

              {locationData?.state && (
                <View style={styles.locationDetails}>
                  <View style={styles.tag}>
                    <AppText variant="caption" color={theme.colors.primaryDark}>
                      {locationData.district || 'District'}
                    </AppText>
                  </View>
                  <View style={styles.tag}>
                    <AppText variant="caption" color={theme.colors.primaryDark}>
                      {locationData.state}
                    </AppText>
                  </View>
                </View>
              )}
            </>
          )}
        </ScreenCard>
      </View>

      {/* Call to Action */}
      <View style={styles.actions}>
        <GradientButton
          label="Cancel"
          secondary
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <GradientButton
          label={loading ? 'Processing...' : 'Confirm Farm Location'}
          onPress={handleConfirm}
          disabled={loading || !locationData}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceMuted,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#eee',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerShadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -2,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  permissionDenied: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  addressContainer: {
    paddingHorizontal: 16,
    marginTop: -32, // Overlap the map
    zIndex: 10,
  },
  addressCard: {
    padding: 16,
    borderRadius: 20,
    ...theme.shadow.glow,
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.2)',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: 'rgba(82,183,129,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
  },
});
