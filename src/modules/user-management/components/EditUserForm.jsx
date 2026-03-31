// src/modules/user-management/components/EditUserForm.jsx
// Formulario de edición de usuarios - SIN CAMPO EQUIPO - CON CARGA DE DETALLES

import React, { useEffect } from "react";
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
  Alert,
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
  Cancel
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import { Edit as EditIcon } from "@mui/icons-material";

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

const EditUserForm = ({ onCancel }) => {
  const {
    // Estados del formulario
    userForm,
    showPassword,
    selectedUser,

    // Catálogos desde el API
    sucursales,
    roles,
    loading,

    // Funciones
    handleFormChange,
    handleUpdateUserAPI,
    clearForm,
    setShowPassword,
    loadUserDetail,
    tipoUsuarios,
  } = useUsers();

  // 🆕 Cargar detalles del usuario cuando se monta el componente
  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      console.log("📄 Cargando detalles del usuario ID:", selectedUser.id);
      loadUserDetail(selectedUser.id);
    }
  }, [selectedUser?.id]);

  // Manejar guardado
  const handleSave = async () => {
    const success = await handleUpdateUserAPI();
    if (success) {
      clearForm();
      if (onCancel) {
        onCancel(); // Volver a la lista
      }
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    clearForm();
    if (onCancel) {
      onCancel();
    }
  };

  // Si no hay usuario seleccionado, mostrar loading
  if (
    !selectedUser &&
    !userForm.usuario &&
    !userForm.nombreCompleto &&
    !userForm.email
  ) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress sx={{ color: farmaColors.primary }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Cargando datos del usuario...
          </Typography>
        </Paper>
      </Container>
    );
  }

  const userToEdit = selectedUser || {
    nombreCompleto: userForm.nombreCompleto
      ? `${userForm.nombreCompleto} ${userForm.apellidos}`
      : "Usuario",
    fechaCreacion: "N/A",
    ultimoAcceso: "N/A",
    estado: "N/A",
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title={`Editar Usuario: ${userToEdit.nombreCompleto}`}
        subtitle="Modificar información del usuario existente del sistema."
        icon={<EditIcon fontSize="large" />}
      />

      <Card sx={{ p: 4, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={3}>
          {/* ===================== FILA 1: Nombre, Apellidos, CI ===================== */}

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
              value={userForm.usuario || ""}
              disabled={true}
              InputProps={{
                startAdornment: <AccountCircle sx={{ color: "action.active", mr: 1 }} />
              }}
              helperText="El nombre de usuario no se puede modificar"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Nueva Password (opcional)"
              placeholder="Dejar vacío para mantener contraseña actual"
              value={userForm.password || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (/\s/.test(v)) return;
                handleFormChange("password")({ target: { value: v } });
              }}
              disabled={loading}
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              * Solo completar si desea cambiar la contraseña
            </Typography>
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
              <MenuItem value="">Seleccione sucursal</MenuItem>
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
              disabled
              InputProps={{
                startAdornment: <Group sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="">Seleccione rol</MenuItem>
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
              disabled
              InputProps={{
                startAdornment: <AdminPanelSettings sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="">Seleccione tipo</MenuItem>
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
              value={TITULOS.some((t) => t.codigo === userForm.titulo)
                ? userForm.titulo
                : userForm.titulo?.charAt(0).toUpperCase() +
                userForm.titulo?.slice(1).toLowerCase() || ""}
              onChange={handleFormChange("titulo")}
              disabled={loading}
              InputProps={{
                startAdornment: <School sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="">Seleccione título</MenuItem>
              <MenuItem value=""><em>Sin título</em></MenuItem>
              {TITULOS.map((titulo) => (
                <MenuItem key={titulo.codigo} value={titulo.codigo}>
                  {titulo.descripcion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 10. Género - RADIO BUTTONS */}
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

          {/* Información adicional del usuario */}
          <Grid item xs={12}>
            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: farmaColors.alpha.secondary10,
                borderLeft: `4px solid ${farmaColors.secondary}`,
                "& .MuiAlert-icon": {
                  color: farmaColors.secondary,
                },
              }}
            >
              <Typography variant="body2">
                <strong>Información del usuario:</strong>
                <br />• Creado: {userToEdit.fechaCreacion}
                <br />• Último acceso: {userToEdit.ultimoAcceso}
                <br />• Estado actual: {userToEdit.estado}
              </Typography>
            </Alert>
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
                  Actualizando usuario...
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
              startIcon={<Cancel />}
              disabled={loading}
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
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
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
              {loading ? "Actualizando..." : "Actualizar usuario"}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default EditUserForm;
