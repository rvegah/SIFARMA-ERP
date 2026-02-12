// src/modules/sales/types/siat.types.js
/**
 * ═══════════════════════════════════════════════════════════════
 * TIPOS DE DATOS PARA INTEGRACIÓN SIAT
 * Sistema de Impuestos de Bolivia - Facturación Electrónica
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * @typedef {Object} CufdData
 * @description Código Único de Factura Diario - Código temporal para facturación
 * 
 * @property {string} codigo - Código CUFD (Base64)
 * @property {string} codigoControl - Código de control del CUFD
 * @property {string} fechaVigencia - Fecha/hora hasta cuando es válido (ISO string)
 * @property {boolean} vigente - Si el CUFD aún está vigente
 * @property {number} puntoVenta - Punto de venta asociado
 * @property {number} sucursal - Sucursal asociada
 */

/**
 * @typedef {Object} CuisData
 * @description Código Único de Inicio de Sistemas - Código por actividad económica
 * 
 * @property {string} codigo - Código CUIS (Base64)
 * @property {string} fechaVigencia - Fecha/hora de vigencia (ISO string)
 * @property {number} codigoActividad - Código de actividad económica (ej: 477310)
 * @property {string} nombreActividad - Nombre de la actividad
 * @property {number} puntoVenta - Punto de venta asociado
 * @property {number} sucursal - Sucursal asociada
 */

/**
 * @typedef {Object} EventoSiat
 * @description Evento significativo del SIAT (contingencias, etc)
 * 
 * @property {number} id - ID del evento
 * @property {number} codigoEvento - Código según catálogo SIAT (1-7)
 * @property {string} descripcion - Descripción del evento
 * @property {string} fechaInicio - Fecha/hora inicio (ISO string)
 * @property {string|null} fechaFin - Fecha/hora fin (ISO string) - null si está activo
 * @property {boolean} activo - Si el evento está activo
 * @property {boolean} esContingencia - Si es evento de contingencia (tipos 5, 6, 7)
 * @property {string} cufd - CUFD usado durante el evento
 * @property {number} puntoVenta - Punto de venta
 * @property {number} sucursal - Sucursal
 */

/**
 * @typedef {Object} SiatStatus
 * @description Estado actual del servicio SIAT
 * 
 * @property {boolean} online - Si SIAT está disponible
 * @property {string} ultimaVerificacion - Última vez que se verificó (ISO string)
 * @property {EventoSiat|null} eventoActivo - Evento activo (si hay)
 * @property {CufdData|null} cufdVigente - CUFD vigente actual
 * @property {string|null} mensajeError - Mensaje de error si está offline
 */

/**
 * @typedef {Object} EmitirFacturaRequest
 * @description Request para emitir factura al SIAT
 * 
 * @property {number} codigoSucursal - Código de sucursal
 * @property {number} codigoPuntoVenta - Código punto de venta
 * @property {number} codigoActividad - Código actividad económica (debe ser único en factura)
 * @property {number} codigoTipoDocumentoIdentidad - Tipo documento cliente (1-5)
 * @property {string} numeroDocumento - NIT/CI del cliente
 * @property {string|null} complemento - Complemento del CI (opcional)
 * @property {string} nombreRazonSocial - Nombre/Razón social cliente
 * @property {number} codigoMetodoPago - Método de pago (1-34)
 * @property {number} montoTotal - Monto total de la factura
 * @property {number} montoTotalSujetoIva - Monto sujeto a IVA
 * @property {string|null} codigoExcepcion - Código excepción (0, 1) - opcional
 * @property {string|null} numeroTarjeta - Últimos 4 dígitos tarjeta - opcional
 * @property {DetalleFacturaRequest[]} detalle - Items de la factura
 * 
 * // CAMPOS CONTINGENCIA (solo para eventos 5, 6, 7)
 * @property {string|null} numeroFacturaTalonario - Número manual del talonario
 * @property {string|null} fechaContingencia - Fecha/hora contingencia (ISO)
 * 
 * // CUFD
 * @property {string} cufd - CUFD vigente al momento de emisión
 * @property {string} codigoControl - Código control del CUFD
 */

/**
 * @typedef {Object} DetalleFacturaRequest
 * @description Item de detalle de factura
 * 
 * @property {number} actividadEconomica - Código actividad (debe coincidir con header)
 * @property {string} codigoProductoSin - Código producto según SIN
 * @property {number} codigoProducto - Código interno del producto
 * @property {string} descripcion - Descripción del producto
 * @property {number} cantidad - Cantidad
 * @property {number} unidadMedida - Código unidad medida SIAT (1-64)
 * @property {number} precioUnitario - Precio unitario
 * @property {number} montoDescuento - Descuento en línea
 * @property {number} subTotal - Subtotal del item
 */

/**
 * @typedef {Object} FacturaEmitidaResponse
 * @description Respuesta del SIAT al emitir factura
 * 
 * @property {boolean} transaccion - Si la transacción fue exitosa
 * @property {string} codigoRecepcion - Código de recepción SIAT
 * @property {string} cuf - Código Único de Factura (40 chars)
 * @property {string} numeroFactura - Número de factura asignado
 * @property {string} fechaEmision - Fecha/hora emisión (ISO string)
 * @property {string|null} mensajeError - Mensaje de error (si transaccion = false)
 * @property {number|null} codigoError - Código de error SIAT (si hay)
 */

/**
 * @typedef {Object} CatalogoSiat
 * @description Catálogo dinámico del SIAT
 * 
 * @property {number} codigoClasificador - Código del clasificador
 * @property {string} descripcion - Descripción del item
 */

/**
 * @typedef {Object} ValidationResult
 * @description Resultado de validación SIAT
 * 
 * @property {boolean} valid - Si la validación pasó
 * @property {string|null} error - Mensaje de error (si valid = false)
 * @property {number|null} errorCode - Código de error SIAT (si aplica)
 */

// ═══════════════════════════════════════════════════════════════
// CÓDIGOS DE ERROR SIAT COMUNES
// ═══════════════════════════════════════════════════════════════

/**
 * Códigos de error más comunes del SIAT
 */
export const SIAT_ERROR_CODES = {
  // CUFD
  CUFD_VENCIDO: 993,
  CUFD_NO_CORRESPONDE: 994,
  
  // NIT
  NIT_INVALIDO: 1037,
  NIT_NO_EXISTE: 986,
  
  // Facturas
  NUMERO_FACTURA_DUPLICADO: 965,
  FACTURA_FUERA_RANGO: 967,
  
  // Eventos
  EVENTO_NO_VALIDO: 970,
  SIN_EVENTO_CONTINGENCIA: 971,
  
  // Sistema
  SISTEMA_NO_DISPONIBLE: 1,
  TIMEOUT: 2,
  
  // Catálogos
  CATALOGO_NO_SINCRONIZADO: 980
};

/**
 * Mensajes amigables para códigos de error SIAT
 */
export const SIAT_ERROR_MESSAGES = {
  [SIAT_ERROR_CODES.CUFD_VENCIDO]: 'El código de facturación (CUFD) ha vencido. Renovando automáticamente...',
  [SIAT_ERROR_CODES.CUFD_NO_CORRESPONDE]: 'El CUFD no corresponde al punto de venta',
  [SIAT_ERROR_CODES.NIT_INVALIDO]: 'El NIT ingresado no es válido según el padrón de Impuestos',
  [SIAT_ERROR_CODES.NIT_NO_EXISTE]: 'El NIT no existe en el padrón de contribuyentes',
  [SIAT_ERROR_CODES.NUMERO_FACTURA_DUPLICADO]: 'El número de factura ya fue utilizado',
  [SIAT_ERROR_CODES.EVENTO_NO_VALIDO]: 'El evento de contingencia no es válido',
  [SIAT_ERROR_CODES.SIN_EVENTO_CONTINGENCIA]: 'Debe crear un evento de contingencia para facturar offline',
  [SIAT_ERROR_CODES.SISTEMA_NO_DISPONIBLE]: 'El sistema SIAT no está disponible temporalmente',
  [SIAT_ERROR_CODES.CATALOGO_NO_SINCRONIZADO]: 'Los catálogos SIAT no están sincronizados. Ejecute la sincronización.'
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  SIAT_ERROR_CODES,
  SIAT_ERROR_MESSAGES
};