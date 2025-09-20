// AssignPermissions.jsx - Interfaz mejorada para asignar permisos

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
    name: 'Usuarios',
    icon: '👥',
    color: '#4A5FFF',
    permissions: [
      { id: 'user_create', name: 'Nuevo Usuario', description: 'Crear nuevos usuarios' },
      { id: 'user_list', name: 'Lista de Usuarios', description: 'Ver lista de usuarios' },
      { id: 'user_edit', name: 'Editar Usuario', description: 'Modificar datos de usuarios' },
      { id: 'user_delete', name: 'Eliminar Usuario', description: 'Eliminar usuarios del sistema' },
      { id: 'user_permissions', name: 'Asignar Permisos', description: 'Gestionar permisos de usuarios' }
    ]
  },
  productos: {
    name: 'Productos',
    icon: '📦',
    color: '#10B981',
    permissions: [
      { id: 'product_view', name: 'Ver Productos', description: 'Consultar catálogo de productos' },
      { id: 'product_create', name: 'Agregar Producto', description: 'Añadir nuevos productos' },
      { id: 'product_edit', name: 'Editar Producto', description: 'Modificar información de productos' },
      { id: 'product_delete', name: 'Eliminar Producto', description: 'Eliminar productos del sistema' },
      { id: 'product_categories', name: 'Gestionar Categorías', description: 'Administrar categorías de productos' },
      { id: 'product_inventory', name: 'Control de Inventario', description: 'Gestionar stock y existencias' }
    ]
  },
  compras: {
    name: 'Compras',
    icon: '🛒',
    color: '#F59E0B',
    permissions: [
      { id: 'purchase_create', name: 'Nueva Compra', description: 'Registrar nuevas compras' },
      { id: 'purchase_edit', name: 'Editar Compras', description: 'Modificar compras existentes' },
      { id: 'purchase_exit', name: 'Nueva Salida', description: 'Registrar salidas de inventario' },
      { id: 'purchase_credit', name: 'Compras a Crédito', description: 'Gestionar compras a crédito' },
      { id: 'purchase_income', name: 'Ingresos del Día', description: 'Ver ingresos diarios' },
      { id: 'purchase_warehouse', name: 'Almacén Traspasos', description: 'Gestionar traspasos entre almacenes' },
      { id: 'purchase_orders', name: 'Órdenes de Compra', description: 'Crear y gestionar órdenes de compra' }
    ]
  },
  proveedor: {
    name: 'Proveedores',
    icon: '🏢',
    color: '#8B5CF6',
    permissions: [
      { id: 'supplier_create', name: 'Nuevo Proveedor', description: 'Registrar nuevos proveedores' },
      { id: 'supplier_edit', name: 'Editar Proveedor', description: 'Modificar datos de proveedores' },
      { id: 'supplier_view', name: 'Ver Proveedores', description: 'Consultar lista de proveedores' },
      { id: 'supplier_delete', name: 'Eliminar Proveedor', description: 'Eliminar proveedores del sistema' }
    ]
  },
  ventas: {
    name: 'Ventas',
    icon: '💰',
    color: '#EF4444',
    permissions: [
      { id: 'sale_create', name: 'Nueva Venta', description: 'Registrar nuevas ventas' },
      { id: 'sale_edit', name: 'Editar Venta', description: 'Modificar ventas existentes' },
      { id: 'sale_orders', name: 'Realizar Pedidos', description: 'Gestionar pedidos de clientes' },
      { id: 'sale_my_orders', name: 'Mis Pedidos', description: 'Ver mis pedidos personales' },
      { id: 'sale_cancel', name: 'Cancelar Ventas', description: 'Cancelar ventas realizadas' },
      { id: 'sale_refund', name: 'Devoluciones', description: 'Procesar devoluciones de productos' }
    ]
  },
  traspasos: {
    name: 'Traspasos',
    icon: '🔄',
    color: '#06B6D4',
    permissions: [
      { id: 'transfer_create', name: 'Nuevo Traspaso', description: 'Crear traspasos entre sucursales' },
      { id: 'transfer_approve', name: 'Aprobar Traspasos', description: 'Aprobar traspasos pendientes' },
      { id: 'transfer_receive', name: 'Recibir Traspasos', description: 'Confirmar recepción de traspasos' },
      { id: 'transfer_history', name: 'Historial Traspasos', description: 'Ver historial de traspasos' }
    ]
  },
  reportes: {
    name: 'Reportes',
    icon: '📊',
    color: '#8B5CF6',
    permissions: [
      { id: 'report_daily', name: 'Reporte Diario', description: 'Generar reportes diarios' },
      { id: 'report_monthly', name: 'Reporte Mensual', description: 'Generar reportes mensuales' },
      { id: 'report_products', name: 'Reporte Productos', description: 'Reportes de productos' },
      { id: 'report_sales', name: 'Reporte Ventas', description: 'Reportes de ventas' },
      { id: 'report_purchases', name: 'Reporte Compras', description: 'Reportes de compras' },
      { id: 'report_inventory', name: 'Inventario Diario', description: 'Control de inventario' },
      { id: 'report_expired', name: 'Productos Vencidos', description: 'Productos próximos a vencer' },
      { id: 'report_stock', name: 'Stock Almacenes', description: 'Estado de stock por almacén' },
      { id: 'report_branches', name: 'Reporte por Sucursales', description: 'Reportes específicos por sucursal' },
      { id: 'report_expired_products', name: 'Reporte Vencimientos', description: 'Productos próximos a vencer' },
      { id: 'report_categories', name: 'Reporte Categorías', description: 'Reportes por categorías de productos' },
      { id: 'report_suppliers', name: 'Reporte Proveedores', description: 'Reportes de proveedores' },
      { id: 'report_bestsellers', name: 'Productos más vendidos', description: 'Productos con mayor rotación' },
      { id: 'report_attendance', name: 'Reporte de Asistencia', description: 'Control de asistencia del personal' },
      { id: 'report_kardex', name: 'Kardex', description: 'Movimientos detallados de productos' },
      { id: 'report_orders', name: 'Reporte Pedidos', description: 'Estado de pedidos y órdenes' }
    ]
  },
  finanzas: {
    name: 'Finanzas',
    icon: '💳',
    color: '#059669',
    permissions: [
      { id: 'finance_daily_income', name: 'Ingresos del Día', description: 'Ver ingresos diarios' },
      { id: 'finance_monthly_income', name: 'Ingresos Mensuales', description: 'Ver ingresos mensuales' },
      { id: 'finance_expenses', name: 'Gastos', description: 'Gestionar gastos de la empresa' },
      { id: 'finance_cash_flow', name: 'Flujo de Caja', description: 'Control de flujo de efectivo' },
      { id: 'finance_accounts', name: 'Cuentas por Cobrar', description: 'Gestionar cuentas pendientes' },
      { id: 'finance_payments', name: 'Métodos de Pago', description: 'Configurar métodos de pago' }
    ]
  },
  clientes: {
    name: 'Clientes',
    icon: '👤',
    color: '#DC2626',
    permissions: [
      { id: 'customer_create', name: 'Nuevo Cliente', description: 'Registrar nuevos clientes' },
      { id: 'customer_edit', name: 'Editar Cliente', description: 'Modificar datos de clientes' },
      { id: 'customer_view', name: 'Ver Clientes', description: 'Consultar lista de clientes' },
      { id: 'customer_history', name: 'Historial Cliente', description: 'Ver historial de compras del cliente' },
      { id: 'customer_credit', name: 'Crédito Cliente', description: 'Gestionar créditos de clientes' }
    ]
  },
  laboratorio: {
    name: 'Laboratorio',
    icon: '🧪',
    color: '#7C3AED',
    permissions: [
      { id: 'lab_tests', name: 'Exámenes de Laboratorio', description: 'Gestionar exámenes médicos' },
      { id: 'lab_results', name: 'Resultados', description: 'Consultar y entregar resultados' },
      { id: 'lab_equipment', name: 'Equipos', description: 'Gestionar equipos de laboratorio' },
      { id: 'lab_samples', name: 'Muestras', description: 'Control de muestras médicas' },
      { id: 'lab_scheduling', name: 'Programación', description: 'Programar citas de laboratorio' }
    ]
  },
  farmacia: {
    name: 'Farmacia',
    icon: '💊',
    color: '#16A34A',
    permissions: [
      { id: 'pharmacy_prescriptions', name: 'Recetas Médicas', description: 'Gestionar recetas médicas' },
      { id: 'pharmacy_controlled', name: 'Medicamentos Controlados', description: 'Manejo de sustancias controladas' },
      { id: 'pharmacy_preparation', name: 'Preparaciones Magistrales', description: 'Preparar fórmulas magistrales' },
      { id: 'pharmacy_consultation', name: 'Consulta Farmacéutica', description: 'Brindar consultas farmacéuticas' },
      { id: 'pharmacy_inventory_control', name: 'Control Farmacéutico', description: 'Control específico de medicamentos' }
    ]
  },
  sistema: {
    name: 'Sistema',
    icon: '⚙️',
    color: '#6B7280',
    permissions: [
      { id: 'system_backup', name: 'Respaldos', description: 'Crear y restaurar respaldos' },
      { id: 'system_config', name: 'Configuración', description: 'Configurar parámetros del sistema' },
      { id: 'system_branches', name: 'Ordenar Sucursales', description: 'Gestionar sucursales' },
      { id: 'system_logs', name: 'Logs del Sistema', description: 'Ver registros del sistema' },
      { id: 'system_maintenance', name: 'Mantenimiento', description: 'Realizar mantenimiento del sistema' },
      { id: 'system_updates', name: 'Actualizaciones', description: 'Gestionar actualizaciones del sistema' },
      { id: 'system_security', name: 'Seguridad', description: 'Configurar parámetros de seguridad' },
      { id: 'system_database', name: 'Base de Datos', description: 'Administrar base de datos' }
    ]
  }
};

// Roles predefinidos con permisos típicos - ACTUALIZADO con nuevos módulos
const roleTemplates = {
  ADMIN: {
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: Object.keys(permissionsConfig).flatMap(module => 
      permissionsConfig[module].permissions.map(p => p.id)
    )
  },
  FARMACEUTICO: {
    name: 'Farmacéutico',
    description: 'Acceso a farmacia, ventas, productos e inventario',
    permissions: [
      // Productos
      'product_view', 'product_edit', 'product_inventory',
      // Ventas
      'sale_create', 'sale_orders', 'sale_refund',
      // Farmacia
      'pharmacy_prescriptions', 'pharmacy_controlled', 'pharmacy_preparation', 'pharmacy_consultation', 'pharmacy_inventory_control',
      // Clientes
      'customer_view', 'customer_history',
      // Reportes básicos
      'report_daily', 'report_inventory', 'report_expired', 'report_kardex'
    ]
  },
  VENDEDOR: {
    name: 'Vendedor',
    description: 'Acceso básico a ventas y productos',
    permissions: [
      // Productos (solo lectura)
      'product_view',
      // Ventas
      'sale_create', 'sale_my_orders',
      // Clientes
      'customer_create', 'customer_view', 'customer_history',
      // Reportes básicos
      'report_daily'
    ]
  },
  SUPERVISOR: {
    name: 'Supervisor',
    description: 'Acceso a reportes, supervisión y operaciones',
    permissions: [
      // Productos
      'product_view', 'product_edit',
      // Ventas
      'sale_create', 'sale_orders', 'sale_cancel',
      // Compras
      'purchase_create', 'purchase_edit',
      // Traspasos
      'transfer_create', 'transfer_approve', 'transfer_history',
      // Clientes
      'customer_view', 'customer_edit', 'customer_history', 'customer_credit',
      // Reportes avanzados
      'report_daily', 'report_monthly', 'report_sales', 'report_inventory', 'report_purchases', 'report_branches', 'report_attendance'
    ]
  },
  CONTADOR: {
    name: 'Contador',
    description: 'Acceso a finanzas, reportes contables y administrativos',
    permissions: [
      // Finanzas
      'finance_daily_income', 'finance_monthly_income', 'finance_expenses', 'finance_cash_flow', 'finance_accounts', 'finance_payments',
      // Reportes financieros
      'report_daily', 'report_monthly', 'report_sales', 'report_purchases', 'report_branches',
      // Proveedores
      'supplier_view',
      // Clientes (cuentas)
      'customer_view', 'customer_credit'
    ]
  },
  LABORATORISTA: {
    name: 'Laboratorista',
    description: 'Acceso específico para laboratorio médico',
    permissions: [
      // Laboratorio
      'lab_tests', 'lab_results', 'lab_equipment', 'lab_samples', 'lab_scheduling',
      // Clientes
      'customer_view', 'customer_history',
      // Reportes específicos
      'report_daily'
    ]
  }
};

const AssignPermissions = ({ onCancel }) => {
  const { selectedUser, users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [expandedPanels, setExpandedPanels] = useState(['usuarios']);

  // Obtener usuario seleccionado
  const currentUser = users.find(u => u.id === parseInt(selectedUserId));

  // Función para aplicar plantilla de rol
  const applyRoleTemplate = (roleKey) => {
    const template = roleTemplates[roleKey];
    if (template) {
      setUserPermissions(new Set(template.permissions));
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
  };

  // Función para alternar todos los permisos de un módulo
  const toggleModulePermissions = (moduleKey) => {
    const modulePermissions = permissionsConfig[moduleKey].permissions.map(p => p.id);
    const allSelected = modulePermissions.every(p => userPermissions.has(p));
    
    const newPermissions = new Set(userPermissions);
    if (allSelected) {
      modulePermissions.forEach(p => newPermissions.delete(p));
    } else {
      modulePermissions.forEach(p => newPermissions.add(p));
    }
    setUserPermissions(newPermissions);
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
    .reduce((sum, module) => sum + module.permissions.length, 0);
  const selectedPermissions = userPermissions.size;

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
                  {template.name}
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
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Permisos por Módulo
                </Typography>
                <Box>
                  <Button
                    startIcon={<SelectAll />}
                    size="small"
                    onClick={() => {
                      const allPermissions = Object.values(permissionsConfig)
                        .flatMap(module => module.permissions.map(p => p.id));
                      setUserPermissions(new Set(allPermissions));
                    }}
                  >
                    Todos
                  </Button>
                  <Button
                    startIcon={<DeselectAll />}
                    size="small"
                    onClick={() => setUserPermissions(new Set())}
                  >
                    Ninguno
                  </Button>
                </Box>
              </Box>

              {Object.entries(permissionsConfig).map(([moduleKey, module]) => {
                const modulePermissions = module.permissions.map(p => p.id);
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
                          {module.icon}
                        </Typography>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {module.name}
                        </Typography>
                        <Chip 
                          label={`${selectedCount}/${module.permissions.length}`}
                          size="small"
                          color={selectedCount > 0 ? 'primary' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        <Switch
                          checked={selectedCount === module.permissions.length}
                          indeterminate={selectedCount > 0 && selectedCount < module.permissions.length ? true : undefined}
                          onChange={() => toggleModulePermissions(moduleKey)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {module.permissions.map((permission) => (
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
                                    {permission.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
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
              sx={{
                bgcolor: '#9c27b0',
                '&:hover': { bgcolor: '#7b1fa2' }
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