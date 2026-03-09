// src/modules/sales/services/siatApiService.js
// Integración con SiatAPI (.NET 8) — FacturacionController

import siatApiClient from "./siatApiClient";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const SIAT_DEFAULTS = {
  codigoActividad: 4772100, // Comercio al por menor de productos farmacéuticos
  codigoDocumentoSector: 1, // Compra/Venta (sector 1)
  tipoFactura: 1, // Con derecho a crédito fiscal
  codigoMoneda: 1, // Bolivianos
  tipoCambio: 1,
  codigoProductoSin: "1003655", // Productos farmacéuticos
  unidadMedidaDefault: 58, // Unidad
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getCodigoExcepcion(nitCliente) {
  const map = { 99001: 1, 99002: 2, 99003: 3, 4444: 4 };
  return map[String(nitCliente)] ?? 0;
}

function getTipoDocumentoIdentidad(nitCliente, tipoDocumento) {
  if (tipoDocumento) return parseInt(tipoDocumento);
  const specialNit = ["99001", "99002", "99003", "4444"];
  return specialNit.includes(String(nitCliente)) ? 5 : 1;
}

/**
 * Mapea items del carrito → DetalleFacturaDto[]
 * Usa los campos reales del API farmacia (codigoSin, codigoActividad, unidadMedida)
 */
function mapSaleItemsToDetalles(saleItems) {
  return saleItems.map((item) => ({
    codigoProducto: item.codigo || item.codigoProducto || "PROD001",
    codigoActividad: item.codigoActividad || SIAT_DEFAULTS.codigoActividad,
    codigoProductoSin:
      item.codigoProductoSin ||
      item.codigoSin ||
      SIAT_DEFAULTS.codigoProductoSin,
    descripcion: item.nombre || item.descripcion || "Producto",
    cantidad: parseFloat(item.cantidad || 1),
    unidadMedida: item.unidadMedida || SIAT_DEFAULTS.unidadMedidaDefault,
    precioUnitario: parseFloat(item.precio || item.precioUnitario || 0),
    montoDescuento: parseFloat(item.descuento || 0),
    numeroSerie: item.numeroSerie || null,
    numeroImei: item.numeroImei || null,
  }));
}

function buildEmitirFacturaRequest(
  clientForm,
  saleItems,
  totals,
  options = {},
) {
  const {
    sucursalId = 0,
    puntoVentaId = 0,
    tipoMetodoPago = 1,
    montoPagadoEfectivo = 0,
    montoPagadoTarjeta = 0,
    numeroTarjeta = null,
    montoGiftCard = 0,
  } = options;

  const nitCliente = String(clientForm.nit || clientForm.nitCliente || "4444");
  const montoTotal = parseFloat(totals.total || totals.montoTotal || 0);
  const descuentoAdicional = parseFloat(
    totals.descuentoAdicional || totals.additionalDiscount || 0,
  );

  return {
    // Cliente
    nitCliente,
    razonSocialCliente:
      clientForm.nombre ||
      clientForm.razonSocial ||
      clientForm.name ||
      "SIN NOMBRE",
    complementoCliente: clientForm.complemento || null,
    tipoDocumentoIdentidad: getTipoDocumentoIdentidad(
      nitCliente,
      clientForm.tipoDocumento,
    ),
    emailCliente: clientForm.email || null,
    direccionCliente: clientForm.direccion || null,

    // Factura
    sucursalId,
    puntoVentaId,
    codigoActividad: options.codigoActividad || SIAT_DEFAULTS.codigoActividad,
    codigoDocumentoSector:
      options.codigoDocumentoSector || SIAT_DEFAULTS.codigoDocumentoSector,
    periodoFacturado: options.periodoFacturado || undefined,
    tipoFactura: options.tipoFactura || SIAT_DEFAULTS.tipoFactura,
    tipoMetodoPago,
    codigoMoneda: SIAT_DEFAULTS.codigoMoneda,
    tipoCambio: SIAT_DEFAULTS.tipoCambio,

    // Montos
    descuentoAdicional,
    montoGiftCard,
    montoAPagar: montoTotal - montoGiftCard,
    montoPagadoEfectivo: parseFloat(montoPagadoEfectivo) || montoTotal,
    montoPagadoTarjeta: parseFloat(montoPagadoTarjeta) || 0,
    numeroTarjeta: numeroTarjeta || null,

    // Excepción NITs especiales
    codigoExcepcion: getCodigoExcepcion(nitCliente),

    // Detalles
    detalles: mapSaleItemsToDetalles(saleItems),
  };
}

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

async function emitirFactura(clientForm, saleItems, totals, options = {}) {
  const requestDto = buildEmitirFacturaRequest(
    clientForm,
    saleItems,
    totals,
    options,
  );

  console.log("[SiatAPI] Emitiendo factura...", {
    nit: requestDto.nitCliente,
    razonSocial: requestDto.razonSocialCliente,
    sucursalId: requestDto.sucursalId,
    puntoVentaId: requestDto.puntoVentaId,
    total: requestDto.montoAPagar,
    items: requestDto.detalles.length,
  });

  const response = await siatApiClient.post("/Facturacion/emitir", requestDto);
  const { data } = response;

  if (!data.success) {
    throw new Error(
      data.message || data.errors?.join("\n") || "Error al emitir factura",
    );
  }

  const factura = data.data;
  const nitEmisor = factura.nitEmisor ?? "425567025";
  return {
    success: true,
    facturaId: factura.facturaId,
    numeroFactura: factura.numeroFactura,
    cuf: factura.cuf,
    codigoAutorizacion: factura.cuf,
    estado: factura.estado,
    tipoEmision: factura.tipoEmision ?? 1,
    esEnLinea: (factura.tipoEmision ?? 1) === 1,
    fechaEmision: factura.fechaEmision,
    montoTotal: factura.montoTotal,
    mensaje: factura.mensaje,
    urlVerificacion: buildSiatQrUrl(
      factura.cuf,
      nitEmisor,
      factura.numeroFactura,
    ),
  };
}

async function anularFactura(facturaId, codigoMotivo) {
  console.log(
    `[SiatAPI] Anulando factura ID=${facturaId}, motivo=${codigoMotivo}`,
  );

  const response = await siatApiClient.post(
    `/Facturacion/anular/${facturaId}`,
    {
      facturaId,
      codigoMotivo,
    },
  );
  const { data } = response;

  if (!data.success) {
    throw new Error(data.message || "Error al anular factura");
  }

  const resultado = data.data;
  return {
    success: true,
    facturaId: resultado.facturaId,
    numeroFactura: resultado.numeroFactura,
    cuf: resultado.cuf,
    fechaAnulacion: resultado.fechaAnulacion,
    mensaje: resultado.mensaje,
  };
}

async function revertirAnulacion(facturaId) {
  const response = await siatApiClient.post(
    `/Facturacion/revertir/${facturaId}`,
  );
  const { data } = response;
  if (!data.success)
    throw new Error(data.message || "Error al revertir anulación");
  return { success: true, ...data.data };
}

async function listarFacturas(params = {}) {
  try {
    const { page = 1, pageSize = 20 } = params;
    const response = await siatApiClient.get("/Facturacion/listar", {
      params: { page, pageSize },
    });
    const { data } = response;
    return data.data || data || [];
  } catch (error) {
    console.error(
      "[SiatAPI] Error al listar facturas:",
      extractErrorMessage(error),
    );
    return [];
  }
}

async function listarFacturasParaAnular(filters = {}) {
  try {
    const response = await siatApiClient.get(
      "/Facturacion/listar-para-anular",
      {
        params: {
          nitCliente: filters.nitCliente || undefined,
          fechaDesde: filters.fechaDesde || undefined,
          fechaHasta: filters.fechaHasta || undefined,
          page: filters.page || 1,
          pageSize: filters.pageSize || 20,
        },
      },
    );
    return response.data.data || { facturas: [], paginacion: {} };
  } catch (error) {
    console.error(
      "[SiatAPI] Error listar para anular:",
      extractErrorMessage(error),
    );
    return { facturas: [], paginacion: {} };
  }
}

async function listarFacturasAnuladas(filters = {}) {
  try {
    const response = await siatApiClient.get("/Facturacion/listar-anuladas", {
      params: {
        nitCliente: filters.nitCliente || undefined,
        fechaDesde: filters.fechaDesde || undefined,
        fechaHasta: filters.fechaHasta || undefined,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
      },
    });
    return response.data.data || { facturas: [], paginacion: {} };
  } catch (error) {
    console.error(
      "[SiatAPI] Error listar anuladas:",
      extractErrorMessage(error),
    );
    return { facturas: [], paginacion: {} };
  }
}

async function obtenerFactura(facturaId) {
  try {
    const response = await siatApiClient.get(`/Facturacion/${facturaId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(
      "[SiatAPI] Error obtener factura:",
      extractErrorMessage(error),
    );
    return null;
  }
}

function getPdfUrl(facturaId, format = "normal") {
  return `${siatApiClient.defaults.baseURL}/Facturacion/${facturaId}/pdf?format=${format}`;
}

async function reenviarPorEmail(facturaId, email) {
  const response = await siatApiClient.post(
    `/Facturacion/${facturaId}/resend`,
    { email, tipoNotificacion: null },
  );
  if (!response.data.success)
    throw new Error(response.data.message || "Error al reenviar");
  return response.data;
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function buildSiatQrUrl(cuf, nit = "425567025", numeroFactura = "") {
  if (!cuf) return "";
  return `https://pilotosiat.impuestos.gob.bo/consulta/QR?nit=${nit}&cuf=${cuf}&numero=${numeroFactura}&t=2`;
}

function extractErrorMessage(error) {
  if (!error.response) return error.message || "Error de conexión con SiatAPI";
  const d = error.response.data;
  if (d?.errors?.length > 0) return d.errors.join("\n");
  if (d?.message) return d.message;
  if (typeof d === "string") return d;
  const s = error.response.status;
  if (s === 400) return "Datos de factura inválidos.";
  if (s === 404) return "Factura no encontrada.";
  if (s === 500) return "Error interno del servidor SiatAPI.";
  return `Error ${s}: ${error.message}`;
}

async function getTiposDocumentoIdentidad() {
  try {
    const response = await siatApiClient.get(
      "/Sincronizacion/tipos-documento-identidad",
    );
    return response.data?.data || [];
  } catch (error) {
    console.error(
      "[SiatAPI] Error al cargar tipos documento:",
      extractErrorMessage(error),
    );
    return [];
  }
}

async function getActividadesDocumentoSector() {
  try {
    const response = await siatApiClient.get(
      "/Sincronizacion/tipos-documento-sector",
    );
    return response.data?.data || [];
  } catch (error) {
    console.error(
      "[SiatAPI] Error al cargar sectores documento:",
      extractErrorMessage(error),
    );
    return [];
  }
}

async function getEmpresaInfo() {
  try {
    const response = await siatApiClient.get("/Configuracion/empresa-info");
    return response.data?.data || null;
  } catch (error) {
    console.error("❌ [SiatAPI] Error al cargar empresa info:", error);
    return null;
  }
}

async function getUnidadesMedida() {
  try {
    const response = await siatApiClient.get("/Sincronizacion/unidades-medida");
    // Convertir array a Map: { 62: "CAJA", 57: "UNIDAD (BIENES)", ... }
    const data = response.data?.data || [];
    const mapa = {};
    data.forEach((u) => {
      mapa[u.codigoClasificador] = u.descripcion;
    });
    return mapa;
  } catch (error) {
    console.error("❌ [SiatAPI] Error al cargar unidades de medida:", error);
    return {}; // fallback vacío, InvoiceFullPDF usará el número
  }
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

const siatApiService = {
  emitirFactura,
  anularFactura,
  revertirAnulacion,
  listarFacturas,
  listarFacturasParaAnular,
  listarFacturasAnuladas,
  obtenerFactura,
  getPdfUrl,
  reenviarPorEmail,
  buildEmitirFacturaRequest,
  buildSiatQrUrl,
  extractErrorMessage,
  SIAT_DEFAULTS,
  getTiposDocumentoIdentidad,
  getActividadesDocumentoSector,
  getEmpresaInfo,
  getUnidadesMedida,
};

export default siatApiService;
export {
  emitirFactura,
  anularFactura,
  revertirAnulacion,
  listarFacturas,
  listarFacturasParaAnular,
  listarFacturasAnuladas,
  obtenerFactura,
  getPdfUrl,
  reenviarPorEmail,
  buildEmitirFacturaRequest,
  buildSiatQrUrl,
  extractErrorMessage,
  SIAT_DEFAULTS,
  getTiposDocumentoIdentidad,
  getActividadesDocumentoSector,
  getEmpresaInfo,
  getUnidadesMedida,
};
