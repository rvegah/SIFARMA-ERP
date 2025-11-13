// src/context/AuthContext.jsx - Context global de autenticación
// 🆕 ACTUALIZADO: Renombrado permissions → apiPermissions

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/api/authService';
import menuService from '../services/api/menuService';

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiPermissions, setApiPermissions] = useState([]); // 🆕 CAMBIO: permissions → apiPermissions
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = authService.getCurrentUser();
        const savedPermissions = menuService.getPermissions();

        if (savedUser) {
          setUser(savedUser);
          setIsAuthenticated(true);
          
          if (savedPermissions) {
            setApiPermissions(savedPermissions); // 🆕 CAMBIO: setPermissions → setApiPermissions
          }
          
          console.log('✅ Sesión restaurada:', savedUser.usuario);
        }
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales con usuario, password e IP
   * @returns {Promise<Object>} Resultado del login
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true);

      // 1. Llamar al API de login
      const loginResult = await authService.login(credentials);

      if (!loginResult.success) {
        throw new Error(loginResult.message);
      }

      // 2. Obtener permisos del usuario
      let userPermissions = [];
      try {
        userPermissions = await menuService.getPermisosByUser(
          loginResult.user.usuario
        );
      } catch (permError) {
        console.warn('⚠️ No se pudieron cargar permisos:', permError);
        // Continuar sin permisos (se pueden cargar después)
      }

      // 3. Guardar en sessionStorage
      authService.saveUser(loginResult.user);
      menuService.savePermissions(userPermissions);

      // 4. Actualizar estado
      setUser(loginResult.user);
      setApiPermissions(userPermissions); // 🆕 CAMBIO: setPermissions → setApiPermissions
      setIsAuthenticated(true);

      console.log('✅ Login completo:', {
        usuario: loginResult.user.usuario,
        permisos: userPermissions.length,
      });

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    authService.logout();
    menuService.clearPermissions();
    setUser(null);
    setApiPermissions([]); // 🆕 CAMBIO: setPermissions → setApiPermissions
    setIsAuthenticated(false);
    
    // 🆕 Limpiar flag de autenticación previa para forzar redirección al dashboard
    sessionStorage.removeItem('wasAlreadyAuthenticated');
    
    console.log('✅ Sesión cerrada');
  };

  /**
   * Verificar si el usuario tiene acceso a una opción
   * @param {string} optionName - Nombre de la opción
   * @returns {boolean} true si tiene acceso
   */
  const hasAccess = (optionName) => {
    return menuService.hasAccessToOption(apiPermissions, optionName); // 🆕 CAMBIO: permissions → apiPermissions
  };

  /**
   * Recargar permisos del usuario
   */
  const refreshPermissions = async () => {
    if (!user) return;

    try {
      const updatedPermissions = await menuService.getPermisosByUser(
        user.usuario
      );
      menuService.savePermissions(updatedPermissions);
      setApiPermissions(updatedPermissions); // 🆕 CAMBIO: setPermissions → setApiPermissions
      console.log('✅ Permisos actualizados');
    } catch (error) {
      console.error('❌ Error al actualizar permisos:', error);
    }
  };

  // Valor del contexto
  const value = {
    user,
    apiPermissions, // 🆕 CAMBIO: permissions → apiPermissions
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasAccess,
    refreshPermissions,
    codigoEmpleado: user?.codigoEmpleado || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;