// src/modules/sales/types/integration.types.js
/**
 * ═══════════════════════════════════════════════════════════════
 * TIPOS DE INTEGRACIÓN SIFARMA ↔ SIAT
 * Mapeos entre estructuras internas y formatos SIAT
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * @typedef {Object} SifarmaToSiatMapping
 * @description Mapeo de campos SIFARMA → SIAT para facturación
 * 
 * @property {Object} cliente - Mapeo de cliente
 * @property {string} cliente.nit - NIT → numeroDocumento
 * @property {string} cliente.complemento - complemento → complemento
 * @property {string} cliente.nombre - nombre → nombreRazonSocial
 * @property {string} cliente.tipoDocumento - tipoDocumento → codigoTipoDocumentoIdentidad
 * 
 * @property {Object} venta - Mapeo de venta
 * @property {Array} venta.items - items → detalle
 * @property {number} venta.total - total → montoTotal
 * @property {number} venta.descuentoAdicional - descuentoAdicional (procesado antes)
 * 
 * @property {Object} producto - Mapeo de producto
 * @property {string} producto.codigo - codigo → codigoProducto
 * @property {string} producto.nombre - nombre → descripcion
 * @property {string} producto.unidadMedida - unidadMedida → unidadMedida (via lookup)
 * @property {number} producto.precio - precio → precioUnitario
 * @property {number} producto.cantidad - cantidad → cantidad
 */

/**
 * @typedef {Object} SiatFacturaInput
 * @description Estructura completa para enviar factura a SIAT
 * Combina datos de venta SIFARMA + contexto SIAT
 */
export const SiatFacturaInput = {
  // Desde SIFARMA (venta actual)
  ventaData: {
    cliente: Object,
    items: Array,
    totales: Object,
    pagado: Number,
    cambio: Number
  },
  
  // Desde contexto SIAT
  siatContext: {
    cufdVigente: Object, // CufdData
    eventoActivo: Object || null, // EventoSiat | null
    codigoSucursal: Number,
    codigoPuntoVenta: Number,
    codigoActividad: Number
  },
  
  // Desde usuario
  userData: {
    usuarioId: Number,
    nombreUsuario: String,
    sucursalId: Number,
    puntoVentaId: Number
  }
};

/**
 * @typedef {Object} FacturaCompletaResponse
 * @description Respuesta completa después de facturar
 * Combina datos SIAT + datos locales generados
 */
export const FacturaCompletaResponse = {
  // Desde SIAT
  siatData: {
    codigoRecepcion: String,
    cuf: String,
    numeroFactura: String,
    fechaEmision: String
  },
  
  // Generado localmente
  localData: {
    facturaId: Number, // ID en BD local
    pdfUrl: String, // URL del PDF generado
    qrUrl: String, // URL para QR
    emailEnviado: Boolean
  },
  
  // Datos originales
  ventaOriginal: Object
};

// ═══════════════════════════════════════════════════════════════
// MAPEOS DE CÓDIGOS SIAT
// ═══════════════════════════════════════════════════════════════

/**
 * Mapeo de tipos de documento SIFARMA → SIAT
 */
export const DOCUMENT_TYPE_MAPPING = {
  '1': 1, // CI - CEDULA DE IDENTIDAD
  '2': 2, // CEX - CEDULA DE IDENTIDAD EXTRANJERO
  '3': 3, // PAS - PASAPORTE
  '4': 4, // OD - OTRO DOCUMENTO DE IDENTIDAD
  '5': 5  // NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA
};

/**
 * Mapeo de unidades de medida SIFARMA (texto) → SIAT (código)
 * Basado en catálogo SIAT de 64 unidades
 */
export const UNIT_MEASURE_MAPPING = {
  // Farmacéuticas comunes
  'COMPRIMIDOS': 57, // UNIDAD (Sin unidad)
  'CAPSULAS': 57,
  'CÁPSULAS': 57,
  'TABLETAS': 57,
  'AMPOLLA': 57,
  'AMPOLLAS': 57,
  'FRASCOS': 11, // PIEZAS
  'FRASCO': 11,
  'SOBRES': 11,
  'SOBRE': 11,
  
  // Unidades estándar
  'UNIDAD': 57,
  'PIEZA': 11,
  'PIEZAS': 11,
  'CAJA': 12,
  'CAJAS': 12,
  
  // Volumen
  'LITRO': 17,
  'LITROS': 17,
  'MILILITRO': 18,
  'ML': 18,
  
  // Peso
  'GRAMO': 28,
  'GRAMOS': 28,
  'KILOGRAMO': 29,
  'KG': 29,
  'MG': 30, // Miligramos
  'MILIGRAMOS': 30,
  
  // Otras
  'LATAS': 11,
  'TUBOS': 11,
  'ENVASE': 11,
  
  // Default
  'DEFAULT': 57 // UNIDAD (cuando no se encuentra)
};

/**
 * Mapeo inverso: SIAT código → nombre
 */
export const UNIT_MEASURE_REVERSE_MAPPING = {
  57: 'UNIDAD',
  11: 'PIEZA',
  12: 'CAJA',
  17: 'LITRO',
  18: 'MILILITRO',
  28: 'GRAMO',
  29: 'KILOGRAMO',
  30: 'MILIGRAMO'
};

/**
 * Mapeo de códigos especiales NIT
 */
export const SPECIAL_NIT_MAPPING = {
  '99001': {
    tipoDocumento: 5, // NIT
    nombreDefault: 'Consulados, Embajadas',
    codigoExcepcion: '1'
  },
  '99002': {
    tipoDocumento: 5, // NIT
    nombreDefault: 'Control Tributario',
    codigoExcepcion: '1'
  },
  '99003': {
    tipoDocumento: 5, // NIT
    nombreDefault: 'Ventas menores del Día',
    codigoExcepcion: '1'
  },
  '4444': {
    tipoDocumento: 1, // CI
    nombreDefault: 'SIN NOMBRE',
    codigoExcepcion: '1'
  },
  '0': {
    tipoDocumento: 4, // OD - Otro documento
    nombreDefault: 'VENTA DIRECTA',
    codigoExcepcion: '1'
  }
};

/**
 * Métodos de pago - Mapeo textual → código SIAT
 */
export const PAYMENT_METHOD_MAPPING = {
  // Efectivo
  'EFECTIVO': 1,
  'DINERO': 1,
  
  // Tarjetas
  'TARJETA_CREDITO': 2,
  'TARJETA_DEBITO': 6,
  
  // Transferencias
  'TRANSFERENCIA': 14,
  'DEPOSITO': 14,
  
  // Gift cards (caso especial SIFARMA)
  'GIFT_CARD_TOTAL': 27, // Tarjeta de regalo - pago total
  'GIFT_CARD_PARCIAL': 33, // Tarjeta de regalo - pago parcial
  'GIFT_CARD_OTRO': 35, // Otro medio de pago
  
  // QR
  'QR': 31,
  
  // Default
  'DEFAULT': 1 // Efectivo por defecto
};

/**
 * Códigos de excepción SIAT
 */
export const EXCEPTION_CODES = {
  NIT_CERO: '0', // Cuando NIT = 0
  ESPECIAL: '1'  // NITs especiales (99001, 99002, 99003, 4444)
};

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES DE INTEGRACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Reglas de negocio SIFARMA + SIAT
 */
export const INTEGRATION_RULES = {
  // Límite para factura sin nombre
  FACTURA_SIN_NOMBRE_LIMIT: 1000,
  
  // NIT 4444 solo permitido si venta < 1000
  NIT_4444_MAX_AMOUNT: 1000,
  
  // Validación de actividad única
  SINGLE_ACTIVITY_PER_INVOICE: true,
  
  // Auto-detect exception codes
  AUTO_EXCEPTION_DETECTION: true,
  
  // Auto-increment quantity for duplicates
  AUTO_INCREMENT_DUPLICATES: true,
  
  // Gift card auto-adjustment
  GIFT_CARD_AUTO_ADJUST: true
};

/**
 * Estados de sincronización SIAT
 */
export const SYNC_STATUS = {
  PENDING: 'PENDING',       // Pendiente de envío
  SYNCING: 'SYNCING',       // Enviando a SIAT
  SYNCED: 'SYNCED',         // Sincronizado exitosamente
  ERROR: 'ERROR',           // Error en sincronización
  OFFLINE: 'OFFLINE'        // Guardado offline (contingencia)
};

// ═══════════════════════════════════════════════════════════════
// HELPERS DE TRANSFORMACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener código unidad de medida SIAT desde texto
 * @param {string} unidadTexto - Texto de unidad (ej: "COMPRIMIDOS")
 * @returns {number} Código SIAT
 */
export const getUnidadMedidaSiat = (unidadTexto) => {
  if (!unidadTexto) return UNIT_MEASURE_MAPPING.DEFAULT;
  
  const unidadUpper = unidadTexto.toUpperCase().trim();
  return UNIT_MEASURE_MAPPING[unidadUpper] || UNIT_MEASURE_MAPPING.DEFAULT;
};

/**
 * Detectar si un NIT es especial
 * @param {string} nit - NIT a validar
 * @returns {boolean}
 */
export const isSpecialNit = (nit) => {
  return Object.keys(SPECIAL_NIT_MAPPING).includes(nit);
};

/**
 * Obtener código de excepción según NIT
 * @param {string} nit - NIT del cliente
 * @returns {string|null}
 */
export const getCodigoExcepcion = (nit) => {
  if (nit === '0') return EXCEPTION_CODES.NIT_CERO;
  if (isSpecialNit(nit)) return EXCEPTION_CODES.ESPECIAL;
  return null;
};

/**
 * Detectar método de pago automáticamente
 * @param {Object} ventaData - Datos de venta
 * @returns {number} Código método pago SIAT
 */
export const detectPaymentMethod = (ventaData) => {
  const { totales, hasGiftCard, giftCardAmount } = ventaData;
  
  if (hasGiftCard) {
    if (giftCardAmount === totales.total) {
      return PAYMENT_METHOD_MAPPING.GIFT_CARD_TOTAL;
    } else {
      return PAYMENT_METHOD_MAPPING.GIFT_CARD_PARCIAL;
    }
  }
  
  return PAYMENT_METHOD_MAPPING.DEFAULT; // Efectivo
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  DOCUMENT_TYPE_MAPPING,
  UNIT_MEASURE_MAPPING,
  UNIT_MEASURE_REVERSE_MAPPING,
  SPECIAL_NIT_MAPPING,
  PAYMENT_METHOD_MAPPING,
  EXCEPTION_CODES,
  INTEGRATION_RULES,
  SYNC_STATUS,
  getUnidadMedidaSiat,
  isSpecialNit,
  getCodigoExcepcion,
  detectPaymentMethod
};