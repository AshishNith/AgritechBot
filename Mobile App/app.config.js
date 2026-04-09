const { expo } = require('./app.json');

module.exports = () => ({
  ...expo,
  owner: 'ig_ashish.ranjan3',
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
    eas: {
      projectId: 'ed5779df-e2ca-4ec8-aac9-c9449ad5cb0c',
    },
  },
});
