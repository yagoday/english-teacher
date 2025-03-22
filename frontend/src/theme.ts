import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      panda: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
      },
      vader: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand.panda',
      },
    },
  },
}); 