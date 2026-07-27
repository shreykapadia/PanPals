const { colors, rounded, spacing } = require('./theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: colors,
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        'page-padding-x': '16px',
        'page-padding-y': '16px',
        gutter: '16px',
        'header-height': '56px',
        'footer-height': '80px',
      },
      letterSpacing: {
        // DESIGN-TOKENS §2 specifies 0.25px on button labels; Tailwind's
        // default `tracking-wide` (0.025em) lands at ~0.35px at 14px.
        wide: '0.25px',
      },
      fontFamily: {
        satoshi: ['Satoshi-Regular', 'sans-serif'],
        'satoshi-medium': ['Satoshi-Medium', 'sans-serif'],
        'satoshi-bold': ['Satoshi-Bold', 'sans-serif'],
        caslon: ['LibreCaslonText-Regular', 'serif'],
        'caslon-bold': ['LibreCaslonText-Bold', 'serif'],
      },
    },
  },
  plugins: [],
};
module.exports.colors = colors;
module.exports.rounded = rounded;
module.exports.spacing = spacing;
