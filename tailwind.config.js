/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          900: '#333333',
          100: '#F5F5F5',
        },
        background: '#FFFFFF',
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      borderWidth: {
        'brand': '2px',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.brand-card': {
          '@apply bg-white rounded-lg shadow-brand p-8 border border-gray-100': {},
        },
        '.brand-input': {
          '@apply bg-gray-100 border border-gray-100 rounded-md px-4 py-2 text-black placeholder-gray-900/50 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900': {},
        },
        '.brand-button': {
          '@apply bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200': {},
        },
        '.brand-select': {
          '@apply bg-gray-100 border border-gray-100 rounded-md px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900': {},
        },
        '.brand-table': {
          '@apply min-w-full divide-y divide-gray-100': {},
          'thead': {
            '@apply bg-gray-100': {},
            'th': {
              '@apply px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider': {},
            },
          },
          'tbody': {
            '@apply bg-white divide-y divide-gray-100': {},
            'td': {
              '@apply px-6 py-4 whitespace-nowrap text-sm text-black': {},
            },
          },
        },
      });
    },
  ],
} 