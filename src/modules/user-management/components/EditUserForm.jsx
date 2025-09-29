// EditUserForm.jsx - Formulario de edición con colores corporativos Farma Dinámica

import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Alert
} from '@mui/material';
import {
  Save,
  Cancel,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useUsers } from '../context/UserContext'; 
import { sucursales, roles, deviceIPMapping } from '../constants/userConstants';
import { farmaColors } from '/src/app/theme'; // Importar colores corporativos

const EditUserForm = ({ onCancel }) => {
  const {
    // Estados del formulario
    userForm,
    showPassword,
    selectedUser,
    
    // Funciones
    handleFormChange,
    handleUpdateUser,
    clearForm,
    setShowPassword
  } = useUsers();

  // Filtrar equipos según la sucursal seleccionada
  const getEquiposPorSucursal = (sucursal) => {
    if (!sucursal) return [];
    
    return Object.keys(deviceIPMapping).filter(equipo => {
      if (sucursal === 'BRASIL') return equipo.includes('BRASIL');
      if (sucursal === 'SAN MARTIN') return equipo.includes('SANMARTIN');
      if (sucursal === 'URUGUAY') return equipo.includes('URUGUAY');
      if (sucursal === 'TIQUIPAYA') return equipo.includes('TIQUIPAYA');
      return false;
    });
  };

  const equiposDisponibles = getEquiposPorSucursal(userForm.sucursal);

  const handleSave = () => {
    const success = handleUpdateUser();
    if (success) {
      clearForm();
      onCancel(); // Volver a la lista
    }
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

  // Debug: verificar datos disponibles
  console.log('EditUserForm - selectedUser:', selectedUser);
  console.log('EditUserForm - userForm:', userForm);

  // Si no hay usuario seleccionado pero tenemos datos en el formulario, usar esos datos
  const userToEdit = selectedUser || {
    nombreCompleto: userForm.nombreCompleto ? `${userForm.nombreCompleto} ${userForm.apellidos}` : 'Usuario',
    fechaCreacion: 'N/A',
    ultimoAcceso: 'N/A',
    estado: 'N/A'
  };

  // Si no tenemos ni usuario ni datos del formulario, mostrar loading
  if (!selectedUser && (!userForm.usuario && !userForm.nombreCompleto && !userForm.email)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Cargando datos del usuario...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado con colores corporativos para edición */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: `linear-gradient(135deg, ${farmaColors.alpha.primary10} 0%, ${farmaColors.alpha.primary20} 100%)`,
        borderLeft: `4px solid ${farmaColors.primary}` // Borde naranja corporativo
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: farmaColors.secondary, // Azul corporativo para el título
          mb: 1 
        }}>
          EDITAR USUARIO: {userToEdit.nombreCompleto}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modificar información del usuario existente
        </Typography>
      </Paper>

      <Card sx={{ p: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={3}>
          {/* 1. Sucursal */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, // Naranja corporativo
              mb: 1, 
              fontWeight: 600 
            }}>
              1.- Sucursal:
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>SELECCIONAR SUCURSAL</InputLabel>
              <Select
                value={userForm.sucursal}
                onChange={handleFormChange('sucursal')}
                label="SELECCIONAR SUCURSAL"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primaryLight,
                  }
                }}
              >
                {sucursales.map((sucursal) => (
                  <MenuItem 
                    key={sucursal} 
                    value={sucursal}
                    sx={{
                      '&:hover': {
                        bgcolor: farmaColors.alpha.primary10
                      },
                      '&.Mui-selected': {
                        bgcolor: farmaColors.alpha.primary20,
                        '&:hover': {
                          bgcolor: farmaColors.alpha.primary30
                        }
                      }
                    }}
                  >
                    {sucursal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 2. Nombre de equipo - CAMBIADO A SELECT FILTRADO POR SUCURSAL */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              2.- Nombre de equipo:
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>SELECCIONAR EQUIPO</InputLabel>
              <Select
                value={userForm.nombreEquipo}
                onChange={handleFormChange('nombreEquipo')}
                label="SELECCIONAR EQUIPO"
                disabled={!userForm.sucursal} // Deshabilitar hasta seleccionar sucursal
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primaryLight,
                  }
                }}
              >
                {equiposDisponibles.map((equipo) => (
                  <MenuItem 
                    key={equipo} 
                    value={equipo}
                    sx={{
                      '&:hover': {
                        bgcolor: farmaColors.alpha.primary10
                      },
                      '&.Mui-selected': {
                        bgcolor: farmaColors.alpha.primary20,
                        '&:hover': {
                          bgcolor: farmaColors.alpha.primary30
                        }
                      }
                    }}
                  >
                    {equipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!userForm.sucursal && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                * Primero seleccione una sucursal
              </Typography>
            )}
          </Grid>

          {/* 3. Tipo de usuario */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              3.- Tipo de usuario:
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>TIPO DE USUARIO</InputLabel>
              <Select
                value={userForm.tipoUsuario}
                onChange={handleFormChange('tipoUsuario')}
                label="TIPO DE USUARIO"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primaryLight,
                  }
                }}
              >
                {roles.map((role) => (
                  <MenuItem 
                    key={role} 
                    value={role}
                    sx={{
                      '&:hover': {
                        bgcolor: farmaColors.alpha.primary10
                      },
                      '&.Mui-selected': {
                        bgcolor: farmaColors.alpha.primary20,
                        '&:hover': {
                          bgcolor: farmaColors.alpha.primary30
                        }
                      }
                    }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 4. Usuario */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              4.- Usuario:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Usuario"
              value={userForm.usuario}
              onChange={handleFormChange('usuario')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
              required
            />
          </Grid>

          {/* 5. Nueva Password (opcional) */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              5.- Nueva Password (opcional):
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Dejar vacío para mantener contraseña actual"
              value={userForm.password}
              onChange={handleFormChange('password')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
              InputProps={{
                endAdornment: (
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
                )
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              * Solo completar si desea cambiar la contraseña
            </Typography>
          </Grid>

          {/* 6. Cédula de identidad */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              6.- Cédula de identidad:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Cedula de identidad"
              value={userForm.cedula}
              onChange={handleFormChange('cedula')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
            />
          </Grid>

          {/* 7. Nombre completo */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              7.- Nombre completo:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Nombre Completo"
              value={userForm.nombreCompleto}
              onChange={handleFormChange('nombreCompleto')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
              required
            />
          </Grid>

          {/* 8. Apellidos */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              8.- Apellidos:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Apellido"
              value={userForm.apellidos}
              onChange={handleFormChange('apellidos')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
            />
          </Grid>

          {/* 9. Título */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              9.- Título:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese el Titulo"
              value={userForm.titulo}
              onChange={handleFormChange('titulo')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
            />
          </Grid>

          {/* 10. Género */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              10.- Género:
            </Typography>
            <RadioGroup
              value={userForm.genero}
              onChange={handleFormChange('genero')}
              row
              sx={{
                '& .MuiFormControlLabel-root': {
                  '& .MuiRadio-root': {
                    color: 'text.secondary',
                    '&.Mui-checked': {
                      color: farmaColors.primary,
                    }
                  }
                }
              }}
            >
              <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
              <FormControlLabel value="Femenino" control={<Radio />} label="Femenino" />
            </RadioGroup>
          </Grid>

          {/* 11. Celular */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              11.- Celular:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Numero de celular"
              value={userForm.telefono}
              onChange={handleFormChange('telefono')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
            />
          </Grid>

          {/* 12. Email */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              12.- Email:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección de correo electrónico"
              value={userForm.email}
              onChange={handleFormChange('email')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
              type="email"
              required
            />
          </Grid>

          {/* 13. Dirección */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ 
              color: farmaColors.primary, 
              mb: 1, 
              fontWeight: 600 
            }}>
              13.- Dirección:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección actual"
              value={userForm.direccion}
              onChange={handleFormChange('direccion')}
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: farmaColors.primaryLight,
                  }
                }
              }}
            />
          </Grid>

          {/* Información adicional del usuario con colores corporativos */}
          <Grid item xs={12}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                bgcolor: farmaColors.alpha.secondary10, // Fondo azul muy sutil
                borderLeft: `4px solid ${farmaColors.secondary}`, // Borde azul corporativo
                '& .MuiAlert-icon': {
                  color: farmaColors.secondary
                }
              }}
            >
              <Typography variant="body2">
                <strong>Información del usuario:</strong><br />
                • Creado: {userToEdit.fechaCreacion}<br />
                • Último acceso: {userToEdit.ultimoAcceso}<br />
                • Estado actual: {userToEdit.estado}
              </Typography>
            </Alert>
          </Grid>

          {/* Botones de acción con colores corporativos */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<Cancel />}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<Save />}
              sx={{
                background: farmaColors.gradients.primary, // Gradiente naranja corporativo
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: `0 4px 20px ${farmaColors.alpha.primary30}`,
                '&:hover': {
                  background: farmaColors.gradients.primary,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 25px ${farmaColors.alpha.primary30}`,
                }
              }}
            >
              Actualizar usuario
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default EditUserForm;