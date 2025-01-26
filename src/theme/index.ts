import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
}

const styles = {
  global: {
    'html, body': {
      bg: 'white',
      color: 'gray.800',
      _dark: {
        bg: 'gray.800',
        color: 'whiteAlpha.900',
      },
    },
  },
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Container: {
    baseStyle: {
      maxW: 'container.xl',
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  styles,
  components,
})

// Default export
export default theme
