// src/modules/sales/components/InvoiceCompactPDF.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
// ✅ Usar react-qr-code
import QRCode from 'react-qr-code';

/**
 * Componente para renderizar factura compacta (estilo PIL/Estaciones)
 * Formato MUY pequeño con solo datos esenciales
 */
const InvoiceCompactPDF = React.forwardRef(({ invoiceData }, ref) => {
  const {
    empresa,
    factura,
    cliente,
    totales,
    pagado
  } = invoiceData;

  // Formatear fecha corta
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '250px',
        padding: '8px',
        backgroundColor: 'white',
        fontFamily: 'monospace',
        fontSize: '10px',
        lineHeight: '1.2',
        color: '#000'
      }}
    >
      {/* ENCABEZADO MÍNIMO */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>
          {empresa.razonSocial}
        </Typography>
        <Typography sx={{ fontSize: '9px' }}>
          NIT: {empresa.nit}
        </Typography>
      </Box>

      {/* DATOS ESENCIALES */}
      <Box sx={{ mb: 1, fontSize: '9px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>Factura:</span>
          <span style={{ fontWeight: 'bold' }}>{factura.numeroFactura}</span>
        </Box>
        
        <Box sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: '7px', color: '#666' }}>
            Cód. Autorización:
          </Typography>
          <Typography sx={{ fontSize: '7px', wordBreak: 'break-all' }}>
            {factura.codigoAutorizacion.substring(0, 32)}...
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>Fecha:</span>
          <span>{formatFecha(factura.fechaEmision)}</span>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>NIT:</span>
          <span>{cliente.nit}</span>
        </Box>

        <Box sx={{ mb: 0.3 }}>
          <Typography sx={{ fontSize: '9px' }}>
            Señor(es): <strong>{cliente.nombre}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3, fontSize: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>TOTAL:</span>
          <span style={{ fontWeight: 'bold' }}>Bs. {totales.total.toFixed(2)}</span>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Pago:</span>
          <span>Efectivo Bs. {pagado.toFixed(2)}</span>
        </Box>
      </Box>

      {/* ✅ LEYENDA PARA EL QR */}
      <Typography sx={{ 
        fontSize: '8px', 
        textAlign: 'center', 
        fontWeight: 'bold',
        mt: 0.5,
        mb: 0.5
      }}>
        Visualice su factura en Línea ingresando al siguiente QR.
      </Typography>

      {/* QR CODE CENTRADO - ✅ USANDO react-qr-code */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <QRCode 
          value={factura.qrUrl} 
          size={100}
          level="M"
        />
      </Box>

      {/* PIE MÍNIMO */}
      <Typography sx={{ fontSize: '7px', textAlign: 'center', mt: 0.5 }}>
        Gracias por su compra
      </Typography>
    </Box>
  );
});

InvoiceCompactPDF.displayName = 'InvoiceCompactPDF';

export default InvoiceCompactPDF;