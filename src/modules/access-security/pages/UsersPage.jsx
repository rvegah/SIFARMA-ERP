import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Box,
  Chip,
  Divider,
  TextField,
  Paper,
  MenuItem,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person,
  Edit,
  Security,
  Group,
  Settings,
  AdminPanelSettings,
  AccountCircle,
  Close,
  Save,
  Cancel,
  Lock,
  Phone,
  Email,
  CameraAlt
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Datos del usuario actual (simulando datos del perfil)
const currentUser = {
  id: 1,
  username: 'brasil_admin',
  email: 'brazil@hotmail.es',
  firstName: 'Brasil',
  lastName: 'Admin',
  role: 'ADMIN',
  avatar: 'BA',
  memberSince: 'JAN. 2025',
  phoneNumber: '655999',
  profileImage: null,
  sucursal: 'BRASIL',
  permissions: ['users', 'inventory', 'sales', 'reports', 'settings']
};

// Lista de usuarios del sistema
const mockUsers = [
  {
    id: 1,
    username: 'brasil_admin',
    email: 'brazil@hotmail.es',
    firstName: 'Brasil',
    lastName: 'Admin',
    role: 'ADMIN',
    status: 'Activo',
    avatar: 'BA',
    lastLogin: '2024-09-11 10:30:00'
  },
  {
    id: 2,
    username: 'farmaceutico01',
    email: 'farmaceutico@sifarma.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'FARMACÉUTICO',
    status: 'Activo',
    avatar: 'CR',
    lastLogin: '2024-09-10 16:45:00'
  },
  {
    id: 3,
    username: 'vendedor01',
    email: 'vendedor@sifarma.com',
    firstName: 'Ana',
    lastName: 'García',
    role: 'VENDEDOR',
    status: 'Activo',
    avatar: 'AG',
    lastLogin: '2024-09-09 14:20:00'
  },
  {
    id: 4,
    username: 'supervisor01',
    email: 'supervisor@sifarma.com',
    firstName: 'Miguel',
    lastName: 'López',
    role: 'SUPERVISOR',
    status: 'Inactivo',
    avatar: 'ML',
    lastLogin: '2024-08-25 11:15:00'
  }
];

const menuOptions = [
  {
    title: 'Datos del Usuario',
    description: 'Ver y editar información personal',
    icon: <AccountCircle />,
    action: 'profile',
    color: '#4A5FFF'
  },
  {
    title: 'Gestión de Usuarios',
    description: 'Administrar usuarios del sistema',
    icon: <Group />,
    action: 'users',
    color: '#00BCD4'
  },
  {
    title: 'Roles y Permisos',
    description: 'Configurar roles y permisos',
    icon: <AdminPanelSettings />,
    action: 'roles',
    color: '#4CAF50'
  },
  {
    title: 'Configuración de Seguridad',
    description: 'Políticas de seguridad y acceso',
    icon: <Security />,
    action: 'security',
    color: '#FF9800'
  }
];

const UsersPage = () => {
  const [activeView, setActiveView] = useState('menu');
  const [editForm, setEditForm] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber,
    password: '',
    confirmPassword: '',
    sucursal: currentUser.sucursal
  });
  const { enqueueSnackbar } = useSnackbar();

  const puntosVenta = [
    'PUNTO DE VENTA(10)',
    'PUNTO DE VENTA(20)', 
    'PUNTO DE VENTA(30)',
    'BRASIL',
    'ARGENTINA'
  ];

  const handleMenuClick = (action) => {
    setActiveView(action);
  };

  const handleEditProfile = () => {
    setActiveView('editProfile');
  };

  const handleFormChange = (field) => (event) => {
    setEditForm({
      ...editForm,
      [field]: event.target.value
    });
  };

  const handleSaveProfile = () => {
    // Validaciones básicas
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      enqueueSnackbar('Las contraseñas no coinciden', { variant: 'error' });
      return;
    }

    // Simulación de guardado
    enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' });
    setActiveView('menu');
  };

  const handleCancelEdit = () => {
    // Restaurar valores originales
    setEditForm({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      password: '',
      confirmPassword: '',
      sucursal: currentUser.sucursal
    });
    setActiveView('menu');
  };

  const renderEditProfile = () => (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header del formulario */}
      <Paper 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Editar Perfil
          </Typography>
          <IconButton 
            sx={{ color: 'white' }}
            onClick={handleCancelEdit}
          >
            <Close />
          </IconButton>
        </Box>
      </Paper>

      {/* Formulario de edición */}
      <Card sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Nombre Completo */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre Completo *"
              value={editForm.firstName}
              onChange={handleFormChange('firstName')}
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Apellidos */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Apellidos *"
              value={editForm.lastName}
              onChange={handleFormChange('lastName')}
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Celular */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Celular *"
              value={editForm.phoneNumber}
              onChange={handleFormChange('phoneNumber')}
              InputProps={{
                startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Correo Electrónico */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Correo Electrónico *"
              type="email"
              value={editForm.email}
              onChange={handleFormChange('email')}
              InputProps={{
                startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Foto de perfil */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#4A5FFF', mb: 2 }}>
                Foto de perfil:
              </Typography>
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#45A049' }
                }}
              >
                Cargar Imagen
              </Button>
            </Box>
          </Grid>

          {/* Contraseña */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contraseña *"
              type="password"
              value={editForm.password}
              onChange={handleFormChange('password')}
              placeholder="••••••••••••••"
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Repetir Contraseña */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Repetir Contraseña *"
              type="password"
              value={editForm.confirmPassword}
              onChange={handleFormChange('confirmPassword')}
              placeholder="••••••••••••••"
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Punto de venta */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Punto de venta *"
              value={editForm.sucursal}
              onChange={handleFormChange('sucursal')}
            >
              {puntosVenta.map((punto) => (
                <MenuItem key={punto} value={punto}>
                  {punto}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Notas importantes */}
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Nota Importante (1):</strong> No puede existir el mismo PUNTO DE VENTA trabajando al mismo tiempo.
              </Typography>
            </Alert>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Nota Importante (2):</strong> Para que se aplique la actualización de PUNTO DE VENTA debe volver a iniciar sesión.
              </Typography>
            </Alert>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
                sx={{
                  borderColor: '#F44336',
                  color: '#F44336',
                  '&:hover': {
                    borderColor: '#D32F2F',
                    bgcolor: 'rgba(244, 67, 54, 0.04)'
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveProfile}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#45A049' }
                }}
              >
                Guardar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );

  const renderUserProfile = () => (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Paper 
        sx={{ 
          p: 4, 
          background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 auto',
            mb: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
        >
          {currentUser.avatar}
        </Avatar>
        
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {currentUser.firstName} {currentUser.lastName} - {currentUser.role}
        </Typography>
        
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Miembro desde {currentUser.memberSince}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEditProfile}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Editar Perfil
          </Button>
          
          <Button
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Salir
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderMainMenu = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
        Configuración
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestión de Acceso y Seguridad - Administración de usuarios
      </Typography>

      {renderUserProfile()}

      <Grid container spacing={3}>
        {menuOptions.map((option, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${option.color}30`
                }
              }}
              onClick={() => handleMenuClick(option.action)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: option.color,
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Usuarios Activos Recientes
      </Typography>

      <Grid container spacing={2}>
        {mockUsers.slice(0, 3).map((user) => (
          <Grid item xs={12} md={4} key={user.id}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4A5FFF' }}>
                  {user.avatar}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                  <Chip
                    label={user.status}
                    size="small"
                    color={user.status === 'Activo' ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  // Por ahora solo renderizamos el menú principal
  if (activeView === 'menu') {
    return renderMainMenu();
  }

  // Renderizar formulario de editar perfil
  if (activeView === 'editProfile') {
    return renderEditProfile();
  }

  // Placeholder para otras vistas
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        onClick={() => setActiveView('menu')}
        sx={{ mb: 3 }}
        startIcon={<Settings />}
      >
        Volver al Menú Principal
      </Button>
      
      <Typography variant="h5" gutterBottom>
        {activeView === 'profile' && 'Datos del Usuario'}
        {activeView === 'users' && 'Gestión de Usuarios'}
        {activeView === 'roles' && 'Roles y Permisos'}
        {activeView === 'security' && 'Configuración de Seguridad'}
      </Typography>
      
      <Typography color="text.secondary">
        Vista en desarrollo: {activeView}
      </Typography>
    </Container>
  );
};

export default UsersPage;