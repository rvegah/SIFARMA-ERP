// src/modules/transfers/services/transferService.js
import pharmacyApiClient from "../../../services/api/pharmacyApiClient";

const transferService = {
    /**
     * Create a new transfer header
     * POST /Traspasos/NuevoTraspaso
     */
    crearTraspaso: async (payload) => {
        try {
            const response = await pharmacyApiClient.post("/Traspasos/NuevoTraspaso", payload);
            return response.data;
        } catch (error) {
            console.error("Error creating transfer:", error);
            throw error;
        }
    },

    /**
     * Search products for transfer
     * GET /Traspasos/Productos
     */
    buscarProductos: async ({ sucursalId, nombre, codigo, lineaId, laboratorioId }) => {
        try {
            if (!sucursalId) {
                throw new Error("La sucursal es obligatoria para la búsqueda.");
            }
            const params = {
                CodigoSucursal: sucursalId,
                ...(nombre && { NombreProducto: nombre }),
                ...(codigo && { CodigoProducto: codigo }),
                ...(lineaId && { LineaProducto: lineaId }),
                ...(laboratorioId && { Laboratorio: laboratorioId }),
            };
            const response = await pharmacyApiClient.get("/Traspasos/Productos", { params });
            // return response.data;
            if (response?.data?.exitoso && Array.isArray(response?.data?.datos)) {
                return { exitoso: true, datos: response?.data?.datos, mensaje: "Productos encontrados" };
            }
            return { exitoso: false, datos: [], mensaje: response?.data?.mensaje || "No se encontraron productos" };
        } catch (error) {
            console.error("Error searching products for transfer:", error);
            throw error;
        }
    },

    /**
     * Save products for a transfer
     * POST /Traspasos/GuardarTraspaso
     */
    guardarTraspaso: async (payload) => {
        try {
            const response = await pharmacyApiClient.post("/Traspasos/GuardarTraspaso", payload);
            return response.data;
        } catch (error) {
            console.error("Error saving transfer products:", error);
            throw error;
        }
    },

    /**
     * Get list of confirmed purchases
     * GET /Traspasos/ListaCompras
     */
    listaCompras: async () => {
        try {
            const response = await pharmacyApiClient.get("/Traspasos/ListaCompras");
            return response.data;
        } catch (error) {
            console.error("Error fetching purchase list for transfers:", error);
            throw error;
        }
    },

    /**
     * Get products from a specific purchase
     * GET /Traspasos/ProductosCompra?NumeroCompra={numeroCompra}
     */
    getProductosCompra: async (numeroCompra) => {
        try {
            const response = await pharmacyApiClient.get("/Traspasos/ProductosCompra", {
                params: { NumeroCompra: numeroCompra }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for purchase ${numeroCompra}:`, error);
            throw error;
        }
    },

    /**
     * Get products by branch report
     * GET /Reportes/ProductosSucursal?Laboratorio={laboratorio}
     */
    getProductosSucursalReporte: async (laboratorio) => {
        try {
            const response = await pharmacyApiClient.get("/Reportes/ProductosSucursal", {
                params: { Laboratorio: laboratorio }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching branch products report:", error);
            throw error;
        }
    }
};

export default transferService;
