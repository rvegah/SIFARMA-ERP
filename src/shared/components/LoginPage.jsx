// src/shared/components/LoginPage.jsx - CON ErrorDialog mejorado

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
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          {/* Logo y título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
              {/* Logo de cruces médicas */}
              <Box
                sx={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  mr: 2,
                }}
              >
                {/* Cruz naranja */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 20,
                    width: 20,
                    height: 40,
                    bgcolor: farmaColors.primary,
                    borderRadius: '10px',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 10,
                    width: 40,
                    height: 20,
                    bgcolor: farmaColors.primary,
                    borderRadius: '10px',
                  }}
                />
                {/* Cruz azul entrelazada */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 15,
                    left: 25,
                    width: 20,
                    height: 30,
                    bgcolor: farmaColors.secondary,
                    borderRadius: '10px',
                    opacity: 0.9,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 25,
                    left: 15,
                    width: 30,
                    height: 20,
                    bgcolor: farmaColors.secondary,
                    borderRadius: '10px',
                    opacity: 0.9,
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: farmaColors.secondary,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                FARMA{' '}
                <Box component="span" sx={{ color: farmaColors.primary }}>
                  DINÁMICA
                </Box>
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#6c757d',
                fontSize: '1.1rem',
                fontWeight: 400,
              }}
            >
              Sistema Integral de Farmacia
            </Typography>
          </Box>

          {/* Card de login */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  mb: 1,
                  fontWeight: 600,
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
                    background: loading ? '#cccccc' : farmaColors.primary,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: loading ? 'none' : `0 4px 20px ${farmaColors.alpha.primary20}`,
                    '&:hover': {
                      background: loading ? '#cccccc' : farmaColors.primaryDark,
                      boxShadow: loading ? 'none' : `0 6px 30px ${farmaColors.alpha.primary30}`,
                      transform: loading ? 'none' : 'translateY(-1px)',
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
                    color: farmaColors.secondary,
                    fontSize: '0.9rem',
                  }}
                >
                  Farma Dinámica v1.0 • Sistema seguro
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Elementos decorativos */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              width: 100,
              height: 60,
              background: `linear-gradient(135deg, ${farmaColors.alpha.primary10} 0%, transparent 70%)`,
              borderRadius: '20px 0 0 20px',
              zIndex: -1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${farmaColors.alpha.secondary10} 0%, transparent 70%)`,
              borderRadius: '0 20px 20px 0',
              zIndex: -1,
            }}
          />
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