// src/shared/components/LoginPage.jsx - Diseño mejorado y profesional

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
//import NetworkValidationService from '../../services/networkValidation';
import ErrorDialog from '../../components/ErrorDialog';
import { farmaColors } from '../../app/theme';
import { useAuth } from '../../context/AuthContext';
import logoFarmaDinamica from '../../assets/logo_farma_dinamica.jpg';

function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para el ErrorDialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    errorType: 'default',
    autoClose: false,
  });

  const { login } = useAuth();

  /**
   * Función para analizar el error y configurar el dialog
   */
  const handleError = (error) => {
    let config = {
      title: 'Error',
      message: '',
      errorType: 'default',
      autoClose: false,
    };

    // Analizar el mensaje de error
    const errorMsg = error.message?.toLowerCase() || '';
    
    if (errorMsg.includes('contraseña') || errorMsg.includes('password') || error.code === 401) {
      config = {
        title: 'Contraseña Incorrecta',
        message: 'La contraseña que ingresaste no es correcta. Por favor, verifica e intenta nuevamente.',
        errorType: 'password',
        autoClose: false,
      };
    } else if (errorMsg.includes('usuario') || errorMsg.includes('no encontrado') || errorMsg.includes('not found')) {
      config = {
        title: 'Usuario No Encontrado',
        message: 'El usuario que ingresaste no existe en el sistema. Verifica que esté escrito correctamente.',
        errorType: 'user',
        autoClose: false,
      };
    } else if (errorMsg.includes('bloqueado') || errorMsg.includes('suspendido') || error.code === 403) {
      config = {
        title: 'Usuario Bloqueado',
        message: 'Tu usuario ha sido bloqueado. Por favor, contacta al administrador del sistema.',
        errorType: 'user',
        autoClose: false,
      };
    } else if (errorMsg.includes('conexión') || errorMsg.includes('conectar') || error.code === 0) {
      config = {
        title: 'Sin Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
        errorType: 'connection',
        autoClose: false,
      };
    } else if (errorMsg.includes('servidor') || error.code === 500) {
      config = {
        title: 'Error del Servidor',
        message: 'El servidor está experimentando problemas. Por favor, intenta nuevamente en unos momentos.',
        errorType: 'server',
        autoClose: false,
      };
    } else if (error.code === 404) {
      config = {
        title: 'Servicio No Disponible',
        message: 'El servicio de autenticación no está disponible. Contacta al administrador.',
        errorType: 'server',
        autoClose: false,
      };
    } else {
      // Error genérico
      config = {
        title: 'Error al Iniciar Sesión',
        message: error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        errorType: 'default',
        autoClose: false,
      };
    }

    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Detectar IP local
      //console.log('🔍 Detectando IP local...');
      /*let localIP;
      
      try {
        localIP = await NetworkValidationService.getLocalIP();
        console.log('✅ IP local detectada:', localIP);
      } catch (ipError) {
        console.warn('⚠️ No se pudo detectar IP, usando fallback');
        localIP = '192.168.0.1';
      }*/

      const localIP = "127.0.0.1"; // Fallback para desarrollo
      // 2. Intentar login
      console.log('🔐 Intentando login con API...');
      const loginResult = await login({
        nombreUsuario: usuario,
        password: contrasena,
        direccion_IP: localIP,
      });

      if (loginResult.success) {
        // 3. Login exitoso - mostrar mensaje de éxito
        setDialogConfig({
          title: '¡Bienvenido!',
          message: `Inicio de sesión exitoso.\nIP detectada: ${localIP}`,
          errorType: 'success',
          autoClose: true,
        });
        setDialogOpen(true);
        
        // El usuario será redirigido automáticamente
      } else {
        throw new Error(loginResult.message);
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: farmaColors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos sobre fondo naranja */}
        <Box sx={{
          position: 'absolute', top: -120, right: -100,
          width: 420, height: 420, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)', zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.08)', zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute', bottom: 60, right: 40,
          width: 180, height: 180, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)', zIndex: 0,
        }} />

        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              border: 'none',
            }}
          >
            {/* Línea azul superior — detalle minimalista */}
            <Box sx={{ height: 4, bgcolor: farmaColors.secondary }} />

            <CardContent sx={{ p: 4 }}>
              {/* Logo real de la empresa */}
              <Box sx={{ mb: 3 }}>
                <Box
                  component="img"
                  src={logoFarmaDinamica}
                  alt="FARMA DINÁMICA"
                  sx={{
                    height: 44,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 0.5 }}>
                Bienvenido
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 3 }}>
                Ingresa tus credenciales para acceder
              </Typography>

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={loading}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: loading ? '#f5f5f5' : '#fafafa',
                      '&.Mui-focused fieldset': {
                        borderColor: farmaColors.primary,
                        borderWidth: '2px',
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: farmaColors.primary },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: farmaColors.secondary, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={loading}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: loading ? '#f5f5f5' : '#fafafa',
                      '&.Mui-focused fieldset': {
                        borderColor: farmaColors.primary,
                        borderWidth: '2px',
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: farmaColors.primary },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: farmaColors.secondary, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                          sx={{
                            color: farmaColors.secondary,
                            '&:hover': { bgcolor: farmaColors.alpha.secondary10 },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    bgcolor: loading ? '#ccc' : farmaColors.secondary,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: farmaColors.secondaryDark,
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      bgcolor: '#ccc',
                      color: 'rgba(255,255,255,0.8)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Validando acceso...</span>
                    </Box>
                  ) : (
                    'Ingresar al sistema'
                  )}
                </Button>
              </Box>

              {/* Footer */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%', bgcolor: '#27ae60',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
                }} />
                <Typography variant="caption" sx={{ color: '#bbb', fontSize: '0.78rem' }}>
                  Farma Dinámica v1.0 · Sistema seguro
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <ErrorDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        title={dialogConfig.title}
        message={dialogConfig.message}
        errorType={dialogConfig.errorType}
        autoClose={dialogConfig.autoClose}
        autoCloseDelay={2000}
      />
    </>
  );;
}

export default LoginPage;