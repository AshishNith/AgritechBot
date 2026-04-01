const { getDefaultConfig } = require('expo/metro-config'); 

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// lucide-react-native resolution fix for Expo 52
config.resolver.unstable_enablePackageExports = true; 

// Resolve issue with missing packages if any
config.resolver.sourceExts.push('mjs');

module.exports = config;