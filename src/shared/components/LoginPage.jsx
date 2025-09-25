// src/shared/components/LoginPage.jsx
import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Container,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Business
} from '@mui/icons-material'
import NetworkValidationService from '../../services/networkValidation'
import DeviceValidationModal from '../../components/DeviceValidationModal'
import { validateCredentials } from '../../modules/user-management/constants/userConstants'

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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Container maxWidth="sm">
          <Card 
            sx={{ 
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
                p: 4,
                textAlign: 'center',
                color: 'white'
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Business sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                SIFARMA
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Sistema Integral de Farmacia
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ textAlign: 'center', mb: 1, fontWeight: 600, color: '#333' }}>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: '#666' }}>
                Ingresa tus credenciales para continuar
              </Typography>

              <Box component="form" onSubmit={handleLogin}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
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
                  sx={{ mb: 4 }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
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
                    py: 2,
                    background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
                    boxShadow: '0 4px 20px rgba(74,95,255,0.3)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 6px 30px rgba(74,95,255,0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? 'Validando dispositivo...' : 'Ingresar al Sistema'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  SIFARMA v1.0 - Sistema seguro
                </Typography>
              </Box>
            </CardContent>
          </Card>
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