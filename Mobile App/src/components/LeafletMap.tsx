import { StyleSheet, View, DimensionValue } from 'react-native';
import { WebView } from 'react-native-webview';

export type MapType = 'standard' | 'satellite' | 'terrain' | 'hybrid';

export interface MapMarker {
  latitude: number;
  longitude: number;
  title: string;
  type?: 'farm' | 'vendor';
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  isDark: boolean;
  height?: DimensionValue;
  zoom?: number;
  mapType?: MapType;
  markers?: MapMarker[];
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ 
  latitude, 
  longitude, 
  isDark, 
  height = '100%',
  zoom = 14,
  mapType = 'standard',
  markers = []
}) => {
  const getTileUrl = () => {
    switch (mapType) {
      case 'satellite':
      case 'hybrid':
        return 'https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'standard':
      default:
        return isDark 
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png' 
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png';
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; background-color: ${isDark ? '#1a1a1a' : '#fff'}; height: 100vh; overflow: hidden; }
        #map { height: 100vh; width: 100vw; background: transparent; }
        .leaflet-container { background: ${isDark ? '#1a1a1a' : '#fff'} !important; }
        /* Custom Marker colors */
        .marker-farm { filter: hue-rotate(75deg) brightness(0.9) saturate(1.2); z-index: 1000 !important; }
        .marker-vendor { filter: hue-rotate(180deg) brightness(0.9); }
        .leaflet-control-attribution { display: none !important; }
        /* Better tile rendering for high-res screens */
        .leaflet-tile { image-rendering: -webkit-optimize-contrast; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
      <script>
        var map = L.map('map', { 
          zoomControl: false, 
          attributionControl: false,
        }).setView([${latitude}, ${longitude}], ${zoom});
        
        L.tileLayer('${getTileUrl()}', {
          maxZoom: 20,
          subdomains: 'abc'
        }).addTo(map);
        
        // Add main farm marker if not in markers list
        L.marker([${latitude}, ${longitude}], {
          icon: L.divIcon({
            className: 'leaflet-marker-icon marker-farm',
            html: '<img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style="width:25px;height:41px">',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
          })
        }).addTo(map).bindPopup("<b>Farm Location</b>");
        
        // Add all other markers
        const otherMarkers = ${JSON.stringify(markers)};
        otherMarkers.forEach(m => {
          L.marker([m.latitude, m.longitude], {
            icon: L.divIcon({
              className: 'leaflet-marker-icon ' + (m.type === 'farm' ? 'marker-farm' : 'marker-vendor'),
              html: '<img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style="width:25px;height:41px">',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            })
          }).addTo(map).bindPopup("<b>" + m.title + "</b><br>" + (m.type || 'Vendor'));
        });
        
        window.addEventListener('resize', function() {
          map.invalidateSize();
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{
          html,
          baseUrl: 'https://anaajai.com'
        }}
        style={styles.webview}
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
