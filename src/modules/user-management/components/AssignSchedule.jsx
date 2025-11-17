// src/modules/user-management/components/AssignSchedule.jsx
// Asignación de horarios de trabajo - Integrado con API real

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  Alert,
  Switch,
  TextField,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Save,
  Cancel,
  AccessTime,
  Delete,
  ContentCopy as Copy,
  WbSunny,
  NightsStay,
  Brightness3,
  WbTwilight,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";
import apiClient from "../../../services/api/apiClient";
import userService from "../../../services/api/userService";

// 🆕 Configuración de días de la semana con numeración 1-7
const diasSemana = [
  { clave: "lunes", nombre: "Lunes", corto: "LUN", numero: 1 },
  { clave: "martes", nombre: "Martes", corto: "MAR", numero: 2 },
  { clave: "miercoles", nombre: "Miércoles", corto: "MIE", numero: 3 },
  { clave: "jueves", nombre: "Jueves", corto: "JUE", numero: 4 },
  { clave: "viernes", nombre: "Viernes", corto: "VIE", numero: 5 },
  { clave: "sabado", nombre: "Sábado", corto: "SAB", numero: 6 },
  { clave: "domingo", nombre: "Domingo", corto: "DOM", numero: 7 },
];

// 🆕 TURNOS HARDCODED según la imagen (sin descanso, sin personalización)
const plantillasTurnos = {
  1: {
    id: 1,
    nombre: "MAÑANA",
    icono: <WbSunny />,
    color: farmaColors.primary,
    horaInicio: "08:00",
    horaFinal: "13:00",
  },
  2: {
    id: 2,
    nombre: "TARDE",
    icono: <WbTwilight />,
    color: farmaColors.secondary,
    horaInicio: "13:00",
    horaFinal: "18:00",
  },
  3: {
    id: 3,
    nombre: "TARDE NOCHE",
    icono: <NightsStay />,
    color: farmaColors.primaryDark,
    horaInicio: "18:00",
    horaFinal: "23:00",
  },
  4: {
    id: 4,
    nombre: "NOCTURNO",
    icono: <Brightness3 />,
    color: farmaColors.secondaryDark,
    horaInicio: "23:00",
    horaFinal: "04:00",
  },
  5: {
    id: 5,
    nombre: "FIN SEMANA",
    icono: <WbSunny />,
    color: "#2E7D32",
    horaInicio: "08:00",
    horaFinal: "21:00",
  },
  6: {
    id: 6,
    nombre: "MADRUGADOR",
    icono: <WbTwilight />,
    color: "#F57C00",
    horaInicio: "04:00",
    horaFinal: "08:00",
  },
};

const AssignSchedule = ({ onCancel }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { selectedUser, users, codigoEmpleado } = useUsers();

  // Estados principales
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || "");
  const [loading, setLoading] = useState(false);

  // 🆕 Estados para catálogos (igual que AssignPermissions)
  const [sucursales, setSucursales] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [selectedSucursal_ID, setSelectedSucursal_ID] = useState("");
  const [selectedEquipo_ID, setSelectedEquipo_ID] = useState("");

  // 🆕 Estado del horario semanal (sin descanso)
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const initial = {};
    diasSemana.forEach((dia) => {
      initial[dia.clave] = {
        activo: false,
        turno: null, // Solo un turno por día
      };
    });
    return initial;
  });

  // Obtener usuario actual
  const currentUser = users.find((u) => u.id === parseInt(selectedUserId));

  // 🆕 Cargar datos iniciales cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      loadUserScheduleData();
    }
  }, [selectedUserId]);

  // 🆕 Cargar sucursales, equipos y horarios del usuario
  const loadUserScheduleData = async () => {
    try {
      setLoading(true);
      console.log(
        "🔄 Cargando datos de horarios para usuario:",
        selectedUserId
      );

      // 1. Cargar sucursales
      const sucursalesData = await userService.getSucursales(1); // organizacion_ID = 1
      setSucursales(sucursalesData);
      console.log("✅ Sucursales cargadas:", sucursalesData.length);

      // 2. Si hay usuario seleccionado, pre-cargar su sucursal
      if (currentUser?.sucursal_ID) {
        setSelectedSucursal_ID(currentUser.sucursal_ID);

        // 3. Cargar equipos de esa sucursal
        const equiposData = await userService.getEquiposBySucursal(
          currentUser.sucursal_ID
        );
        setEquipos(equiposData);
        console.log("✅ Equipos cargados:", equiposData.length);

        // 4. Pre-seleccionar equipo si existe
        if (currentUser?.equipoComputo_ID) {
          setSelectedEquipo_ID(currentUser.equipoComputo_ID);
        }
      }

      // TODO: Aquí se cargarían los horarios existentes del usuario
      // const horariosData = await apiClient.get(`/Horarios/ObtenerHorariosUsuario?Usuario_ID=${selectedUserId}`);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      enqueueSnackbar("Error al cargar datos del usuario", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Manejar cambio de sucursal
  const handleSucursalChange = async (event) => {
    const sucursalId = event.target.value;
    setSelectedSucursal_ID(sucursalId);
    setSelectedEquipo_ID(""); // Resetear equipo
    setEquipos([]); // Limpiar equipos

    if (sucursalId) {
      try {
        const equiposData = await userService.getEquiposBySucursal(sucursalId);
        setEquipos(equiposData);
        console.log("✅ Equipos cargados para sucursal:", sucursalId);
      } catch (error) {
        console.error("❌ Error cargando equipos:", error);
        enqueueSnackbar("Error al cargar equipos", { variant: "error" });
      }
    }
  };

  // 🆕 Agregar turno a un día (solo uno permitido)
  const addShiftToDay = (claveDia, turnoId) => {
    // 🔒 Validación: solo un turno por día
    if (weeklySchedule[claveDia].turno !== null) {
      enqueueSnackbar("❌ Solo se puede asignar un turno por día", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }

    const plantilla = plantillasTurnos[turnoId];

    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        activo: true,
        turno: {
          id: Date.now(),
          turnoLaboral_ID: plantilla.id,
          nombre: plantilla.nombre,
          color: plantilla.color,
          horaInicio: plantilla.horaInicio,
          horaFinal: plantilla.horaFinal,
        },
      },
    }));

    console.log(`✅ Turno "${plantilla.nombre}" asignado a ${claveDia}`);
  };

  // 🆕 Aplicar plantilla de turno a TODOS los días de la semana
  const applyTemplateToAllDays = (turnoId) => {
    const plantilla = plantillasTurnos[turnoId];

    console.log(`🔄 Aplicando turno "${plantilla.nombre}" a todos los días...`);

    const nuevoSchedule = {};

    diasSemana.forEach((dia) => {
      nuevoSchedule[dia.clave] = {
        activo: true,
        turno: {
          id: Date.now() + Math.random(), // ID único
          turnoLaboral_ID: plantilla.id,
          nombre: plantilla.nombre,
          color: plantilla.color,
          horaInicio: plantilla.horaInicio,
          horaFinal: plantilla.horaFinal,
        },
      };
    });

    setWeeklySchedule(nuevoSchedule);

    enqueueSnackbar(
      `✅ Turno "${plantilla.nombre}" aplicado a toda la semana`,
      { variant: "success" }
    );
  };

  // 🆕 Eliminar turno de un día
  const removeShiftFromDay = (claveDia) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        activo: false,
        turno: null,
      },
    }));
    console.log(`🗑️ Turno eliminado de ${claveDia}`);
  };

  // 🆕 Copiar horario a días laborales (lunes a viernes)
  const copyDaySchedule = (diaOrigen) => {
    const horarioOrigen = weeklySchedule[diaOrigen];

    if (!horarioOrigen.turno) {
      enqueueSnackbar("⚠️ No hay turno para copiar", { variant: "warning" });
      return;
    }

    const diasDestino = ["lunes", "martes", "miercoles", "jueves", "viernes"];

    setWeeklySchedule((prev) => {
      const actualizado = { ...prev };
      diasDestino.forEach((dia) => {
        if (dia !== diaOrigen) {
          actualizado[dia] = {
            activo: true,
            turno: {
              ...horarioOrigen.turno,
              id: Date.now() + Math.random(), // Nuevo ID único
            },
          };
        }
      });
      return actualizado;
    });

    enqueueSnackbar(`✅ Horario copiado a días laborales`, {
      variant: "success",
    });
  };

  // 🆕 Alternar día activo/inactivo
  const toggleDay = (claveDia) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [claveDia]: {
        ...prev[claveDia],
        activo: !prev[claveDia].activo,
        turno: !prev[claveDia].activo ? prev[claveDia].turno : null,
      },
    }));
  };

  // 🆕 Calcular horas totales semanales (sin descanso)
  const calculateWeeklyHours = () => {
    let totalHoras = 0;

    Object.values(weeklySchedule).forEach((dia) => {
      if (dia.activo && dia.turno) {
        const [hInicio, mInicio] = dia.turno.horaInicio.split(":").map(Number);
        const [hFin, mFin] = dia.turno.horaFinal.split(":").map(Number);

        let minutosInicio = hInicio * 60 + mInicio;
        let minutosFin = hFin * 60 + mFin;

        // Manejar turnos nocturnos (ej: 23:00 - 04:00)
        if (minutosFin < minutosInicio) {
          minutosFin += 24 * 60;
        }

        const horasTrabajo = (minutosFin - minutosInicio) / 60;
        totalHoras += horasTrabajo;
      }
    });

    return totalHoras.toFixed(1);
  };

  // 🆕 GUARDAR HORARIOS (enviar al endpoint)
  const handleSaveSchedule = async () => {
    try {
      // Validaciones
      if (!selectedUserId) {
        enqueueSnackbar("⚠️ Debe seleccionar un usuario", {
          variant: "warning",
        });
        return;
      }

      if (!selectedSucursal_ID) {
        enqueueSnackbar("⚠️ Debe seleccionar una sucursal", {
          variant: "warning",
        });
        return;
      }

      if (!selectedEquipo_ID) {
        enqueueSnackbar("⚠️ Debe seleccionar un equipo", {
          variant: "warning",
        });
        return;
      }

      // Verificar que haya al menos un turno asignado
      const turnosAsignados = Object.values(weeklySchedule).filter(
        (dia) => dia.activo && dia.turno
      );
      if (turnosAsignados.length === 0) {
        enqueueSnackbar("⚠️ Debe asignar al menos un turno", {
          variant: "warning",
        });
        return;
      }

      setLoading(true);

      // 🧾 Construir payload según el formato del API
      const payload = {
        usuario_ID: parseInt(selectedUserId),
        sucursal_ID: parseInt(selectedSucursal_ID),
        equipoComputo_ID: parseInt(selectedEquipo_ID),
        turnoLaboral_ID: turnosAsignados[0]?.turno?.turnoLaboral_ID || 0,
        codigoEmpleadoAlta: codigoEmpleado || "SYSTEM",
        turnosUsuario: Object.entries(weeklySchedule)
          .filter(([_, dia]) => dia.activo && dia.turno)
          .map(([claveDia, dia]) => {
            const diaInfo = diasSemana.find((d) => d.clave === claveDia);
            return {
              usuario_Turno_Horario_ID: 0,
              horaInicio: dia.turno.horaInicio,
              horaFinal: dia.turno.horaFinal,
              numeroDia: diaInfo.numero, // 1-7
              nombreDia: diaInfo.nombre,
            };
          }),
      };

      console.log(
        "📤 Enviando horarios al API:",
        JSON.stringify(payload, null, 2)
      );

      const response = await apiClient.put(
        "/Organizacion/ActualizarTurnosUsuario",
        payload
      );

      if (response.data?.exitoso) {
        console.log("✅ Horarios guardados exitosamente:", response.data);
        enqueueSnackbar("✅ Horarios asignados correctamente", {
          variant: "success",
        });

        // Volver a la lista después de guardar
        if (onCancel) {
          onCancel();
        }
      } else {
        throw new Error(response.data?.mensaje || "Error al guardar horarios");
      }
    } catch (error) {
      console.error("❌ Error guardando horarios:", error);
      enqueueSnackbar(error.message || "Error al guardar horarios", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${farmaColors.alpha.secondary10} 0%, ${farmaColors.alpha.secondary20} 100%)`,
          borderLeft: `4px solid ${farmaColors.secondary}`,
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
          ASIGNACIÓN DE HORARIOS DE TRABAJO
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configurar horarios y turnos de trabajo del personal
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel izquierdo: Selección de usuario y plantillas */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: farmaColors.secondary,
                }}
              >
                <Person />
                Usuario
              </Typography>

              {/* Selector de Usuario */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Seleccionar Usuario</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Seleccionar Usuario"
                  disabled={loading}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: "0.75rem",
                            background: farmaColors.gradients.secondary,
                          }}
                        >
                          {user.nombreCompleto
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        {user.nombreCompleto}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {currentUser && (
                <Alert
                  severity="info"
                  sx={{ mb: 3, bgcolor: farmaColors.alpha.secondary10 }}
                >
                  <Typography variant="body2">
                    <strong>{currentUser.nombreCompleto}</strong>
                    <br />
                    {currentUser.rol} - {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              {/* 🆕 Selector de Sucursal */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={selectedSucursal_ID}
                  onChange={handleSucursalChange}
                  label="Sucursal"
                  disabled={loading || !selectedUserId}
                >
                  {sucursales.map((suc) => (
                    <MenuItem key={suc.sucursal_ID} value={suc.sucursal_ID}>
                      {suc.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 🆕 Selector de Equipo */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={selectedEquipo_ID}
                  onChange={(e) => setSelectedEquipo_ID(e.target.value)}
                  label="Equipo"
                  disabled={loading || !selectedSucursal_ID}
                >
                  {equipos.map((eq) => (
                    <MenuItem
                      key={eq.equipoComputo_ID}
                      value={eq.equipoComputo_ID}
                    >
                      {eq.nombreHost}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              {/* Plantillas de Turno */}
              <Typography
                variant="h6"
                sx={{ mb: 2, color: farmaColors.secondary }}
              >
                Plantillas de Turno
              </Typography>

              {Object.values(plantillasTurnos).map((plantilla) => (
                <Tooltip
                  key={plantilla.id}
                  title={`${plantilla.horaInicio} - ${plantilla.horaFinal}`}
                  placement="right"
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={plantilla.icono}
                    onClick={() => applyTemplateToAllDays(plantilla.id)} // 🆕 CAMBIO AQUÍ
                    sx={{
                      mb: 1,
                      justifyContent: "flex-start",
                      borderColor: plantilla.color,
                      color: plantilla.color,
                      "&:hover": {
                        bgcolor: `${plantilla.color}20`,
                        borderColor: plantilla.color,
                      },
                    }}
                  >
                    {plantilla.nombre}
                  </Button>
                </Tooltip>
              ))}
            </CardContent>
          </Card>

          {/* Resumen semanal */}
          <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: farmaColors.secondary,
                }}
              >
                <AccessTime />
                Resumen Semanal
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: farmaColors.primary,
                    fontWeight: "bold",
                  }}
                >
                  {calculateWeeklyHours()}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Horas totales semanales
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Días activos:{" "}
                  {
                    Object.values(weeklySchedule).filter((dia) => dia.activo)
                      .length
                  }
                  /7
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  Total turnos:{" "}
                  {
                    Object.values(weeklySchedule).filter((dia) => dia.turno)
                      .length
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel principal: Calendario semanal */}
        <Grid item xs={12} lg={9}>
          <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: farmaColors.secondary }}
              >
                Configuración Semanal
              </Typography>

              {diasSemana.map((dia) => (
                <Paper
                  key={dia.clave}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: weeklySchedule[dia.clave].activo
                      ? farmaColors.alpha.primary10
                      : "#fafafa",
                    border: weeklySchedule[dia.clave].activo
                      ? `1px solid ${farmaColors.alpha.primary30}`
                      : "1px solid #e0e0e0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 100,
                          color: weeklySchedule[dia.clave].activo
                            ? farmaColors.secondary
                            : "text.secondary",
                        }}
                      >
                        {dia.nombre}
                      </Typography>
                      <Switch
                        checked={weeklySchedule[dia.clave].activo}
                        onChange={() => toggleDay(dia.clave)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: farmaColors.primary,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: farmaColors.primary,
                            },
                        }}
                      />
                      {weeklySchedule[dia.clave].turno && (
                        <Chip
                          label={weeklySchedule[dia.clave].turno.nombre}
                          size="small"
                          sx={{
                            bgcolor: weeklySchedule[dia.clave].turno.color,
                            color: "white",
                          }}
                        />
                      )}
                    </Box>

                    <Box>
                      {weeklySchedule[dia.clave].activo && (
                        <Tooltip title="Copiar a días laborales">
                          <IconButton
                            size="small"
                            onClick={() => copyDaySchedule(dia.clave)}
                            sx={{
                              color: farmaColors.secondary,
                              "&:hover": {
                                bgcolor: farmaColors.alpha.secondary10,
                              },
                            }}
                          >
                            <Copy />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {weeklySchedule[dia.clave].activo && (
                    <>
                      {weeklySchedule[dia.clave].turno ? (
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "white",
                            border: `2px solid ${
                              weeklySchedule[dia.clave].turno.color
                            }30`,
                            borderLeft: `4px solid ${
                              weeklySchedule[dia.clave].turno.color
                            }`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color: weeklySchedule[dia.clave].turno.color,
                                fontWeight: 600,
                              }}
                            >
                              {weeklySchedule[dia.clave].turno.nombre}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeShiftFromDay(dia.clave)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Hora Inicio"
                                type="time"
                                value={
                                  weeklySchedule[dia.clave].turno.horaInicio
                                }
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Hora Final"
                                type="time"
                                value={
                                  weeklySchedule[dia.clave].turno.horaFinal
                                }
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            No hay turno asignado para este día
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {Object.values(plantillasTurnos).map(
                              (plantilla) => (
                                <Button
                                  key={plantilla.id}
                                  size="small"
                                  variant="outlined"
                                  startIcon={plantilla.icono}
                                  onClick={() =>
                                    addShiftToDay(dia.clave, plantilla.id)
                                  }
                                  sx={{
                                    borderColor: plantilla.color,
                                    color: plantilla.color,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {plantilla.nombre}
                                </Button>
                              )
                            )}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}

                  {!weeklySchedule[dia.clave].activo && (
                    <Box sx={{ textAlign: "center", py: 2, opacity: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Día de descanso
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Vista resumen en tabla */}
              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h6"
                sx={{ mb: 2, color: farmaColors.secondary }}
              >
                Resumen Semanal
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 600, color: farmaColors.secondary }}
                      >
                        Día
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: farmaColors.secondary }}
                      >
                        Estado
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: farmaColors.secondary }}
                      >
                        Turno
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: farmaColors.secondary }}
                      >
                        Horario
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: farmaColors.secondary }}
                      >
                        Horas
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diasSemana.map((dia) => {
                      const horarioDia = weeklySchedule[dia.clave];

                      let horasDia = 0;
                      if (horarioDia.activo && horarioDia.turno) {
                        const [hI, mI] = horarioDia.turno.horaInicio
                          .split(":")
                          .map(Number);
                        const [hF, mF] = horarioDia.turno.horaFinal
                          .split(":")
                          .map(Number);
                        let minI = hI * 60 + mI;
                        let minF = hF * 60 + mF;
                        if (minF < minI) minF += 24 * 60;
                        horasDia = (minF - minI) / 60;
                      }

                      return (
                        <TableRow key={dia.clave}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {dia.corto}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={horarioDia.activo ? "Activo" : "Descanso"}
                              size="small"
                              color={horarioDia.activo ? "success" : "default"}
                            />
                          </TableCell>
                          <TableCell>
                            {horarioDia.turno ? (
                              <Chip
                                label={horarioDia.turno.nombre}
                                size="small"
                                sx={{
                                  bgcolor: horarioDia.turno.color + "20",
                                  color: horarioDia.turno.color,
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {horarioDia.turno ? (
                              <Typography variant="caption">
                                {horarioDia.turno.horaInicio} -{" "}
                                {horarioDia.turno.horaFinal}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{ color: farmaColors.primary }}
                            >
                              {horasDia.toFixed(1)}h
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Botones de acción */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={onCancel}
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
                  onClick={handleSaveSchedule}
                  disabled={
                    loading ||
                    !selectedUserId ||
                    !selectedSucursal_ID ||
                    !selectedEquipo_ID
                  }
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
                  {loading ? "Guardando..." : "Guardar Horarios"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssignSchedule;
