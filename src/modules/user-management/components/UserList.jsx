// UserList.jsx - Componente completo con toda la funcionalidad del monolítico

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
        Gestión de Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administración y control de usuarios del sistema
      </Typography>

      {/* Tabs de sucursales - Solo para administradores */}
      {isAdmin && (
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
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
                  color: '#1F2937',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3B82F6',
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
                      bgcolor: '#E5E7EB', 
                      color: '#374151',
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
                      bgcolor: '#E5E7EB', 
                      color: '#374151',
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por rol</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filtrar por rol"
                startAdornment={<FilterList sx={{ color: 'action.active', mr: 1 }} />}
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
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
                background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3E51E5 0%, #5A6AD8 100%)'
                }
              }}
            >
              Nuevo Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Avatar</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Último Acceso</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1A202C' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Avatar sx={{ bgcolor: '#4A5FFF', width: 40, height: 40 }}>
                    {user.nombreCompleto.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.usuario}
                  </Typography>
                </TableCell>
                <TableCell>{user.nombreCompleto}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.rol}
                    size="small"
                    color={user.rol === 'ADMIN' ? 'error' : user.rol === 'FARMACEUTICO' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{user.sucursal}</TableCell>
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
                        color: '#1976d2',
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        '&:hover': { 
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                          color: '#1565c0'
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
                        color: '#7b1fa2',
                        bgcolor: 'rgba(123, 31, 162, 0.04)',
                        '&:hover': { 
                          bgcolor: 'rgba(123, 31, 162, 0.08)',
                          color: '#6a1b9a'
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
                        color: '#ed6c02',
                        bgcolor: 'rgba(237, 108, 2, 0.04)',
                        '&:hover': { 
                          bgcolor: 'rgba(237, 108, 2, 0.08)',
                          color: '#e65100'
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
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
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