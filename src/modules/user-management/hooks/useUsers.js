// useUsers.js - Hook completo con toda la lógica del monolítico + nombreEquipo

import { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { 
  allUsers, 
  currentUserConfig, 
  initialFormState, 
  requiredFields, 
  requiredFieldsEdit 
} from '../constants/userConstants';

export const useUsers = () => {
  // Estados principales - exactos del monolítico
  const [users, setUsers] = useState(allUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Mi Sucursal, 1 = Todas las Sucursales
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Formulario de usuario - exacto del monolítico
  const [userForm, setUserForm] = useState(initialFormState);
  
  const { enqueueSnackbar } = useSnackbar();

  // Configuración de usuario actual - del monolítico
  const currentUserSucursal = currentUserConfig.sucursal;
  const isAdmin = currentUserConfig.isAdmin;

  // Función para manejar cambios en el formulario - exacta del monolítico
  const handleFormChange = (field) => (event) => {
    setUserForm({
      ...userForm,
      [field]: event.target.value
    });
  };

  // Filtrar usuarios según la pestaña seleccionada - exacto del monolítico
  const getFilteredUsersByTab = useMemo(() => {
    if (selectedTab === 0) {
      // Mi Sucursal
      return users.filter(user => user.sucursal === currentUserSucursal);
    } else {
      // Todas las Sucursales (solo si es admin)
      return isAdmin ? users : users.filter(user => user.sucursal === currentUserSucursal);
    }
  }, [users, selectedTab, currentUserSucursal, isAdmin]);

  // Usuarios filtrados por búsqueda y rol - ACTUALIZADO para incluir nombreEquipo
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

  // Función para crear usuario - ACTUALIZADA con nombreEquipo
  const handleCreateUser = () => {
    // Validación - exacta del monolítico
    if (!userForm.usuario || !userForm.password || !userForm.nombreCompleto || !userForm.email) {
      enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
      return false;
    }

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
      ultimoAcceso: 'Nunca'
    };

    setUsers([...users, newUser]);
    enqueueSnackbar('Usuario creado correctamente', { variant: 'success' });
    return true;
  };

  // Función para actualizar usuario - ACTUALIZADA con nombreEquipo  
  const handleUpdateUser = () => {
    // Validación - exacta del monolítico
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
            ...(userForm.password && { password: userForm.password })
          }
        : user
    );

    setUsers(updatedUsers);
    enqueueSnackbar('Usuario actualizado correctamente', { variant: 'success' });
    return true;
  };

  // Función para eliminar usuario - del monolítico
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' });
  };

  // Función para preparar edición de usuario - ACTUALIZADA con nombreEquipo
  const prepareEditUser = (user) => {
    console.log('Preparando usuario para edición:', user);
    setSelectedUser(user);
    // Pre-poblar el formulario con los datos del usuario - ACTUALIZADO con nombreEquipo
    setUserForm({
      sucursal: user.sucursal,
      nombreEquipo: user.nombreEquipo || '',
      tipoUsuario: user.rol,
      usuario: user.usuario,
      password: '', // Por seguridad, no pre-poblar contraseña
      cedula: user.cedula || '',
      nombreCompleto: user.nombreCompleto.split(' ')[0] || '',
      apellidos: user.nombreCompleto.split(' ').slice(1).join(' ') || '',
      titulo: '', // Campo adicional que no tenemos en mock
      telefono: user.telefono || '',
      email: user.email,
      genero: user.genero || 'Masculino',
      direccion: user.direccion || ''
    });
  };

  // Función para limpiar formulario - del monolítico
  const clearForm = () => {
    setUserForm(initialFormState);
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Cambio de pestaña - del monolítico
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