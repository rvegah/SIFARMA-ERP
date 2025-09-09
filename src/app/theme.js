import { createTheme } from '@mui/material/styles'

// Tema basado en los colores del sistema actual (azul farmacia)
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A5FFF', // Azul principal del sistema actual
      light: '#7B8EFF',
      dark: '#2A3FDF',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BCD4', // Cian/turquesa para acentos
      light: '#4DD0E7',
      dark: '#0097A7',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50', // Verde para botones de éxito
    },
    warning: {
      main: '#FF9800', // Naranja para alertas
    },
    error: {
      main: '#F44336', // Rojo para errores
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#333',
    },
    h6: {
      fontWeight: 500,
      color: '#555',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme