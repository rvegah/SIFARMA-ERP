// UserList.jsx - Componente con colores corporativos Farma Dinámica

import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Business,
  SupervisorAccount,
  AccessTime,
  VpnKey
} from '@mui/icons-material';
import { useUsers } from '../context/UserContext';
import { roles } from '../constants/userConstants';
import { farmaColors } from '/src/app/theme'; // Importar colores corporativos

const UserList = ({ onCreateUser, onEditUser, onAssignPermissions, onAssignSchedule }) => {
  const {
    // Estados
    filteredUsers,
    users,
    selectedTab,
    searchTerm,
    filterRole,
    
    // Configuración
    currentUserSucursal,
    isAdmin,
    
    // Funciones de UI
    handleTabChange,
    setSearchTerm,
    setFilterRole,
    
    // Funciones CRUD
    handleDeleteUser,
    prepareEditUser
  } = useUsers();

  // Handler para edición que prepara el formulario y cambia vista
  const handleEditClick = (user) => {
    // Primero preparar los datos del usuario en el hook
    prepareEditUser(user);
    // Luego cambiar la vista
    onEditUser(user);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 700, 
        color: farmaColors.secondary, // Azul corporativo para el título principal
        mb: 1 
      }}>
        Gestión de Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administración y control de usuarios del sistema
      </Typography>

      {/* Tabs de sucursales - Solo para administradores */}
      {isAdmin && (
        <Paper sx={{ 
          mb: 3, 
          borderRadius: 2, 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#6B7280',
                '&.Mui-selected': {
                  color: farmaColors.primary, // Naranja corporativo para tab seleccionado
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: farmaColors.primary, // Indicador naranja
                height: 3
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" />
                  <span>MI SUCURSAL</span>
                  <Chip 
                    label={users.filter(u => u.sucursal === currentUserSucursal).length} 
                    size="small"
                    sx={{ 
                      bgcolor: farmaColors.alpha.secondary10, // Chip con color corporativo
                      color: farmaColors.secondary,
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupervisorAccount fontSize="small" />
                  <span>TODAS LAS SUCURSALES</span>
                  <Chip 
                    label={users.length} 
                    size="small"
                    sx={{ 
                      bgcolor: farmaColors.alpha.secondary10,
                      color: farmaColors.secondary,
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>
      )}

      {/* Filtros y controles */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por usuario, nombre, email o equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
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
                startAdornment: <Search sx={{ color: farmaColors.secondary, mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>Filtrar por rol</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filtrar por rol"
                startAdornment={<FilterList sx={{ color: farmaColors.secondary, mr: 1 }} />}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: farmaColors.primaryLight,
                  }
                }}
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {roles.map((role) => (
                  <MenuItem 
                    key={role} 
                    value={role}
                    sx={{
                      '&:hover': {
                        bgcolor: farmaColors.alpha.primary10
                      },
                      '&.Mui-selected': {
                        bgcolor: farmaColors.alpha.primary20
                      }
                    }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateUser}
              sx={{
                background: farmaColors.gradients.primary, // Gradiente naranja corporativo
                color: 'white',
                boxShadow: `0 4px 20px ${farmaColors.alpha.primary20}`,
                '&:hover': {
                  background: farmaColors.gradients.primary,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 25px ${farmaColors.alpha.primary30}`
                }
              }}
            >
              Nuevo Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de usuarios - ACTUALIZADA con columna nombreEquipo */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
      }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Avatar</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Equipo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Último Acceso</TableCell>
              <TableCell sx={{ fontWeight: 600, color: farmaColors.secondary }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id} 
                hover
                sx={{
                  '&:hover': {
                    bgcolor: farmaColors.alpha.primary10 // Hover muy sutil naranja
                  }
                }}
              >
                <TableCell>
                  <Avatar sx={{ 
                    background: farmaColors.gradients.secondary, // Avatar con gradiente azul corporativo
                    width: 40, 
                    height: 40 
                  }}>
                    {user.nombreCompleto.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: farmaColors.secondary // Azul corporativo para nombres de usuario
                  }}>
                    {user.usuario}
                  </Typography>
                </TableCell>
                <TableCell>{user.nombreCompleto}</TableCell>
                <TableCell>
                  <Chip
                    label={user.nombreEquipo || 'Sin asignar'}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      bgcolor: user.nombreEquipo ? farmaColors.alpha.secondary10 : '#f5f5f5',
                      color: user.nombreEquipo ? farmaColors.secondary : '#666',
                      borderColor: user.nombreEquipo ? farmaColors.secondary : '#ccc'
                    }}
                  />
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.rol}
                    size="small"
                    sx={{
                      bgcolor: user.rol === 'ADMIN' ? 'error.main' : 
                              user.rol === 'FARMACEUTICO' ? farmaColors.primary : 'grey.300',
                      color: user.rol === 'ADMIN' ? 'white' : 
                             user.rol === 'FARMACEUTICO' ? 'white' : 'grey.700'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.sucursal}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: farmaColors.primaryLight,
                      color: farmaColors.primaryDark
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.estado}
                    size="small"
                    color={user.estado === 'Activo' || user.estado === 'Habilitado' ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {user.ultimoAcceso}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{ 
                        color: farmaColors.primary, // Icono naranja para editar
                        bgcolor: farmaColors.alpha.primary10,
                        '&:hover': { 
                          bgcolor: farmaColors.alpha.primary20,
                          color: farmaColors.primaryDark
                        }
                      }}
                      title="Editar usuario"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        prepareEditUser(user);
                        onAssignPermissions(user);
                      }}
                      sx={{ 
                        color: farmaColors.secondary, // Icono azul para permisos
                        bgcolor: farmaColors.alpha.secondary10,
                        '&:hover': { 
                          bgcolor: farmaColors.alpha.secondary20,
                          color: farmaColors.secondaryDark
                        }
                      }}
                      title="Asignar permisos"
                    >
                      <VpnKey fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        prepareEditUser(user);
                        onAssignSchedule(user);
                      }}
                      sx={{ 
                        color: farmaColors.primaryDark, // Variación naranja para horarios
                        bgcolor: farmaColors.alpha.primary10,
                        '&:hover': { 
                          bgcolor: farmaColors.alpha.primary20,
                          color: farmaColors.primaryDark
                        }
                      }}
                      title="Asignar horarios"
                    >
                      <AccessTime fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mensaje cuando no hay usuarios */}
      {filteredUsers.length === 0 && (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center', 
          mt: 3,
          border: `2px dashed ${farmaColors.alpha.secondary30}`
        }}>
          <Typography variant="h6" sx={{ color: farmaColors.secondary }}>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default UserList;