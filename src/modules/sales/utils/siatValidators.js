// src/modules/sales/utils/siatValidators.js
/**
 * ═══════════════════════════════════════════════════════════════
 * VALIDADORES SIAT
 * Funciones de validación para datos SIAT
 * ═══════════════════════════════════════════════════════════════
 */

import { SIAT_ERROR_CODES, SIAT_ERROR_MESSAGES } from '../types/siat.types';
import {
  SPECIAL_NIT_MAPPING,
  INTEGRATION_RULES,
  isSpecialNit,
  getCodigoExcepcion
} from '../types/integration.types';
import {
  SIAT_DATA_FORMATS,
  SIAT_LIMITS,
  CUFD_CONFIG,
  CUIS_CONFIG,
  isContingencyEvent
} from '../constants/siatConstants';

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES DE NIT
// ═══════════════════════════════════════════════════════════════

/**
 * Validar formato de NIT boliviano
 * @param {string} nit - NIT a validar
 * @returns {ValidationResult}
 */
export const validateNitFormat = (nit) => {
  if (!nit || nit.trim() === '') {
    return {
      valid: false,
      error: 'El NIT no puede estar vacío',
      errorCode: null
    };
  }

  const nitTrimmed = nit.trim();

  // NITs especiales son siempre válidos
  if (isSpecialNit(nitTrimmed)) {
    return { valid: true, error: null, errorCode: null };
  }

  // NIT "0" (venta directa) es válido
  if (nitTrimmed === '0') {
    return { valid: true, error: null, errorCode: null };
  }

  // Formato general: solo números
  if (!/^\d+$/.test(nitTrimmed)) {
    return {
      valid: false,
      error: 'El NIT debe contener solo números',
      errorCode: SIAT_ERROR_CODES.NIT_INVALIDO
    };
  }

  // Longitud mínima
  if (nitTrimmed.length < 4) {
    return {
      valid: false,
      error: 'El NIT debe tener al menos 4 dígitos',
      errorCode: SIAT_ERROR_CODES.NIT_INVALIDO
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Validar NIT 4444 según monto
 * @param {string} nit - NIT del cliente
 * @param {number} montoTotal - Monto total de la venta
 * @returns {ValidationResult}
 */
export const validateNit4444Amount = (nit, montoTotal) => {
  if (nit !== '4444') {
    return { valid: true, error: null, errorCode: null };
  }

  if (montoTotal >= INTEGRATION_RULES.NIT_4444_MAX_AMOUNT) {
    return {
      valid: false,
      error: `Para ventas de Bs. ${INTEGRATION_RULES.NIT_4444_MAX_AMOUNT} o más, debe ingresar un NIT/CI válido`,
      errorCode: SIAT_ERROR_CODES.NIT_INVALIDO
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Auto-detectar tipo de documento según formato de NIT
 * @param {string} nit - NIT/CI ingresado
 * @returns {string} Código de tipo de documento (1-5)
 */
export const detectDocumentType = (nit) => {
  if (!nit) return '1'; // CI por defecto

  const nitTrimmed = nit.trim();

  // NITs especiales
  if (SPECIAL_NIT_MAPPING[nitTrimmed]) {
    return String(SPECIAL_NIT_MAPPING[nitTrimmed].tipoDocumento);
  }

  // Carnet de extranjero (empieza con E)
  if (/^E\d+$/i.test(nitTrimmed)) {
    return '2'; // CEX
  }

  // Pasaporte (alfanumérico, > 6 caracteres)
  if (/^[A-Z]\d+$/i.test(nitTrimmed) && nitTrimmed.length > 6) {
    return '3'; // PAS
  }

  // NIT largo (más de 10 dígitos)
  if (/^\d{10,}$/.test(nitTrimmed)) {
    return '5'; // NIT
  }

  // CI (solo números, 4-9 dígitos)
  if (/^\d{4,9}$/.test(nitTrimmed)) {
    return '1'; // CI
  }

  // Otro documento
  return '4'; // OD
};

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES DE CUFD/CUIS
// ═══════════════════════════════════════════════════════════════

/**
 * Validar vigencia de CUFD
 * @param {CufdData} cufd - Datos del CUFD
 * @returns {ValidationResult}
 */
export const validateCufdVigencia = (cufd) => {
  if (!cufd) {
    return {
      valid: false,
      error: 'No hay CUFD disponible',
      errorCode: SIAT_ERROR_CODES.CUFD_VENCIDO
    };
  }

  if (!cufd.vigente) {
    return {
      valid: false,
      error: 'El CUFD ha vencido',
      errorCode: SIAT_ERROR_CODES.CUFD_VENCIDO
    };
  }

  // Verificar fecha de vigencia
  const fechaVigencia = new Date(cufd.fechaVigencia);
  const ahora = new Date();

  if (ahora >= fechaVigencia) {
    return {
      valid: false,
      error: 'El CUFD ha expirado',
      errorCode: SIAT_ERROR_CODES.CUFD_VENCIDO
    };
  }

  // Verificar si está cerca de vencer (2 horas antes)
  const horasRestantes = (fechaVigencia - ahora) / (1000 * 60 * 60);
  const cercaDeVencer = horasRestantes < CUFD_CONFIG.RENOVACION_ANTICIPADA_HORAS;

  return {
    valid: true,
    error: null,
    errorCode: null,
    warning: cercaDeVencer ? 'El CUFD vencerá pronto, se renovará automáticamente' : null
  };
};

/**
 * Validar formato de CUFD
 * @param {string} codigo - Código CUFD
 * @returns {ValidationResult}
 */
export const validateCufdFormat = (codigo) => {
  if (!codigo) {
    return { valid: false, error: 'Código CUFD vacío', errorCode: null };
  }

  if (codigo.length < CUFD_CONFIG.LONGITUD_MINIMA || codigo.length > CUFD_CONFIG.LONGITUD_MAXIMA) {
    return {
      valid: false,
      error: `Código CUFD debe tener entre ${CUFD_CONFIG.LONGITUD_MINIMA} y ${CUFD_CONFIG.LONGITUD_MAXIMA} caracteres`,
      errorCode: null
    };
  }

  // Validar que sea Base64
  if (!/^[A-Za-z0-9+/=]+$/.test(codigo)) {
    return {
      valid: false,
      error: 'Código CUFD debe estar en formato Base64',
      errorCode: null
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Validar formato de CUIS
 * @param {string} codigo - Código CUIS
 * @returns {ValidationResult}
 */
export const validateCuisFormat = (codigo) => {
  if (!codigo) {
    return { valid: false, error: 'Código CUIS vacío', errorCode: null };
  }

  if (codigo.length < CUIS_CONFIG.LONGITUD_MINIMA || codigo.length > CUIS_CONFIG.LONGITUD_MAXIMA) {
    return {
      valid: false,
      error: `Código CUIS debe tener entre ${CUIS_CONFIG.LONGITUD_MINIMA} y ${CUIS_CONFIG.LONGITUD_MAXIMA} caracteres`,
      errorCode: null
    };
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(codigo)) {
    return {
      valid: false,
      error: 'Código CUIS debe estar en formato Base64',
      errorCode: null
    };
  }

  return { valid: true, error: null, errorCode: null };
};

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES DE FACTURA
// ═══════════════════════════════════════════════════════════════

/**
 * Validar actividad económica única en factura
 * @param {Array} items - Items de la factura
 * @returns {ValidationResult}
 */
export const validateSingleActivity = (items) => {
  if (!items || items.length === 0) {
    return { valid: true, error: null, errorCode: null };
  }

  const actividades = new Set();
  items.forEach(item => {
    if (item.codigoActividad) {
      actividades.add(item.codigoActividad);
    }
  });

  if (actividades.size > 1) {
    return {
      valid: false,
      error: 'Todos los productos deben tener la misma actividad económica. No se pueden mezclar productos de diferentes actividades en una misma factura.',
      errorCode: null,
      actividades: Array.from(actividades)
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Validar límites de factura
 * @param {Object} facturaData - Datos de la factura
 * @returns {ValidationResult}
 */
export const validateInvoiceLimits = (facturaData) => {
  const { items, totales } = facturaData;

  // Validar número de items
  if (items && items.length > SIAT_LIMITS.MAX_ITEMS_PER_INVOICE) {
    return {
      valid: false,
      error: `La factura no puede tener más de ${SIAT_LIMITS.MAX_ITEMS_PER_INVOICE} items`,
      errorCode: null
    };
  }

  // Warning para montos altos
  if (totales && totales.total > SIAT_LIMITS.WARNING_AMOUNT) {
    return {
      valid: true,
      error: null,
      errorCode: null,
      warning: `Monto elevado (Bs. ${totales.total.toFixed(2)}). Por favor verifique.`
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Validar descripción de producto
 * @param {string} descripcion - Descripción del producto
 * @returns {ValidationResult}
 */
export const validateProductDescription = (descripcion) => {
  if (!descripcion || descripcion.trim() === '') {
    return {
      valid: false,
      error: 'La descripción del producto no puede estar vacía',
      errorCode: null
    };
  }

  if (descripcion.length > SIAT_LIMITS.MAX_PRODUCT_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `La descripción no puede exceder ${SIAT_LIMITS.MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres`,
      errorCode: null,
      truncated: descripcion.substring(0, SIAT_LIMITS.MAX_PRODUCT_DESCRIPTION_LENGTH)
    };
  }

  return { valid: true, error: null, errorCode: null };
};

/**
 * Validar nombre de cliente
 * @param {string} nombre - Nombre del cliente
 * @returns {ValidationResult}
 */
export const validateClientName = (nombre) => {
  if (!nombre || nombre.trim() === '') {
    return {
      valid: false,
      error: 'El nombre del cliente no puede estar vacío',
      errorCode: null
    };
  }

  if (nombre.length > SIAT_LIMITS.MAX_CLIENT_NAME_LENGTH) {
    return {
      valid: false,
      error: `El nombre no puede exceder ${SIAT_LIMITS.MAX_CLIENT_NAME_LENGTH} caracteres`,
      errorCode: null,
      truncated: nombre.substring(0, SIAT_LIMITS.MAX_CLIENT_NAME_LENGTH)
    };
  }

  return { valid: true, error: null, errorCode: null };
};

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES DE CONTINGENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * Validar campos de contingencia
 * @param {Object} contingenciaData - Datos de contingencia
 * @param {EventoSiat} eventoActivo - Evento activo
 * @returns {ValidationResult}
 */
export const validateContingencyFields = (contingenciaData, eventoActivo) => {
  if (!eventoActivo) {
    return { valid: true, error: null, errorCode: null };
  }

  // Solo validar si es evento de contingencia (5, 6, 7)
  if (!isContingencyEvent(eventoActivo.codigoEvento)) {
    return { valid: true, error: null, errorCode: null };
  }

  const { numeroFacturaTalonario, fechaContingencia } = contingenciaData || {};

  // Campos requeridos para contingencia
  if (!numeroFacturaTalonario || !fechaContingencia) {
    return {
      valid: false,
      error: 'Para facturación en contingencia se requiere número de talonario y fecha/hora',
      errorCode: SIAT_ERROR_CODES.EVENTO_NO_VALIDO,
      camposFaltantes: {
        numeroFacturaTalonario: !numeroFacturaTalonario,
        fechaContingencia: !fechaContingencia
      }
    };
  }

  // Validar formato de número de factura
  if (!/^\d+$/.test(numeroFacturaTalonario)) {
    return {
      valid: false,
      error: 'El número de factura debe contener solo dígitos',
      errorCode: null
    };
  }

  // Validar fecha de contingencia
  const fecha = new Date(fechaContingencia);
  if (isNaN(fecha.getTime())) {
    return {
      valid: false,
      error: 'Fecha de contingencia inválida',
      errorCode: null
    };
  }

  return { valid: true, error: null, errorCode: null };
};

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES COMPUESTAS
// ═══════════════════════════════════════════════════════════════

/**
 * Validar factura completa antes de enviar a SIAT
 * @param {Object} facturaData - Datos completos de la factura
 * @param {Object} siatContext - Contexto SIAT (CUFD, evento, etc)
 * @returns {ValidationResult}
 */
export const validateCompleteInvoice = (facturaData, siatContext) => {
  const errors = [];
  const warnings = [];

  // 1. Validar NIT
  const nitValidation = validateNitFormat(facturaData.cliente.nit);
  if (!nitValidation.valid) {
    errors.push(nitValidation.error);
  }

  // 2. Validar NIT 4444 con monto
  const nit4444Validation = validateNit4444Amount(
    facturaData.cliente.nit,
    facturaData.totales.total
  );
  if (!nit4444Validation.valid) {
    errors.push(nit4444Validation.error);
  }

  // 3. Validar CUFD
  if (siatContext.cufdVigente) {
    const cufdValidation = validateCufdVigencia(siatContext.cufdVigente);
    if (!cufdValidation.valid) {
      errors.push(cufdValidation.error);
    }
    if (cufdValidation.warning) {
      warnings.push(cufdValidation.warning);
    }
  } else {
    errors.push('No hay CUFD vigente disponible');
  }

  // 4. Validar actividad única
  if (INTEGRATION_RULES.SINGLE_ACTIVITY_PER_INVOICE) {
    const activityValidation = validateSingleActivity(facturaData.items);
    if (!activityValidation.valid) {
      errors.push(activityValidation.error);
    }
  }

  // 5. Validar límites
  const limitsValidation = validateInvoiceLimits(facturaData);
  if (!limitsValidation.valid) {
    errors.push(limitsValidation.error);
  }
  if (limitsValidation.warning) {
    warnings.push(limitsValidation.warning);
  }

  // 6. Validar nombre cliente
  const nameValidation = validateClientName(facturaData.cliente.nombre);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  }

  // 7. Validar contingencia si aplica
  if (siatContext.eventoActivo) {
    const contingencyValidation = validateContingencyFields(
      facturaData.contingencia,
      siatContext.eventoActivo
    );
    if (!contingencyValidation.valid) {
      errors.push(contingencyValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors.join('. ') : null,
    errorCode: null,
    errors: errors,
    warnings: warnings
  };
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  validateNitFormat,
  validateNit4444Amount,
  detectDocumentType,
  validateCufdVigencia,
  validateCufdFormat,
  validateCuisFormat,
  validateSingleActivity,
  validateInvoiceLimits,
  validateProductDescription,
  validateClientName,
  validateContingencyFields,
  validateCompleteInvoice
};