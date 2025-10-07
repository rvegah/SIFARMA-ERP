// MOCK SERVICE - Reemplazar cuando tengas el API REST

import { SPECIAL_NIT_CODES, SALE_STATUS } from "../constants/salesConstants";

// Simular base de datos en memoria
let mockSalesDB = [];
let mockClientsDB = [
  { nit: "4444", nombre: "SIN NOMBRE", tipo: "1" },
  { nit: "99001", nombre: "Consulados, Embajadas", tipo: "1" },
  { nit: "99002", nombre: "Control Tributario", tipo: "1" },
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
        };
        mockSalesDB.push(newSale);
        resolve({ success: true, sale: newSale });
      }, 500);
    });
  }

  // Facturar venta
  static async invoiceSale(saleData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = {
          id: Date.now(),
          numeroFactura: `F-${Math.floor(100000 + Math.random() * 900000)}`,
          codigoAutorizacion: this.generateAuthCode(),
          ...saleData,
          status: SALE_STATUS.INVOICED,
          fechaEmision: new Date().toISOString(),
        };
        mockSalesDB.push(invoice);

        // Actualizar stock
        saleData.items.forEach((item) => {
          const product = mockProductsDB.find((p) => p.id === item.productId);
          if (product) {
            product.stock -= item.cantidad;
          }
        });

        resolve({ success: true, invoice });
      }, 800);
    });
  }

  // Generar código de autorización simulado
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
        let sales = mockSalesDB.filter((sale) => sale.userId === userId);

        if (filters.fechaDesde) {
          sales = sales.filter(
            (s) => new Date(s.fechaCreacion) >= new Date(filters.fechaDesde)
          );
        }
        if (filters.fechaHasta) {
          sales = sales.filter(
            (s) => new Date(s.fechaCreacion) <= new Date(filters.fechaHasta)
          );
        }

        resolve(sales);
      }, 300);
    });
  }

  // Anular factura
  static async cancelInvoice(invoiceId, motivo) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sale = mockSalesDB.find((s) => s.id === invoiceId);
        if (sale) {
          sale.status = SALE_STATUS.CANCELLED;
          sale.motivoAnulacion = motivo;
          sale.fechaAnulacion = new Date().toISOString();

          // Restaurar stock
          sale.items.forEach((item) => {
            const product = mockProductsDB.find((p) => p.id === item.productId);
            if (product) {
              product.stock += item.cantidad;
            }
          });
        }
        resolve({ success: true });
      }, 500);
    });
  }

  // Obtener stock en sucursales
  static async getStockBySucursal(productId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { sucursal: "SAN MARTIN", stock: 732, precio: 1.36 },
          { sucursal: "BRASIL", stock: 521, precio: 1.36 },
          { sucursal: "URUGUAY", stock: 89, precio: 1.36 },
          { sucursal: "TIQUIPAYA", stock: 234, precio: 1.36 },
        ]);
      }, 300);
    });
  }
}

export default SalesService;
