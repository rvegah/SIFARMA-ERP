// src/shared/components/LoginPage.jsx - Rediseño profesional con identidad Farma Dinámica
import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material'
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  LocalPharmacy
} from '@mui/icons-material'
import NetworkValidationService from '../../services/networkValidation'
import DeviceValidationModal from '../../components/DeviceValidationModal'
import { validateCredentials } from '../../modules/user-management/constants/userConstants'
import { farmaColors } from '/src/app/theme' // Importar colores corporativos

function LoginPage({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Estados para validación de dispositivo
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [pendingLoginData, setPendingLoginData] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Simular delay de autenticación
    setTimeout(async () => {
      // 1. Validar credenciales usando la función helper
      const userCredentials = validateCredentials(usuario, contrasena);
      
      if (!userCredentials) {
        setError('Credenciales incorrectas')
        setLoading(false)
        return
      }

      // 2. Si las credenciales son correctas, validar dispositivo
      try {
        console.log('🔍 Validando dispositivo para:', userCredentials.nombreEquipo);
        const deviceValidation = await NetworkValidationService.validateDeviceIP(userCredentials.nombreEquipo);
        
        console.log('📊 Resultado validación:', deviceValidation);
        
        // Guardar datos del login pendiente
        setPendingLoginData({ usuario, contrasena });
        setValidationResult(deviceValidation);
        setShowValidationModal(true);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error en validación de dispositivo:', error);
        setError('Error validando dispositivo: ' + error.message);
        setLoading(false);
      }
    }, 800)
  }

  const handleValidationContinue = () => {
    // Continuar con el login normal
    if (pendingLoginData) {
      const success = onLogin(pendingLoginData.usuario, pendingLoginData.contrasena);
      if (success) {
        setShowValidationModal(false);
        setPendingLoginData(null);
        setValidationResult(null);
      } else {
        setError('Error completando el login');
        setShowValidationModal(false);
      }
    }
  }

  const handleValidationCancel = () => {
    // Volver al login sin proceder
    setShowValidationModal(false);
    setPendingLoginData(null);
    setValidationResult(null);
    setLoading(false);
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Logo corporativo */}
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                mb: 2
              }}
            >
              {/* Icono de cruz médica inspirado en el logo */}
              <Box
                sx={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  mr: 2
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
                    borderRadius: '10px'
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
                    borderRadius: '10px'
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
                    opacity: 0.9
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
                    opacity: 0.9
                  }}
                />
              </Box>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: farmaColors.secondary,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
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
                fontWeight: 400
              }}
            >
              Sistema Integral de Farmacia
            </Typography>
          </Box>

          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography variant="h5" sx={{ 
                textAlign: 'center', 
                mb: 1, 
                fontWeight: 600, 
                color: farmaColors.secondary
              }}>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" sx={{ 
                textAlign: 'center', 
                mb: 4, 
                color: '#6c757d'
              }}>
                Ingresa tus credenciales para acceder al sistema
              </Typography>

              <Box component="form" onSubmit={handleLogin}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      bgcolor: '#fff5f5',
                      border: '1px solid #fed7d7',
                      '& .MuiAlert-icon': {
                        color: '#e53e3e'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f8f9fa',
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: farmaColors.primary,
                          borderWidth: '2px'
                        }
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: farmaColors.primary
                    }
                  }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: farmaColors.secondary, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f8f9fa',
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: farmaColors.primary,
                          borderWidth: '2px'
                        }
                      },
                      '&:hover:not(.Mui-focused) fieldset': {
                        borderColor: farmaColors.primaryLight,
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: farmaColors.primary
                    }
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
                          sx={{
                            color: farmaColors.secondary,
                            '&:hover': {
                              bgcolor: farmaColors.alpha.secondary10
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
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
                    background: farmaColors.primary,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: `0 4px 20px ${farmaColors.alpha.primary20}`,
                    '&:hover': {
                      background: farmaColors.primaryDark,
                      boxShadow: `0 6px 30px ${farmaColors.alpha.primary30}`,
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: farmaColors.alpha.primary20,
                      color: 'rgba(255,255,255,0.8)',
                      transform: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Validando dispositivo...' : 'Ingresar al Sistema'}
                </Button>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ 
                  color: farmaColors.secondary,
                  fontSize: '0.9rem'
                }}>
                  Farma Dinámica v1.0 • Sistema seguro
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Elementos decorativos minimalistas */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              width: 100,
              height: 60,
              background: `linear-gradient(135deg, ${farmaColors.alpha.primary10} 0%, transparent 70%)`,
              borderRadius: '20px 0 0 20px',
              zIndex: -1
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
              zIndex: -1
            }}
          />
        </Container>
      </Box>

      {/* Modal de validación de dispositivo */}
      <DeviceValidationModal
        open={showValidationModal}
        validationResult={validationResult}
        onContinue={handleValidationContinue}
        onCancel={handleValidationCancel}
      />
    </>
  )
}

export default LoginPage