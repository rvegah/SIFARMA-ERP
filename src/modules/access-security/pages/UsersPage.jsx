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
const usuarioActual = {
  id: 1,
  nombreUsuario: 'brasil_admin',
  correo: 'brazil@hotmail.es',
  nombre: 'Brasil',
  apellido: 'Admin',
  rol: 'ADMIN',
  avatar: 'BA',
  miembroDesdel: 'ENE. 2025',
  numeroTelefono: '655999',
  imagenPerfil: null,
  sucursal: 'BRASIL',
  permisos: ['usuarios', 'inventario', 'ventas', 'reportes', 'configuracion']
};

// Lista de usuarios del sistema
const usuariosMock = [
  {
    id: 1,
    nombreUsuario: 'brasil_admin',
    correo: 'brazil@hotmail.es',
    nombre: 'Brasil',
    apellido: 'Admin',
    rol: 'ADMIN',
    estado: 'Activo',
    avatar: 'BA',
    ultimoAcceso: '2024-09-11 10:30:00'
  },
  {
    id: 2,
    nombreUsuario: 'farmaceutico01',
    correo: 'farmaceutico@sifarma.com',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    rol: 'FARMACÉUTICO',
    estado: 'Activo',
    avatar: 'CR',
    ultimoAcceso: '2024-09-10 16:45:00'
  },
  {
    id: 3,
    nombreUsuario: 'vendedor01',
    correo: 'vendedor@sifarma.com',
    nombre: 'Ana',
    apellido: 'García',
    rol: 'VENDEDOR',
    estado: 'Activo',
    avatar: 'AG',
    ultimoAcceso: '2024-09-09 14:20:00'
  },
  {
    id: 4,
    nombreUsuario: 'supervisor01',
    correo: 'supervisor@sifarma.com',
    nombre: 'Miguel',
    apellido: 'López',
    rol: 'SUPERVISOR',
    estado: 'Inactivo',
    avatar: 'ML',
    ultimoAcceso: '2024-08-25 11:15:00'
  }
];

const opcionesMenu = [
  {
    titulo: 'Datos del Usuario',
    descripcion: 'Ver y editar información personal',
    icono: <AccountCircle />,
    accion: 'perfil',
    color: '#4A5FFF'
  },
  {
    titulo: 'Gestión de Usuarios',
    descripcion: 'Administrar usuarios del sistema',
    icono: <Group />,
    accion: 'usuarios',
    color: '#00BCD4'
  },
  {
    titulo: 'Roles y Permisos',
    descripcion: 'Configurar roles y permisos',
    icono: <AdminPanelSettings />,
    accion: 'roles',
    color: '#4CAF50'
  },
  {
    titulo: 'Configuración de Seguridad',
    descripcion: 'Políticas de seguridad y acceso',
    icono: <Security />,
    accion: 'seguridad',
    color: '#FF9800'
  }
];

const UsersPage = () => {
  const [vistaActiva, setVistaActiva] = useState('menu');
  const [formularioEdicion, setFormularioEdicion] = useState({
    nombre: usuarioActual.nombre,
    apellido: usuarioActual.apellido,
    correo: usuarioActual.correo,
    numeroTelefono: usuarioActual.numeroTelefono,
    contrasena: '',
    confirmarContrasena: '',
    sucursal: usuarioActual.sucursal
  });
  const { enqueueSnackbar } = useSnackbar();

  const puntosVenta = [
    'PUNTO DE VENTA(10)',
    'PUNTO DE VENTA(20)', 
    'PUNTO DE VENTA(30)',
    'BRASIL',
    'ARGENTINA'
  ];

  const manejarClickMenu = (accion) => {
    setVistaActiva(accion);
  };

  const manejarEditarPerfil = () => {
    setVistaActiva('editarPerfil');
  };

  const manejarCambioFormulario = (campo) => (event) => {
    setFormularioEdicion({
      ...formularioEdicion,
      [campo]: event.target.value
    });
  };

  const manejarGuardarPerfil = () => {
    // Validaciones básicas
    if (!formularioEdicion.nombre || !formularioEdicion.apellido || !formularioEdicion.correo) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return;
    }

    if (formularioEdicion.contrasena && formularioEdicion.contrasena !== formularioEdicion.confirmarContrasena) {
      enqueueSnackbar('Las contraseñas no coinciden', { variant: 'error' });
      return;
    }

    // Simulación de guardado
    enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' });
    setVistaActiva('menu');
  };

  const manejarCancelarEdicion = () => {
    // Restaurar valores originales
    setFormularioEdicion({
      nombre: usuarioActual.nombre,
      apellido: usuarioActual.apellido,
      correo: usuarioActual.correo,
      numeroTelefono: usuarioActual.numeroTelefono,
      contrasena: '',
      confirmarContrasena: '',
      sucursal: usuarioActual.sucursal
    });
    setVistaActiva('menu');
  };

  const renderizarEditarPerfil = () => (
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
            onClick={manejarCancelarEdicion}
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
              value={formularioEdicion.nombre}
              onChange={manejarCambioFormulario('nombre')}
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
              value={formularioEdicion.apellido}
              onChange={manejarCambioFormulario('apellido')}
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
              value={formularioEdicion.numeroTelefono}
              onChange={manejarCambioFormulario('numeroTelefono')}
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
              value={formularioEdicion.correo}
              onChange={manejarCambioFormulario('correo')}
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
              value={formularioEdicion.contrasena}
              onChange={manejarCambioFormulario('contrasena')}
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
              value={formularioEdicion.confirmarContrasena}
              onChange={manejarCambioFormulario('confirmarContrasena')}
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
              value={formularioEdicion.sucursal}
              onChange={manejarCambioFormulario('sucursal')}
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
                onClick={manejarCancelarEdicion}
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
                onClick={manejarGuardarPerfil}
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

  const renderizarPerfilUsuario = () => (
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
          {usuarioActual.avatar}
        </Avatar>
        
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {usuarioActual.nombre} {usuarioActual.apellido} - {usuarioActual.rol}
        </Typography>
        
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Miembro desde {usuarioActual.miembroDesdel}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={manejarEditarPerfil}
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

  const renderizarMenuPrincipal = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
        Configuración
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestión de Acceso y Seguridad - Administración de usuarios
      </Typography>

      {renderizarPerfilUsuario()}

      <Grid container spacing={3}>
        {opcionesMenu.map((opcion, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${opcion.color}30`
                }
              }}
              onClick={() => manejarClickMenu(opcion.accion)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: opcion.color,
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {opcion.icono}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      {opcion.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opcion.descripcion}
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
        {usuariosMock.slice(0, 3).map((usuario) => (
          <Grid item xs={12} md={4} key={usuario.id}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4A5FFF' }}>
                  {usuario.avatar}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {usuario.nombre} {usuario.apellido}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {usuario.rol}
                  </Typography>
                  <Chip
                    label={usuario.estado}
                    size="small"
                    color={usuario.estado === 'Activo' ? 'success' : 'default'}
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
  if (vistaActiva === 'menu') {
    return renderizarMenuPrincipal();
  }

  // Renderizar formulario de editar perfil
  if (vistaActiva === 'editarPerfil') {
    return renderizarEditarPerfil();
  }

  // Placeholder para otras vistas
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        onClick={() => setVistaActiva('menu')}
        sx={{ mb: 3 }}
        startIcon={<Settings />}
      >
        Volver al Menú Principal
      </Button>
      
      <Typography variant="h5" gutterBottom>
        {vistaActiva === 'perfil' && 'Datos del Usuario'}
        {vistaActiva === 'usuarios' && 'Gestión de Usuarios'}
        {vistaActiva === 'roles' && 'Roles y Permisos'}
        {vistaActiva === 'seguridad' && 'Configuración de Seguridad'}
      </Typography>
      
      <Typography color="text.secondary">
        Vista en desarrollo: {vistaActiva}
      </Typography>
    </Container>
  );
};

export default UsersPage;