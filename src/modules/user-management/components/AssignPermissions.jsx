// src/modules/user-management/components/AssignPermissions.jsx
// VERSIÓN FINAL CORREGIDA - Con subopciones, plantillas dinámicas y carga completa de permisos

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
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Alert,
  Switch,
  Avatar,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore,
  Person,
  Save,
  Cancel,
  CheckCircle,
  SelectAll,
  ClearAll as DeselectAll,
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";

// ========================================
// CONSTANTES
// ========================================
const ROLES_ORDER = [
  "Administrador",
  "Contador",
  "Farmacéutico",
  "Vendedor",
  "Bioquimico",
  "Supervisor",
  "Laboratorista",
];

const EXCLUDED_ROLES = ["SISTEMAS", "Sistemas", "IMPUESTOS", "Impuestos"];

const AssignPermissions = ({ onCancel }) => {
  const {
    users,
    sucursales,
    roles,
    loading,
    selectedUser,
    getMenuEstructura,
    getRoleTemplatePermissionsReal,
    saveUserPermissionsReal,
    codigoEmpleado,
  } = useUsers();

  // ========================================
  // ESTADOS
  // ========================================
  const [selectedUserId, setSelectedUserId] = useState(""); // ← Inicializa vacío
  const [selectedSucursalId, setSelectedSucursalId] = useState("");
  const [selectedRolId, setSelectedRolId] = useState("");
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [menuStructure, setMenuStructure] = useState([]);
  const [expandedPanels, setExpandedPanels] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoleName, setPendingRoleName] = useState("");

  const currentUser = users.find((u) => u.id === parseInt(selectedUserId));

  // ✅ Y el useEffect de la línea 81 se encargará de setear el usuario
  useEffect(() => {
    if (selectedUser?.id && selectedUserId === "") {
      console.log(
        "🎯 Auto-seleccionando usuario:",
        selectedUser.nombreCompleto
      );
      setSelectedUserId(selectedUser.id.toString());
      setSelectedSucursalId(selectedUser.sucursal_ID || "");
      setSelectedRolId(selectedUser.rol_ID || "");

      if (selectedUser.rol) {
        handleUserChange({ target: { value: selectedUser.id.toString() } });
      }
    }
  }, [selectedUser]);

  // ========================================
  // CARGAR PERMISOS ACTUALES DEL USUARIO
  // ========================================
  const loadUserPermissions = async (usuarioId) => {
    try {
      setLoadingMenu(true);
      console.log(`📡 Cargando permisos para usuario ID ${usuarioId}...`);

      const menuData = await getMenuEstructura(usuarioId);

      console.log(
        "🔍 DATOS CRUDOS DEL API:",
        JSON.stringify(menuData, null, 2)
      );

      // ✅ NORMALIZAR estructura del API a formato esperado
      const normalizedData = menuData.map((modulo) => ({
        opcion_ID: modulo.codigoOpcion_ID || modulo.opcion_ID,
        nombreOpcion: modulo.nombreOpcion,
        descripcion: modulo.descripcion,
        estado: modulo.estado, // ✅ SIN valor por defecto
        opcionesSubMenu: (
          modulo.subOpcionesMenu ||
          modulo.opcionesSubMenu ||
          []
        ).map((sub) => ({
          opcion_ID: sub.codigoOpcion_ID || sub.opcion_ID,
          nombreOpcion: sub.nombreOpcion,
          descripcion: sub.descripcion,
          estado: sub.estado, // ✅ SIN valor por defecto
        })),
      }));

      console.log(
        "🔍 DATOS NORMALIZADOS:",
        JSON.stringify(normalizedData, null, 2)
      );

      setMenuStructure(normalizedData);

      // ✅ Extraer permisos ACTIVOS (estado === "ACT")
      const activePermissionIds = new Set();

      normalizedData.forEach((modulo) => {
        console.log(
          `📋 Módulo: ${modulo.nombreOpcion}, Estado: ${modulo.estado}`
        );
        if (modulo.estado === "ACT") {
          activePermissionIds.add(modulo.opcion_ID);
          console.log(`  ✅ Agregado módulo ID ${modulo.opcion_ID}`);
        }

        if (modulo.opcionesSubMenu && Array.isArray(modulo.opcionesSubMenu)) {
          modulo.opcionesSubMenu.forEach((subOpcion) => {
            console.log(
              `  📄 Subopción: ${subOpcion.nombreOpcion}, Estado: ${subOpcion.estado}`
            );
            if (subOpcion.estado === "ACT") {
              activePermissionIds.add(subOpcion.opcion_ID);
              console.log(
                `    ✅ Agregado subopción ID ${subOpcion.opcion_ID}`
              );
            }
          });
        }
      });

      setUserPermissions(activePermissionIds);
      setHasChanges(false);
      console.log(
        `✅ ${
          activePermissionIds.size
        } permisos activos cargados (de ${getTotalPermissions(
          normalizedData
        )} totales)`
      );
      console.log("🔍 IDs ACTIVOS:", Array.from(activePermissionIds));
    } catch (error) {
      console.error("❌ Error cargando permisos:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Nueva función que solo carga la estructura, no los permisos
  const loadMenuStructureOnly = async (usuarioId) => {
    try {
      setLoadingMenu(true);
      const menuData = await getMenuEstructura(usuarioId);

      const normalizedData = menuData.map((modulo) => ({
        opcion_ID: modulo.codigoOpcion_ID || modulo.opcion_ID,
        nombreOpcion: modulo.nombreOpcion,
        descripcion: modulo.descripcion,
        estado: modulo.estado,
        opcionesSubMenu: (
          modulo.subOpcionesMenu ||
          modulo.opcionesSubMenu ||
          []
        ).map((sub) => ({
          opcion_ID: sub.codigoOpcion_ID || sub.opcion_ID,
          nombreOpcion: sub.nombreOpcion,
          descripcion: sub.descripcion,
          estado: sub.estado,
        })),
      }));

      setMenuStructure(normalizedData);
      // ✅ NO tocar userPermissions aquí
    } catch (error) {
      console.error("❌ Error cargando estructura:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // ========================================
  // CALCULAR TOTAL DE PERMISOS
  // ========================================
  const getTotalPermissions = (menuData) => {
    return menuData.reduce((sum, modulo) => {
      let count = 1; // El módulo principal
      if (modulo.opcionesSubMenu) {
        count += modulo.opcionesSubMenu.length;
      }
      return sum + count;
    }, 0);
  };

  // ========================================
  // MANEJO DE CAMBIO DE USUARIO
  // ========================================
  const handleUserChange = async (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);

    const user = users.find((u) => u.id === parseInt(userId));
    if (user) {
      setSelectedSucursalId(user.sucursal_ID || "");
      setSelectedRolId(user.rol_ID || "");

      if (user.rol) {
        // 1️⃣ Primero cargar la plantilla de permisos
        await applyRoleTemplate(user.rol);

        // 2️⃣ Luego cargar la estructura del menú (sin sobrescribir permisos)
        await loadMenuStructureOnly(userId);
      }
    }
  };

  // ========================================
  // APLICAR PLANTILLA DE ROL
  // ========================================
  // ✅ NUEVA VERSIÓN con Dialog elegante
  const applyRoleTemplate = async (nombreRol) => {
    // Abrir dialog de confirmación
    setPendingRoleName(nombreRol);
    setConfirmDialogOpen(true);
  };

  const handleConfirmApplyTemplate = async () => {
    setConfirmDialogOpen(false);

    try {
      console.log(`🔄 Aplicando plantilla de rol: ${pendingRoleName}`);
      const templatePermissions = await getRoleTemplatePermissionsReal(
        pendingRoleName
      );

      setUserPermissions(new Set(templatePermissions));

      // ✅ ACTUALIZAR el rol_ID cuando se aplica una plantilla
      const rolSeleccionado = roles.find(
        (r) => r.nombre_Rol === pendingRoleName
      );
      if (rolSeleccionado) {
        setSelectedRolId(rolSeleccionado.rol_ID);
        console.log(
          `✅ Rol actualizado a: ${pendingRoleName} (ID: ${rolSeleccionado.rol_ID})`
        );
      }

      setHasChanges(true);
      console.log(
        `✅ Plantilla aplicada: ${templatePermissions.length} permisos`
      );
    } catch (error) {
      console.error("❌ Error aplicando plantilla:", error);
    }
  };

  const handleCancelApplyTemplate = () => {
    setConfirmDialogOpen(false);
    setPendingRoleName("");
  };

  // ========================================
  // ALTERNAR PERMISO INDIVIDUAL
  // ========================================
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

  // ========================================
  // ALTERNAR MÓDULO COMPLETO
  // ========================================
  const toggleModulePermissions = (modulo) => {
    const modulePermissions = [];

    if (modulo.opcion_ID) {
      modulePermissions.push(modulo.opcion_ID);
    }

    if (modulo.opcionesSubMenu && Array.isArray(modulo.opcionesSubMenu)) {
      modulo.opcionesSubMenu.forEach((sub) => {
        if (sub.opcion_ID) {
          modulePermissions.push(sub.opcion_ID);
        }
      });
    }

    const allSelected = modulePermissions.every((p) => userPermissions.has(p));

    const newPermissions = new Set(userPermissions);
    if (allSelected) {
      modulePermissions.forEach((p) => newPermissions.delete(p));
    } else {
      modulePermissions.forEach((p) => newPermissions.add(p));
    }
    setUserPermissions(newPermissions);
    setHasChanges(true);
  };

  // ========================================
  // ALTERNAR PANEL EXPANDIDO
  // ========================================
  const togglePanel = (panelId) => {
    setExpandedPanels((prev) =>
      prev.includes(panelId)
        ? prev.filter((p) => p !== panelId)
        : [...prev, panelId]
    );
  };

  // ========================================
  // ESTADÍSTICAS
  // ========================================
  const totalPermissions = getTotalPermissions(menuStructure);
  const selectedPermissions = userPermissions.size;

  // ========================================
  // GUARDAR PERMISOS
  // ========================================
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      window.alert("Por favor seleccione un usuario");
      return;
    }

    if (!selectedSucursalId) {
      window.alert("Por favor seleccione una sucursal");
      return;
    }

    const permisoIDs = Array.from(userPermissions);
    const usuario_ID = parseInt(selectedUserId);
    const rol_ID = selectedRolId || currentUser?.rol_ID;
    const sucursal_ID = parseInt(selectedSucursalId);
    const codigoEmpleadoAlta = codigoEmpleado || "SYSTEM";

    const success = await saveUserPermissionsReal({
      usuario_ID,
      rol_ID,
      sucursal_ID,
      permisoIDs,
      codigoEmpleadoAlta,
    });

    if (success) {
      setHasChanges(false);
      window.alert(
        "✅ Permisos guardados correctamente.\n\nLos cambios se aplicarán en el próximo inicio de sesión del usuario."
      );
    }
  };

  // ========================================
  // FILTRAR Y ORDENAR ROLES
  // ========================================
  const filteredRoles = roles
    .filter((r) => !EXCLUDED_ROLES.includes(r.nombre_Rol))
    .sort((a, b) => {
      const indexA = ROLES_ORDER.indexOf(a.nombre_Rol);
      const indexB = ROLES_ORDER.indexOf(b.nombre_Rol);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

  // ========================================
  // RENDERIZADO
  // ========================================
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#f3e5f5",
          borderLeft: `4px solid ${farmaColors.secondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#1A202C", mb: 1 }}
        >
          ASIGNAR PERMISOS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestionar permisos y roles de usuario
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* ========================================
            PANEL IZQUIERDO
            ======================================== */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Person />
                Seleccionar Usuario
              </Typography>

              {/* Selector de usuario */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={handleUserChange}
                  label="Usuario"
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
                            bgcolor: farmaColors.primary,
                          }}
                        >
                          {user.avatar ||
                            user.nombreCompleto
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                        </Avatar>
                        {user.nombreCompleto}
                        <Chip label={user.rol} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selector de sucursal */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={selectedSucursalId}
                  onChange={(e) => {
                    setSelectedSucursalId(e.target.value);
                    setHasChanges(true);
                  }}
                  label="Sucursal"
                  disabled={!selectedUserId}
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem
                      key={sucursal.sucursal_ID}
                      value={sucursal.sucursal_ID}
                    >
                      {sucursal.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Info del usuario */}
              {currentUser && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Usuario:</strong> {currentUser.nombreCompleto}
                    <br />
                    <strong>Rol:</strong> {currentUser.rol}
                    <br />
                    <strong>Sucursal:</strong> {currentUser.sucursal}
                  </Typography>
                </Alert>
              )}

              {hasChanges && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Hay cambios sin guardar
                </Alert>
              )}

              {/* Plantillas de roles */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Plantillas de Roles
              </Typography>

              {filteredRoles.length === 0 ? (
                <Alert severity="info">No hay roles disponibles</Alert>
              ) : (
                filteredRoles.map((role) => (
                  <Button
                    key={role.rol_ID}
                    fullWidth
                    variant="outlined"
                    onClick={() => applyRoleTemplate(role.nombre_Rol)}
                    disabled={!selectedUserId}
                    sx={{
                      mb: 1,
                      justifyContent: "flex-start",
                      "&:hover": {
                        bgcolor: farmaColors.alpha.primary10,
                      },
                    }}
                  >
                    {role.nombre_Rol}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Permisos seleccionados:</Typography>
                <Badge badgeContent={selectedPermissions} color="primary">
                  <CheckCircle color="action" />
                </Badge>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Total permisos:</Typography>
                <Typography variant="body2">{totalPermissions}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ========================================
            PANEL DERECHO: PERMISOS
            ======================================== */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Permisos por Módulo</Typography>
                <Box>
                  <Button
                    startIcon={<SelectAll />}
                    size="small"
                    onClick={() => {
                      const allPermissions = new Set();
                      menuStructure.forEach((modulo) => {
                        if (modulo.opcion_ID)
                          allPermissions.add(modulo.opcion_ID);
                        if (modulo.opcionesSubMenu) {
                          modulo.opcionesSubMenu.forEach((sub) => {
                            if (sub.opcion_ID)
                              allPermissions.add(sub.opcion_ID);
                          });
                        }
                      });
                      setUserPermissions(allPermissions);
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

              {loadingMenu ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {menuStructure.map((modulo, index) => {
                    const modulePermissions = [];
                    if (modulo.opcion_ID)
                      modulePermissions.push(modulo.opcion_ID);
                    if (modulo.opcionesSubMenu) {
                      modulo.opcionesSubMenu.forEach((sub) => {
                        if (sub.opcion_ID)
                          modulePermissions.push(sub.opcion_ID);
                      });
                    }

                    const selectedCount = modulePermissions.filter((p) =>
                      userPermissions.has(p)
                    ).length;
                    const isExpanded = expandedPanels.includes(
                      modulo.opcion_ID
                    );

                    return (
                      <Accordion
                        key={`modulo-${modulo.opcion_ID}-${index}`}
                        expanded={isExpanded}
                        onChange={() => togglePanel(modulo.opcion_ID)}
                        sx={{ mb: 1 }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                              {modulo.nombreOpcion}
                            </Typography>
                            <Chip
                              label={`${selectedCount}/${modulePermissions.length}`}
                              size="small"
                              color={selectedCount > 0 ? "primary" : "default"}
                              sx={{ mr: 1 }}
                            />
                            <Switch
                              checked={
                                selectedCount === modulePermissions.length
                              }
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleModulePermissions(modulo);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={1}>
                            {/* Checkbox del módulo principal */}
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={userPermissions.has(
                                      modulo.opcion_ID
                                    )}
                                    onChange={() =>
                                      togglePermission(modulo.opcion_ID)
                                    }
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {modulo.nombreOpcion} (Módulo)
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {modulo.descripcion}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>

                            {/* ✅ SUBOPCIONES */}
                            {modulo.opcionesSubMenu &&
                              modulo.opcionesSubMenu.length > 0 &&
                              modulo.opcionesSubMenu.map(
                                (subOpcion, subIndex) => (
                                  <Grid
                                    item
                                    xs={12}
                                    key={`subopcion-${subOpcion.opcion_ID}-${subIndex}`}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={userPermissions.has(
                                            subOpcion.opcion_ID
                                          )}
                                          onChange={() =>
                                            togglePermission(
                                              subOpcion.opcion_ID
                                            )
                                          }
                                        />
                                      }
                                      label={
                                        <Box sx={{ ml: 2 }}>
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                          >
                                            {subOpcion.nombreOpcion}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {subOpcion.descripcion}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </Grid>
                                )
                              )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
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
              startIcon={<Save />}
              onClick={handleSavePermissions}
              disabled={!hasChanges || !selectedUserId || loading}
              sx={{
                background: farmaColors.gradients.primary,
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
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Guardar Permisos"
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog de confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelApplyTemplate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: farmaColors.secondary, fontWeight: 600 }}>
          ⚠️ ADVERTENCIA
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Está a punto de aplicar la plantilla de permisos del rol{" "}
            <strong>"{pendingRoleName}"</strong>.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: "error.main" }}>
            Esto <strong>REEMPLAZARÁ</strong> todos los permisos actuales del
            usuario.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            ¿Está seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancelApplyTemplate}
            variant="outlined"
            sx={{
              borderColor: farmaColors.secondary,
              color: farmaColors.secondary,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmApplyTemplate}
            variant="contained"
            sx={{
              background: farmaColors.gradients.primary,
            }}
            autoFocus
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignPermissions;
