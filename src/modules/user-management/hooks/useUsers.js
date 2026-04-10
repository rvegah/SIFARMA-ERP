// src/modules/user-management/hooks/useUsers.js
// Hook con gestión completa + CREAR Y ACTUALIZAR usuarios vía API

import { useState, useMemo, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import {
  currentUserConfig,
  initialFormState,
  getDefaultPermissionsByRole,
  generos,
  titulos,
} from "../constants/userConstants";

import userService from "../../../services/api/userService";
import menuService from "../../../services/api/menuService";
import { ORGANIZATION_CONFIG } from "../../../config/organizationConfig";

import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/api/apiClient";

export const useUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { codigoEmpleado, user } = useAuth();
  const [tipoUsuarios, setTipoUsuarios] = useState([]);

  // ========================================
  // ESTADOS
  // ========================================
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState(initialFormState);

  // Estados para API
  const [sucursales, setSucursales] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Configuración de usuario actual
  const currentUserSucursal = user?.sucursal || currentUserConfig.sucursal;
  const isAdmin = user?.rol === "Administrador" || currentUserConfig.isAdmin;

  const initialDataLoaded = useRef(false);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    if (initialDataLoaded.current) {
      console.log("⏭️ Datos ya cargados, saltando...");
      return;
    }

    initialDataLoaded.current = true;
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Cargando datos iniciales...");

      const tipoUsuariosData = await userService.getTipoUsuarios();
      setTipoUsuarios(tipoUsuariosData);

      const rolesData = await userService.getRoles();
      setRoles(rolesData);

      const sucursalesData = await userService.getSucursales(
        ORGANIZATION_CONFIG.organizacion_ID,
      );
      setSucursales(sucursalesData);

      await loadUsuarios(false);

      console.log("✅ Datos iniciales cargados:", {
        tipoUsuarios: tipoUsuariosData.length,
        roles: rolesData.length,
        sucursales: sucursalesData.length,
      });
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);
      enqueueSnackbar("Error cargando datos del sistema", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar usuarios desde el API
   */
  const loadUsuarios = async (showSnackbar = true) => {
    try {
      console.log("🔄 Cargando usuarios...");
      const sucursalFiltro = isAdmin ? "*" : currentUserSucursal;
      const usuariosData = await userService.buscarUsuarios(sucursalFiltro);
      setUsers(usuariosData);
      console.log(`✅ ${usuariosData.length} usuarios cargados`);

      if (showSnackbar) {
        enqueueSnackbar(
          `${usuariosData.length} usuarios cargados correctamente`,
          {
            variant: "success",
          },
        );
      }
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error);
      enqueueSnackbar("Error al cargar la lista de usuarios", {
        variant: "error",
      });
    }
  };

  /**
   * 🆕 Cargar detalle del usuario junto con catálogos (Sucursal, Rol, Tipo)
   */
  const loadUserDetail = async (usuarioId) => {
    try {
      setLoading(true);
      console.log(`📡 Cargando detalle del usuario ID ${usuarioId}...`);

      // 1️⃣ Aseguramos que los catálogos estén listos
      if (sucursales.length === 0) await loadSucursales();
      if (roles.length === 0) await loadRoles();
      if (tipoUsuarios.length === 0) await loadTipoUsuarios();

      // 2️⃣ Obtener detalle del usuario
      const detail = await userService.getUserDetail(usuarioId);
      if (!detail) {
        enqueueSnackbar("No se encontraron detalles del usuario", {
          variant: "warning",
        });
        return;
      }

      // 3️⃣ Buscar coincidencias exactas entre nombres del detalle y catálogos
      const sucursalMatch = sucursales.find(
        (s) =>
          s.nombreSucursal?.trim().toLowerCase() ===
          detail.sucursal?.trim().toLowerCase(),
      );
      const rolMatch = roles.find(
        (r) =>
          r.nombre_Rol?.trim().toLowerCase() ===
          detail.rol?.trim().toLowerCase(),
      );

      // 4️⃣ Actualizar formulario con los IDs encontrados
      setUserForm({
        ...detail,
        sucursal_ID: sucursalMatch ? sucursalMatch.sucursal_ID : "",
        rol_ID: rolMatch ? rolMatch.rol_ID : "",
      });

      console.log("✅ Usuario cargado:", {
        ...detail,
        sucursal_ID: sucursalMatch
          ? sucursalMatch.sucursal_ID
          : "❌ No encontrada",
        rol_ID: rolMatch ? rolMatch.rol_ID : "❌ No encontrado",
      });
    } catch (error) {
      console.error("❌ Error al cargar detalle del usuario:", error);
      enqueueSnackbar("Error al cargar detalle del usuario", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar equipos cuando se selecciona una sucursal
   */
  const loadEquiposBySucursal = async (sucursalId) => {
    try {
      console.log(`🔄 Cargando equipos para sucursal ${sucursalId}...`);
      const equiposData = await userService.getEquiposBySucursal(sucursalId);
      setEquipos(equiposData);
      console.log(`✅ Equipos cargados:`, equiposData.length);
    } catch (error) {
      console.error("❌ Error cargando equipos:", error);
      enqueueSnackbar("Error cargando equipos", { variant: "error" });
    }
  };

  // ========================================
  // FUNCIONES DE FORMULARIO
  // ========================================
  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setUserForm({
      ...userForm,
      [field]: value,
    });

    if (field === "sucursal_ID") {
      const sucursalSeleccionada = sucursales.find(
        (s) => s.sucursal_ID === parseInt(value),
      );
      setUserForm((prev) => ({
        ...prev,
        sucursal_ID: value,
        sucursal: sucursalSeleccionada?.nombreSucursal || "",
        nombreEquipo: "",
        equipoComputo_ID: "",
      }));
      loadEquiposBySucursal(value);
    }

    if (field === "equipoComputo_ID") {
      const equipoSeleccionado = equipos.find(
        (e) => e.equipoComputo_ID === parseInt(value),
      );
      setUserForm((prev) => ({
        ...prev,
        equipoComputo_ID: value,
        nombreEquipo: equipoSeleccionado?.nombreHost || "",
      }));
    }

    if (field === "rol_ID") {
      const rolSeleccionado = roles.find((r) => r.rol_ID === parseInt(value));
      setUserForm((prev) => ({
        ...prev,
        rol_ID: value,
        tipoUsuario: rolSeleccionado?.nombre_Rol || "",
      }));
    }

    if (field === "tipoUsuarioInterno") {
      const tipoSeleccionado = tipoUsuarios.find((t) => t.codigo === value);
      setUserForm((prev) => ({
        ...prev,
        tipoUsuarioInterno: value,
        tipoUsuarioDescripcion: tipoSeleccionado?.descripcion || "",
      }));
    }
  };

  // ========================================
  // FUNCIONES COMPUTADAS
  // ========================================
  const getFilteredUsersByTab = useMemo(() => {
    if (selectedTab === 0) {
      return users.filter((user) => user.sucursal === currentUserSucursal);
    } else {
      return isAdmin
        ? users
        : users.filter((user) => user.sucursal === currentUserSucursal);
    }
  }, [users, selectedTab, currentUserSucursal, isAdmin]);

  const filteredUsers = useMemo(() => {
    return getFilteredUsersByTab.filter((user) => {
      const matchesSearch =
        user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.nombreEquipo &&
          user.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = filterRole === "" || user.rol === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [getFilteredUsersByTab, searchTerm, filterRole]);

  // ========================================
  // FUNCIONES CRUD
  // ========================================

  /**
   * Crear usuario vía API
   */
  const handleCreateUserAPI = async () => {
    if (!validateFormForAPI()) {
      return false;
    }

    setLoading(true);
    try {
      const payload = {
        organizacion_ID: ORGANIZATION_CONFIG.organizacion_ID,
        sucursal_ID: parseInt(userForm.sucursal_ID),
        rol_ID: parseInt(userForm.rol_ID),
        equipo: userForm.nombreEquipo,
        tipoUsuario: userForm.tipoUsuarioInterno || "INT",
        usuario: userForm.usuario,
        password: userForm.password,
        cedula: userForm.cedula || "",
        nombres: userForm.nombreCompleto,
        apellidos: userForm.apellidos || "",
        titulo: userForm.titulo || "",
        genero: userForm.genero,
        celular: userForm.telefono || "",
        correo: userForm.email,
        direccion: userForm.direccion || "",
        codigoEmpleadoAlta: codigoEmpleado || "",
      };

      console.log("📤 Enviando datos al API:", payload);

      const result = await userService.createUser(payload);

      if (result.success) {
        enqueueSnackbar(result.message, { variant: "success" });
        clearForm();
        await loadUsuarios();
        return true;
      } else {
        enqueueSnackbar(result.message, { variant: "error" });
        return false;
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      enqueueSnackbar("Error inesperado al crear usuario", {
        variant: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧩 Actualizar usuario (la contraseña es opcional)
   */
  const handleUpdateUserAPI = async () => {
    try {
      setLoading(true);

      // Validaciones mínimas
      if (!userForm.usuario) {
        enqueueSnackbar("El campo 'usuario' es obligatorio.", {
          variant: "error",
        });
        return false;
      }

      if (!userForm.nombreCompleto || !userForm.email) {
        enqueueSnackbar("Faltan campos obligatorios.", { variant: "warning" });
        return false;
      }

      // Preparar payload limpio
      const payload = { ...userForm };
      payload.usuario = userForm.usuario; // obligatorio

      if (!payload.password || payload.password.trim() === "") {
        delete payload.password;
      }

      console.log("📤 Enviando actualización de usuario:", payload);
      const response = await userService.updateUser(payload);

      if (response?.success) {
        enqueueSnackbar("✅ Usuario actualizado correctamente.", {
          variant: "success",
        });

        // 🔄 1️⃣ Recargar lista desde backend (seguridad de consistencia)
        await loadUsuarios();

        // 🔁 2️⃣ Actualizar estado local (por si no se usa navigate)
        setUsers((prev) =>
          prev.map((u) =>
            u.usuario === payload.usuario
              ? {
                  ...u,
                  nombreCompleto: `${
                    payload.Nombres || userForm.nombreCompleto
                  } ${payload.Apellidos || userForm.apellidos}`.trim(),
                  email: payload.email || u.email,
                  cedula: payload.cedula || u.cedula,
                  telefono: payload.telefono || u.telefono,
                  direccion: payload.direccion || u.direccion,
                  rol:
                    roles.find((r) => r.rol_ID === parseInt(payload.rol_ID))
                      ?.nombre_Rol || u.rol,
                  sucursal:
                    sucursales.find(
                      (s) => s.sucursal_ID === parseInt(payload.sucursal_ID),
                    )?.nombreSucursal || u.sucursal,
                }
              : u,
          ),
        );

        // 3️⃣ Limpia formulario y estados temporales
        clearForm();
        setSelectedUser(null);

        // 4️⃣ Feedback
        enqueueSnackbar("La lista de usuarios fue actualizada.", {
          variant: "info",
        });

        return true;
      } else {
        enqueueSnackbar(
          response?.message || "Error al actualizar el usuario.",
          { variant: "error" },
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error en handleUpdateUserAPI:", error);
      enqueueSnackbar("Error al actualizar usuario", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validar formulario para creación
   */
  const validateFormForAPI = () => {
    const requiredFieldsAPI = {
      sucursal_ID: "Sucursal",
      //equipoComputo_ID: "Nombre de equipo",
      tipoUsuarioInterno: "Tipo de usuario",
      rol_ID: "Rol de usuario",
      usuario: "Usuario",
      password: "Password",
      nombreCompleto: "Nombre completo",
      email: "Email",
    };

    for (const [field, label] of Object.entries(requiredFieldsAPI)) {
      if (!userForm[field]) {
        enqueueSnackbar(`El campo "${label}" es obligatorio`, {
          variant: "warning",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      enqueueSnackbar("Ingrese un email válido", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }

    if (userForm.password.length < 3) {
      enqueueSnackbar("La contraseña debe tener al menos 3 caracteres", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }

    if (userForm.usuario.length < 3) {
      enqueueSnackbar("El usuario debe tener al menos 3 caracteres", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }

    return true;
  };

  /**
   * 🆕 NUEVO: Validar formulario para actualización
   */
  const validateFormForUpdate = () => {
    const requiredFieldsUpdate = {
      usuario: "Usuario",
      nombreCompleto: "Nombre completo",
      email: "Email",
    };

    for (const [field, label] of Object.entries(requiredFieldsUpdate)) {
      if (!userForm[field]) {
        enqueueSnackbar(`El campo "${label}" es obligatorio`, {
          variant: "warning",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      enqueueSnackbar("Ingrese un email válido", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }

    // Si hay contraseña nueva, validar longitud
    if (userForm.password && userForm.password.length < 3) {
      enqueueSnackbar("La contraseña debe tener al menos 3 caracteres", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }

    return true;
  };

  const updateUserPermissions = (userId, newPermissions) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, permisos: newPermissions } : user,
    );

    setUsers(updatedUsers);
    enqueueSnackbar("Permisos actualizados correctamente", {
      variant: "success",
    });
    return true;
  };

  const hasPermission = (userId, permission) => {
    const user = users.find((u) => u.id === userId);
    return user?.permisos?.includes(permission) || false;
  };

  const getUserPermissions = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.permisos || [];
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
    enqueueSnackbar("Usuario eliminado correctamente", { variant: "success" });
  };

  /**
   * Preparar usuario para edición
   */
  const prepareEditUser = (user) => {
    console.log("Preparando usuario para edición:", user);
    setSelectedUser(user);

    // Buscar los IDs correspondientes desde los catálogos
    const sucursalObj = sucursales.find(
      (s) => s.nombreSucursal === user.sucursal,
    );
    const rolObj = roles.find((r) => r.nombre_Rol === user.rol);

    setUserForm({
      sucursal_ID: sucursalObj?.sucursal_ID || user.sucursal_ID || "",
      sucursal: user.sucursal,
      equipoComputo_ID: "", // Se cargará cuando seleccione la sucursal
      nombreEquipo: user.nombreEquipo || "",
      rol_ID: rolObj?.rol_ID || user.rol_ID || "",
      tipoUsuario: user.rol,
      usuario: user.usuario,
      password: "", // Dejar vacío - solo si quiere cambiar
      cedula: user.cedula || "",
      nombreCompleto: user.nombreCompleto.split(" ")[0] || "",
      apellidos: user.nombreCompleto.split(" ").slice(1).join(" ") || "",
      titulo: user.titulo || "",
      telefono: user.telefono || "",
      email: user.email,
      genero: user.genero || "Masculino",
      direccion: user.direccion || "",
    });

    // Si tiene sucursal_ID, cargar equipos
    if (sucursalObj?.sucursal_ID) {
      loadEquiposBySucursal(sucursalObj.sucursal_ID);
    }
  };

  const clearForm = () => {
    setUserForm({ ...initialFormState }); // nueva referencia = re-render
    setSelectedUser(null);
    setShowPassword(false);
    console.log("🧹 Formulario reiniciado:", { ...initialFormState });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Al final de useUsers.js, ANTES del return, agrega/reemplaza:

  // ========================================
  // FUNCIONES DE PERMISOS (VERSIÓN CORREGIDA)
  // ========================================

  /**
   * 🆕 Obtener estructura del menú con permisos
   */
  const getMenuEstructura = async (usuarioId) => {
    const usuario = users.find((u) => u.id === parseInt(usuarioId));

    if (!usuario || !usuario.rol_ID) {
      throw new Error("Usuario no encontrado o sin rol asignado");
    }

    // Llamar con el rol_ID numérico
    const menuData = await menuService.getPermisosByRol(usuario.rol_ID);
    return menuData;
  };

  /**
   * 🆕 Obtener plantilla de permisos por rol
   */
  const getRoleTemplatePermissionsReal = async (nombreRol) => {
    try {
      console.log(
        `📡 Obteniendo plantilla de permisos para rol: ${nombreRol}...`,
      );

      const templateData = await menuService.getPermisosByRol(nombreRol);

      const activePermissions = [];

      templateData.forEach((modulo) => {
        const opcionId = modulo.codigoOpcion_ID || modulo.opcion_ID;
        const estado = modulo.estado || "ACT";

        if (estado === "ACT" && opcionId) {
          activePermissions.push(opcionId);
        }

        const subOpciones =
          modulo.subOpcionesMenu || modulo.opcionesSubMenu || [];
        subOpciones.forEach((subOpcion) => {
          const subId = subOpcion.codigoOpcion_ID || subOpcion.opcion_ID;
          const subEstado = subOpcion.estado || "ACT";

          if (subEstado === "ACT" && subId) {
            activePermissions.push(subId);
          }
        });
      });

      console.log(
        `✅ Plantilla "${nombreRol}":`,
        activePermissions.length,
        "permisos",
      );
      return activePermissions;
    } catch (error) {
      console.error("❌ Error obteniendo plantilla:", error);
      throw error;
    }
  };

  /**
   * 🆕 Guardar permisos
   */
  const saveUserPermissionsReal = async ({
    usuario_ID,
    rol_ID,
    sucursal_ID,
    permisoIDs,
    codigoEmpleadoAlta,
  }) => {
    try {
      setLoading(true);

      const payload = {
        usuario_ID: Number(usuario_ID),
        rol_ID: Number(rol_ID),
        sucursal_ID: Number(sucursal_ID),
        codigoEmpleadoAlta: codigoEmpleadoAlta || "SYSTEM",
        permisosOpciones: permisoIDs.map((id) => ({
          opcion_ID: Number(id),
          estadoOpcion: "ACT",
        })),
      };

      console.log("🧾 Payload:", JSON.stringify(payload, null, 2));

      const response = await apiClient.put(
        "/MenuOpciones/ActualizarPermisosOpciones",
        payload,
      );

      if (response.data?.exitoso) {
        enqueueSnackbar("Permisos actualizados correctamente", {
          variant: "success",
        });
        return true;
      } else {
        enqueueSnackbar(response.data?.mensaje || "Error al actualizar", {
          variant: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("❌ Error guardando:", error);
      enqueueSnackbar("Error al guardar permisos", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RETURN
  // ========================================
  return {
    // Estados
    users,
    selectedUser,
    selectedTab,
    searchTerm,
    filterRole,
    showPassword,
    userForm,
    filteredUsers,

    // Estados API
    sucursales,
    equipos,
    roles,
    loading,

    // Configuración
    currentUserSucursal,
    isAdmin,
    codigoEmpleado,
    tipoUsuarios,
    titulos,

    // Funciones de formulario
    handleFormChange,
    clearForm,
    prepareEditUser,

    // Funciones CRUD
    handleCreateUserAPI,
    handleUpdateUserAPI, // 🆕 NUEVA función exportada
    handleDeleteUser,

    // Función para recargar usuarios
    loadUsuarios,

    // Funciones de permisos
    updateUserPermissions,
    hasPermission,
    getUserPermissions,
    getMenuEstructura,
    getRoleTemplatePermissionsReal,
    saveUserPermissionsReal,

    // Funciones de catálogos
    loadEquiposBySucursal,
    loadUserDetail,

    // Funciones de UI
    handleTabChange,
    setSearchTerm,
    setFilterRole,
    setShowPassword,
    setSelectedUser,

    // Datos computados
    getFilteredUsersByTab,
  };
};
