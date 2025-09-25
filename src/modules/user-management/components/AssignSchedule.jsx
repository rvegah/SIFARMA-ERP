// AssignSchedule.jsx - Interfaz mejorada para asignar horarios de trabajo

import React, { useState } from 'react';
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
  FormControlLabel,
  TextField,
  Divider,
  Avatar,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Schedule,
  Save,
  Cancel,
  AccessTime,
  Add,
  Delete,
  ContentCopy as Copy,
  WbSunny,
  NightsStay,
  WorkOutline
} from '@mui/icons-material';
import { useUsers } from '../context/UserContext';

// Configuración de días de la semana
const diasSemana = [
  { clave: 'lunes', nombre: 'Lunes', corto: 'LUN' },
  { clave: 'martes', nombre: 'Martes', corto: 'MAR' },
  { clave: 'miercoles', nombre: 'Miércoles', corto: 'MIE' },
  { clave: 'jueves', nombre: 'Jueves', corto: 'JUE' },
  { clave: 'viernes', nombre: 'Viernes', corto: 'VIE' },
  { clave: 'sabado', nombre: 'Sábado', corto: 'SAB' },
  { clave: 'domingo', nombre: 'Domingo', corto: 'DOM' }
];

// Turnos predefinidos
const plantillasTurnos = {
  manana: {
    nombre: 'Turno Mañana',
    icono: <WbSunny />,
    color: '#FF9800',
    horario: {
      inicio: '07:00',
      fin: '15:00',
      descanso: { inicio: '12:00', fin: '13:00' }
    }
  },
  tarde: {
    nombre: 'Turno Tarde',
    icono: <NightsStay />,
    color: '#3F51B5',
    horario: {
      inicio: '15:00',
      fin: '23:00',
      descanso: { inicio: '19:00', fin: '20:00' }
    }
  },
  completo: {
    nombre: 'Turno Completo',
    icono: <WorkOutline />,
    color: '#4CAF50',
    horario: {
      inicio: '08:00',
      fin: '18:00',
      descanso: { inicio: '12:00', fin: '14:00' }
    }
  },
  nocturno: {
    nombre: 'Turno Nocturno',
    icono: <NightsStay />,
    color: '#9C27B0',
    horario: {
      inicio: '22:00',
      fin: '06:00',
      descanso: { inicio: '02:00', fin: '03:00' }
    }
  }
};

const AssignSchedule = ({ onCancel }) => {
  const { selectedUser, users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
  
  // Estado inicial del horario semanal
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const initial = {};
    diasSemana.forEach(dia => {
      initial[dia.clave] = {
        activo: false,
        turnos: []
      };
    });
    return initial;
  });

  // Obtener usuario seleccionado
  const currentUser = users.find(u => u.id === parseInt(selectedUserId));

  // Agregar turno a un día específico
  const addShiftToDay = (claveDia, plantillaTurno = null) => {
    const nuevoTurno = plantillaTurno ? {
      id: Date.now(),
      ...plantillaTurno.horario,
      nombre: plantillaTurno.nombre,
      color: plantillaTurno.color
    } : {
      id: Date.now(),
      inicio: '09:00',
      fin: '17:00',
      descanso: { inicio: '12:00', fin: '13:00' },
      nombre: 'Turno Personalizado',
      color: '#6B7280'
    };

    setWeeklySchedule(prev => ({
      ...prev,
      [claveDia]: {
        ...prev[claveDia],
        activo: true,
        turnos: [...prev[claveDia].turnos, nuevoTurno]
      }
    }));
  };

  // Eliminar turno de un día
  const removeShiftFromDay = (claveDia, idTurno) => {
    setWeeklySchedule(prev => {
      const turnosActualizados = prev[claveDia].turnos.filter(turno => turno.id !== idTurno);
      return {
        ...prev,
        [claveDia]: {
          ...prev[claveDia],
          turnos: turnosActualizados,
          activo: turnosActualizados.length > 0
        }
      };
    });
  };

  // Actualizar turno específico
  const updateShift = (claveDia, idTurno, campo, valor) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [claveDia]: {
        ...prev[claveDia],
        turnos: prev[claveDia].turnos.map(turno =>
          turno.id === idTurno ? { ...turno, [campo]: valor } : turno
        )
      }
    }));
  };

  // Copiar horario de un día a otros días
  const copyDaySchedule = (diaOrigen) => {
    const horarioOrigen = weeklySchedule[diaOrigen];
    const diasSeleccionados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']; // Ejemplo: copiar a días laborales

    setWeeklySchedule(prev => {
      const actualizado = { ...prev };
      diasSeleccionados.forEach(dia => {
        if (dia !== diaOrigen) {
          actualizado[dia] = {
            activo: horarioOrigen.activo,
            turnos: horarioOrigen.turnos.map(turno => ({
              ...turno,
              id: Date.now() + Math.random()
            }))
          };
        }
      });
      return actualizado;
    });
  };

  // Alternar día activo/inactivo
  const toggleDay = (claveDia) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [claveDia]: {
        ...prev[claveDia],
        activo: !prev[claveDia].activo,
        turnos: !prev[claveDia].activo ? prev[claveDia].turnos : []
      }
    }));
  };

  // Calcular horas totales semanales
  const calculateWeeklyHours = () => {
    let totalHoras = 0;
    Object.values(weeklySchedule).forEach(dia => {
      if (dia.activo) {
        dia.turnos.forEach(turno => {
          const horaInicio = new Date(`2000-01-01 ${turno.inicio}`);
          const horaFin = new Date(`2000-01-01 ${turno.fin}`);
          const inicioDescanso = new Date(`2000-01-01 ${turno.descanso.inicio}`);
          const finDescanso = new Date(`2000-01-01 ${turno.descanso.fin}`);
          
          const horasTrabajo = (horaFin - horaInicio) / (1000 * 60 * 60);
          const horasDescanso = (finDescanso - inicioDescanso) / (1000 * 60 * 60);
          totalHoras += horasTrabajo - horasDescanso;
        });
      }
    });
    return totalHoras.toFixed(1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A202C', mb: 1 }}>
          HORARIOS DE TRABAJO
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configurar horarios y turnos de trabajo del personal
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel izquierdo: Selección y plantillas */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Usuario
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Seleccionar Usuario</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Seleccionar Usuario"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#2196f3' }}>
                          {user.nombreCompleto.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        {user.nombreCompleto}
                        <Chip label={user.rol} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {currentUser && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>{currentUser.nombreCompleto}</strong><br />
                    {currentUser.rol} - {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>
                Plantillas de Turno
              </Typography>
              
              {Object.entries(plantillasTurnos).map(([clave, plantilla]) => (
                <Button
                  key={clave}
                  fullWidth
                  variant="outlined"
                  startIcon={plantilla.icono}
                  sx={{ 
                    mb: 1, 
                    justifyContent: 'flex-start',
                    borderColor: plantilla.color,
                    color: plantilla.color,
                    '&:hover': {
                      bgcolor: `${plantilla.color}20`,
                      borderColor: plantilla.color
                    }
                  }}
                >
                  {plantilla.nombre}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Resumen semanal */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime />
                Resumen Semanal
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {calculateWeeklyHours()}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Horas totales semanales
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Días activos: {Object.values(weeklySchedule).filter(dia => dia.activo).length}/7
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  Total turnos: {Object.values(weeklySchedule).reduce((suma, dia) => suma + dia.turnos.length, 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel principal: Calendario semanal */}
        <Grid item xs={12} lg={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Configuración Semanal
              </Typography>

              {diasSemana.map((dia) => (
                <Paper key={dia.clave} sx={{ mb: 2, p: 2, bgcolor: weeklySchedule[dia.clave].activo ? '#f8f9fa' : '#fafafa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ minWidth: 100 }}>
                        {dia.nombre}
                      </Typography>
                      <Switch
                        checked={weeklySchedule[dia.clave].activo}
                        onChange={() => toggleDay(dia.clave)}
                        color="primary"
                      />
                      {weeklySchedule[dia.clave].activo && (
                        <Chip 
                          label={`${weeklySchedule[dia.clave].turnos.length} turno${weeklySchedule[dia.clave].turnos.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    
                    <Box>
                      {weeklySchedule[dia.clave].activo && (
                        <>
                          <Tooltip title="Copiar a días laborales">
                            <IconButton
                              size="small"
                              onClick={() => copyDaySchedule(dia.clave)}
                              sx={{ mr: 1 }}
                            >
                              <Copy />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => addShiftToDay(dia.clave)}
                          >
                            Agregar Turno
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {weeklySchedule[dia.clave].activo && (
                    <Grid container spacing={2}>
                      {weeklySchedule[dia.clave].turnos.map((turno, index) => (
                        <Grid item xs={12} key={turno.id}>
                          <Paper sx={{ p: 2, bgcolor: 'white', border: `2px solid ${turno.color}20` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ color: turno.color, fontWeight: 600 }}>
                                {turno.nombre}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeShiftFromDay(dia.clave, turno.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Hora Inicio"
                                  type="time"
                                  value={turno.inicio}
                                  onChange={(e) => updateShift(dia.clave, turno.id, 'inicio', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Hora Fin"
                                  type="time"
                                  value={turno.fin}
                                  onChange={(e) => updateShift(dia.clave, turno.id, 'fin', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Descanso Inicio"
                                  type="time"
                                  value={turno.descanso.inicio}
                                  onChange={(e) => updateShift(dia.clave, turno.id, 'descanso', { ...turno.descanso, inicio: e.target.value })}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Descanso Fin"
                                  type="time"
                                  value={turno.descanso.fin}
                                  onChange={(e) => updateShift(dia.clave, turno.id, 'descanso', { ...turno.descanso, fin: e.target.value })}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}

                      {weeklySchedule[dia.clave].turnos.length === 0 && (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              No hay turnos asignados para este día
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {Object.entries(plantillasTurnos).map(([clave, plantilla]) => (
                                <Button
                                  key={clave}
                                  size="small"
                                  variant="outlined"
                                  startIcon={plantilla.icono}
                                  onClick={() => addShiftToDay(dia.clave, plantilla)}
                                  sx={{ 
                                    borderColor: plantilla.color,
                                    color: plantilla.color,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {plantilla.nombre}
                                </Button>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {!weeklySchedule[dia.clave].activo && (
                    <Box sx={{ textAlign: 'center', py: 2, opacity: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Día de descanso
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Vista resumen en tabla */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen Semanal
              </Typography>
              
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Día</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Turnos</strong></TableCell>
                      <TableCell><strong>Horario</strong></TableCell>
                      <TableCell><strong>Horas</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diasSemana.map((dia) => {
                      const horarioDia = weeklySchedule[dia.clave];
                      const horasDia = horarioDia.activo ? horarioDia.turnos.reduce((suma, turno) => {
                        const horaInicio = new Date(`2000-01-01 ${turno.inicio}`);
                        const horaFin = new Date(`2000-01-01 ${turno.fin}`);
                        const inicioDescanso = new Date(`2000-01-01 ${turno.descanso.inicio}`);
                        const finDescanso = new Date(`2000-01-01 ${turno.descanso.fin}`);
                        
                        const horasTrabajo = (horaFin - horaInicio) / (1000 * 60 * 60);
                        const horasDescanso = (finDescanso - inicioDescanso) / (1000 * 60 * 60);
                        return suma + horasTrabajo - horasDescanso;
                      }, 0) : 0;

                      return (
                        <TableRow key={dia.clave}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {dia.corto}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={horarioDia.activo ? 'Activo' : 'Descanso'} 
                              size="small"
                              color={horarioDia.activo ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {horarioDia.turnos.length} turno{horarioDia.turnos.length !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {horarioDia.turnos.map((turno, index) => (
                              <Typography key={turno.id} variant="caption" sx={{ display: 'block' }}>
                                {turno.inicio} - {turno.fin}
                                {index < horarioDia.turnos.length - 1 && ', '}
                              </Typography>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  startIcon={<Cancel />}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  sx={{
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' }
                  }}
                >
                  Guardar Horario
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