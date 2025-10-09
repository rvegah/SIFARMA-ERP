// src/modules/sales/services/salesService.js
// MOCK SERVICE - Reemplazar cuando tengas el API REST

import { SPECIAL_NIT_CODES, SALE_STATUS } from "../constants/salesConstants";
import { enviarFacturaSIAT, anularFacturaSIAT } from './siatMockService';

// Simular base de datos en memoria
let mockSalesDB = [];
let mockClientsDB = [
  { nit: "4444", nombre: "SIN NOMBRE", tipo: "1" },
  { nit: "99001", nombre: "Consulados, Embajadas", tipo: "5" },
  { nit: "99002", nombre: "Control Tributario", tipo: "5" },
  { nit: "99003", nombre: "Ventas menores del Día", tipo: "5" },
];
let mockProductsDB = [
  {
    id: 4020,
    codigo: "4020",
    nombre: "IBUPROFENO 800 MG COMPR",
    linea: "COFAR",
    laboratorio: "COFAR",
    presentacion: "CAJA X 100",
    precio: 1.3,
    precioCaja: 130.0,
    stock: 732,
    stockMinimo: 10,
    unidadMedida: "CAJA",
    lote: "L123456",
    vencimiento: "2026-12-31",
  },
  {
    id: 4031,
    codigo: "4031",
    nombre: "IBUSEC 800 MG COMPR (IBUPROFENO 800 MG COMPR)",
    linea: "DR MEDINAT",
    laboratorio: "UNICURE",
    presentacion: "CAJA X 100",
    precio: 1.3,
    precioCaja: 130.0,
    stock: 652,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 4005,
    codigo: "4005",
    nombre: "IBUFEN 800 MG COMPR (IBUPROFENO 800 MG COMPR)",
    linea: "IFARBO",
    laboratorio: "IFARBO",
    presentacion: "CAJA X 100",
    precio: 1.1,
    precioCaja: 110.0,
    stock: 523,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 4032,
    codigo: "4032",
    nombre: "IBUSEC 600 COMPR (IBUPROFENO 600 MG COMPR)",
    linea: "DR MEDINAT",
    laboratorio: "UNICURE",
    presentacion: "CAJA X 100",
    precio: 1.0,
    precioCaja: 100.0,
    stock: 492,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 4025,
    codigo: "4025",
    nombre: "IBUPROFENO 800 MG COMPR",
    linea: "SANAT",
    laboratorio: "SANAT",
    presentacion: "CAJA X 100",
    precio: 1.1,
    precioCaja: 110.0,
    stock: 351,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 9168,
    codigo: "9168",
    nombre: "IBUPROFENO 800 MG COMPR",
    linea: "SAE",
    laboratorio: "CHILE VERDE",
    presentacion: "CAJA X 100",
    precio: 1.1,
    precioCaja: 110.0,
    stock: 338,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 3108,
    codigo: "3108",
    nombre: "IBUPROFENO 800 MG COMPR",
    linea: "DELTA",
    laboratorio: "DELTA",
    presentacion: "CAJA X 50",
    precio: 1.6,
    precioCaja: 80.0,
    stock: 320,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 4609,
    codigo: "4609",
    nombre: "IBUFLAMAR P COMPR (PARACETAMOL IBUPROFENO)",
    linea: "SAN FERNANDO",
    laboratorio: "SAN FERNANDO",
    presentacion: "CAJA X 100",
    precio: 2.0,
    precioCaja: 200.0,
    stock: 273,
    stockMinimo: 10,
    unidadMedida: "CAJA",
  },
  {
    id: 4124,
    codigo: "4124",
    nombre: "VITAMINA C TERBOL",
    linea: "CRESPAL",
    laboratorio: "CRESPAL",
    presentacion: "CAJA",
    precio: 50.0,
    precioCaja: 50.0,
    stock: 15,
    stockMinimo: 5,
    unidadMedida: "CAJA",
  },
  {
    id: 5560,
    codigo: "5560",
    nombre: "ASPIRINETAS 100 MG (ACIDO ACETILSALICILICO 100 MG)",
    linea: "BAYER",
    laboratorio: "BAYER",
    presentacion: "CAJA X 98 COMPR",
    precio: 0.7,
    precioCaja: 68.6,
    stock: 1416,
    stockMinimo: 20,
    unidadMedida: "CAJA",
  },
  {
    id: 5404,
    codigo: "5404",
    nombre: "MENTISAN LATA 15 GR",
    linea: "INTI",
    laboratorio: "INTI",
    presentacion: "CAJA X 144",
    precio: 9.0,
    precioCaja: 1296.0,
    stock: 1129,
    stockMinimo: 20,
    unidadMedida: "LATAS",
  },
];

class SalesService {
  // Buscar productos
  static async searchProducts(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockProductsDB.filter(
          (product) =>
            product.nombre.toLowerCase().includes(query.toLowerCase()) ||
            product.codigo.includes(query) ||
            product.linea.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }

  // Buscar o crear cliente
  static async searchOrCreateClient(nit) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let client = mockClientsDB.find((c) => c.nit === nit);

        if (!client && !SPECIAL_NIT_CODES[nit]) {
          // Crear cliente nuevo
          client = {
            nit,
            nombre: "",
            tipo: this.detectDocumentType(nit),
            celular: "",
            email: "",
          };
          mockClientsDB.push(client);
        }

        resolve(
          client || { nit, nombre: SPECIAL_NIT_CODES[nit] || "", tipo: "1" }
        );
      }, 200);
    });
  }

  // Detectar tipo de documento automáticamente
  static detectDocumentType(nit) {
    if (!nit) return "1";
    if (nit.startsWith("E")) return "2"; // CEX
    if (nit.length <= 10) return "1"; // CI
    if (nit.length > 10) return "5"; // NIT
    return "4"; // OD - Otros
  }

  // Guardar venta (sin facturar)
  static async saveSale(saleData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSale = {
          id: Date.now(),
          ...saleData,
          status: SALE_STATUS.SAVED,
          fechaCreacion: new Date().toISOString(),
          numeroFactura: null,
          codigoAutorizacion: null,
        };
        mockSalesDB.push(newSale);
        
        console.log('💾 Venta guardada (sin facturar):', newSale);
        
        resolve({ 
          success: true, 
          sale: newSale,
          message: 'Venta guardada exitosamente (sin facturar)'
        });
      }, 500);
    });
  }

  // ============================================
  // 🔥 NUEVA FUNCIÓN: Facturar con integración SIAT
  // ============================================
  static async invoiceSale(saleData) {
    try {
      console.log('📤 Iniciando facturación con SIAT...', saleData);

      // 1. Validaciones previas
      if (!saleData.cliente || !saleData.items || saleData.items.length === 0) {
        return {
          success: false,
          message: 'Datos incompletos para facturar'
        };
      }

      // 2. Enviar factura al SIAT (mock)
      const siatResponse = await enviarFacturaSIAT(saleData);

      if (!siatResponse.success) {
        throw new Error('Error al registrar factura en SIAT');
      }

      console.log('✅ Respuesta del SIAT recibida:', siatResponse.data);

      // 3. Crear registro de venta con datos del SIAT
      const invoice = {
        id: Date.now(),
        // Datos del SIAT
        numeroFactura: siatResponse.data.numeroFactura,
        codigoAutorizacion: siatResponse.data.codigoAutorizacion,
        cuf: siatResponse.data.cuf,
        qrUrl: siatResponse.data.qrUrl,
        codigoRecepcion: siatResponse.data.codigoRecepcion,
        
        // Datos de la venta
        ...saleData,
        
        // Estado y fechas
        status: SALE_STATUS.INVOICED,
        fechaCreacion: new Date().toISOString(),
        fechaEmision: siatResponse.data.fechaEmision,
        
        // Usuario (TODO: obtener del contexto)
        usuarioFacturacion: saleData.userId || 1,
        nombreUsuario: 'Usuario Sistema'
      };

      // 4. Guardar en "base de datos" mock
      mockSalesDB.push(invoice);

      // 5. Actualizar stock de productos
      saleData.items.forEach((item) => {
        const product = mockProductsDB.find((p) => p.id === item.productId);
        if (product) {
          const stockAnterior = product.stock;
          product.stock -= item.cantidad;
          console.log(
            `📦 Stock actualizado: ${product.nombre} | ` +
            `Anterior: ${stockAnterior} → Actual: ${product.stock} | ` +
            `Vendido: ${item.cantidad}`
          );
        }
      });

      // 6. Guardar/Actualizar datos del cliente para futuras ventas
      const existingClient = mockClientsDB.find(c => c.nit === saleData.cliente.nit);
      if (existingClient) {
        // Actualizar datos del cliente existente
        Object.assign(existingClient, {
          nombre: saleData.cliente.nombre,
          celular: saleData.cliente.celular || existingClient.celular,
          email: saleData.cliente.email || existingClient.email,
          fechaNacimiento: saleData.cliente.fechaNacimiento || existingClient.fechaNacimiento,
          ultimaCompra: new Date().toISOString()
        });
        console.log('👤 Cliente actualizado:', existingClient);
      } else {
        // Agregar nuevo cliente
        const newClient = {
          nit: saleData.cliente.nit,
          nombre: saleData.cliente.nombre,
          tipo: saleData.cliente.tipoDocumento || '1',
          celular: saleData.cliente.celular || '',
          email: saleData.cliente.email || '',
          fechaNacimiento: saleData.cliente.fechaNacimiento || '',
          fechaRegistro: new Date().toISOString(),
          ultimaCompra: new Date().toISOString()
        };
        mockClientsDB.push(newClient);
        console.log('👤 Cliente nuevo registrado:', newClient);
      }

      console.log('✅ Factura generada exitosamente:', invoice.numeroFactura);

      return { 
        success: true, 
        invoice,
        message: 'Factura generada exitosamente',
        // Datos adicionales para la impresión
        siatData: siatResponse.data
      };

    } catch (error) {
      console.error('❌ Error al facturar:', error);
      return {
        success: false,
        message: error.message || 'Error al generar la factura',
        error: error
      };
    }
  }

  // ============================================
  // MANTENER COMPATIBILIDAD: Generar código de autorización
  // (Ya no se usa, pero se mantiene por compatibilidad)
  // ============================================
  static generateAuthCode() {
    return Array(40)
      .fill(0)
      .map(() =>
        Math.floor(Math.random() * 16)
          .toString(16)
          .toUpperCase()
      )
      .join("");
  }

  // Obtener ventas del usuario
  static async getUserSales(userId, filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let sales = [...mockSalesDB];

        // Filtrar por usuario si se especifica
        if (userId) {
          sales = sales.filter((sale) => sale.userId === userId);
        }

        // Filtrar por fecha desde
        if (filters.fechaDesde) {
          sales = sales.filter(
            (s) => new Date(s.fechaCreacion) >= new Date(filters.fechaDesde)
          );
        }

        // Filtrar por fecha hasta
        if (filters.fechaHasta) {
          const fechaHasta = new Date(filters.fechaHasta);
          fechaHasta.setHours(23, 59, 59);
          sales = sales.filter(
            (s) => new Date(s.fechaCreacion) <= fechaHasta
          );
        }

        // Filtrar por estado
        if (filters.status) {
          sales = sales.filter((s) => s.status === filters.status);
        }

        // Filtrar por número de factura
        if (filters.numeroFactura) {
          sales = sales.filter((s) => 
            s.numeroFactura?.includes(filters.numeroFactura)
          );
        }

        console.log(`📋 Ventas encontradas: ${sales.length}`);
        resolve(sales);
      }, 300);
    });
  }

  // ============================================
  // 🔥 ACTUALIZADA: Anular factura con SIAT
  // ============================================
  static async cancelInvoice(invoiceId, motivo) {
    try {
      console.log(`🗑️ Anulando factura ID: ${invoiceId}, Motivo: ${motivo}`);

      // 1. Buscar la venta
      const sale = mockSalesDB.find((s) => s.id === invoiceId);
      
      if (!sale) {
        return {
          success: false,
          message: 'Venta no encontrada'
        };
      }

      if (sale.status === SALE_STATUS.CANCELLED) {
        return {
          success: false,
          message: 'Esta factura ya está anulada'
        };
      }

      // 2. Anular en el SIAT (mock)
      const siatResponse = await anularFacturaSIAT(sale.numeroFactura, motivo);

      if (!siatResponse.success) {
        throw new Error('Error al anular factura en SIAT');
      }

      console.log('✅ Factura anulada en SIAT:', siatResponse.data);

      // 3. Actualizar estado de la venta
      sale.status = SALE_STATUS.CANCELLED;
      sale.motivoAnulacion = motivo;
      sale.fechaAnulacion = siatResponse.data.fechaAnulacion;
      sale.codigoAnulacion = siatResponse.data.codigoAnulacion;

      // 4. Restaurar stock de productos
      sale.items.forEach((item) => {
        const product = mockProductsDB.find((p) => p.id === item.productId);
        if (product) {
          const stockAnterior = product.stock;
          product.stock += item.cantidad;
          console.log(
            `📦 Stock restaurado: ${product.nombre} | ` +
            `Anterior: ${stockAnterior} → Actual: ${product.stock} | ` +
            `Devuelto: ${item.cantidad}`
          );
        }
      });

      console.log('✅ Factura anulada completamente');

      return { 
        success: true,
        message: 'Factura anulada exitosamente',
        sale
      };

    } catch (error) {
      console.error('❌ Error al anular factura:', error);
      return {
        success: false,
        message: error.message || 'Error al anular la factura',
        error: error
      };
    }
  }

  // Obtener stock en sucursales
  static async getStockBySucursal(productId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock de stock por sucursales
        resolve([
          { 
            sucursalId: 1,
            sucursal: "SAN MARTIN", 
            stock: 732, 
            precio: 1.30,
            ubicacion: "ESTANTE-A-12"
          },
          { 
            sucursalId: 2,
            sucursal: "BRASIL", 
            stock: 450, 
            precio: 1.30,
            ubicacion: "ESTANTE-B-05"
          },
          { 
            sucursalId: 3,
            sucursal: "URUGUAY", 
            stock: 280, 
            precio: 1.35,
            ubicacion: "ESTANTE-A-08"
          },
          { 
            sucursalId: 4,
            sucursal: "ALMACÉN/ANABARMÍN", 
            stock: 5000, 
            precio: 1.25,
            ubicacion: "PALLET-15"
          },
          { 
            sucursalId: 5,
            sucursal: "AGRIPAFA", 
            stock: 120, 
            precio: 1.32,
            ubicacion: "ESTANTE-C-03"
          },
          { 
            sucursalId: 6,
            sucursal: "FACHADA", 
            stock: 185, 
            precio: 1.30,
            ubicacion: "ESTANTE-E-06"
          }
        ]);
      }, 300);
    });
  }

  // ============================================
  // 🔥 NUEVA: Obtener detalles de una venta específica
  // ============================================
  static async getSaleById(saleId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sale = mockSalesDB.find(s => s.id === saleId);
        
        if (sale) {
          console.log('📄 Venta encontrada:', sale.numeroFactura || sale.id);
          resolve({ success: true, sale });
        } else {
          resolve({ 
            success: false, 
            message: 'Venta no encontrada' 
          });
        }
      }, 200);
    });
  }

  // ============================================
  // 🔥 NUEVA: Obtener lista de clientes
  // ============================================
  static async getClients() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockClientsDB);
      }, 200);
    });
  }

  // ============================================
  // 🔥 NUEVA: Actualizar cliente
  // ============================================
  static async updateClient(nit, clientData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const client = mockClientsDB.find(c => c.nit === nit);
        
        if (client) {
          Object.assign(client, clientData);
          console.log('👤 Cliente actualizado:', client);
          resolve({ success: true, client });
        } else {
          resolve({ 
            success: false, 
            message: 'Cliente no encontrado' 
          });
        }
      }, 300);
    });
  }
}

export default SalesService;