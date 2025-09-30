// useUsers.js - Hook con gestión completa de permisos

import { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { 
  allUsers, 
  currentUserConfig, 
  initialFormState, 
  requiredFields, 
  requiredFieldsEdit,
  getDefaultPermissionsByRole
} from '../constants/userConstants';

export const useUsers = () => {
  // Estados principales
  const [users, setUsers] = useState(allUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Formulario de usuario
  const [userForm, setUserForm] = useState(initialFormState);
  
  const { enqueueSnackbar } = useSnackbar();

  // Configuración de usuario actual
  const currentUserSucursal = currentUserConfig.sucursal;
  const isAdmin = currentUserConfig.isAdmin;

  // Función para manejar cambios en el formulario
  const handleFormChange = (field) => (event) => {
    setUserForm({
      ...userForm,
      [field]: event.target.value
    });
  };

  // Filtrar usuarios según la pestaña seleccionada
  const getFilteredUsersByTab = useMemo(() => {
    if (selectedTab === 0) {
      return users.filter(user => user.sucursal === currentUserSucursal);
    } else {
      return isAdmin ? users : users.filter(user => user.sucursal === currentUserSucursal);
    }
  }, [users, selectedTab, currentUserSucursal, isAdmin]);

  // Usuarios filtrados por búsqueda y rol
  const filteredUsers = useMemo(() => {
    return getFilteredUsersByTab.filter(user => {
      const matchesSearch = user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.nombreEquipo && user.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = filterRole === '' || user.rol === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [getFilteredUsersByTab, searchTerm, filterRole]);

  // NUEVO: Función para actualizar permisos de un usuario
  const updateUserPermissions = (userId, newPermissions) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, permisos: newPermissions }
        : user
    );

    setUsers(updatedUsers);
    enqueueSnackbar('Permisos actualizados correctamente', { variant: 'success' });
    return true;
  };

  // NUEVO: Función para verificar si un usuario tiene un permiso específico
  const hasPermission = (userId, permission) => {
    const user = users.find(u => u.id === userId);
    return user?.permisos?.includes(permission) || false;
  };

  // NUEVO: Función para obtener todos los permisos de un usuario
  const getUserPermissions = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.permisos || [];
  };

  // Función para crear usuario
  const handleCreateUser = () => {
    if (!userForm.usuario || !userForm.password || !userForm.nombreCompleto || !userForm.email) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return false;
    }

    // Obtener permisos por defecto según el rol
    const defaultPermissions = getDefaultPermissionsByRole(userForm.tipoUsuario);

    const newUser = {
      id: users.length + 1,
      usuario: userForm.usuario,
      nombreCompleto: `${userForm.nombreCompleto} ${userForm.apellidos}`,
      nombreEquipo: userForm.nombreEquipo,
      email: userForm.email,
      cedula: userForm.cedula,
      telefono: userForm.telefono,
      rol: userForm.tipoUsuario,
      sucursal: userForm.sucursal,
      genero: userForm.genero,
      direccion: userForm.direccion,
      estado: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimoAcceso: 'Nunca',
      permisos: defaultPermissions // Asignar permisos por defecto
    };

    setUsers([...users, newUser]);
    enqueueSnackbar('Usuario creado correctamente con permisos por defecto', { variant: 'success' });
    return true;
  };

  // Función para actualizar usuario
  const handleUpdateUser = () => {
    if (!userForm.usuario || !userForm.nombreCompleto || !userForm.email) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return false;
    }

    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            usuario: userForm.usuario,
            nombreCompleto: `${userForm.nombreCompleto} ${userForm.apellidos}`,
            nombreEquipo: userForm.nombreEquipo,
            email: userForm.email,
            cedula: userForm.cedula,
            telefono: userForm.telefono,
            rol: userForm.tipoUsuario,
            sucursal: userForm.sucursal,
            genero: userForm.genero,
            direccion: userForm.direccion,
            // Si se proporciona nueva contraseña, la actualizamos
            ...(userForm.password && { password: userForm.password }),
            // Mantener los permisos existentes
            permisos: user.permisos
          }
        : user
    );

    setUsers(updatedUsers);
    enqueueSnackbar('Usuario actualizado correctamente', { variant: 'success' });
    return true;
  };

  // Función para eliminar usuario
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' });
  };

  // Función para preparar edición de usuario
  const prepareEditUser = (user) => {
    console.log('Preparando usuario para edición:', user);
    setSelectedUser(user);
    setUserForm({
      sucursal: user.sucursal,
      nombreEquipo: user.nombreEquipo || '',
      tipoUsuario: user.rol,
      usuario: user.usuario,
      password: '',
      cedula: user.cedula || '',
      nombreCompleto: user.nombreCompleto.split(' ')[0] || '',
      apellidos: user.nombreCompleto.split(' ').slice(1).join(' ') || '',
      titulo: '',
      telefono: user.telefono || '',
      email: user.email,
      genero: user.genero || 'Masculino',
      direccion: user.direccion || ''
    });
  };

  // Función para limpiar formulario
  const clearForm = () => {
    setUserForm(initialFormState);
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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
    
    // Configuración
    currentUserSucursal,
    isAdmin,
    
    // Funciones de formulario
    handleFormChange,
    clearForm,
    prepareEditUser,
    
    // Funciones CRUD
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    
    // NUEVAS: Funciones de permisos
    updateUserPermissions,
    hasPermission,
    getUserPermissions,
    
    // Funciones de UI
    handleTabChange,
    setSearchTerm,
    setFilterRole,
    setShowPassword,
    setSelectedUser,
    
    // Datos computados
    getFilteredUsersByTab
  };
};