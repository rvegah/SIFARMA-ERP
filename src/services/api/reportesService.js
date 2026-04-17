// src/services/api/reportesService.js
import pharmacyApiClient from "./pharmacyApiClient";
import authService from "./authService";

function getCodigoSucursal() {
  const user = authService.getCurrentUser();
  return user?.codigoSucursal_ID ?? 1;
}

function getFechaActual() {
  return new Date().toISOString().split("T")[0];
}

const reportesService = {
  // =========================================================================
  // DASHBOARD — conteos
  // =========================================================================
  async getVentasDia() {
    try {
      const res = await pharmacyApiClient.get("/Reportes/VentasSucursales", {
        params: { CodigoSucursal: getCodigoSucursal() },
      });
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getComprasDia() {
    try {
      const res = await pharmacyApiClient.get("/Reportes/ComprasSucursales", {
        params: { CodigoSucursal: getCodigoSucursal() },
      });
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getTraspasosDia() {
    try {
      const res = await pharmacyApiClient.get("/Reportes/TraspasosSucursales", {
        params: { CodigoSucursal: getCodigoSucursal() },
      });
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getComprasCredito() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/ComprasCreditoSucursales",
        {
          params: { CodigoSucursal: getCodigoSucursal() },
        },
      );
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getProductosStockNegativo() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/ProductosStockNegativo",
        {
          params: { CodigoSucursal: getCodigoSucursal() },
        },
      );
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getVentasEliminadas() {
    try {
      const res = await pharmacyApiClient.get("/Reportes/VentasEliminadas", {
        params: { CodigoSucursal: getCodigoSucursal() },
      });
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getTraspasosNoAceptados() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/TraspasosNoAceptados",
        {
          params: { CodigoSucursal: getCodigoSucursal() },
        },
      );
      const datos = res.data?.datos ?? [];
      return { count: datos.length, datos };
    } catch {
      return { count: 0, datos: [] };
    }
  },

  async getGraficoProductosMasVendidos() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/GraficoProductosMasVendidos",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // =========================================================================
  // BUSCADORES
  // =========================================================================

  // Ventas
  async buscarVentas(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarVentasSucursal",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            NumeroFactura: filtros.numeroFactura ?? "",
            DocumentoIdentidad: filtros.documentoIdentidad ?? "",
            FechaActual: filtros.fechaActual ?? getFechaActual(),
            CodigoProducto: filtros.codigoProducto ?? "",
            NombreProducto: filtros.nombreProducto ?? "",
            TipoDescuento: filtros.tipoDescuento ?? "Todos",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Compras
  async buscarCompras(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarComprasSucursal",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            FechaInicial: filtros.fechaInicial ?? getFechaActual(),
            FechaFinal: filtros.fechaFinal ?? getFechaActual(),
            CodigoProducto: filtros.codigoProducto ?? "",
            NombreProducto: filtros.nombreProducto ?? "",
            Laboratorio: filtros.laboratorio ?? "",
            NumeroFactura: filtros.numeroFactura ?? "",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Traspasos
  async buscarTraspasos(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarTraspasosSucursal",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            FechaInicial: filtros.fechaInicial ?? getFechaActual(),
            FechaFinal: filtros.fechaFinal ?? getFechaActual(),
            CodigoProducto: filtros.codigoProducto ?? "",
            NombreProducto: filtros.nombreProducto ?? "",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Compras a crédito
  async buscarComprasCredito(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarComprasCreditosSucursal",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            FechaInicial: filtros.fechaInicial ?? getFechaActual(),
            FechaFinal: filtros.fechaFinal ?? getFechaActual(),
            Laboratorio: filtros.laboratorio ?? "",
            NumeroFactura: filtros.numeroFactura ?? "",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Stock negativo
  async buscarProductosStockNegativo() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarProductosStockNegativo",
        {
          params: { CodigoSucursal: getCodigoSucursal() },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Ventas eliminadas
  async buscarVentasEliminadas(filtros = {}) {
    try {
      const user = authService.getCurrentUser();
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarVentasEliminadas",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            Usuario_ID: filtros.usuarioId ?? user?.usuario_ID ?? 0,
            FechaActual: filtros.fechaActual ?? getFechaActual(),
            CodigoProducto: filtros.codigoProducto ?? "",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Traspasos no aceptados
  async buscarTraspasosNoAceptados() {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarTraspasosNoAceptados",
        {
          params: { CodigoSucursal: getCodigoSucursal() },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  // Gráfico por mes
  async buscarGraficoProductosMasVendidos(numeroMes) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/BuscarGraficoProductosMasVendidos",
        {
          params: {
            CodigoSucursal: getCodigoSucursal(),
            NumeroMesVenta: numeroMes ?? new Date().getMonth() + 1,
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getVentasDiarias(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/VentasDiarias", {
        params: {
          CodigoSucursal: filtros.codigoSucursal || getCodigoSucursal(),
          CodigoUsuario: filtros.codigoUsuario ?? 0,
          FechaInicio: filtros.fechaInicio,
          FechaFinal: filtros.fechaFinal,
          CodigoProducto: filtros.codigoProducto ?? "",
          NombreProducto: filtros.nombreProducto ?? "",
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getVentasMensuales(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/VentasMensuales", {
        params: {
          CodigoSucursal: filtros.codigoSucursal || getCodigoSucursal(),
          CodigoUsuario: filtros.codigoUsuario ?? 0,
          FechaInicio: filtros.fechaInicio,
          FechaFinal: filtros.fechaFinal,
          CodigoProducto: filtros.codigoProducto ?? "",
          NombreProducto: filtros.nombreProducto ?? "",
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getVentasGeneral(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/VentaGeneral", {
        params: {
          CodigoSucursal: getCodigoSucursal(),
          FechaInicio: filtros.fechaInicio,
          FechaFinal: filtros.fechaFinal,
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async buscarProductos(query, codigoSucursal, signal) {
    try {
      const esCodigo = /^[A-Z]{2,4}-\d{3,6}$/i.test(query.trim());
      const res = await pharmacyApiClient.get("/Productos/Buscar", {
        params: {
          CodigoSucursal: codigoSucursal || getCodigoSucursal(),
          ...(esCodigo
            ? { CodigoProducto: query.trim().toUpperCase() }
            : { Producto: query.trim() }),
        },
        signal,
      });
      return res.data?.datos ?? [];
    } catch (err) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      return [];
    }
  },

  async getListaProductos(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/ListaProductos", {
        params: {
          CodigoSucursal: filtros.codigoSucursal,
          Linea_ID: filtros.lineaId,
          CodigoProducto: filtros.codigoProducto ?? "",
          NombrePoducto: filtros.nombreProducto ?? "", // typo intencional del API
          Laboratorio_ID: filtros.laboratorioId ?? "",
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getLineasProductos() {
    try {
      const res = await pharmacyApiClient.get("/Productos/LineaProductos");
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getLaboratoriosPorLinea(codigoLinea) {
    try {
      const res = await pharmacyApiClient.get("/Productos/Laboratorios", {
        params: { CodigoLineaProducto: codigoLinea },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getHistorialVentas(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/HistorialVentas", {
        params: {
          CodigoSucursal: filtros.codigoSucursal,
          CodigoUsuario: filtros.codigoUsuario,
          Fecha: filtros.fecha,
          CodigoProducto: filtros.codigoProducto ?? "",
          NombreProducto: filtros.nombreProducto ?? "",
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getProductosVencidos(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/ProductosVencidos", {
        params: {
          CodigoSucursal: filtros.codigoSucursal,
          FechaInicio: filtros.fechaInicio,
          FechaFinal: filtros.fechaFinal,
          Linea_ID: filtros.lineaId,
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getProductosMasVendidos(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get(
        "/Reportes/ProductosMasVendidos",
        {
          params: {
            CodigoSucursal: filtros.codigoSucursal,
            FechaInicio: filtros.fechaInicio,
            FechaFinal: filtros.fechaFinal,
            CodigoProducto: filtros.codigoProducto ?? "",
            NombreProducto: filtros.nombreProducto ?? "",
          },
        },
      );
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },

  async getPedidosSucursal(filtros = {}) {
    try {
      const res = await pharmacyApiClient.get("/Reportes/PedidosSucursal", {
        params: {
          CodigoSucursal: filtros.codigoSucursal,
          FechaInicio: filtros.fechaInicio,
          FechaFinal: filtros.fechaFinal,
          CodigoProducto: filtros.codigoProducto ?? "",
          NombreProducto: filtros.nombreProducto ?? "",
        },
      });
      return res.data?.datos ?? [];
    } catch {
      return [];
    }
  },
};

export default reportesService;
