const { expo } = require('./app.json');

module.exports = () => ({
  ...expo,
  owner: 'ig_ashish.ranjan4',
  scheme: 'anaajai',
  android: {
    ...expo.android,
    config: {
      ...(expo.android?.config || {}),
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || expo.android?.config?.googleMaps?.apiKey || '',
      },
    },
  },
  extra: {
    ...(expo.extra || {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || expo.extra?.apiBaseUrl || '',
    ...(expo.extra?.eas ? { eas: expo.extra.eas } : {}),
  },
});
