import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Security,
  Schedule,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
  Search,
  FilterList,
  Business,
  SupervisorAccount,
  AccessTime,
  VpnKey
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Datos mock de usuarios con sucursales específicas
const allUsers = [
  // Usuarios de BRASIL
  {
    id: 1,
    usuario: 'brasil_admin',
    nombreCompleto: 'Brasil Admin',
    email: 'brazil@hotmail.es',
    cedula: '12345678',
    telefono: '655999',
    rol: 'ADMIN',
    sucursal: 'BRASIL',
    genero: 'Masculino',
    direccion: 'Av. Principal 123',
    estado: 'Activo',
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-09-16 10:30'
  },
  {
    id: 2,
    usuario: 'brasil_farm01',
    nombreCompleto: 'MARCELA VILCA',
    email: 'marcela@sifarma.com',
    cedula: '87654321',
    telefono: '77788899',
    rol: 'FARMACEUTICO',
    sucursal: 'BRASIL',
    genero: 'Femenino',
    direccion: 'Calle Brasil 456',
    estado: 'Habilitado',
    fechaCreacion: '2024-02-10',
    ultimoAcceso: '2024-09-15 16:45'
  },
  // Usuarios de SAN MARTIN
  {
    id: 3,
    usuario: 'sanmartin_admin',
    nombreCompleto: 'USUARIO DE PRUEBA',
    email: 'sanmartin@sifarma.com',
    cedula: '11223344',
    telefono: '66677788',
    rol: 'ADMIN',
    sucursal: 'SAN MARTIN',
    genero: 'Masculino',
    direccion: 'Av. San Martin 789',
    estado: 'Habilitado',
    fechaCreacion: '2024-03-05',
    ultimoAcceso: '2024-09-10 14:20'
  },
  {
    id: 4,
    usuario: 'veronica_brasil',
    nombreCompleto: 'VERONICA OCAÑA',
    email: 'veronica@sifarma.com',
    cedula: '55443322',
    telefono: '99887766',
    rol: 'VENDEDOR',
    sucursal: 'SAN MARTIN',
    genero: 'Femenino',
    direccion: 'Calle Veronica 321',
    estado: 'Habilitado',
    fechaCreacion: '2024-04-12',
    ultimoAcceso: '2024-09-12 11:30'
  },
  // Usuarios de URUGUAY
  {
    id: 5,
    usuario: 'valerio_valerolo',
    nombreCompleto: 'Valerio Valerolo',
    email: 'valerio@sifarma.com',
    cedula: '44556677',
    telefono: '88776655',
    rol: 'SUPERVISOR',
    sucursal: 'URUGUAY',
    genero: 'Masculino',
    direccion: 'Uruguay Central 654',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-05-20',
    ultimoAcceso: '2024-09-05 09:15'
  },
  // Usuarios de TIQUIPAYA
  {
    id: 6,
    usuario: 'xinienio_xinienito',
    nombreCompleto: 'Xinienio Xinienito',
    email: 'xinienio@sifarma.com',
    cedula: '33445566',
    telefono: '77665544',
    rol: 'FARMACEUTICO',
    sucursal: 'TIQUIPAYA',
    genero: 'Masculino',
    direccion: 'Tiquipaya Norte 987',
    estado: 'Deshabilitado',
    fechaCreacion: '2024-06-15',
    ultimoAcceso: '2024-08-30 15:45'
  }
];

const sucursales = ['BRASIL', 'SAN MARTIN', 'URUGUAY', 'TIQUIPAYA'];
const roles = ['ADMIN', 'FARMACEUTICO', 'VENDEDOR', 'SUPERVISOR', 'CONTADOR'];
const tiposUsuario = ['ADMINISTRADOR', 'USUARIO NORMAL', 'INVITADO'];

const UserManagement = () => {
  const [activeView, setActiveView] = useState('list');
  const [users, setUsers] = useState(allUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Mi Sucursal, 1 = Todas las Sucursales
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  // Usuario actual (simulando sesión)
  const currentUserSucursal = 'BRASIL';
  const isAdmin = true; // Simulando que es administrador

  // Detectar ruta y establecer vista correspondiente
  useEffect(() => {
    if (location.pathname.includes('/new')) {
      setActiveView('create');
    } else if (location.pathname.includes('/list') || location.pathname === '/users') {
      setActiveView('list');
    }
  }, [location.pathname]);

  // Formulario para nuevo usuario
  const [userForm, setUserForm] = useState({
    sucursal: '',
    tipoUsuario: '',
    usuario: '',
    password: '',
    cedula: '',
    nombreCompleto: '',
    apellidos: '',
    titulo: '',
    telefono: '',
    email: '',
    genero: 'Masculino',
    direccion: ''
  });

  const handleFormChange = (field) => (event) => {
    setUserForm({
      ...userForm,
      [field]: event.target.value
    });
  };

  const handleCreateUser = () => {
    setActiveView('create');
    setUserForm({
      sucursal: '',
      tipoUsuario: '',
      usuario: '',
      password: '',
      cedula: '',
      nombreCompleto: '',
      apellidos: '',
      titulo: '',
      telefono: '',
      email: '',
      genero: 'Masculino',
      direccion: ''
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setActiveView('edit');
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' });
  };

  const handleSaveUser = () => {
    if (!userForm.usuario || !userForm.password || !userForm.nombreCompleto || !userForm.email) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return;
    }

    const newUser = {
      id: users.length + 1,
      usuario: userForm.usuario,
      nombreCompleto: `${userForm.nombreCompleto} ${userForm.apellidos}`,
      email: userForm.email,
      cedula: userForm.cedula,
      telefono: userForm.telefono,
      rol: userForm.tipoUsuario,
      sucursal: userForm.sucursal,
      genero: userForm.genero,
      direccion: userForm.direccion,
      estado: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimoAcceso: 'Nunca'
    };

    setUsers([...users, newUser]);
    enqueueSnackbar('Usuario creado correctamente', { variant: 'success' });
    setActiveView('list');
  };

  // Filtrar usuarios según la pestaña seleccionada
  const getFilteredUsersByTab = () => {
    if (selectedTab === 0) {
      // Mi Sucursal
      return users.filter(user => user.sucursal === currentUserSucursal);
    } else {
      // Todas las Sucursales (solo si es admin)
      return isAdmin ? users : users.filter(user => user.sucursal === currentUserSucursal);
    }
  };

  const filteredUsers = getFilteredUsersByTab().filter(user => {
    const matchesSearch = user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderCreateUserForm = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderLeft: '4px solid #4A5FFF' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A202C', mb: 1 }}>
          REGISTRAR USUARIO
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Formulario usuarios
        </Typography>
      </Paper>

      <Card sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Fila 1: Sucursal y Tipo de Usuario */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              1.- Sucursal:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>SELECCIONAR SUCURSAL</InputLabel>
              <Select
                value={userForm.sucursal}
                onChange={handleFormChange('sucursal')}
                label="SELECCIONAR SUCURSAL"
              >
                {sucursales.map((sucursal) => (
                  <MenuItem key={sucursal} value={sucursal}>
                    {sucursal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              2.- Tipo de usuario:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>TIPO DE USUARIO</InputLabel>
              <Select
                value={userForm.tipoUsuario}
                onChange={handleFormChange('tipoUsuario')}
                label="TIPO DE USUARIO"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Fila 2: Usuario y Password */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              3.- Usuario:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Usuario"
              value={userForm.usuario}
              onChange={handleFormChange('usuario')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              4.- Password:
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese Password"
              value={userForm.password}
              onChange={handleFormChange('password')}
              sx={{ bgcolor: 'white' }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
          </Grid>

          {/* Fila 3: Cédula y Nombre */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              5.- Cédula de identidad:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Cedula de identidad"
              value={userForm.cedula}
              onChange={handleFormChange('cedula')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              6.- Nombre completo:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Nombre Completo"
              value={userForm.nombreCompleto}
              onChange={handleFormChange('nombreCompleto')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          {/* Fila 4: Apellidos y Título */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              7.- Apellidos:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Apellido"
              value={userForm.apellidos}
              onChange={handleFormChange('apellidos')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              8.- Título:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese el Titulo"
              value={userForm.titulo}
              onChange={handleFormChange('titulo')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          {/* Fila 5: Género y Celular */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              9.- Género:
            </Typography>
            <RadioGroup
              value={userForm.genero}
              onChange={handleFormChange('genero')}
              row
            >
              <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
              <FormControlLabel value="Femenino" control={<Radio />} label="Femenino" />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              10.- Celular:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Numero de celular"
              value={userForm.telefono}
              onChange={handleFormChange('telefono')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          {/* Fila 6: Email */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              11.- Email:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección de correo electrónico"
              value={userForm.email}
              onChange={handleFormChange('email')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          {/* Fila 7: Dirección */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#4A5FFF', mb: 1, fontWeight: 600 }}>
              12.- Dirección:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección actual"
              value={userForm.direccion}
              onChange={handleFormChange('direccion')}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          {/* Botón de guardar */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSaveUser}
              sx={{
                bgcolor: '#28a745',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#218838'
                }
              }}
            >
              Guardar usuario
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          onClick={() => setActiveView('list')}
          startIcon={<Cancel />}
        >
          Volver a la Lista
        </Button>
      </Box>
    </Container>
  );

  const renderUsersList = () => (
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
              onClick={handleCreateUser}
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
                      onClick={() => handleEditUser(user)}
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
                        setSelectedUser(user);
                        setActiveView('permissions');
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
                        setSelectedUser(user);
                        setActiveView('schedule');
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

  // Renderizado principal
  if (activeView === 'create') {
    return renderCreateUserForm();
  }

  if (activeView === 'edit') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Función de edición en desarrollo - Regresando a la lista
        </Alert>
        <Button onClick={() => setActiveView('list')}>Volver a la Lista</Button>
      </Container>
    );
  }

  return renderUsersList();
};

export default UserManagement;