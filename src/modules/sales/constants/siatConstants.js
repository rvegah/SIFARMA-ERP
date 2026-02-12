// src/modules/sales/constants/siatConstants.js
/**
 * ═══════════════════════════════════════════════════════════════
 * CONSTANTES SIAT - Sistema de Impuestos Bolivia
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * TIPOS DE EVENTOS SIAT
 * 
 * Eventos 1-4: Normal (SIFARMA no los gestiona)
 * Eventos 5-7: Contingencia (SIFARMA SOLO DETECTA)
 */
export const SIAT_EVENT_TYPES = {
  // NORMALES (No relevantes para SIFARMA - gestionados en sistema SIAT)
  1: {
    codigo: 1,
    descripcion: 'Corte del servicio de internet',
    esContingencia: false,
    gestionadoPor: 'SISTEMA_SIAT' // No gestionar en SIFARMA
  },
  2: {
    codigo: 2,
    descripcion: 'Ingreso a zonas sin internet',
    esContingencia: false,
    gestionadoPor: 'SISTEMA_SIAT'
  },
  3: {
    codigo: 3,
    descripcion: 'Venta en transporte público',
    esContingencia: false,
    gestionadoPor: 'SISTEMA_SIAT'
  },
  4: {
    codigo: 4,
    descripcion: 'Venta en lugares sin energía eléctrica',
    esContingencia: false,
    gestionadoPor: 'SISTEMA_SIAT'
  },
  
  // CONTINGENCIA (SIFARMA DETECTA - NO GESTIONA)
  5: {
    codigo: 5,
    descripcion: 'Inaccesibilidad al servicio web del SIAT',
    esContingencia: true,
    requiereCamposExtras: true,
    campos: ['numeroFacturaTalonario', 'fechaContingencia'],
    gestionadoPor: 'SISTEMA_SIAT', // Creado en sistema SIAT
    detectadoPor: 'SIFARMA' // SIFARMA solo detecta y adapta facturación
  },
  6: {
    codigo: 6,
    descripcion: 'Verificación de estado del SIAT',
    esContingencia: true,
    requiereCamposExtras: true,
    campos: ['numeroFacturaTalonario', 'fechaContingencia'],
    gestionadoPor: 'SISTEMA_SIAT',
    detectadoPor: 'SIFARMA'
  },
  7: {
    codigo: 7,
    descripcion: 'Corte del servicio de internet',
    esContingencia: true,
    requiereCamposExtras: true,
    campos: ['numeroFacturaTalonario', 'fechaContingencia'],
    gestionadoPor: 'SISTEMA_SIAT',
    detectadoPor: 'SIFARMA'
  }
};

/**
 * Códigos de eventos de contingencia (los que SIFARMA detecta)
 */
export const CONTINGENCY_EVENT_CODES = [5, 6, 7];

/**
 * Verificar si un evento es de contingencia
 * @param {number} codigoEvento - Código del evento
 * @returns {boolean}
 */
export const isContingencyEvent = (codigoEvento) => {
  return CONTINGENCY_EVENT_CODES.includes(codigoEvento);
};

/**
 * MODALIDADES DE FACTURACIÓN SIAT
 */
export const SIAT_MODALITIES = {
  ELECTRONICA_LINEA: 1,      // Facturación en línea (normal)
  COMPUTARIZADA_LINEA: 2,    // Computarizada en línea
  ELECTRONICA_CONTINGENCIA: 3 // Facturación en contingencia (eventos 5-7)
};

/**
 * TIPOS DE FACTURA SIAT
 */
export const SIAT_INVOICE_TYPES = {
  VENTA: 1,                    // Factura con derecho a crédito fiscal
  VENTA_SIN_CREDITO: 2,        // Factura sin derecho a crédito fiscal
  NOTA_CREDITO_DEBITO: 3       // Nota de crédito/débito
};

/**
 * SECTORES ECONÓMICOS SIAT
 */
export const SIAT_ECONOMIC_SECTORS = {
  FARMACIAS: 17, // Sector farmacéutico
  HOSPITALES: 17, // Hospitales también usan sector 17
  // Otros sectores no relevantes para SIFARMA
};

/**
 * ACTIVIDADES ECONÓMICAS FARMACIAS
 */
export const PHARMACY_ACTIVITIES = {
  VENTA_MINORISTA_FARMACIA: 477310, // Actividad principal farmacias
  VENTA_MINORISTA_PRODUCTOS_MEDICOS: 477320 // Productos médicos/ortopédicos
};

/**
 * CONFIGURACIÓN CUFD
 */
export const CUFD_CONFIG = {
  // Vigencia típica de un CUFD (24 horas)
  VIGENCIA_HORAS: 24,
  
  // Tiempo antes de vencimiento para renovar automáticamente (2 horas)
  RENOVACION_ANTICIPADA_HORAS: 2,
  
  // Intervalo de verificación de vigencia (cada 30 minutos)
  VERIFICACION_INTERVALO_MS: 30 * 60 * 1000,
  
  // Formato del código CUFD (Base64, longitud típica)
  FORMATO: 'BASE64',
  LONGITUD_MINIMA: 40,
  LONGITUD_MAXIMA: 200
};

/**
 * CONFIGURACIÓN CUIS
 */
export const CUIS_CONFIG = {
  // CU

/*IS es más longevo (hasta 1 año)*/
  VIGENCIA_DIAS: 365,
  
  // Se requiere un CUIS por cada actividad económica
  POR_ACTIVIDAD: true,
  
  // Formato similar a CUFD
  FORMATO: 'BASE64',
  LONGITUD_MINIMA: 40,
  LONGITUD_MAXIMA: 200
};

/**
 * TIMEOUTS Y RETRY PARA SIAT
 */
export const SIAT_TIMEOUTS = {
  // Timeout para llamadas SOAP al SIAT (30 segundos)
  REQUEST_TIMEOUT_MS: 30000,
  
  // Reintentos automáticos
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  
  // Polling de estado SIAT
  STATUS_POLL_INTERVAL_MS: 60000, // Cada 1 minuto
  
  // Timeout para verificación de estado
  STATUS_CHECK_TIMEOUT_MS: 5000
};

/**
 * CÓDIGOS DE RECHAZO COMUNES SIAT
 */
export const SIAT_REJECTION_CODES = {
  // Facturas
  FACTURA_DUPLICADA: 965,
  FACTURA_FUERA_RANGO: 967,
  DATOS_INCOMPLETOS: 990,
  
  // NIT
  NIT_INVALIDO: 1037,
  NIT_NO_REGISTRADO: 986,
  
  // CUFD/CUIS
  CUFD_VENCIDO: 993,
  CUIS_INVALIDO: 994,
  
  // Eventos
  SIN_EVENTO_ACTIVO: 971,
  EVENTO_CERRADO: 972,
  
  // Sistema
  SERVICIO_NO_DISPONIBLE: 1,
  ERROR_INTERNO: 500
};

/**
 * CATÁLOGOS SIAT (sincronizados dinámicamente)
 * Lista de catálogos que deben sincronizarse
 */
export const SIAT_CATALOGS = {
  TIPOS_DOCUMENTO_IDENTIDAD: {
    codigo: 5,
    nombre: 'Tipos de Documento de Identidad',
    sincronizacionRequerida: true,
    frecuenciaDias: 30 // Sincronizar cada 30 días
  },
  TIPOS_METODO_PAGO: {
    codigo: 10,
    nombre: 'Tipos de Método de Pago',
    sincronizacionRequerida: true,
    frecuenciaDias: 30
  },
  UNIDADES_MEDIDA: {
    codigo: 11,
    nombre: 'Unidades de Medida',
    sincronizacionRequerida: true,
    frecuenciaDias: 90
  },
  TIPOS_MONEDA: {
    codigo: 3,
    nombre: 'Tipos de Moneda',
    sincronizacionRequerida: true,
    frecuenciaDias: 180
  },
  MOTIVOS_ANULACION: {
    codigo: 12,
    nombre: 'Motivos de Anulación',
    sincronizacionRequerida: true,
    frecuenciaDias: 90
  },
  TIPOS_PUNTO_VENTA: {
    codigo: 13,
    nombre: 'Tipos de Punto de Venta',
    sincronizacionRequerida: false
  },
  TIPOS_EMISION: {
    codigo: 2,
    nombre: 'Tipos de Emisión',
    sincronizacionRequerida: false
  }
};

/**
 * FORMATO DE DATOS SIAT
 */
export const SIAT_DATA_FORMATS = {
  // Fechas siempre en formato ISO 8601
  FECHA_FORMATO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  
  // Timezone Bolivia (UTC-4)
  TIMEZONE: 'America/La_Paz',
  UTC_OFFSET: -4,
  
  // Decimales para montos
  DECIMALES_MONTO: 2,
  
  // Longitud CUF (Código Único de Factura)
  CUF_LENGTH: 40,
  
  // Formato números de factura
  NUMERO_FACTURA_REGEX: /^\d+$/
};

/**
 * MENSAJES DE USUARIO SIAT
 */
export const SIAT_USER_MESSAGES = {
  CUFD_RENOVANDO: 'Renovando código de facturación (CUFD)...',
  CUFD_RENOVADO: 'Código de facturación renovado exitosamente',
  CUFD_ERROR: 'Error al renovar código de facturación. Verifique su conexión.',
  
  SIAT_OFFLINE: 'El sistema SIAT no está disponible. Se guardará la factura para envío posterior.',
  SIAT_ONLINE: 'Conexión con SIAT restablecida',
  
  EVENTO_DETECTADO: 'Evento de contingencia detectado. Se activarán campos adicionales.',
  EVENTO_FINALIZADO: 'Evento de contingencia finalizado. Volviendo a modo normal.',
  
  NIT_VALIDACION_ERROR: 'El NIT ingresado no es válido según el padrón de Impuestos. Por favor verifique.',
  
  CATALOGO_DESACTUALIZADO: 'Los catálogos SIAT están desactualizados. Por favor ejecute la sincronización.'
};

/**
 * CONFIGURACIÓN DE SINCRONIZACIÓN
 */
export const SYNC_CONFIG = {
  // Auto-sincronizar catálogos al inicio
  AUTO_SYNC_ON_START: true,
  
  // Verificar sincronización cada
  CHECK_INTERVAL_HOURS: 24,
  
  // Reintentos en caso de fallo
  MAX_SYNC_RETRIES: 3,
  
  // Notificar al usuario si la sincronización falla
  NOTIFY_ON_FAILURE: true
};

/**
 * LÍMITES Y VALIDACIONES
 */
export const SIAT_LIMITS = {
  // Máximo de items por factura
  MAX_ITEMS_PER_INVOICE: 500,
  
  // Monto máximo por factura (sin límite técnico, pero warning a partir de)
  WARNING_AMOUNT: 50000,
  
  // Longitud máxima descripción producto
  MAX_PRODUCT_DESCRIPTION_LENGTH: 500,
  
  // Longitud máxima nombre cliente
  MAX_CLIENT_NAME_LENGTH: 500
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  SIAT_EVENT_TYPES,
  CONTINGENCY_EVENT_CODES,
  isContingencyEvent,
  SIAT_MODALITIES,
  SIAT_INVOICE_TYPES,
  SIAT_ECONOMIC_SECTORS,
  PHARMACY_ACTIVITIES,
  CUFD_CONFIG,
  CUIS_CONFIG,
  SIAT_TIMEOUTS,
  SIAT_REJECTION_CODES,
  SIAT_CATALOGS,
  SIAT_DATA_FORMATS,
  SIAT_USER_MESSAGES,
  SYNC_CONFIG,
  SIAT_LIMITS
};