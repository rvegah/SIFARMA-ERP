import { createTheme } from '@mui/material/styles'

// COLORES CORPORATIVOS FARMA DINÁMICA
const corporateColors = {
  primary: '#CC6C06',        // Naranja corporativo
  primaryLight: '#E6854D',   // Naranja más claro
  primaryDark: '#A55605',    // Naranja más oscuro
  secondary: '#05305A',      // Azul oscuro corporativo
  secondaryLight: '#2B5A87', // Azul más claro
  secondaryDark: '#032240',   // Azul más oscuro
  secondaryWhite: '#FFFFFF'   // Azul más oscuro
}

// Tema actualizado con colores corporativos Farma Dinámica
const theme = createTheme({
  palette: {
    primary: {
      main: corporateColors.primary,     // #CC6C06 (Naranja)
      light: corporateColors.primaryLight,
      dark: corporateColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: corporateColors.secondary,   // #05305A (Azul oscuro)
      light: corporateColors.secondaryLight,
      dark: corporateColors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50', // Verde para botones de éxito
    },
    warning: {
      main: corporateColors.primary, // Usando naranja corporativo
    },
    error: {
      main: '#F44336', // Rojo para errores
    },
    info: {
      main: corporateColors.secondary, // Usando azul corporativo
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

// Exportar colores para uso directo en componentes
export const farmaColors = {
  // Gradientes corporativos
  gradients: {
    primary: `linear-gradient(135deg, ${corporateColors.primary} 0%, ${corporateColors.primaryLight} 100%)`,
    secondary: `linear-gradient(135deg, ${corporateColors.secondary} 0%, ${corporateColors.secondaryLight} 100%)`,
    corporate: `linear-gradient(135deg, ${corporateColors.primary} 0%, ${corporateColors.secondary} 100%)`,
    sidebar: `linear-gradient(180deg, ${corporateColors.secondaryDark} 0%, ${corporateColors.secondary} 100%)`
  },
  
  // Colores sólidos
  primary: corporateColors.primary,
  primaryLight: corporateColors.primaryLight,
  primaryDark: corporateColors.primaryDark,
  secondary: corporateColors.secondary,
  secondaryLight: corporateColors.secondaryLight,
  secondaryDark: corporateColors.secondaryDark,
  secondaryWhite: corporateColors.secondaryWhite,

  
  // Versiones con transparencia
  alpha: {
    primary10: `${corporateColors.primary}1A`,     // 10% opacity
    primary20: `${corporateColors.primary}33`,     // 20% opacity
    primary30: `${corporateColors.primary}4D`,     // 30% opacity
    secondary10: `${corporateColors.secondary}1A`,  // 10% opacity
    secondary20: `${corporateColors.secondary}33`,  // 20% opacity
    secondary30: `${corporateColors.secondary}4D`   // 30% opacity
  }
}

export default theme