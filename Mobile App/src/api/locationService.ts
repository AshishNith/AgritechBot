import * as Location from 'expo-location';

export interface LocationResult {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
}

export const getCurrentLocation = async (): Promise<LocationResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const { latitude, longitude } = position.coords;

    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const place = reverseGeocode[0];
    if (!place) {
      throw new Error('Could not resolve address details');
    }

    // Mapping for Indian context (District is often subregion or city)
    const city = place.city || place.subregion || place.district || 'Unknown City';
    const state = place.region || 'Unknown State';
    const country = place.country || 'India';
    
    return {
      city,
      state,
      country,
      latitude,
      longitude,
      address: `${city}, ${state}, ${country}`,
    };
  } catch (error) {
    console.error('[LocationService] Error fetching location:', error);
    throw error;
  }
};
