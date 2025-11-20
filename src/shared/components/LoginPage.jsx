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
import NetworkValidationService from '../../services/networkValidation';
import ErrorDialog from '../../components/ErrorDialog';
import { farmaColors } from '../../app/theme';
import { useAuth } from '../../context/AuthContext';

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
      console.log('🔍 Detectando IP local...');
      let localIP;
      
      try {
        localIP = await NetworkValidationService.getLocalIP();
        console.log('✅ IP local detectada:', localIP);
      } catch (ipError) {
        console.warn('⚠️ No se pudo detectar IP, usando fallback');
        localIP = '192.168.0.1';
      }

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
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Elementos decorativos de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${farmaColors.alpha.primary10} 0%, transparent 70%)`,
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${farmaColors.alpha.secondary10} 0%, transparent 70%)`,
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Card principal integrado */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: 'none',
              overflow: 'hidden',
              background: 'white',
            }}
          >
            {/* Header con logo y gradiente */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${farmaColors.secondary} 0%, ${farmaColors.primary} 100%)`,
                padding: 4,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Patrón decorativo */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 2px, transparent 0)`,
                  backgroundSize: '40px 40px',
                  opacity: 0.3,
                }}
              />

              {/* Logo */}
              <Box
                sx={{
                  display: 'inline-block',
                  background: 'white',
                  padding: '16px 32px',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  mb: 2,
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src="/logo_farma_dinamica.jpg"
                  alt="FARMA DINÁMICA"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: 60,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px',
                }}
              >
                Sistema Integral de Farmacia
              </Typography>
            </Box>

            {/* Formulario de login */}
            <CardContent sx={{ p: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  mb: 1,
                  fontWeight: 700,
                  color: farmaColors.secondary,
                }}
              >
                Iniciar Sesión
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  color: '#6c757d',
                }}
              >
                Ingresa tus credenciales para acceder al sistema
              </Typography>

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={loading}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: loading ? '#f5f5f5' : '#f8f9fa',
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: farmaColors.primary,
                          borderWidth: '2px',
                        },
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: farmaColors.primary,
                    },
                  }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person
                          sx={{ color: farmaColors.secondary, fontSize: '1.2rem' }}
                        />
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
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: loading ? '#f5f5f5' : '#f8f9fa',
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: farmaColors.primary,
                          borderWidth: '2px',
                        },
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: farmaColors.primary,
                    },
                  }}
                  required
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
                            '&:hover': {
                              bgcolor: farmaColors.alpha.secondary10,
                            },
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
                    py: 2.5,
                    background: loading
                      ? '#cccccc'
                      : `linear-gradient(135deg, ${farmaColors.primary} 0%, ${farmaColors.primaryDark} 100%)`,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: loading ? 'none' : `0 8px 24px ${farmaColors.alpha.primary30}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: loading
                        ? '#cccccc'
                        : `linear-gradient(135deg, ${farmaColors.primaryDark} 0%, ${farmaColors.primary} 100%)`,
                      boxShadow: loading ? 'none' : `0 12px 32px ${farmaColors.alpha.primary40}`,
                      transform: loading ? 'none' : 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: farmaColors.alpha.primary20,
                      color: 'rgba(255,255,255,0.8)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                      <span>Validando acceso...</span>
                    </Box>
                  ) : (
                    'Ingresar al Sistema'
                  )}
                </Button>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#95a5a6',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#27ae60',
                      display: 'inline-block',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  Farma Dinámica v1.0 • Sistema seguro
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Dialog de errores/éxito */}
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
  );
}

export default LoginPage;