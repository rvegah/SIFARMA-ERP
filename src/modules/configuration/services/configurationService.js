// src/modules/configuration/services/configurationService.js
import apiClient from '../../../services/api/apiClient';

const configurationService = {
  /**
   * Actualiza el certificado de cómputo
   * @param {number} codigoEquipoComputo_ID - ID del equipo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async guardarCertificado(codigoEquipoComputo_ID) {
    try {
      // Según requerimiento: Call /InicioSesion/ActualizarCertificadoComputo
      const response = await apiClient.put('/InicioSesion/ActualizarCertificadoComputo', {
        codigoEquipoComputo_ID: codigoEquipoComputo_ID
      });
      
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
