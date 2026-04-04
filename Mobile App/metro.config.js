const { getDefaultConfig } = require('expo/metro-config'); 

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// fixes for lucide-react-native and date-fns v4
config.resolver.unstable_enablePackageExports = true; 
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;