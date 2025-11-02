// src/services/api/menuService.js - Servicios de permisos y menú

import apiClient from './apiClient';

const menuService = {
  /**
   * Obtener permisos del usuario por nombre de usuario
   * @param {string} usuario - Nombre de usuario
   * @returns {Promise<Array>} Array de opciones de menú con permisos
   */
  async getPermisosByUser(usuario) {
    try {
      const response = await apiClient.get(
        `/MenuOpciones/OpcionesPermisos/${usuario}`
      );

      console.log('✅ Permisos obtenidos para:', usuario);
      
      // El API devuelve un array directamente
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si viene envuelto en un objeto
      if (response.data && response.data.datos) {
        return response.data.datos;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener permisos:', error);
      throw {
        message: error.message || 'Error al obtener permisos del usuario',
        code: error.code || 500,
      };
    }
  },

  /**
   * Obtener permisos por rol
   * @param {string} rol - Nombre del rol (Administrador, Farmaceutico, etc.)
   * @returns {Promise<Array>} Array de opciones de menú con permisos
   */
  async getPermisosByRol(rol) {
    try {
      const response = await apiClient.get(
        `/MenuOpciones/OpcionesPermisosRol/${rol}`
      );

      console.log('✅ Permisos obtenidos para rol:', rol);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && response.data.datos) {
        return response.data.datos;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener permisos por rol:', error);
      throw {
        message: error.message || 'Error al obtener permisos del rol',
        code: error.code || 500,
      };
    }
  },

  /**
   * Guardar permisos en sessionStorage
   * @param {Array} permissions - Array de permisos/opciones de menú
   */
  savePermissions(permissions) {
    try {
      sessionStorage.setItem('userPermissions', JSON.stringify(permissions));
      console.log('✅ Permisos guardados en sessionStorage');
    } catch (error) {
      console.error('❌ Error al guardar permisos:', error);
    }
  },

  /**
   * Obtener permisos desde sessionStorage
   * @returns {Array|null} Array de permisos o null
   */
  getPermissions() {
    try {
      const permissionsJson = sessionStorage.getItem('userPermissions');
      if (permissionsJson) {
        return JSON.parse(permissionsJson);
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener permisos:', error);
      return null;
    }
  },

  /**
   * Verificar si el usuario tiene acceso a una opción específica
   * @param {Array} permissions - Array de permisos del usuario
   * @param {string} optionName - Nombre de la opción a verificar
   * @returns {boolean} true si tiene acceso
   */
  hasAccessToOption(permissions, optionName) {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    // Buscar en opciones principales
    const hasMainOption = permissions.some(
      (option) => option.nombreOpcion === optionName
    );

    if (hasMainOption) {
      return true;
    }

    // Buscar en subopciones
    const hasSubOption = permissions.some((option) => {
      if (option.opcionesSubMenu && Array.isArray(option.opcionesSubMenu)) {
        return option.opcionesSubMenu.some(
          (subOption) => subOption.nombreOpcion === optionName
        );
      }
      return false;
    });

    return hasSubOption;
  },

  /**
   * Limpiar permisos del sessionStorage
   */
  clearPermissions() {
    try {
      sessionStorage.removeItem('userPermissions');
      console.log('✅ Permisos limpiados');
    } catch (error) {
      console.error('❌ Error al limpiar permisos:', error);
    }
  },
};

export default menuService;