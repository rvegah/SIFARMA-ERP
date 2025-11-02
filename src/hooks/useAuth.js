// src/hooks/useAuth.js - Hook personalizado para autenticación
// (Este archivo es opcional, el hook ya está exportado desde AuthContext.jsx)

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * @returns {Object} Contexto de autenticación
 * @returns {Object} user - Datos del usuario actual
 * @returns {Array} permissions - Permisos del usuario
 * @returns {boolean} isAuthenticated - Si el usuario está autenticado
 * @returns {boolean} isLoading - Si está cargando
 * @returns {Function} login - Función para iniciar sesión
 * @returns {Function} logout - Función para cerrar sesión
 * @returns {Function} hasAccess - Función para verificar permisos
 * @returns {Function} refreshPermissions - Función para actualizar permisos
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default useAuth;