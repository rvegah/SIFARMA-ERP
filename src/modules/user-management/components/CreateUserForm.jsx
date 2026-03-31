// src/modules/user-management/components/CreateUserForm.jsx
// Formulario de creación de usuarios - CON LIMPIEZA FORZADA AL MONTAR

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Save,
  Visibility,
  VisibilityOff,
  Person,
  Badge,
  AccountCircle,
  Lock,
  Store,
  Group,
  AdminPanelSettings,
  School,
  PhoneAndroid,
  Email,
  Home,
  Cancel,
  PersonAdd
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";

// 🆕 Opciones de título (estáticas)
const TITULOS = [
  { codigo: "Tec", descripcion: "Técnico" },
  { codigo: "Lic", descripcion: "Licenciado" },
  { codigo: "Ing", descripcion: "Ingeniero" },
  { codigo: "MSc", descripcion: "Master" },
  { codigo: "Doc", descripcion: "Doctor" },
  { codigo: "Phd", descripcion: "Doctor (PhD)" },
];

// 🆕 Opciones de género
const GENEROS = [
  { codigo: "M", descripcion: "Masculino" },
  { codigo: "F", descripcion: "Femenino" },
];

const CreateUserForm = ({ onCancel }) => {
  const navigate = useNavigate();

  const {
    // Estados del formulario
    userForm,
    showPassword,

    setUserForm,

    // Catálogos desde el API
    sucursales,
    roles,
    loading,

    // Funciones
    handleFormChange,
    handleCreateUserAPI,
    clearForm,
    setShowPassword,
    tipoUsuarios,
    setSelectedUser, // 🆕 IMPORTAR ESTA FUNCIÓN
  } = useUsers();

  const [formKey, setFormKey] = useState(Date.now());

  // 🔥 SOLUCIÓN: Limpiar SIEMPRE al montar y al cambiar activeView
  useEffect(() => {
    console.log("🧹 CreateUserForm montado → LIMPIANDO TODO");
    clearForm();
    setSelectedUser(null); // 🆕 CRÍTICO: Limpiar usuario seleccionado
    setFormKey(Date.now());
  }, []); // Sin dependencias = solo al montar

  // Manejar guardado
  const handleSave = async () => {
    const success = await handleCreateUserAPI();
    if (success) {
      clearForm();
      setSelectedUser(null); // 🆕 Limpiar después de guardar
      if (onCancel) {
        onCancel();
      } else {
        navigate("/users/list");
      }
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    clearForm();
    setSelectedUser(null); // 🆕 Limpiar al cancelar
    if (onCancel) {
      onCancel();
    } else {
      navigate("/users/list");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Registrar Usuario"
        // subtitle="Formulario de registro de nuevos usuarios para el personal del sistema."
        icon={<PersonAdd fontSize="large" />}
      />

      <Card
        key={formKey}
        sx={{ p: 4, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Nombre completo"
              placeholder="Ingrese Nombre Completo"
              value={userForm.nombreCompleto || ""}
              onChange={handleFormChange("nombreCompleto")}
              disabled={loading}
              InputProps={{
                startAdornment: <Person sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* 2. Apellidos */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Apellidos"
              placeholder="Ingrese Apellido"
              value={userForm.apellidos || ""}
              onChange={handleFormChange("apellidos")}
              disabled={loading}
              InputProps={{
                startAdornment: <Person sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* 3. Cédula de identidad */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cédula de identidad"
              placeholder="Ingrese Cedula de identidad"
              value={userForm.cedula || ""}
              onChange={handleFormChange("cedula")}
              disabled={loading}
              InputProps={{
                startAdornment: <Badge sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* ===================== FILA 2: Usuario, Password ===================== */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Usuario"
              placeholder="Ingrese Usuario"
              value={userForm.usuario || ""}
              onChange={handleFormChange("usuario")}
              disabled={loading}
              autoComplete="off"
              InputProps={{
                startAdornment: <AccountCircle sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* 5. Password */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Ingrese Password"
              value={userForm.password || ""}
              onChange={handleFormChange("password")}
              disabled={loading}
              autoComplete="new-password"
              InputProps={{
                startAdornment: <Lock sx={{ color: "action.active", mr: 1 }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: farmaColors.secondary,
                      "&:hover": { bgcolor: farmaColors.alpha.secondary10 },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>

          {/* ===================== FILA 3: Sucursal, Rol, Tipo Usuario ===================== */}

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Sucursal"
              value={userForm.sucursal_ID || ""}
              onChange={handleFormChange("sucursal_ID")}
              disabled={loading}
              InputProps={{
                startAdornment: <Store sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione sucursal</MenuItem>
              {sucursales.map((sucursal) => (
                <MenuItem key={sucursal.sucursal_ID} value={sucursal.sucursal_ID}>
                  {sucursal.nombreSucursal}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 7. Rol de usuario */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Rol de usuario"
              value={userForm.rol_ID || ""}
              onChange={handleFormChange("rol_ID")}
              disabled={loading}
              InputProps={{
                startAdornment: <Group sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione rol</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.rol_ID} value={role.rol_ID}>
                  {role.nombre_Rol}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 8. Tipo de usuario */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Tipo de usuario"
              value={userForm.tipoUsuarioInterno || ""}
              onChange={handleFormChange("tipoUsuarioInterno")}
              disabled={loading}
              InputProps={{
                startAdornment: <AdminPanelSettings sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione tipo</MenuItem>
              {tipoUsuarios.map((tipo) => (
                <MenuItem key={tipo.codigo} value={tipo.codigo}>
                  {tipo.descripcion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ===================== FILA 4: Título, Género ===================== */}

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Título"
              value={userForm.titulo || ""}
              onChange={handleFormChange("titulo")}
              disabled={loading}
              InputProps={{
                startAdornment: <School sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione título</MenuItem>
              <MenuItem value=""><em>Sin título</em></MenuItem>
              {TITULOS.map((titulo) => (
                <MenuItem key={titulo.codigo} value={titulo.codigo}>
                  {titulo.descripcion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 10. Género */}
          <Grid item xs={12} md={6}>
            {/* <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              10.- Género:
            </Typography> */}
            <RadioGroup
              value={userForm.genero || "M"}
              onChange={handleFormChange("genero")}
              row
              sx={{
                "& .MuiFormControlLabel-root": {
                  "& .MuiRadio-root": {
                    color: "text.secondary",
                    "&.Mui-checked": { color: farmaColors.primary },
                    "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.26)" },
                  },
                },
              }}
            >
              {GENEROS.map((genero) => (
                <FormControlLabel
                  key={genero.codigo}
                  value={genero.codigo}
                  control={<Radio disabled={loading} />}
                  label={genero.descripcion}
                />
              ))}
            </RadioGroup>
          </Grid>

          {/* ===================== FILA 5: Celular, Email ===================== */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Celular"
              placeholder="Ingrese Numero de celular"
              value={userForm.telefono || ""}
              onChange={handleFormChange("telefono")}
              disabled={loading}
              InputProps={{
                startAdornment: <PhoneAndroid sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* 12. Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              placeholder="Ingrese dirección de correo electrónico"
              value={userForm.email || ""}
              onChange={handleFormChange("email")}
              disabled={loading}
              InputProps={{
                startAdornment: <Email sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* 13. Dirección */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              placeholder="Ingrese dirección actual"
              value={userForm.direccion || ""}
              onChange={handleFormChange("direccion")}
              disabled={loading}
              InputProps={{
                startAdornment: <Home sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* Indicador visual de carga */}
          {loading && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: farmaColors.alpha.primary10,
                  borderRadius: 2,
                }}
              >
                <CircularProgress
                  size={24}
                  sx={{ color: farmaColors.primary }}
                />
                <Typography variant="body2" color="text.secondary">
                  Cargando catálogos del sistema...
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Botones de acción */}
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              startIcon={<Cancel />}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                "&:hover": {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10,
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              sx={{
                background: farmaColors.gradients.primary,
                color: "white",
                px: 5,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 700,
                boxShadow: `0 4px 20px ${farmaColors.alpha.primary30}`,
                "&:hover": {
                  background: farmaColors.gradients.primary,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 25px ${farmaColors.alpha.primary30}`,
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default CreateUserForm;