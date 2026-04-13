// src/modules/purchases/services/purchaseService.js
import pharmacyApiClient from "../../../services/api/pharmacyApiClient";

const purchaseService = {
  /**
   * Obtiene los tipos de formas de pago
   * GET /Compras/TipoFormasPago
   */
  getFormasPago: async () => {
    try {
      const response = await pharmacyApiClient.get("/Compras/TipoFormasPago");
      return response.data;
    } catch (error) {
      console.error("Error fetching formas pago:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de proveedores
   * GET /Compras/Proveedores
   */
  getProveedores: async () => {
    try {
      const response = await pharmacyApiClient.get("/Compras/Proveedores");
      return response.data;
    } catch (error) {
      console.error("Error fetching proveedores:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de pedidos disponibles para una sucursal
   * GET /Compras/ListaPedidos?CodigoSucursal=...&EstadoPedido=ENV
   */
  getListaPedidos: async (codigoSucursal) => {
    try {
      const response = await pharmacyApiClient.get("/Compras/ListaPedidos", {
        params: {
          CodigoSucursal: codigoSucursal,
          EstadoPedido: "ENV",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching lista pedidos:", error);
      throw error;
    }
  },

  /**
   * Busca productos para agregar a una compra
   * GET /Compras/Productos?CodigoSucursal=...&NombreProducto=...&CodigoProducto=...
   */
  buscarProductos: async ({ sucursalId, nombre, codigo }, signal = null) => {
    try {
      const params = { CodigoSucursal: sucursalId };
      if (nombre) params.NombreProducto = nombre;
      if (codigo) params.CodigoProducto = codigo;

      const config = { params };
      if (signal) config.signal = signal;

      const response = await pharmacyApiClient.get(
        "/Compras/Productos",
        config,
      );
      return response.data;
    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        return { exitoso: true, datos: [] };
      }
      console.error("Error buscando productos de compra:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva compra (cabecera)
   * POST /Compras/NuevaCompra
   */
  crearCompra: async (compraData) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Compras/NuevaCompra",
        compraData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating compra:", error);
      throw error;
    }
  },

  /**
   * Guarda los productos de una compra
   * POST /Compras/GuardarCompra
   */
  guardarProductos: async (payload) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Compras/GuardarCompra",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error saving purchase products:", error);
      throw error;
    }
  },

  /**
   * Guarda los datos de facturación de una compra
   * POST /Compras/GuardarFactura
   */
  guardarFactura: async (payload) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Compras/GuardarFactura",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error saving purchase invoice:", error);
      throw error;
    }
  },

  /**
   * Actualiza los datos de la factura de una compra
   * PUT /Compras/ActualizarFactura
   */
  actualizarFactura: async (payload) => {
    try {
      const response = await pharmacyApiClient.put(
        "/Compras/ActualizarFactura",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating purchase invoice:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de laboratorios filtrada por nombre
   * GET /Compras/Laboratorio?NombreLaboratorio=...
   */
  getLaboratorios: async (nombre) => {
    try {
      const response = await pharmacyApiClient.get("/Compras/Laboratorio", {
        params: { NombreLaboratorio: nombre },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching laboratorios:", error);
      throw error;
    }
  },

  /**
   * Registra un pago a crédito para una compra
   * POST /Compras/PagarCredito
   */
  pagarCredito: async (payload) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Compras/PagarCredito",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error in pagarCredito:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de compras al crédito con filtros
   * GET /Compras/ComprasCredito?...
   */
  getComprasCredito: async (filters) => {
    try {
      const response = await pharmacyApiClient.get("/Compras/ComprasCredito", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching compras credito:", error);
      throw error;
    }
  },

  /**
   * Obtiene el listado de mis compras con filtros
   * GET /Compras/MisCompras?CodigoSucursal=...&FechaCompraInicio=...&FechaCompraFinal=...&EstadoCompra=...
   */
  getMisCompras: async (filters) => {
    try {
      const response = await pharmacyApiClient.get("/Compras/MisCompras", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching mis compras:", error);
      throw error;
    }
  },

  /**
   * Cambiar estado de una compra
   * PUT /Compras/CambiarEstadoCompra?NumeroCompra=...&Estado=...
   */
  cambiarEstadoCompra: async (numeroCompra, estado) => {
    try {
      const response = await pharmacyApiClient.put(
        "/Compras/CambiarEstadoCompra",
        null,
        {
          params: { NumeroCompra: numeroCompra, Estado: estado },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing purchase state:", error);
      throw error;
    }
  },

  // GET /Compras/EditarCompra?NumeroCompra=...
  getEditarCompra: async (numeroCompra) => {
    try {
      const response = await pharmacyApiClient.get("/Compras/EditarCompra", {
        params: { NumeroCompra: numeroCompra },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching editar compra:", error);
      throw error;
    }
  },
};

export default purchaseService;
