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
import { Save, Cancel, Visibility, VisibilityOff } from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${farmaColors.alpha.primary10} 0%, ${farmaColors.alpha.primary20} 100%)`,
          borderLeft: `4px solid ${farmaColors.primary}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: farmaColors.secondary,
            mb: 1,
          }}
        >
          EDITAR USUARIO: {userToEdit.nombreCompleto}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modificar información del usuario existente
        </Typography>
      </Paper>

      <Card sx={{ p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Grid container spacing={3}>
          {/* 1. Sucursal */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              1.- Sucursal: <span style={{ color: "red" }}>*</span>
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
                        "&:hover": {
                          bgcolor: farmaColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: farmaColors.alpha.primary20,
                          "&:hover": {
                            bgcolor: farmaColors.alpha.primary30,
                          },
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

          {/* 2. Rol de usuario (ROL: Administrador, Farmacéutico, etc) - INTERCAMBIADO */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              2.- Rol de usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "text.secondary" }}>
                ROL DE USUARIO
              </InputLabel>
              <Select
                value={userForm.rol_ID || ""}
                onChange={handleFormChange("rol_ID")}
                label="ROL DE USUARIO"
                disabled //={loading}
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
                        "&:hover": {
                          bgcolor: farmaColors.alpha.primary10,
                        },
                        "&.Mui-selected": {
                          bgcolor: farmaColors.alpha.primary20,
                          "&:hover": {
                            bgcolor: farmaColors.alpha.primary30,
                          },
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

          {/* 3. Tipo de usuario - COMBOBOX igual que CreateUserForm */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}
            >
              3.- Tipo de usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "text.secondary" }}>
                TIPO DE USUARIO
              </InputLabel>
              <Select
                value={userForm.tipoUsuarioInterno || ""}
                onChange={handleFormChange("tipoUsuarioInterno")}
                label="TIPO DE USUARIO"
                disabled //={loading} // o true si deseas solo lectura
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

          {/* 4. Usuario - DESHABILITADO */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              4.- Usuario: <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              required
              value={userForm.usuario || ""}
              disabled={true}
              sx={{
                bgcolor: "#f5f5f5",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-disabled": {
                    bgcolor: "#f5f5f5",
                  },
                },
              }}
              helperText="El nombre de usuario no se puede modificar"
            />
          </Grid>

          {/* 5. Nueva Password (opcional) */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              5.- Nueva Password (opcional):
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Dejar vacío para mantener contraseña actual"
              value={userForm.password || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (/\s/.test(v)) return; // evita espacios
                handleFormChange("password")({ target: { value: v } });
              }}
              disabled={loading}
              sx={{
                bgcolor: "white",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: farmaColors.primary,
                  },
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: farmaColors.secondary,
                      "&:hover": {
                        bgcolor: farmaColors.alpha.secondary10,
                      },
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

          {/* 6. Cédula de identidad */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              6.- Cédula de identidad:
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
            />
          </Grid>

          {/* 7. Nombre completo */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              7.- Nombre completo: <span style={{ color: "red" }}>*</span>
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
            />
          </Grid>

          {/* 8. Apellidos */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              8.- Apellidos:
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
            />
          </Grid>

          {/* 9. Título - SELECT */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
            >
              9.- Título:
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "text.secondary" }}>
                SELECCIONAR TÍTULO
              </InputLabel>
              <Select
                value={
                  TITULOS.some((t) => t.codigo === userForm.titulo)
                    ? userForm.titulo
                    : userForm.titulo?.charAt(0).toUpperCase() +
                        userForm.titulo?.slice(1).toLowerCase() || ""
                }
                onChange={handleFormChange("titulo")}
                label="SELECCIONAR TÍTULO"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Sin título</em>
                </MenuItem>
                {TITULOS.map((titulo) => (
                  <MenuItem
                    key={titulo.codigo}
                    value={titulo.codigo}
                    sx={{
                      "&:hover": {
                        bgcolor: farmaColors.alpha.primary10,
                      },
                      "&.Mui-selected": {
                        bgcolor: farmaColors.alpha.primary20,
                        "&:hover": {
                          bgcolor: farmaColors.alpha.primary30,
                        },
                      },
                    }}
                  >
                    {titulo.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 10. Género - RADIO BUTTONS */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
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
                    "&.Mui-checked": {
                      color: farmaColors.primary,
                    },
                    "&.Mui-disabled": {
                      color: "rgba(0, 0, 0, 0.26)",
                    },
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

          {/* 11. Celular */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
            />
          </Grid>

          {/* 12. Email */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
              }}
            />
          </Grid>

          {/* 13. Dirección */}
          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{
                color: farmaColors.primary,
                mb: 1,
                fontWeight: 600,
              }}
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
                  "&:hover fieldset": {
                    borderColor: farmaColors.primaryLight,
                  },
                },
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
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<Cancel />}
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
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: "1rem",
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
              {loading ? "Actualizando..." : "Actualizar usuario"}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default EditUserForm;