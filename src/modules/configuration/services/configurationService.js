// src/modules/configuration/services/configurationService.js
import apiClient from '../../../services/api/apiClient';

const configurationService = {
  /**
   * Actualiza el certificado de cómputo
   * @param {Object} data - Datos del certificado
   * @param {number} data.codigoEquipoComputo - ID del equipo
   * @param {string} data.motivoCambio - Motivo del cambio
   * @param {number} data.empleadoAlta - ID del empleado que realiza el cambio
   * @returns {Promise<Object>} Resultado de la operación
   */
  async guardarCertificado(data) {
    try {
      const response = await apiClient.put('/Organizacion/GuardarCertificado', data);
      
      if (response.data && response.data.exitoso) {
        return {
          success: true,
          message: response.data.mensaje || 'Certificado actualizado correctamente',
          datos: response.data.datos
        };
      } else {
        throw new Error(response.data?.mensaje || 'Error al actualizar el certificado');
      }
    } catch (error) {
      console.error('❌ Error en guardarCertificado:', error);
      throw {
        success: false,
        message: error.message || 'Error al conectar con el servidor',
      };
    }
  }
};

export default configurationService;
