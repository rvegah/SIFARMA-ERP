// src/modules/sales/services/salesService.js
// Integración real con SiatAPI + Core API + Farmacia API

import { SPECIAL_NIT_CODES, SALE_STATUS } from "../constants/salesConstants";
import siatApiService from './siatApiService';
import authService from '../../../services/api/authService';
import apiClient from '../../../services/api/apiClient';
import axios from 'axios';

// ─── CLIENTE AXIOS PARA API FARMACIA ─────────────────────────────────────────
const farmaciaApiClient = axios.create({
  baseURL: 'https://api-farmacia.farmadinamica.com.bo/api/farmalink-farmacia',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// ─── HELPER: leer ubicación del usuario logueado ─────────────────────────────
// El Core API devuelve en el login:
//   codigoSucursal_ID     → sucursal interna (para búsqueda de productos)
//   codigoSucursal_SIAT   → sucursalId para SiatAPI
//   codigoPuntoVenta_SIAT → puntoVentaId para SiatAPI
function getLocationFromSession() {
  const user = authService.getCurrentUser();
  return {
    sucursalId: user?.codigoSucursal_SIAT ?? 0,
    puntoVentaId: user?.codigoPuntoVenta_SIAT ?? 0,
    codigoSucursalInterno: user?.codigoSucursal_ID ?? 1,
  };
}

class SalesService {

  // ── PRODUCTOS — endpoint Ventas/BuscarProductos ───────────────────────────
  // Estructura del API (nueva):
  //   id, codigo, nombre, descripcion, precio, codigoBarra, stock, categoria,
  //   codigoSin, codigoActividad, unidadMedida (número SIAT directo),
  //   linea, laboratorio, sku, numeroLote, fechaVencimiento,
  //   diasProximoVencimiento, descuentoVencimiento

  static async searchProducts(query) {
    try {
      const { codigoSucursalInterno } = getLocationFromSession();
      const response = await farmaciaApiClient.get('/Ventas/BuscarProductos', {
        params: {
          CodigoSucursal: codigoSucursalInterno,
          NombreProducto: query,
        },
      });

      if (!response.data?.exitoso) {
        throw new Error(response.data?.mensaje || 'Error al buscar productos');
      }

      return (response.data.datos || []).map((p) => ({
        // Identificación
        id: p.id,
        codigo: p.codigo,
        sku: p.sku,
        nombre: p.nombre,

        // Info para mostrar en tabla
        descripcion: p.descripcion,
        categoria: p.categoria,
        linea: p.linea,
        laboratorio: p.laboratorio,

        // Lote y vencimiento (fila 2 en tabla)
        numeroLote: p.numeroLote,
        fechaVencimiento: p.fechaVencimiento?.split('T')[0] || '',
        diasProximoVencimiento: p.diasProximoVencimiento,
        descuentoVencimiento: p.descuentoVencimiento,

        // Precio y stock
        precio: p.precio,
        precioUnitario: p.precio,
        stock: p.stock,

        // Campos SIAT — ya vienen correctos del API
        codigoSin: p.codigoSin,
        codigoProductoSin: p.codigoSin,
        codigoActividad: parseInt(p.codigoActividad) || 4772100,
        unidadMedida: p.unidadMedida || 62, // número SIAT directo
      }));

    } catch (error) {
      console.error('❌ Error al buscar productos:', error.message);
      return [];
    }
  }

  // ── SUCURSALES — endpoint real de api-core ────────────────────────────────

  static async getStockBySucursal(productId) {
    try {
      const response = await apiClient.get('/Organizacion/SucursalesOrganizacion/1');

      if (!response.data?.exitoso) {
        throw new Error(response.data?.mensaje || 'Error al obtener sucursales');
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
      console.error('❌ Error al obtener sucursales:', error.message);
      return [];
    }
  }

  // ── CLIENTE ───────────────────────────────────────────────────────────────

  static async searchOrCreateClient(nit) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (SPECIAL_NIT_CODES[nit]) {
          resolve({ nit, nombre: SPECIAL_NIT_CODES[nit], tipo: '5' });
          return;
        }
        resolve({
          nit,
          nombre: '',
          tipo: SalesService.detectDocumentType(nit),
          celular: '',
          email: '',
        });
      }, 200);
    });
  }

  static detectDocumentType(nit) {
    if (!nit) return '1';
    if (nit.startsWith('E')) return '2';
    if (nit.length <= 10) return '1';
    if (nit.length > 10) return '5';
    return '4';
  }

  // ── GUARDAR VENTA SIN FACTURAR ────────────────────────────────────────────

  static async saveSale(saleData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('💾 Venta guardada (sin facturar):', saleData);
        resolve({
          success: true,
          sale: { id: Date.now(), ...saleData, status: SALE_STATUS.SAVED },
          message: 'Venta guardada exitosamente (sin facturar)',
        });
      }, 300);
    });
  }

  // ── FACTURAR ──────────────────────────────────────────────────────────────

  static async invoiceSale(saleData) {
    try {
      console.log('📤 Iniciando facturación con SiatAPI...', saleData);

      if (!saleData.cliente || !saleData.items || saleData.items.length === 0) {
        return { success: false, message: 'Datos incompletos para facturar' };
      }

      const { sucursalId, puntoVentaId } = getLocationFromSession();

      const tipoMetodoPago = saleData.metodoPago?.codigo || 1;
      const montoPagadoEfectivo = saleData.metodoPago?.montoEfectivo || saleData.totals?.total || 0;
      const montoPagadoTarjeta = saleData.metodoPago?.montoTarjeta || 0;
      const montoGiftCard = saleData.metodoPago?.montoGiftCard || 0;
      const numeroTarjeta = saleData.metodoPago?.numeroTarjeta || null;

      const siatResponse = await siatApiService.emitirFactura(
        saleData.cliente,
        saleData.items,
        saleData.totals,
        { sucursalId, puntoVentaId, tipoMetodoPago, montoPagadoEfectivo, montoPagadoTarjeta, montoGiftCard, numeroTarjeta }
      );

      console.log('✅ Factura emitida:', siatResponse);

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
          ...saleData,
          status: siatResponse.estado === 'VALIDATED' ? SALE_STATUS.INVOICED : SALE_STATUS.PENDING,
          fechaCreacion: new Date().toISOString(),
        },
        message: siatResponse.mensaje || 'Factura generada exitosamente',
        siatData: siatResponse,
      };

    } catch (error) {
      console.error('❌ Error al facturar:', error);
      return { success: false, message: error.message || 'Error al generar la factura', error };
    }
  }

  // ── ANULAR ────────────────────────────────────────────────────────────────

  static async cancelInvoice(invoiceId, motivo) {
    try {
      const siatResponse = await siatApiService.anularFactura(invoiceId, motivo);
      return {
        success: true,
        message: siatResponse.mensaje || 'Factura anulada exitosamente',
        facturaId: siatResponse.facturaId,
        fechaAnulacion: siatResponse.fechaAnulacion,
      };
    } catch (error) {
      return { success: false, message: error.message || 'Error al anular', error };
    }
  }

  // ── HISTORIAL ─────────────────────────────────────────────────────────────

  static async getUserSales(userId, filters = {}) {
    try {
      const result = await siatApiService.listarFacturas({ page: filters.page || 1, pageSize: filters.pageSize || 20 });
      const facturas = Array.isArray(result) ? result : (result.facturas || []);
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
      console.error('❌ Error al obtener historial:', error);
      return [];
    }
  }

  static async getSaleById(saleId) {
    try {
      const factura = await siatApiService.obtenerFactura(saleId);
      if (factura) return { success: true, sale: factura };
      return { success: false, message: 'Factura no encontrada' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static generateAuthCode() {
    return Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
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