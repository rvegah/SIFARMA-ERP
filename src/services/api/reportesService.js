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
          CodigoSucursal: getCodigoSucursal(),
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
          CodigoSucursal: getCodigoSucursal(),
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
};

export default reportesService;
