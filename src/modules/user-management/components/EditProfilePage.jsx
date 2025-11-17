import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  Box,
  TextField,
  Paper,
  Alert,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Lock,
  Save,
  Cancel,
  CameraAlt,
  ArrowBack,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { farmaColors } from "/src/app/theme";
import profileService from "/src/services/api/profileService";
import apiClient from "/src/services/api/apiClient";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    usuario: "",
    nombreCompleto: "",
    apellidos: "",
    telefono: "",
    email: "",
    password: "",
    confirmarPassword: "",
    sucursal: "",
    fotoPerfil: "",
  });

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      setLoading(true);
      const currentUser = profileService.getCurrentUserProfile();

      if (!currentUser || !currentUser.usuario) {
        enqueueSnackbar("No se encontró información del usuario", {
          variant: "error",
        });
        navigate("/dashboard");
        return;
      }

      // 🎉 Usar directamente nombres y apellidos del backend
      setFormData({
        usuario: currentUser.usuario || "",
        nombreCompleto: currentUser.nombres || "", // ← Usar "nombres" directamente
        apellidos: currentUser.apellidos || "", // ← Usar "apellidos" directamente
        telefono: currentUser.celular || "", // ← Usar "celular" directamente
        email: currentUser.correo || "",
        password: "",
        confirmarPassword: "",
        sucursal: currentUser.sucursal || "",
        fotoPerfil: "",
      });

      console.log("✅ Perfil cargado desde sessionStorage:", {
        nombres: currentUser.nombres,
        apellidos: currentUser.apellidos,
        celular: currentUser.celular,
      });
    } catch (error) {
      console.error("❌ Error cargando perfil:", error);
      enqueueSnackbar("Error al cargar los datos del perfil", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (campo) => (event) => {
    setFormData({
      ...formData,
      [campo]: event.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.nombreCompleto || !formData.apellidos || !formData.email) {
      enqueueSnackbar("Complete todos los campos obligatorios", {
        variant: "error",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmarPassword) {
      enqueueSnackbar("Las contraseñas no coinciden", { variant: "error" });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      enqueueSnackbar("La contraseña debe tener al menos 6 caracteres", {
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const result = await profileService.updateProfile(formData);

      if (result.success) {
        enqueueSnackbar("Perfil actualizado correctamente", {
          variant: "success",
        });
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmarPassword: "",
        }));

        if (formData.password) {
          enqueueSnackbar(
            "Para aplicar el cambio de contraseña, cierre sesión",
            {
              variant: "info",
              autoHideDuration: 5000,
            }
          );
        }
      } else {
        enqueueSnackbar(result.message || "Error al actualizar perfil", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error al guardar los cambios", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: farmaColors.primary }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          background: farmaColors.gradients.secondary,
          color: "white",
          borderRadius: 3,
          mb: 4,
          boxShadow: `0 8px 32px ${farmaColors.alpha.secondary20}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Volver
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar
            src={
              formData.fotoPerfil
                ? `https://api-core.farmadinamica.com.bo${formData.fotoPerfil}`
                : undefined
            }
            sx={{
              width: 80,
              height: 80,
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: "2rem",
              fontWeight: "bold",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {!formData.fotoPerfil &&
              `${formData.nombreCompleto?.charAt(
                0
              )}${formData.apellidos?.charAt(0)}`}
          </Avatar>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Editar Mi Perfil
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {formData.usuario}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Card sx={{ p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre Completo"
              value={formData.nombreCompleto}
              onChange={handleChange("nombreCompleto")}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Apellidos"
              value={formData.apellidos}
              onChange={handleChange("apellidos")}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Celular"
              value={formData.telefono}
              onChange={handleChange("telefono")}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Phone sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Email sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: farmaColors.secondary, mb: 2, fontWeight: 600 }}
              >
                Foto de perfil:
              </Typography>
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                disabled
                sx={{
                  background: farmaColors.gradients.primary,
                  "&.Mui-disabled": { background: "#ccc", color: "#666" },
                }}
              >
                Cargar Imagen (próximamente)
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                * Requiere endpoint de subida de archivos en el backend
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nueva Contraseña (opcional)"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Dejar vacío para no cambiar"
              helperText="Mínimo 6 caracteres"
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Lock sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              type="password"
              value={formData.confirmarPassword}
              onChange={handleChange("confirmarPassword")}
              placeholder="Repetir contraseña"
              disabled={!formData.password}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: farmaColors.primary,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: farmaColors.primary,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Lock sx={{ color: farmaColors.secondary, mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Punto de venta"
              value={formData.sucursal}
              disabled
              helperText="Para cambiar de sucursal, contacte al administrador"
              sx={{ "& .Mui-disabled": { bgcolor: "#f5f5f5" } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Alert
              severity="warning"
              sx={{ mb: 2, "& .MuiAlert-icon": { color: farmaColors.primary } }}
            >
              <Typography variant="body2">
                <strong>Nota:</strong> Los cambios de contraseña requieren
                cerrar sesión para aplicarse.
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  borderColor: farmaColors.secondary,
                  color: farmaColors.secondary,
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
                startIcon={
                  saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: farmaColors.gradients.primary,
                  color: "white",
                  "&:hover": {
                    background: farmaColors.gradients.primary,
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": { background: "#ccc", color: "#666" },
                }}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default EditProfilePage;
