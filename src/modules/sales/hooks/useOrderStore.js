// src/modules/sales/hooks/useOrderStore.js

const BASE_KEY = "@sifarma/order_";
const NEW_ORDER_KEY = "NEW_ORDER";

export const useOrderStore = () => {
    /**
     * Construye la llave de storage basada en el numeroPedido o un flag de nuevo pedido
     */
    const getStorageKey = (id) => {
        const key = id || NEW_ORDER_KEY;
        return `${BASE_KEY}${key}`;
    };

    /**
     * Guarda el estado actual del pedido en localStorage
     */
    const savePendingOrder = (id, orderData, selectedProducts) => {
        try {
            const key = getStorageKey(id);
            const dataToStore = {
                orderData,
                selectedProducts,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(key, JSON.stringify(dataToStore));
            // Actualizar lista de pedidos con cambios pendientes (opcional para busqueda rápida)
        } catch (error) {
            console.error("Error saving pending order to store:", error);
        }
    };

    /**
     * Recupera el pedido guardado si existe
     */
    const getPendingOrder = (id) => {
        try {
            const key = getStorageKey(id);
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (error) {
            console.error("Error reading pending order from store:", error);
            return null;
        }
    };

    /**
     * Limpia el almacenamiento para un ID específico
     */
    const clearPendingOrder = (id) => {
        try {
            const key = getStorageKey(id);
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Error clearing pending order store:", error);
        }
    };

    /**
     * Verifica si hay un pedido pendiente válido para un ID
     */
    const hasPendingOrder = (id) => {
        const data = getPendingOrder(id);
        if (!data) return false;

        // Un pedido nuevo es válido si tiene sucursal o productos
        if (!id) {
            return !!(data.selectedProducts?.length > 0 || data.orderData?.sucursalId);
        }

        // Un pedido existente es válido si tiene productos (pueden ser los mismos que en BD o modificados)
        // La lógica de "si hay cambios" se manejará en el hook useOrders comparando con el API
        return !!(data.selectedProducts?.length > 0);
    };

    return {
        savePendingOrder,
        getPendingOrder,
        clearPendingOrder,
        hasPendingOrder
    };
};
