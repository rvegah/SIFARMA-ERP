// src/services/api/inventoryService.js
import pharmacyApiClient from './pharmacyApiClient';

const inventoryService = {
    /**
     * Obtiene los motivos de salida de inventario
     * GET /Inventario/TipoMotivoSalida
     */
    getMotivosSalida: async () => {
        try {
            const response = await pharmacyApiClient.get('/Inventario/TipoMotivoSalida');
            return response.data;
        } catch (error) {
            console.error('Error fetching motivos salida:', error);
            throw error;
        }
    },

    /**
     * Registra una nueva salida (cabecera)
     * POST /Inventario/NuevaSalida
     */
    crearSalida: async (salidaData) => {
        try {
            const response = await pharmacyApiClient.post('/Inventario/NuevaSalida', salidaData);
            return response.data;
        } catch (error) {
            console.error('Error creating inventory output:', error);
            throw error;
        }
    },

    /**
     * Guarda los productos de una salida y la finaliza
     * PUT /Inventario/GuardarSalida
     */
    guardarSalida: async (payload) => {
        try {
            const response = await pharmacyApiClient.put('/Inventario/GuardarSalida', payload);
            return response.data;
        } catch (error) {
            console.error('Error saving inventory output products:', error);
            throw error;
        }
    }
};

export default inventoryService;
