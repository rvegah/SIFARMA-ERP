// CreateUserForm.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { sucursales, roles } from '../constants/userConstants';
import { useUsers } from '../hooks/useUsers';

const CreateUserForm = ({ onCancel }) => {
  const { createUser } = useUsers();
  
  const [formData, setFormData] = useState({
    sucursal: '',
    rol: '',
    usuario: '',
    nombreCompleto: '',
    email: ''
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSave = () => {
    // Validación básica
    if (!formData.usuario || !formData.nombreCompleto || !formData.email) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    createUser(formData);
    onCancel(); // Volver a la lista
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 4 }}>
        Crear Nuevo Usuario
      </Typography>

      <Card sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sucursal *</InputLabel>
              <Select
                value={formData.sucursal}
                onChange={handleChange('sucursal')}
                label="Sucursal *"
                required
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
            <FormControl fullWidth>
              <InputLabel>Rol *</InputLabel>
              <Select
                value={formData.rol}
                onChange={handleChange('rol')}
                label="Rol *"
                required
              >
                {roles.map((rol) => (
                  <MenuItem key={rol} value={rol}>
                    {rol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Usuario *"
              value={formData.usuario}
              onChange={handleChange('usuario')}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre Completo *"
              value={formData.nombreCompleto}
              onChange={handleChange('nombreCompleto')}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<Save />}
              sx={{ bgcolor: '#28a745' }}
            >
              Guardar Usuario
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default CreateUserForm;