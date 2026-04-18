// src/modules/transfers/services/transferService.js
import pharmacyApiClient from "../../../services/api/pharmacyApiClient";

const transferService = {
  crearTraspaso: async (payload) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Traspasos/NuevoTraspaso",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  },

  buscarProductos: async ({
    sucursalId,
    nombre,
    codigo,
    lineaId,
    laboratorioId,
  }) => {
    try {
      if (!sucursalId)
        throw new Error("La sucursal es obligatoria para la búsqueda.");
      const params = {
        CodigoSucursal: sucursalId,
        ...(nombre && { NombreProducto: nombre }),
        ...(codigo && { CodigoProducto: codigo }),
        ...(lineaId && { LineaProducto: lineaId }),
        ...(laboratorioId && { Laboratorio: laboratorioId }),
      };
      const response = await pharmacyApiClient.get("/Traspasos/Productos", {
        params,
      });
      if (response?.data?.exitoso && Array.isArray(response?.data?.datos)) {
        return {
          exitoso: true,
          datos: response?.data?.datos,
          mensaje: "Productos encontrados",
        };
      }
      return {
        exitoso: false,
        datos: [],
        mensaje: response?.data?.mensaje || "No se encontraron productos",
      };
    } catch (error) {
      console.error("Error searching products for transfer:", error);
      throw error;
    }
  },

  guardarTraspaso: async (payload) => {
    try {
      const response = await pharmacyApiClient.post(
        "/Traspasos/GuardarTraspaso",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error saving transfer products:", error);
      throw error;
    }
  },

  // PUT /Traspasos/CambiarEstado?NumeroTraspaso=xxx&EstadoTraspaso=ENV
  cambiarEstado: async (numeroTraspaso, estadoTraspaso) => {
    try {
      const response = await pharmacyApiClient.put(
        "/Traspasos/CambiarEstado",
        null,
        {
          params: {
            NumeroTraspaso: numeroTraspaso,
            EstadoTraspaso: estadoTraspaso,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing transfer state:", error);
      throw error;
    }
  },

  // GET /Traspasos/EditarTraspaso?NumeroTraspaso=xxx
  editarTraspaso: async (numeroTraspaso) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Traspasos/EditarTraspaso",
        {
          params: { NumeroTraspaso: numeroTraspaso },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transfer detail:", error);
      throw error;
    }
  },

  // GET /Traspasos/BuscarTraspasos
  buscarTraspasos: async (params) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Traspasos/BuscarTraspasos",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error searching transfers:", error);
      throw error;
    }
  },

  listaCompras: async () => {
    try {
      const response = await pharmacyApiClient.get("/Traspasos/ListaCompras");
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase list for transfers:", error);
      throw error;
    }
  },

  getProductosCompra: async (numeroCompra) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Traspasos/ProductosCompra",
        {
          params: { NumeroCompra: numeroCompra },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching products for purchase ${numeroCompra}:`,
        error,
      );
      throw error;
    }
  },

  getProductosSucursalReporte: async (laboratorio) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Reportes/ProductosSucursal",
        {
          params: { Laboratorio: laboratorio },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching branch products report:", error);
      throw error;
    }
  },
};

export default transferService;
