// CreateUserForm.jsx - Formulario completo con 12 campos del monolítico

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
  IconButton
} from '@mui/material';
import {
  Save,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useUsers } from '../context/UserContext';
import { sucursales, roles, generos } from '../constants/userConstants';

const CreateUserForm = ({ onCancel }) => {
  const {
    // Estados del formulario
    userForm,
    showPassword,
    
    // Funciones
    handleFormChange,
    handleCreateUser,
    clearForm,
    setShowPassword
  } = useUsers();

  const handleSave = () => {
    const success = handleCreateUser();
    if (success) {
      clearForm();
      onCancel(); // Volver a la lista
    }
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado con estilo del monolítico */}
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
          {/* 1. Sucursal */}
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

          {/* 2. Tipo de usuario */}
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

          {/* 3. Usuario */}
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
              required
            />
          </Grid>

          {/* 4. Password */}
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
              required
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
          </Grid>

          {/* 5. Cédula de identidad */}
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

          {/* 6. Nombre completo */}
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
              required
            />
          </Grid>

          {/* 7. Apellidos */}
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

          {/* 8. Título */}
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

          {/* 9. Género */}
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

          {/* 10. Celular */}
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

          {/* 11. Email */}
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
              type="email"
              required
            />
          </Grid>

          {/* 12. Dirección */}
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

          {/* Botón de acción */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                borderColor: '#6c757d',
                color: '#6c757d',
                '&:hover': {
                  borderColor: '#5a6268',
                  bgcolor: 'rgba(108, 117, 125, 0.04)'
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
    </Container>
  );
};

export default CreateUserForm;