// src/modules/sales/services/orderService.js
import pharmacyApiClient from '../../../services/api/pharmacyApiClient';

const orderService = {
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
     * Crea un nuevo pedido (cabecera)
     * POST /Pedidos/CrearPedido
     */
    crearPedido: async (pedidoData) => {
        try {
            const response = await pharmacyApiClient.post('/Pedidos/CrearPedido', pedidoData);
            return response.data;
        } catch (error) {
            console.error('Error creating pedido:', error);
            throw error;
        }
    },

    /**
     * Guarda el detalle del pedido (productos)
     * POST /Pedidos/GuardarPedido
     */
    guardarPedido: async (detalleData) => {
        try {
            const response = await pharmacyApiClient.post('/Pedidos/GuardarPedido', detalleData);
            return response.data;
        } catch (error) {
            console.error('Error saving products to pedido:', error);
            throw error;
        }
    },

    /**
     * Busca pedidos (Mis Pedidos)
     * GET /Pedidos/MisPedidos
     */
    getMisPedidos: async (params) => {
        try {
            const response = await pharmacyApiClient.get('/Pedidos/MisPedidos', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching mis pedidos:', error);
            throw error;
        }
    },

    /**
     * Obtiene el detalle de un pedido para editarlo
     * GET /Pedidos/EditarPedido?NumeroPedido=...
     */
    getPedidoDetalle: async (numeroPedido) => {
        try {
            const response = await pharmacyApiClient.get(`/Pedidos/EditarPedido`, {
                params: { NumeroPedido: numeroPedido }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pedido detalle:', error);
            throw error;
        }
    },

    /**
     * Cambia el estado de un pedido
     * PUT /Pedidos/CambiarEstado?NumeroPedido=...&EstadoPedido=...
     */
    cambiarEstadoPedido: async (numeroPedido, estado) => {
        try {
            const response = await pharmacyApiClient.put('/Pedidos/CambiarEstado', null, {
                params: {
                    NumeroPedido: numeroPedido,
                    EstadoPedido: estado
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error changing order status:', error);
            throw error;
        }
    }
};

export default orderService;
