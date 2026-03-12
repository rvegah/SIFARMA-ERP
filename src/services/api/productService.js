// src/services/api/productService.js
// Servicios de productos - catálogos, búsqueda y CRUD vía API Farmacia

import pharmacyApiClient from "./pharmacyApiClient";

const productService = {

  // ==========================================================
  // BUSQUEDA AVANZADA (API FARMACIA)
  // ==========================================================

  /**
   * Buscar productos con filtros avanzados
   * GET /Productos/ListaProductos
   */
  async buscarProductos({ sucursalId, nombre, codigo, lineaId, laboratorioId }) {
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
      const response = await pharmacyApiClient.get("/Productos/ListaProductos", { params });
      if (response.data?.exitoso && Array.isArray(response.data?.datos)) {
        return { exitoso: true, datos: response.data.datos, mensaje: "Productos encontrados" };
      }
      return { exitoso: false, datos: [], mensaje: response.data?.mensaje || "No se encontraron productos" };
    } catch (error) {
      console.error("❌ Error buscando productos:", error);
      throw error;
    }
  },

  // ==========================================================
  // CRUD REAL (API FARMACIA)
  // ==========================================================

  /**
   * Guardar nuevo producto
   * POST /Productos/GuardarProducto
   */
  async guardarProducto(payload) {
    try {
      const response = await pharmacyApiClient.post("/Productos/GuardarProducto", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error guardando producto:", error);
      throw error;
    }
  },

  /**
   * Obtener datos del producto para edición
   * GET /Productos/EditarProducto?CodigoProducto=TEC-0127
   */
  async getProductoParaEditar(codigoProducto) {
    try {
      const response = await pharmacyApiClient.get("/Productos/EditarProducto", {
        params: { CodigoProducto: codigoProducto }
      });
      if (response.data?.exitoso && response.data?.datos) {
        return { exitoso: true, datos: response.data.datos };
      }
      return { exitoso: false, datos: null, mensaje: response.data?.mensaje || "No encontrado" };
    } catch (error) {
      console.error("❌ Error obteniendo producto para editar:", error);
      throw error;
    }
  },

  /**
   * Actualizar producto existente
   * PUT /Productos/ActualizarProducto
   */
  async actualizarProducto(payload) {
    try {
      const response = await pharmacyApiClient.put("/Productos/ActualizarProducto", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando producto:", error);
      throw error;
    }
  },

  /**
   * Eliminar producto (mock - reemplazar por DELETE real cuando exista endpoint)
   */
  async eliminar(id) {
    try {
      await new Promise((r) => setTimeout(r, 300));
      return { exitoso: true, mensaje: "Producto eliminado correctamente" };
    } catch (error) {
      console.error("❌ Error eliminando producto:", error);
      throw error;
    }
  },

  // ==========================================================
  // CATALOGOS (API FARMACIA)
  // ==========================================================

  /**
   * Tipo Forma Farmacéutica
   * GET /Productos/TipoFormaFarmaceutica
   */
  async getFormasFarmaceuticas() {
    try {
      const response = await pharmacyApiClient.get("/Productos/TipoFormaFarmaceutica");
      if (response.data?.exitoso && response.data?.datos) {
        return response.data.datos.map(item => ({
          id: item.codigoFormaFarmaceutica,
          nombre: item.nombreTipoFormaFarmaceutica
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching formas farmaceuticas:", error);
      return [];
    }
  },

  /**
   * Unidad de Medida (Presentación)
   * GET /Productos/UnidadMedidaProducto
   */
  async getUnidadesMedida() {
    try {
      const response = await pharmacyApiClient.get("/Productos/UnidadMedidaProducto");
      if (response.data?.exitoso && response.data?.datos) {
        return response.data.datos.map(item => ({
          id: item.codigoUnidadMedida,
          nombre: item.nombreUnidad
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching unidades de medida:", error);
      return [];
    }
  },

  /**
   * Líneas de Productos
   * GET /Productos/LineaProductos
   */
  async getLineas() {
    try {
      const response = await pharmacyApiClient.get("/Productos/LineaProductos");
      if (response.data?.exitoso && response.data?.datos) {
        return response.data.datos.map(item => ({
          id: item.codigoLinea,
          nombre: item.nombreLinea
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching lineas:", error);
      return [];
    }
  },

  /**
   * Laboratorios (dependiente de Línea)
   * GET /Productos/Laboratorios?CodigoLineaProducto={codigoLinea}
   */
  async getLaboratorios(codigoLinea) {
    if (!codigoLinea) return [];
    try {
      const response = await pharmacyApiClient.get("/Productos/Laboratorios", {
        params: { CodigoLineaProducto: codigoLinea }
      });
      if (response.data?.exitoso && response.data?.datos) {
        return response.data.datos.map(item => ({
          id: item.codigoLaboratorio,
          nombre: item.nombreLaboratorio
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching laboratorios:", error);
      return [];
    }
  },

  /**
   * Industrias (países)
   * GET /Productos/Industrias
   */
  async getIndustrias() {
    try {
      const response = await pharmacyApiClient.get("/Productos/Industrias");
      if (response.data?.exitoso && response.data?.datos) {
        return response.data.datos.map(item => ({
          id: item.codigoIndustria,
          nombre: item.nombrePais
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching industrias:", error);
      return [];
    }
  },
};

export default productService;
