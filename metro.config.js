const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Expo's default web config resolves packages via the "browser" export
// condition only. Some deps (e.g. zustand) only guard their Vite-style
// `import.meta.env` check behind the "react-native" condition's CJS build,
// not "browser" — Metro's classic (non-ESM) web bundle can't parse a
// top-level `import.meta`, so the whole bundle fails silently on web.
// Preferring "react-native" first on web matches iOS/Android resolution and
// avoids ESM-only builds that assume a module-aware bundler like Vite.
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: ['react-native', 'browser'],
};

module.exports = withNativeWind(config, { input: './global.css' });
