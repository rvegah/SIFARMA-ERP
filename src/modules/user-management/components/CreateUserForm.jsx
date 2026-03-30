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
import { Save, Visibility, VisibilityOff } from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import { PersonAdd } from "@mui/icons-material";

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
        title="Registrar Usuario"
        subtitle="Formulario de registro de nuevos usuarios para el personal del sistema."
        icon={<PersonAdd fontSize="large" />}
      />

      <Card
        key={formKey}
        sx={{ p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        <Grid container spacing={3}>
          {/* 1. Nombre completo */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              1.- Nombre completo: <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="Ingrese Nombre Completo"
              value={userForm.nombreCompleto || ""}
              onChange={handleFormChange("nombreCompleto")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* 2. Apellidos */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              2.- Apellidos:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Apellido"
              value={userForm.apellidos || ""}
              onChange={handleFormChange("apellidos")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* 3. Cédula de identidad */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              3.- Cédula de identidad:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Cedula de identidad"
              value={userForm.cedula || ""}
              onChange={handleFormChange("cedula")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* ===================== FILA 2: Usuario, Password ===================== */}

          {/* 4. Usuario */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              4.- Usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="Ingrese Usuario"
              value={userForm.usuario || ""}
              onChange={handleFormChange("usuario")}
              disabled={loading}
              autoComplete="off"
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* 5. Password */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              5.- Password: <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              placeholder="Ingrese Password"
              value={userForm.password || ""}
              onChange={handleFormChange("password")}
              disabled={loading}
              autoComplete="new-password"
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
              InputProps={{
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

          {/* 6. Sucursal */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              6.- Sucursal: <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "text.secondary" }}>
                SELECCIONAR SUCURSAL
              </InputLabel>
              <Select
                value={userForm.sucursal_ID || ""}
                onChange={handleFormChange("sucursal_ID")}
                label="SELECCIONAR SUCURSAL"
                disabled={loading}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primaryLight,
                  },
                }}
              >
                {sucursales.length === 0 ? (
                  <MenuItem disabled>Cargando sucursales...</MenuItem>
                ) : (
                  sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.sucursal_ID}
                      value={sucursal.sucursal_ID}
                      sx={{
                        "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                        "&.Mui-selected": {
                          bgcolor: farmaColors.alpha.primary20,
                          "&:hover": { bgcolor: farmaColors.alpha.primary30 },
                        },
                      }}
                    >
                      {sucursal.nombreSucursal}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* 7. Rol de usuario */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              7.- Rol de usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "text.secondary" }}>
                ROL DE USUARIO
              </InputLabel>
              <Select
                value={userForm.rol_ID || ""}
                onChange={handleFormChange("rol_ID")}
                label="ROL DE USUARIO"
                disabled={loading}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primaryLight,
                  },
                }}
              >
                {roles.length === 0 ? (
                  <MenuItem disabled>Cargando roles...</MenuItem>
                ) : (
                  roles.map((role) => (
                    <MenuItem
                      key={role.rol_ID}
                      value={role.rol_ID}
                      sx={{
                        "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                        "&.Mui-selected": {
                          bgcolor: farmaColors.alpha.primary20,
                          "&:hover": { bgcolor: farmaColors.alpha.primary30 },
                        },
                      }}
                    >
                      {role.nombre_Rol}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* 8. Tipo de usuario */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              8.- Tipo de usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "text.secondary" }}>
                TIPO DE USUARIO
              </InputLabel>
              <Select
                value={userForm.tipoUsuarioInterno || ""}
                onChange={handleFormChange("tipoUsuarioInterno")}
                label="TIPO DE USUARIO"
                disabled={loading}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primaryLight,
                  },
                }}
              >
                {tipoUsuarios.length === 0 ? (
                  <MenuItem disabled>Cargando tipos...</MenuItem>
                ) : (
                  tipoUsuarios.map((tipo) => (
                    <MenuItem
                      key={tipo.codigo}
                      value={tipo.codigo}
                      sx={{
                        "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                        "&.Mui-selected": {
                          bgcolor: farmaColors.alpha.primary20,
                          "&:hover": { bgcolor: farmaColors.alpha.primary30 },
                        },
                      }}
                    >
                      {tipo.descripcion}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* ===================== FILA 4: Título, Género ===================== */}

          {/* 9. Título */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              9.- Título:
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "text.secondary" }}>
                SELECCIONAR TÍTULO
              </InputLabel>
              <Select
                value={userForm.titulo || ""}
                onChange={handleFormChange("titulo")}
                label="SELECCIONAR TÍTULO"
                disabled={loading}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: farmaColors.primaryLight,
                  },
                }}
              >
                <MenuItem value="">
                  <em>Sin título</em>
                </MenuItem>
                {TITULOS.map((titulo) => (
                  <MenuItem
                    key={titulo.codigo}
                    value={titulo.codigo}
                    sx={{
                      "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                      "&.Mui-selected": {
                        bgcolor: farmaColors.alpha.primary20,
                        "&:hover": { bgcolor: farmaColors.alpha.primary30 },
                      },
                    }}
                  >
                    {titulo.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 10. Género */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              10.- Género:
            </Typography>
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

          {/* 11. Celular */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              11.- Celular:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese Numero de celular"
              value={userForm.telefono || ""}
              onChange={handleFormChange("telefono")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* 12. Email */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              12.- Email: <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              required
              type="email"
              placeholder="Ingrese dirección de correo electrónico"
              value={userForm.email || ""}
              onChange={handleFormChange("email")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
              }}
            />
          </Grid>

          {/* ===================== FILA 6: Dirección (full width) ===================== */}

          {/* 13. Dirección */}
          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              13.- Dirección:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese dirección actual"
              value={userForm.direccion || ""}
              onChange={handleFormChange("direccion")}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": { borderColor: farmaColors.primaryLight },
                },
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
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                px: 3,
                py: 1.5,
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
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: `0 4px 20px ${farmaColors.alpha.primary30}`,
                "&:hover": {
                  background: farmaColors.gradients.primary,
                  transform: "translateY(-2px)",
                  boxShadow: `0 6px 25px ${farmaColors.alpha.primary30}`,
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default CreateUserForm;