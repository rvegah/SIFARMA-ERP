// src/modules/sales/services/siatMockService.js

/**
 * Mock Service para simular respuesta del SIAT
 * Este servicio será reemplazado por la integración real más adelante
 */

// Generar código de autorización fake (64 caracteres)
const generateAuthorizationCode = () => {
  const chars = '0123456789ABCDEF';
  let code = '';
  for (let i = 0; i < 64; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generar número de factura incremental
let lastInvoiceNumber = 206300; // Empezar desde aquí

const generateInvoiceNumber = () => {
  lastInvoiceNumber += 1;
  return lastInvoiceNumber.toString();
};

// Generar CUF (Código Único de Factura)
const generateCUF = () => {
  return generateAuthorizationCode().substring(0, 40);
};

/**
 * Simula el envío de factura al SIAT y retorna los datos necesarios
 */
export const enviarFacturaSIAT = async (ventaData) => {
  // Simular delay de red (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  const numeroFactura = generateInvoiceNumber();
  const codigoAutorizacion = generateAuthorizationCode();
  const cuf = generateCUF();
  const fechaEmision = new Date().toISOString();

  // Construir URL del QR (formato real del SIAT)
  const nitEmpresa = '425567025';
  const numero = numeroFactura;
  const timestamp = Date.now();
  
  const qrUrl = `https://siat.impuestos.gob.bo/consulta/QR?nit=${nitEmpresa}&cuf=${cuf}&numero=${numero}&t=${timestamp}`;

  // Simular respuesta exitosa del SIAT
  const response = {
    success: true,
    data: {
      numeroFactura,
      codigoAutorizacion,
      cuf,
      fechaEmision,
      qrUrl,
      estado: 'VIGENTE',
      mensaje: 'Factura registrada correctamente en el SIAT',
      
      // Datos adicionales que retorna el SIAT
      codigoRecepcion: `REC-${Date.now()}`,
      codigoControl: codigoAutorizacion.substring(0, 16),
      fechaLimiteEmision: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };

  return response;
};

/**
 * Simula la consulta de estado de una factura en el SIAT
 */
export const consultarEstadoFactura = async (numeroFactura) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    success: true,
    data: {
      numeroFactura,
      estado: 'VIGENTE',
      fechaConsulta: new Date().toISOString()
    }
  };
};

/**
 * Simula la anulación de factura en el SIAT
 */
export const anularFacturaSIAT = async (numeroFactura, motivo) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    data: {
      numeroFactura,
      estado: 'ANULADA',
      motivoAnulacion: motivo,
      fechaAnulacion: new Date().toISOString(),
      codigoAnulacion: generateAuthorizationCode().substring(0, 32)
    }
  };
};

export default {
  enviarFacturaSIAT,
  consultarEstadoFactura,
  anularFacturaSIAT
};