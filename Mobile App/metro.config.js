const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// lucide-react-native resolution fix for certain Metro versions in Expo 52
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
