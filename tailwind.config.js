/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown': {
          'darkest': '#2C1810',
          'dark': '#4A2C2A',
          'medium': '#8B4513',
          'light': '#A67C52',
          'lightest': '#D2B48C',
        },
        'cream': {
          'darkest': '#F5E6D3',
          'dark': '#F8EBD8',
          'medium': '#FAF0E1',
          'light': '#FDF5E6',
          'lightest': '#FFF8F0',
        },
        'status': {
          'red': '#DC2626',
          'green': '#059669',
          'yellow': '#D97706',
          'blue': '#2563EB',
        },
        // Orange Family
        'orange-light': '#F2C094',
        'orange-medium': '#E8A76F',
        'orange-dark': '#D48C4A',
        'orange-burnt': '#BF7E45',
        
        // Blue Family
        'blue-faded': '#A5B9C9',
        'blue-muted': '#7D96A9',
        'blue-vintage': '#5D7A8C',
        
        // Utility Colors
        'background': '#FFFEF7',
        'black': '#2A2A2A',
        
        // Gray Scale
        'gray-100': '#F2F0E6',
        'gray-200': '#D9D6C9',
        'gray-300': '#BFBCB2',
        'gray-400': '#8C8A83',
        'gray-500': '#5F5E59',
      },
      boxShadow: {
        'vintage': '0 4px 6px -1px rgba(44, 24, 16, 0.1), 0 2px 4px -1px rgba(44, 24, 16, 0.06)',
      },
      borderWidth: {
        'vintage': '2px',
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
        '.vintage-card': {
          '@apply bg-cream-lightest rounded-lg shadow-vintage p-8 border border-brown-lightest/20': {},
        },
        '.vintage-input': {
          '@apply bg-cream-light border border-brown-lightest/30 rounded-md px-4 py-2 text-brown-darkest placeholder-brown-light/50 focus:outline-none focus:ring-2 focus:ring-brown-medium/20 focus:border-brown-medium': {},
        },
        '.vintage-button': {
          '@apply bg-brown-medium text-cream-lightest px-6 py-2 rounded-md font-medium hover:bg-brown-dark focus:outline-none focus:ring-2 focus:ring-brown-medium/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200': {},
        },
        '.vintage-select': {
          '@apply bg-cream-light border border-brown-lightest/30 rounded-md px-4 py-2 text-brown-darkest focus:outline-none focus:ring-2 focus:ring-brown-medium/20 focus:border-brown-medium': {},
        },
        '.vintage-table': {
          '@apply min-w-full divide-y divide-brown-lightest/20': {},
          'thead': {
            '@apply bg-cream-dark': {},
            'th': {
              '@apply px-6 py-3 text-left text-xs font-medium text-brown-darkest uppercase tracking-wider': {},
            },
          },
          'tbody': {
            '@apply bg-cream-lightest divide-y divide-brown-lightest/20': {},
            'td': {
              '@apply px-6 py-4 whitespace-nowrap text-sm text-brown-dark': {},
            },
          },
        },
      });
    },
  ],
} 