// src/modules/sales/services/salesService.js
// Integración real con SiatAPI + Core API + Farmacia API

import { SPECIAL_NIT_CODES, SALE_STATUS } from "../constants/salesConstants";
import siatApiService from "./siatApiService";
import authService from "../../../services/api/authService";
import apiClient from "../../../services/api/apiClient";
import axios from "axios";

// ─── CLIENTE AXIOS PARA API FARMACIA ─────────────────────────────────────────
const farmaciaApiClient = axios.create({
  baseURL: "https://api-farmacia.farmadinamica.com.bo/api/farmalink-farmacia",
  timeout: 45000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ─── HELPER: leer ubicación del usuario logueado ─────────────────────────────
function getLocationFromSession() {
  const user = authService.getCurrentUser();
  return {
    sucursalId: user?.codigoSucursal_SIAT ?? 0,
    puntoVentaId: user?.codigoPuntoVenta_SIAT ?? 0,
    codigoSucursalInterno: user?.codigoSucursal_ID ?? 1,
    usuarioId: user?.usuario_ID ?? 0,
    usuarioCodigo: user?.usuario ?? "",
  };
}

class SalesService {
  // ── PRODUCTOS — endpoint Ventas/BuscarProductos ───────────────────────────
  static async searchProducts(query, signal = null) {
    try {
      const { codigoSucursalInterno } = getLocationFromSession();
      const response = await farmaciaApiClient.get("/Ventas/BuscarProductos", {
        params: {
          CodigoSucursal: codigoSucursalInterno,
          NombreProducto: query,
        },
        signal, // ← axios >= 0.22 lo soporta nativamente
      });

      if (!response.data?.exitoso) {
        throw new Error(response.data?.mensaje || "Error al buscar productos");
      }

      return (response.data.datos || []).map((p) => ({
        id: p.id,
        codigo: p.codigo,
        sku: p.sku,
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoria: p.categoria,
        linea: p.linea,
        laboratorio: p.laboratorio,
        numeroLote: p.numeroLote,
        fechaVencimiento: p.fechaVencimiento?.split("T")[0] || "",
        diasProximoVencimiento: p.diasProximoVencimiento,
        descuentoVencimiento: p.descuentoVencimiento,
        precio: p.precio,
        precioUnitario: p.precio,
        stock: p.stock,
        codigoSin: p.codigoSin,
        codigoProductoSin: p.codigoSin,
        codigoActividad: parseInt(p.codigoActividad) || 4772100,
        unidadMedida: p.unidadMedida || 62,
      }));
    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        return []; // ← NO re-lanzar, simplemente retornar vacío
      }
      console.error("❌ Error al buscar productos:", error.message);
      return [];
    }
  }

  // ── SUCURSALES ────────────────────────────────────────────────────────────
  static async getStockBySucursal(productId) {
    try {
      const response = await apiClient.get(
        "/Organizacion/SucursalesOrganizacion/1",
      );

      if (!response.data?.exitoso) {
        throw new Error(
          response.data?.mensaje || "Error al obtener sucursales",
        );
      }

      return (response.data.datos || []).map((s) => ({
        sucursalId: s.sucursal_ID,
        sucursal: s.nombreSucursal,
        direccion: s.direccion,
        ciudad: s.ciudad,
        telefono: s.telefono?.trim(),
        esPrincipal: s.esPrincipal,
        estado: s.estado,
        stock: null,
        precio: null,
      }));
    } catch (error) {
      console.error("❌ Error al obtener sucursales:", error.message);
      return [];
    }
  }

  // ── BUSCAR CLIENTE POR DOCUMENTO O RAZÓN SOCIAL ───────────────────────────
  // GET /Ventas/DatosCliente?NumeroDocumento=&RazonSocialCliente=
  // Se llama en onBlur del campo NIT/CI o Nombre Completo
  static async getClienteByDocumento({ numeroDocumento, razonSocial } = {}) {
    try {
      const params = {};
      if (numeroDocumento) params.NumeroDocumento = numeroDocumento;
      if (razonSocial) params.RazonSocialCliente = razonSocial;

      if (!params.NumeroDocumento && !params.RazonSocialCliente) return null;

      console.log("🔍 Buscando cliente en FARMADINAMICA:", params);

      const response = await farmaciaApiClient.get("/Ventas/DatosCliente", {
        params,
      });

      if (!response.data?.exitoso) {
        console.log("ℹ️ Cliente no encontrado en FARMADINAMICA");
        return null;
      }

      const lista = response.data.datos;
      const d = Array.isArray(lista) ? lista[0] : lista;
      if (!d) return null;

      // Mapear respuesta al formato de clientForm
      return {
        nit: d.numeroDocumento || "",
        complemento: d.complemento || "",
        nombre: d.razonSocialCliente || "",
        celular: d.celular || "",
        email: d.correoElectronico || "",
        // Convertir fecha ISO → "yyyy-MM-dd" para input type="date"
        fechaNacimiento: d.fechaNacimiento
          ? d.fechaNacimiento.split("T")[0]
          : "",
        tipoDocumento: d.tipoDocumento ? String(d.tipoDocumento) : "1",
        // Datos extra para guardarCliente (no se muestran en form)
        codigoCliente: d.codigoCliente || null,
        nombresCliente: d.nombresCliente || "",
        apellidosCliente: d.apellidosCliente || "",
      };
    } catch (error) {
      // No propagar: si el cliente no existe en BD es normal
      console.warn("⚠️ getClienteByDocumento:", error.message);
      return null;
    }
  }

  // ── GUARDAR CLIENTE EN FARMADINAMICA ──────────────────────────────────────
  // POST /Ventas/GuardarCliente
  // Se llama al presionar el botón "Guardar Cliente" (◇) en ClientForm
  static async guardarCliente(clientForm) {
    try {
      const user = authService.getCurrentUser();

      // Construir fecha de nacimiento en ISO con zona horaria Bolivia (UTC-4)
      let fechaNacimientoISO = null;
      if (clientForm.fechaNacimiento) {
        // clientForm.fechaNacimiento viene como "yyyy-MM-dd"
        fechaNacimientoISO = new Date(
          clientForm.fechaNacimiento + "T00:00:00",
        ).toISOString();
      }

      const payload = {
        tipoDocumento: parseInt(clientForm.tipoDocumento || "1"),
        numeroDocumento: clientForm.nit || "",
        complemento: clientForm.complemento || "",
        razonSocialCliente: clientForm.nombre || "",
        // nombresCliente y apellidosCliente: si el nombre tiene espacio lo separamos,
        // de lo contrario todo va a razonSocial y estos quedan vacíos
        nombresCliente: clientForm.nombresCliente || "",
        apellidosCliente: clientForm.apellidosCliente || "",
        celular: clientForm.celular || "",
        correoElectronico: clientForm.email || "",
        fechaNacimiento: fechaNacimientoISO,
        codigoEmpleadoAlta: user?.usuario || "SYSTEMAS",
      };

      console.log("💾 Guardando cliente en FARMADINAMICA:", payload);

      const response = await farmaciaApiClient.post(
        "/Ventas/GuardarCliente",
        payload,
      );

      if (!response.data?.exitoso) {
        throw new Error(response.data?.mensaje || "Error al guardar cliente");
      }

      console.log("✅ Cliente guardado:", response.data.datos);

      return {
        success: true,
        message: response.data.mensaje || "Cliente guardado correctamente",
        datos: response.data.datos,
      };
    } catch (error) {
      console.error("❌ guardarCliente:", error.message);
      return {
        success: false,
        message: error.message || "Error al guardar el cliente",
      };
    }
  }

  // ── CLIENTE (búsqueda SIAT/local) ─────────────────────────────────────────
  static async searchOrCreateClient(nit) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (SPECIAL_NIT_CODES[nit]) {
          resolve({ nit, nombre: SPECIAL_NIT_CODES[nit], tipo: "5" });
          return;
        }
        resolve({
          nit,
          nombre: "",
          tipo: SalesService.detectDocumentType(nit),
          celular: "",
          email: "",
        });
      }, 200);
    });
  }

  static detectDocumentType(nit) {
    if (!nit) return "1";
    if (nit.startsWith("E")) return "2";
    if (nit.length <= 8) return "1";
    if (nit.length > 8) return "5";
    return "4";
  }

  // ── GUARDAR VENTA SIN FACTURAR ────────────────────────────────────────────
  static async saveSale(saleData) {
    const { usuarioId, usuarioCodigo } = getLocationFromSession();
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("💾 Venta guardada (sin facturar):", {
          ...saleData,
          usuarioId,
          usuarioCodigo,
        });
        resolve({
          success: true,
          sale: {
            id: Date.now(),
            ...saleData,
            usuarioId,
            status: SALE_STATUS.SAVED,
          },
          message: "Venta guardada exitosamente (sin facturar)",
        });
      }, 300);
    });
  }

  // ── FACTURAR ──────────────────────────────────────────────────────────────
  static async invoiceSale(saleData) {
    try {
      console.log("📤 Iniciando facturación con SiatAPI...", saleData);

      if (!saleData.cliente || !saleData.items || saleData.items.length === 0) {
        return { success: false, message: "Datos incompletos para facturar" };
      }

      const { sucursalId, puntoVentaId, usuarioId, usuarioCodigo } =
        getLocationFromSession();

      const tipoMetodoPago = saleData.metodoPago?.codigo || 1;
      const montoPagadoEfectivo =
        saleData.metodoPago?.montoEfectivo || saleData.totals?.total || 0;
      const montoPagadoTarjeta = saleData.metodoPago?.montoTarjeta || 0;
      const montoGiftCard = saleData.metodoPago?.montoGiftCard || 0;
      const numeroTarjeta = saleData.metodoPago?.numeroTarjeta || null;

      const siatResponse = await siatApiService.emitirFactura(
        saleData.cliente,
        saleData.items,
        saleData.totals,
        {
          sucursalId,
          puntoVentaId,
          usuarioId, // ← nuevo
          usuarioCodigo, // ← nuevo
          tipoMetodoPago,
          montoPagadoEfectivo,
          montoPagadoTarjeta,
          montoGiftCard,
          numeroTarjeta,
          codigoDocumentoSector: parseInt(
            saleData.cliente.codigoDocumentoSector || "1",
          ),
          periodoFacturado: saleData.cliente.periodoFacturado || undefined,
          codigoExcepcion: saleData.codigoExcepcion ?? undefined,
          numeroFacturaTalonario: saleData.numeroFacturaTalonario ?? undefined,
          fechaContingencia: saleData.fechaContingencia ?? undefined,
        },
      );

      console.log("✅ Factura emitida:", siatResponse);

      return {
        success: true,
        invoice: {
          id: siatResponse.facturaId,
          facturaId: siatResponse.facturaId,
          numeroFactura: siatResponse.numeroFactura,
          cuf: siatResponse.cuf,
          codigoAutorizacion: siatResponse.cuf,
          urlVerificacion: siatResponse.urlVerificacion,
          estado: siatResponse.estado,
          fechaEmision: siatResponse.fechaEmision,
          montoTotal: siatResponse.montoTotal,
          puntoVenta: puntoVentaId,
          ...saleData,
          status:
            siatResponse.estado === "VALIDATED"
              ? SALE_STATUS.INVOICED
              : SALE_STATUS.PENDING,
          fechaCreacion: new Date().toISOString(),
        },
        message: siatResponse.mensaje || "Factura generada exitosamente",
        siatData: siatResponse,
      };
    } catch (error) {
      console.error("❌ Error al facturar:", error);
      if (error.code === "INVALID_NIT") throw error;
      return {
        success: false,
        message: error.message || "Error al generar la factura",
        error,
      };
    }
  }

  // ── ANULAR ────────────────────────────────────────────────────────────────
  static async cancelInvoice(invoiceId, motivo) {
    try {
      const siatResponse = await siatApiService.anularFactura(
        invoiceId,
        motivo,
      );
      return {
        success: true,
        message: siatResponse.mensaje || "Factura anulada exitosamente",
        facturaId: siatResponse.facturaId,
        fechaAnulacion: siatResponse.fechaAnulacion,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al anular",
        error,
      };
    }
  }

  // ── HISTORIAL ─────────────────────────────────────────────────────────────
  static async getUserSales(userId, filters = {}) {
    try {
      const result = await siatApiService.listarFacturas({
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
      });
      const facturas = Array.isArray(result) ? result : result.facturas || [];
      return facturas.map((f) => ({
        id: f.id || f.facturaId,
        facturaId: f.id || f.facturaId,
        numeroFactura: f.numeroFactura,
        cuf: f.cuf,
        clientName: f.razonSocialCliente,
        nit: f.nitCliente,
        total: f.montoTotal,
        status: f.estado,
        fechaCreacion: f.fechaEmision,
        fechaEmision: f.fechaEmision,
        estado: f.estado,
      }));
    } catch (error) {
      console.error("❌ Error al obtener historial:", error);
      return [];
    }
  }

  static async getSaleById(saleId) {
    try {
      const factura = await siatApiService.obtenerFactura(saleId);
      if (factura) return { success: true, sale: factura };
      return { success: false, message: "Factura no encontrada" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static generateAuthCode() {
    return Array(40)
      .fill(0)
      .map(() =>
        Math.floor(Math.random() * 16)
          .toString(16)
          .toUpperCase(),
      )
      .join("");
  }

  static async getClients() {
    return [
      { nit: "4444", nombre: "SIN NOMBRE", tipo: "1" },
      { nit: "99001", nombre: "Consulados, Embajadas", tipo: "5" },
      { nit: "99002", nombre: "Control Tributario", tipo: "5" },
      { nit: "99003", nombre: "Ventas menores del Día", tipo: "5" },
    ];
  }

  static async updateClient(nit, clientData) {
    return { success: true, client: { nit, ...clientData } };
  }
}

export default SalesService;
