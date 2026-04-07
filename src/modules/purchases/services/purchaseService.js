// src/modules/purchases/services/purchaseService.js
import pharmacyApiClient from '../../../services/api/pharmacyApiClient';

const purchaseService = {
    /**
     * Obtiene los tipos de formas de pago
     * GET /Compras/TipoFormasPago
     */
    getFormasPago: async () => {
        try {
            const response = await pharmacyApiClient.get('/Compras/TipoFormasPago');
            return response.data;
        } catch (error) {
            console.error('Error fetching formas pago:', error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de proveedores
     * GET /Compras/Proveedores
     */
    getProveedores: async () => {
        try {
            const response = await pharmacyApiClient.get('/Compras/Proveedores');
            return response.data;
        } catch (error) {
            console.error('Error fetching proveedores:', error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de pedidos pendientes para una sucursal
     * GET /Compras/ListaPedidos?CodigoSucursal=...&EstadoPedido=PEN
     */
    getListaPedidos: async (codigoSucursal) => {
        try {
            const response = await pharmacyApiClient.get('/Compras/ListaPedidos', {
                params: {
                    CodigoSucursal: codigoSucursal,
                    EstadoPedido: 'ENV' // Solo pedidos en estado ENV (Enviado)
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching lista pedidos:', error);
            throw error;
        }
    },

    /**
     * Crea una nueva compra
     * POST /Compras/NuevaCompra
     */
    crearCompra: async (compraData) => {
        try {
            const response = await pharmacyApiClient.post('/Compras/NuevaCompra', compraData);
            return response.data;
        } catch (error) {
            console.error('Error creating compra:', error);
            throw error;
        }
    },

    /**
     * Guarda los productos de una compra
     * POST /Compras/GuardarCompra
     */
    guardarProductos: async (payload) => {
        try {
            const response = await pharmacyApiClient.post('/Compras/GuardarCompra', payload);
            return response.data;
        } catch (error) {
            console.error('Error saving purchase products:', error);
            throw error;
        }
    },

    /**
     * Guarda los datos de facturacion de una compra
     * POST /Compras/GuardarFactura
     */
    guardarFactura: async (payload) => {
        try {
            const response = await pharmacyApiClient.post('/Compras/GuardarFactura', payload);
            return response.data;
        } catch (error) {
            console.error('Error saving purchase invoice:', error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de laboratorios filtrada por nombre
     * GET /Compras/Laboratorio?NombreLaboratorio=...
     */
    getLaboratorios: async (nombre) => {
        try {
            const response = await pharmacyApiClient.get('/Compras/Laboratorio', {
                params: { NombreLaboratorio: nombre }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching laboratorios:', error);
            throw error;
        }
    },

    /**
     * Registra un pago a crédito para una compra
     * POST /Compras/PagarCredito
     */
    pagarCredito: async (payload) => {
        try {
            const response = await pharmacyApiClient.post('/Compras/PagarCredito', payload);
            return response.data;
        } catch (error) {
            console.error('Error in pagarCredito:', error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de compras al crédito con filtros
     * GET /Compras/ComprasCredito?...
     */
    getComprasCredito: async (filters) => {
        try {
            const response = await pharmacyApiClient.get('/Compras/ComprasCredito', {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching compras credito:', error);
            throw error;
        }
    },

    /**
     * Cambiar estado de una compra a ENV
     * PUT /Compras/CambiarEstadoCompra?NumeroCompra=...&Estado=ENV
     */
    cambiarEstadoCompra: async (numeroCompra, estado) => {
        try {
            const response = await pharmacyApiClient.put('/Compras/CambiarEstadoCompra', null, {
                params: { NumeroCompra: numeroCompra, Estado: estado }
            });
            return response.data;
        } catch (error) {
            console.error('Error changing purchase state:', error);
            throw error;
        }
    }
};

export default purchaseService;
