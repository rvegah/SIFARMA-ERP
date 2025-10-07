// Códigos especiales de facturación según normativa de impuestos
export const SPECIAL_NIT_CODES = {
  '99001': 'Consulados, Embajadas',
  '99002': 'Control Tributario',
  '99003': 'Ventas menores del Día', // Ya no se usa mucho
  '4444': 'SIN NOMBRE'
};

// Límite para facturar sin nombre
export const FACTURA_SIN_NOMBRE_LIMIT = 1000; // Bs.

// Tipos de documento según normativa
export const DOCUMENT_TYPES = [
  { value: '1', label: '1 - CI - CEDULA DE IDENTIDAD' },
  { value: '2', label: '2 - CEX - CEDULA DE IDENTIDAD DE EXTRANJERO' },
  { value: '3', label: '3 - PAS - PASAPORTE' },
  { value: '4', label: '4 - OD - OTRO DOCUMENTO DE IDENTIDAD' },
  { value: '5', label: '5 - NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA' }
];

// Unidades de medida (según sistema de impuestos)
export const UNITS_OF_MEASURE = [
  { id: 1, code: '1', name: 'BOBINAS' },
  { id: 2, code: '2', name: 'BALDE' },
  { id: 3, code: '3', name: 'BARRILES' },
  { id: 4, code: '4', name: 'BOLSA' },
  { id: 5, code: '5', name: 'BOTELLAS' },
  { id: 6, code: '6', name: 'CAJA' },
  { id: 7, code: '7', name: 'CARTONES' },
  { id: 8, code: '8', name: 'CENTIMETRO CUADRADO' },
  { id: 9, code: '9', name: 'CENTIMETRO CUBICO' },
  { id: 10, code: '10', name: 'CENTIMETRO LINEAL' },
  { id: 11, code: '11', name: 'CIENTO DE UNIDADES' },
  { id: 12, code: '12', name: 'CILINDRO' },
  { id: 13, code: '13', name: 'CONOS' },
  { id: 14, code: '14', name: 'DOCENA' },
  { id: 25, code: '25', name: 'KIT' },
  { id: 26, code: '26', name: 'LATAS' },
  { id: 27, code: '27', name: 'LIBRAS' },
  { id: 28, code: '28', name: 'LITRO' },
  { id: 29, code: '29', name: 'MEGAWATT HORA' },
  { id: 30, code: '30', name: 'METRO' },
  { id: 31, code: '31', name: 'METRO CUADRADO' },
  { id: 32, code: '32', name: 'METRO CUBICO' },
  { id: 33, code: '33', name: 'MILIGRAMOS' },
  { id: 34, code: '34', name: 'MILILITRO' },
  { id: 35, code: '35', name: 'MILIMETRO' },
  { id: 36, code: '36', name: 'MILIMETRO CUADRADO' },
  { id: 37, code: '37', name: 'MILIMETRO CUBICO' },
  { id: 38, code: '38', name: 'MILLARES' },
  { id: 39, code: '39', name: 'MILLON DE UNIDADES' },
  { id: 40, code: '40', name: 'ONZAS' },
  { id: 41, code: '41', name: 'PALETAS' },
  { id: 42, code: '42', name: 'PAQUETE' },
  { id: 43, code: '43', name: 'PAR' }
];

// Motivos de anulación
export const CANCELLATION_REASONS = [
  { value: '1', label: '(1) FACTURA MAL EMITIDA' },
  { value: '2', label: '(2) NOTA DE CREDITO-DEBITO MAL EMITIDA' },
  { value: '3', label: '(3) DATOS DE EMISION INCORRECTOS' },
  { value: '4', label: '(4) FACTURA O NOTA DE CREDITO-DEBITO DEVUELTA' }
];

// Estados de venta
export const SALE_STATUS = {
  PENDING: 'pending',      // Venta en proceso
  SAVED: 'saved',          // Guardada sin facturar
  INVOICED: 'invoiced',    // Facturada
  CANCELLED: 'cancelled'   // Anulada
};

// Configuración de impresión
export const PRINT_CONFIG = {
  PAPER_WIDTH: 79,  // mm
  PAPER_HEIGHT: 70, // mm
  PAPER_TYPE: 'TERMICO 80 GRAMOS'
};