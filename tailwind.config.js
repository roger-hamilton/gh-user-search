module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      animation: ['hover', 'focus', 'group-hover'],
      scale: ['hover', 'focus', 'active', 'group-hover'],
      boxShadow: ['hover', 'group-hover', 'focus'],
      zIndex: ['hover', 'active'],
      borderWidth: ['hover', 'focus'],
      height: ['hover', 'focus'],
      ringWidth: ['hover', 'focus', 'focus-within']
    },
  },
  plugins: [],
}
