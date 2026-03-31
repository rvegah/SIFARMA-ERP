// UserList.jsx - Componente con colores corporativos Farma Dinámica - Estandarizado
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Search,
  FilterList,
  Business,
  SupervisorAccount,
  AccessTime,
  VpnKey,
  Group,
} from "@mui/icons-material";
import { useUsers } from "../context/UserContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";

const UserList = ({
  onCreateUser,
  onEditUser,
  onAssignPermissions,
  onAssignSchedule,
}) => {
  const {
    filteredUsers,
    users,
    selectedTab,
    searchTerm,
    filterRole,
    currentUserSucursal,
    isAdmin,
    roles,
    handleTabChange,
    setSearchTerm,
    setFilterRole,
    handleDeleteUser,
    prepareEditUser,
    loadUsuarios,
    clearForm,
  } = useUsers();

  useEffect(() => {
    loadUsuarios(false);
  }, []);

  const handleEditClick = (user) => {
    prepareEditUser(user);
    onEditUser(user);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Gestión de Usuarios"
        // subtitle="Administración y control de accesos de personal por sucursal"
        icon={<Group />}
      />

      {/* Tabs de sucursales - Solo para administradores */}
      {isAdmin && (
        <Card sx={{ mb: 3, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                minHeight: 56,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: farmaColors.secondary,
                opacity: 0.7,
                "&.Mui-selected": {
                  color: farmaColors.primary,
                  opacity: 1,
                  fontWeight: 800,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: farmaColors.primary,
                height: 4,
                borderRadius: "4px 4px 0 0",
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Business fontSize="small" />
                  <span>MI SUCURSAL</span>
                  <Chip
                    label={users.filter((u) => u.sucursal === currentUserSucursal).length}
                    size="small"
                    sx={{ bgcolor: farmaColors.alpha.primary10, color: farmaColors.primary, fontWeight: 700, height: 22 }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SupervisorAccount fontSize="small" />
                  <span>TODAS LAS SUCURSALES</span>
                  <Chip
                    label={users.length}
                    size="small"
                    sx={{ bgcolor: farmaColors.alpha.secondary10, color: farmaColors.secondary, fontWeight: 700, height: 22 }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Card>
      )}

      {/* Filtros de Búsqueda */}
      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "visible", mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Buscar usuario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filtrar por rol"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                InputProps={{
                  startAdornment: <FilterList sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="" disabled>Seleccione...</MenuItem>
                <MenuItem value="">Todos los roles</MenuItem>
                {roles?.map((role) => (
                  <MenuItem key={role.rol_ID} value={role.nombre_Rol}>
                    {role.nombre_Rol}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  clearForm();
                  onCreateUser();
                }}
                sx={{
                  background: farmaColors.gradients.primary,
                  fontWeight: 700,
                  px: 3,
                  height: 48,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
                }}
              >
                Nuevo Usuario
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
              <TableRow sx={{ height: 60 }}>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Avatar</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: "white" }}>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <Group sx={{ fontSize: 40, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No se encontraron usuarios</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Avatar sx={{ background: farmaColors.gradients.secondary, width: 36, height: 36, fontSize: "0.875rem" }}>
                        {user.nombreCompleto?.split(" ").map((n) => n[0]).join("")}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                        {user.usuario}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{user.nombreCompleto}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.rol}
                        size="small"
                        sx={{
                          bgcolor: user.rol === "ADMIN" ? "error.main" : user.rol === "FARMACEUTICO" ? farmaColors.primary : "grey.200",
                          color: (user.rol === "ADMIN" || user.rol === "FARMACEUTICO") ? "white" : "grey.800",
                          fontWeight: 700,
                          fontSize: "0.7rem"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.estado}
                        size="small"
                        color={(user.estado === "Activo" || user.estado === "Habilitado") ? "success" : "error"}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="Editar Usuario">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            sx={{ color: farmaColors.primary, bgcolor: farmaColors.alpha.primary10, "&:hover": { bgcolor: farmaColors.alpha.primary20 } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Asignar Permisos">
                          <IconButton
                            size="small"
                            onClick={() => { prepareEditUser(user); onAssignPermissions(user); }}
                            sx={{ color: farmaColors.secondary, bgcolor: farmaColors.alpha.secondary10, "&:hover": { bgcolor: farmaColors.alpha.secondary20 } }}
                          >
                            <VpnKey fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Asignar Horarios">
                          <IconButton
                            size="small"
                            onClick={() => { prepareEditUser(user); onAssignSchedule(user); }}
                            sx={{ color: farmaColors.secondaryLight, bgcolor: farmaColors.alpha.secondary10, "&:hover": { bgcolor: farmaColors.alpha.secondary20 } }}
                          >
                            <AccessTime fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
};

export default UserList;
