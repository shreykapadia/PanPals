module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|nativewind|react-native-svg|lucide-react-native)',
  ],
  transform: {
    ...require('jest-expo/jest-preset.js').transform,
    // lucide-react-native@1.x ships an ESM-only build for the "react-native"
    // export condition; jest-expo's default transform only matches .[jt]sx?,
    // so its .mjs files need their own babel-jest entry to parse.
    '\\.mjs$': 'babel-jest',
  },
};
