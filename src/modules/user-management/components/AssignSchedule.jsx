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
const daysOfWeek = [
  { key: 'monday', name: 'Lunes', short: 'LUN' },
  { key: 'tuesday', name: 'Martes', short: 'MAR' },
  { key: 'wednesday', name: 'Miércoles', short: 'MIE' },
  { key: 'thursday', name: 'Jueves', short: 'JUE' },
  { key: 'friday', name: 'Viernes', short: 'VIE' },
  { key: 'saturday', name: 'Sábado', short: 'SAB' },
  { key: 'sunday', name: 'Domingo', short: 'DOM' }
];

// Turnos predefinidos
const shiftTemplates = {
  morning: {
    name: 'Turno Mañana',
    icon: <WbSunny />,
    color: '#FF9800',
    schedule: {
      start: '07:00',
      end: '15:00',
      break: { start: '12:00', end: '13:00' }
    }
  },
  afternoon: {
    name: 'Turno Tarde',
    icon: <NightsStay />,
    color: '#3F51B5',
    schedule: {
      start: '15:00',
      end: '23:00',
      break: { start: '19:00', end: '20:00' }
    }
  },
  full: {
    name: 'Turno Completo',
    icon: <WorkOutline />,
    color: '#4CAF50',
    schedule: {
      start: '08:00',
      end: '18:00',
      break: { start: '12:00', end: '14:00' }
    }
  },
  night: {
    name: 'Turno Nocturno',
    icon: <NightsStay />,
    color: '#9C27B0',
    schedule: {
      start: '22:00',
      end: '06:00',
      break: { start: '02:00', end: '03:00' }
    }
  }
};

const AssignSchedule = ({ onCancel }) => {
  const { selectedUser, users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
  
  // Estado inicial del horario semanal
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const initial = {};
    daysOfWeek.forEach(day => {
      initial[day.key] = {
        active: false,
        shifts: []
      };
    });
    return initial;
  });

  // Obtener usuario seleccionado
  const currentUser = users.find(u => u.id === parseInt(selectedUserId));

  // Agregar turno a un día específico
  const addShiftToDay = (dayKey, shiftTemplate = null) => {
    const newShift = shiftTemplate ? {
      id: Date.now(),
      ...shiftTemplate.schedule,
      name: shiftTemplate.name,
      color: shiftTemplate.color
    } : {
      id: Date.now(),
      start: '09:00',
      end: '17:00',
      break: { start: '12:00', end: '13:00' },
      name: 'Turno Personalizado',
      color: '#6B7280'
    };

    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: true,
        shifts: [...prev[dayKey].shifts, newShift]
      }
    }));
  };

  // Eliminar turno de un día
  const removeShiftFromDay = (dayKey, shiftId) => {
    setWeeklySchedule(prev => {
      const updatedShifts = prev[dayKey].shifts.filter(shift => shift.id !== shiftId);
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          shifts: updatedShifts,
          active: updatedShifts.length > 0
        }
      };
    });
  };

  // Actualizar turno específico
  const updateShift = (dayKey, shiftId, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        shifts: prev[dayKey].shifts.map(shift =>
          shift.id === shiftId ? { ...shift, [field]: value } : shift
        )
      }
    }));
  };

  // Copiar horario de un día a otros días
  const copyDaySchedule = (fromDay) => {
    const sourceSchedule = weeklySchedule[fromDay];
    const selectedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']; // Ejemplo: copiar a días laborales

    setWeeklySchedule(prev => {
      const updated = { ...prev };
      selectedDays.forEach(day => {
        if (day !== fromDay) {
          updated[day] = {
            active: sourceSchedule.active,
            shifts: sourceSchedule.shifts.map(shift => ({
              ...shift,
              id: Date.now() + Math.random()
            }))
          };
        }
      });
      return updated;
    });
  };

  // Alternar día activo/inactivo
  const toggleDay = (dayKey) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: !prev[dayKey].active,
        shifts: !prev[dayKey].active ? prev[dayKey].shifts : []
      }
    }));
  };

  // Calcular horas totales semanales
  const calculateWeeklyHours = () => {
    let totalHours = 0;
    Object.values(weeklySchedule).forEach(day => {
      if (day.active) {
        day.shifts.forEach(shift => {
          const startTime = new Date(`2000-01-01 ${shift.start}`);
          const endTime = new Date(`2000-01-01 ${shift.end}`);
          const breakStart = new Date(`2000-01-01 ${shift.break.start}`);
          const breakEnd = new Date(`2000-01-01 ${shift.break.end}`);
          
          const workHours = (endTime - startTime) / (1000 * 60 * 60);
          const breakHours = (breakEnd - breakStart) / (1000 * 60 * 60);
          totalHours += workHours - breakHours;
        });
      }
    });
    return totalHours.toFixed(1);
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
              
              {Object.entries(shiftTemplates).map(([key, template]) => (
                <Button
                  key={key}
                  fullWidth
                  variant="outlined"
                  startIcon={template.icon}
                  sx={{ 
                    mb: 1, 
                    justifyContent: 'flex-start',
                    borderColor: template.color,
                    color: template.color,
                    '&:hover': {
                      bgcolor: `${template.color}20`,
                      borderColor: template.color
                    }
                  }}
                >
                  {template.name}
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
                  Días activos: {Object.values(weeklySchedule).filter(day => day.active).length}/7
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  Total turnos: {Object.values(weeklySchedule).reduce((sum, day) => sum + day.shifts.length, 0)}
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

              {daysOfWeek.map((day) => (
                <Paper key={day.key} sx={{ mb: 2, p: 2, bgcolor: weeklySchedule[day.key].active ? '#f8f9fa' : '#fafafa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ minWidth: 100 }}>
                        {day.name}
                      </Typography>
                      <Switch
                        checked={weeklySchedule[day.key].active}
                        onChange={() => toggleDay(day.key)}
                        color="primary"
                      />
                      {weeklySchedule[day.key].active && (
                        <Chip 
                          label={`${weeklySchedule[day.key].shifts.length} turno${weeklySchedule[day.key].shifts.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    
                    <Box>
                      {weeklySchedule[day.key].active && (
                        <>
                          <Tooltip title="Copiar a días laborales">
                            <IconButton
                              size="small"
                              onClick={() => copyDaySchedule(day.key)}
                              sx={{ mr: 1 }}
                            >
                              <Copy />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => addShiftToDay(day.key)}
                          >
                            Agregar Turno
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {weeklySchedule[day.key].active && (
                    <Grid container spacing={2}>
                      {weeklySchedule[day.key].shifts.map((shift, index) => (
                        <Grid item xs={12} key={shift.id}>
                          <Paper sx={{ p: 2, bgcolor: 'white', border: `2px solid ${shift.color}20` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ color: shift.color, fontWeight: 600 }}>
                                {shift.name}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeShiftFromDay(day.key, shift.id)}
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
                                  value={shift.start}
                                  onChange={(e) => updateShift(day.key, shift.id, 'start', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Hora Fin"
                                  type="time"
                                  value={shift.end}
                                  onChange={(e) => updateShift(day.key, shift.id, 'end', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Descanso Inicio"
                                  type="time"
                                  value={shift.break.start}
                                  onChange={(e) => updateShift(day.key, shift.id, 'break', { ...shift.break, start: e.target.value })}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Descanso Fin"
                                  type="time"
                                  value={shift.break.end}
                                  onChange={(e) => updateShift(day.key, shift.id, 'break', { ...shift.break, end: e.target.value })}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}

                      {weeklySchedule[day.key].shifts.length === 0 && (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              No hay turnos asignados para este día
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {Object.entries(shiftTemplates).map(([key, template]) => (
                                <Button
                                  key={key}
                                  size="small"
                                  variant="outlined"
                                  startIcon={template.icon}
                                  onClick={() => addShiftToDay(day.key, template)}
                                  sx={{ 
                                    borderColor: template.color,
                                    color: template.color,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {template.name}
                                </Button>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {!weeklySchedule[day.key].active && (
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
                    {daysOfWeek.map((day) => {
                      const daySchedule = weeklySchedule[day.key];
                      const dayHours = daySchedule.active ? daySchedule.shifts.reduce((sum, shift) => {
                        const startTime = new Date(`2000-01-01 ${shift.start}`);
                        const endTime = new Date(`2000-01-01 ${shift.end}`);
                        const breakStart = new Date(`2000-01-01 ${shift.break.start}`);
                        const breakEnd = new Date(`2000-01-01 ${shift.break.end}`);
                        
                        const workHours = (endTime - startTime) / (1000 * 60 * 60);
                        const breakHours = (breakEnd - breakStart) / (1000 * 60 * 60);
                        return sum + workHours - breakHours;
                      }, 0) : 0;

                      return (
                        <TableRow key={day.key}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {day.short}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={daySchedule.active ? 'Activo' : 'Descanso'} 
                              size="small"
                              color={daySchedule.active ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {daySchedule.shifts.length} turno{daySchedule.shifts.length !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {daySchedule.shifts.map((shift, index) => (
                              <Typography key={shift.id} variant="caption" sx={{ display: 'block' }}>
                                {shift.start} - {shift.end}
                                {index < daySchedule.shifts.length - 1 && ', '}
                              </Typography>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {dayHours.toFixed(1)}h
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