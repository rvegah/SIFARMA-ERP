// AssignPermissions.jsx - Interfaz mejorada para asignar permisos

import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Alert,
  Divider,
  Switch,
  Avatar,
  Badge
} from '@mui/material';
import {
  ExpandMore,
  Person,
  Security,
  Save,
  Cancel,
  CheckCircle,
  RadioButtonUnchecked,
  SelectAll,
  ClearAll as DeselectAll
} from '@mui/icons-material';
import { useUsers } from '../context/UserContext';

// Configuración de módulos y permisos organizados por categorías - COMPLETA con 70+ permisos
const permissionsConfig = {
  usuarios: {
    nombre: 'Usuarios',
    icono: '👥',
    color: '#4A5FFF',
    permisos: [
      { id: 'usuario_crear', nombre: 'Nuevo Usuario', descripcion: 'Crear nuevos usuarios' },
      { id: 'usuario_lista', nombre: 'Lista de Usuarios', descripcion: 'Ver lista de usuarios' },
      { id: 'usuario_editar', nombre: 'Editar Usuario', descripcion: 'Modificar datos de usuarios' },
      { id: 'usuario_eliminar', nombre: 'Eliminar Usuario', descripcion: 'Eliminar usuarios del sistema' },
      { id: 'usuario_permisos', nombre: 'Asignar Permisos', descripcion: 'Gestionar permisos de usuarios' }
    ]
  },
  productos: {
    nombre: 'Productos',
    icono: '📦',
    color: '#10B981',
    permisos: [
      { id: 'producto_ver', nombre: 'Ver Productos', descripcion: 'Consultar catálogo de productos' },
      { id: 'producto_crear', nombre: 'Agregar Producto', descripcion: 'Añadir nuevos productos' },
      { id: 'producto_editar', nombre: 'Editar Producto', descripcion: 'Modificar información de productos' },
      { id: 'producto_eliminar', nombre: 'Eliminar Producto', descripcion: 'Eliminar productos del sistema' },
      { id: 'producto_categorias', nombre: 'Gestionar Categorías', descripcion: 'Administrar categorías de productos' },
      { id: 'producto_inventario', nombre: 'Control de Inventario', descripcion: 'Gestionar stock y existencias' }
    ]
  },
  compras: {
    nombre: 'Compras',
    icono: '🛒',
    color: '#F59E0B',
    permisos: [
      { id: 'compra_crear', nombre: 'Nueva Compra', descripcion: 'Registrar nuevas compras' },
      { id: 'compra_editar', nombre: 'Editar Compras', descripcion: 'Modificar compras existentes' },
      { id: 'compra_salida', nombre: 'Nueva Salida', descripcion: 'Registrar salidas de inventario' },
      { id: 'compra_credito', nombre: 'Compras a Crédito', descripcion: 'Gestionar compras a crédito' },
      { id: 'compra_ingresos', nombre: 'Ingresos del Día', descripcion: 'Ver ingresos diarios' },
      { id: 'compra_almacen', nombre: 'Almacén Traspasos', descripcion: 'Gestionar traspasos entre almacenes' },
      { id: 'compra_ordenes', nombre: 'Órdenes de Compra', descripcion: 'Crear y gestionar órdenes de compra' }
    ]
  },
  proveedor: {
    nombre: 'Proveedores',
    icono: '🏢',
    color: '#8B5CF6',
    permisos: [
      { id: 'proveedor_crear', nombre: 'Nuevo Proveedor', descripcion: 'Registrar nuevos proveedores' },
      { id: 'proveedor_editar', nombre: 'Editar Proveedor', descripcion: 'Modificar datos de proveedores' },
      { id: 'proveedor_ver', nombre: 'Ver Proveedores', descripcion: 'Consultar lista de proveedores' },
      { id: 'proveedor_eliminar', nombre: 'Eliminar Proveedor', descripcion: 'Eliminar proveedores del sistema' }
    ]
  },
  ventas: {
    nombre: 'Ventas',
    icono: '💰',
    color: '#EF4444',
    permisos: [
      { id: 'venta_crear', nombre: 'Nueva Venta', descripcion: 'Registrar nuevas ventas' },
      { id: 'venta_editar', nombre: 'Editar Venta', descripcion: 'Modificar ventas existentes' },
      { id: 'venta_pedidos', nombre: 'Realizar Pedidos', descripcion: 'Gestionar pedidos de clientes' },
      { id: 'venta_mis_pedidos', nombre: 'Mis Pedidos', descripcion: 'Ver mis pedidos personales' },
      { id: 'venta_cancelar', nombre: 'Cancelar Ventas', descripcion: 'Cancelar ventas realizadas' },
      { id: 'venta_devoluciones', nombre: 'Devoluciones', descripcion: 'Procesar devoluciones de productos' }
    ]
  },
  traspasos: {
    nombre: 'Traspasos',
    icono: '🔄',
    color: '#06B6D4',
    permisos: [
      { id: 'traspaso_crear', nombre: 'Nuevo Traspaso', descripcion: 'Crear traspasos entre sucursales' },
      { id: 'traspaso_aprobar', nombre: 'Aprobar Traspasos', descripcion: 'Aprobar traspasos pendientes' },
      { id: 'traspaso_recibir', nombre: 'Recibir Traspasos', descripcion: 'Confirmar recepción de traspasos' },
      { id: 'traspaso_historial', nombre: 'Historial Traspasos', descripcion: 'Ver historial de traspasos' }
    ]
  },
  reportes: {
    nombre: 'Reportes',
    icono: '📊',
    color: '#8B5CF6',
    permisos: [
      { id: 'reporte_diario', nombre: 'Reporte Diario', descripcion: 'Generar reportes diarios' },
      { id: 'reporte_mensual', nombre: 'Reporte Mensual', descripcion: 'Generar reportes mensuales' },
      { id: 'reporte_productos', nombre: 'Reporte Productos', descripcion: 'Reportes de productos' },
      { id: 'reporte_ventas', nombre: 'Reporte Ventas', descripcion: 'Reportes de ventas' },
      { id: 'reporte_compras', nombre: 'Reporte Compras', descripcion: 'Reportes de compras' },
      { id: 'reporte_inventario', nombre: 'Inventario Diario', descripcion: 'Control de inventario' },
      { id: 'reporte_vencidos', nombre: 'Productos Vencidos', descripcion: 'Productos próximos a vencer' },
      { id: 'reporte_stock', nombre: 'Stock Almacenes', descripcion: 'Estado de stock por almacén' },
      { id: 'reporte_sucursales', nombre: 'Reporte por Sucursales', descripcion: 'Reportes específicos por sucursal' },
      { id: 'reporte_productos_vencidos', nombre: 'Reporte Vencimientos', descripcion: 'Productos próximos a vencer' },
      { id: 'reporte_categorias', nombre: 'Reporte Categorías', descripcion: 'Reportes por categorías de productos' },
      { id: 'reporte_proveedores', nombre: 'Reporte Proveedores', descripcion: 'Reportes de proveedores' },
      { id: 'reporte_mas_vendidos', nombre: 'Productos más vendidos', descripcion: 'Productos con mayor rotación' },
      { id: 'reporte_asistencia', nombre: 'Reporte de Asistencia', descripcion: 'Control de asistencia del personal' },
      { id: 'reporte_kardex', nombre: 'Kardex', descripcion: 'Movimientos detallados de productos' },
      { id: 'reporte_pedidos', nombre: 'Reporte Pedidos', descripcion: 'Estado de pedidos y órdenes' }
    ]
  },
  finanzas: {
    nombre: 'Finanzas',
    icono: '💳',
    color: '#059669',
    permisos: [
      { id: 'finanzas_ingresos_diarios', nombre: 'Ingresos del Día', descripcion: 'Ver ingresos diarios' },
      { id: 'finanzas_ingresos_mensuales', nombre: 'Ingresos Mensuales', descripcion: 'Ver ingresos mensuales' },
      { id: 'finanzas_gastos', nombre: 'Gastos', descripcion: 'Gestionar gastos de la empresa' },
      { id: 'finanzas_flujo_caja', nombre: 'Flujo de Caja', descripcion: 'Control de flujo de efectivo' },
      { id: 'finanzas_cuentas', nombre: 'Cuentas por Cobrar', descripcion: 'Gestionar cuentas pendientes' },
      { id: 'finanzas_pagos', nombre: 'Métodos de Pago', descripcion: 'Configurar métodos de pago' }
    ]
  },
  clientes: {
    nombre: 'Clientes',
    icono: '👤',
    color: '#DC2626',
    permisos: [
      { id: 'cliente_crear', nombre: 'Nuevo Cliente', descripcion: 'Registrar nuevos clientes' },
      { id: 'cliente_editar', nombre: 'Editar Cliente', descripcion: 'Modificar datos de clientes' },
      { id: 'cliente_ver', nombre: 'Ver Clientes', descripcion: 'Consultar lista de clientes' },
      { id: 'cliente_historial', nombre: 'Historial Cliente', descripcion: 'Ver historial de compras del cliente' },
      { id: 'cliente_credito', nombre: 'Crédito Cliente', descripcion: 'Gestionar créditos de clientes' }
    ]
  },
  laboratorio: {
    nombre: 'Laboratorio',
    icono: '🧪',
    color: '#7C3AED',
    permisos: [
      { id: 'laboratorio_examenes', nombre: 'Exámenes de Laboratorio', descripcion: 'Gestionar exámenes médicos' },
      { id: 'laboratorio_resultados', nombre: 'Resultados', descripcion: 'Consultar y entregar resultados' },
      { id: 'laboratorio_equipos', nombre: 'Equipos', descripcion: 'Gestionar equipos de laboratorio' },
      { id: 'laboratorio_muestras', nombre: 'Muestras', descripcion: 'Control de muestras médicas' },
      { id: 'laboratorio_programacion', nombre: 'Programación', descripcion: 'Programar citas de laboratorio' }
    ]
  },
  farmacia: {
    nombre: 'Farmacia',
    icono: '💊',
    color: '#16A34A',
    permisos: [
      { id: 'farmacia_recetas', nombre: 'Recetas Médicas', descripcion: 'Gestionar recetas médicas' },
      { id: 'farmacia_controlados', nombre: 'Medicamentos Controlados', descripcion: 'Manejo de sustancias controladas' },
      { id: 'farmacia_preparaciones', nombre: 'Preparaciones Magistrales', descripcion: 'Preparar fórmulas magistrales' },
      { id: 'farmacia_consulta', nombre: 'Consulta Farmacéutica', descripcion: 'Brindar consultas farmacéuticas' },
      { id: 'farmacia_control_inventario', nombre: 'Control Farmacéutico', descripcion: 'Control específico de medicamentos' }
    ]
  },
  sistema: {
    nombre: 'Sistema',
    icono: '⚙️',
    color: '#6B7280',
    permisos: [
      { id: 'sistema_respaldos', nombre: 'Respaldos', descripcion: 'Crear y restaurar respaldos' },
      { id: 'sistema_configuracion', nombre: 'Configuración', descripcion: 'Configurar parámetros del sistema' },
      { id: 'sistema_sucursales', nombre: 'Ordenar Sucursales', descripcion: 'Gestionar sucursales' },
      { id: 'sistema_logs', nombre: 'Logs del Sistema', descripcion: 'Ver registros del sistema' },
      { id: 'sistema_mantenimiento', nombre: 'Mantenimiento', descripcion: 'Realizar mantenimiento del sistema' },
      { id: 'sistema_actualizaciones', nombre: 'Actualizaciones', descripcion: 'Gestionar actualizaciones del sistema' },
      { id: 'sistema_seguridad', nombre: 'Seguridad', descripcion: 'Configurar parámetros de seguridad' },
      { id: 'sistema_base_datos', nombre: 'Base de Datos', descripcion: 'Administrar base de datos' }
    ]
  }
};

// Roles predefinidos con permisos típicos - ACTUALIZADO con nuevos módulos
const roleTemplates = {
  ADMIN: {
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permisos: Object.keys(permissionsConfig).flatMap(module => 
      permissionsConfig[module].permisos.map(p => p.id)
    )
  },
  FARMACEUTICO: {
    nombre: 'Farmacéutico',
    descripcion: 'Acceso a farmacia, ventas, productos e inventario',
    permisos: [
      'producto_ver', 'producto_editar', 'producto_inventario',
      'venta_crear', 'venta_pedidos', 'venta_devoluciones',
      'farmacia_recetas', 'farmacia_controlados', 'farmacia_preparaciones', 'farmacia_consulta', 'farmacia_control_inventario',
      'cliente_ver', 'cliente_historial',
      'reporte_diario', 'reporte_inventario', 'reporte_vencidos', 'reporte_kardex'
    ]
  },
  VENDEDOR: {
    nombre: 'Vendedor',
    descripcion: 'Acceso básico a ventas y productos',
    permisos: [
      'producto_ver',
      'venta_crear', 'venta_mis_pedidos',
      'cliente_crear', 'cliente_ver', 'cliente_historial',
      'reporte_diario'
    ]
  },
  SUPERVISOR: {
    nombre: 'Supervisor',
    descripcion: 'Acceso a reportes, supervisión y operaciones',
    permisos: [
      'producto_ver', 'producto_editar',
      'venta_crear', 'venta_pedidos', 'venta_cancelar',
      'compra_crear', 'compra_editar',
      'traspaso_crear', 'traspaso_aprobar', 'traspaso_historial',
      'cliente_ver', 'cliente_editar', 'cliente_historial', 'cliente_credito',
      'reporte_diario', 'reporte_mensual', 'reporte_ventas', 'reporte_inventario', 'reporte_compras', 'reporte_sucursales', 'reporte_asistencia'
    ]
  },
  CONTADOR: {
    nombre: 'Contador',
    descripcion: 'Acceso a finanzas, reportes contables y administrativos',
    permisos: [
      'finanzas_ingresos_diarios', 'finanzas_ingresos_mensuales', 'finanzas_gastos', 'finanzas_flujo_caja', 'finanzas_cuentas', 'finanzas_pagos',
      'reporte_diario', 'reporte_mensual', 'reporte_ventas', 'reporte_compras', 'reporte_sucursales',
      'proveedor_ver',
      'cliente_ver', 'cliente_credito'
    ]
  },
  LABORATORISTA: {
    nombre: 'Laboratorista',
    descripcion: 'Acceso específico para laboratorio médico',
    permisos: [
      'laboratorio_examenes', 'laboratorio_resultados', 'laboratorio_equipos', 'laboratorio_muestras', 'laboratorio_programacion',
      'cliente_ver', 'cliente_historial',
      'reporte_diario'
    ]
  }
};

const AssignPermissions = ({ onCancel }) => {
  const { selectedUser, users, updateUserPermissions, getUserPermissions } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [expandedPanels, setExpandedPanels] = useState(['usuarios']);
  const [hasChanges, setHasChanges] = useState(false);

  // Obtener usuario seleccionado
  const currentUser = users.find(u => u.id === parseInt(selectedUserId));

  // Cargar permisos cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      const permissions = getUserPermissions(parseInt(selectedUserId));
      setUserPermissions(new Set(permissions));
      setHasChanges(false);
    }
  }, [selectedUserId, getUserPermissions]);

  // Función para aplicar plantilla de rol
  const applyRoleTemplate = (roleKey) => {
    const template = roleTemplates[roleKey];
    if (template) {
      setUserPermissions(new Set(template.permisos));
      setHasChanges(true);
    }
  };

  // Función para alternar permiso individual
  const togglePermission = (permissionId) => {
    const newPermissions = new Set(userPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setUserPermissions(newPermissions);
    setHasChanges(true);
  };

  // Función para alternar todos los permisos de un módulo
  const toggleModulePermissions = (moduleKey) => {
    const modulePermissions = permissionsConfig[moduleKey].permisos.map(p => p.id);
    const allSelected = modulePermissions.every(p => userPermissions.has(p));
    
    const newPermissions = new Set(userPermissions);
    if (allSelected) {
      modulePermissions.forEach(p => newPermissions.delete(p));
    } else {
      modulePermissions.forEach(p => newPermissions.add(p));
    }
    setUserPermissions(newPermissions);
    setHasChanges(true);
  };

  // Función para alternar panel expandido
  const togglePanel = (panel) => {
    setExpandedPanels(prev => 
      prev.includes(panel) 
        ? prev.filter(p => p !== panel)
        : [...prev, panel]
    );
  };

  // Calcular estadísticas de permisos
  const totalPermissions = Object.values(permissionsConfig)
    .reduce((sum, module) => sum + module.permisos.length, 0);
  const selectedPermissions = userPermissions.size;

  // Función para guardar permisos
  const handleSavePermissions = () => {
    if (!selectedUserId) {
      alert('Por favor seleccione un usuario');
      return;
    }

    const permissionsArray = Array.from(userPermissions);
    const success = updateUserPermissions(parseInt(selectedUserId), permissionsArray);
    
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A202C', mb: 1 }}>
          ASIGNAR PERMISOS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestionar permisos y roles de usuario
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Panel izquierdo: Selección de usuario y plantillas */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Seleccionar Usuario
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Usuario"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#4A5FFF' }}>
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
                    <strong>Usuario:</strong> {currentUser.nombreCompleto}<br />
                    <strong>Rol:</strong> {currentUser.rol}<br />
                    <strong>Sucursal:</strong> {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              {hasChanges && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Hay cambios sin guardar
                </Alert>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>
                Plantillas de Roles
              </Typography>
              
              {Object.entries(roleTemplates).map(([roleKey, template]) => (
                <Button
                  key={roleKey}
                  fullWidth
                  variant="outlined"
                  onClick={() => applyRoleTemplate(roleKey)}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  {template.nombre}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Resumen de permisos */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Permisos seleccionados:</Typography>
                <Badge badgeContent={selectedPermissions} color="primary">
                  <CheckCircle color="action" />
                </Badge>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total permisos:</Typography>
                <Typography variant="body2">{totalPermissions}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel derecho: Permisos por módulos */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Permisos por Módulo
                </Typography>
                <Box>
                  <Button
                    startIcon={<SelectAll />}
                    size="small"
                    onClick={() => {
                      const allPermissions = Object.values(permissionsConfig)
                        .flatMap(module => module.permisos.map(p => p.id));
                      setUserPermissions(new Set(allPermissions));
                      setHasChanges(true);
                    }}
                  >
                    Todos
                  </Button>
                  <Button
                    startIcon={<DeselectAll />}
                    size="small"
                    onClick={() => {
                      setUserPermissions(new Set());
                      setHasChanges(true);
                    }}
                  >
                    Ninguno
                  </Button>
                </Box>
              </Box>

              {Object.entries(permissionsConfig).map(([moduleKey, module]) => {
                const modulePermissions = module.permisos.map(p => p.id);
                const selectedCount = modulePermissions.filter(p => userPermissions.has(p)).length;
                const isExpanded = expandedPanels.includes(moduleKey);

                return (
                  <Accordion 
                    key={moduleKey} 
                    expanded={isExpanded}
                    onChange={() => togglePanel(moduleKey)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ mr: 2, fontSize: '1.2rem' }}>
                          {module.icono}
                        </Typography>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {module.nombre}
                        </Typography>
                        <Chip 
                          label={`${selectedCount}/${module.permisos.length}`}
                          size="small"
                          color={selectedCount > 0 ? 'primary' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        <Switch
                          checked={selectedCount === module.permisos.length}
                          indeterminate={selectedCount > 0 && selectedCount < module.permisos.length ? true : undefined}
                          onChange={() => toggleModulePermissions(moduleKey)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {module.permisos.map((permission) => (
                          <Grid item xs={12} key={permission.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={userPermissions.has(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {permission.nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.descripcion}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </CardContent>
          </Card>

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
              onClick={handleSavePermissions}
              disabled={!hasChanges || !selectedUserId}
              sx={{
                bgcolor: '#9c27b0',
                '&:hover': { bgcolor: '#7b1fa2' },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              Guardar Permisos
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssignPermissions;