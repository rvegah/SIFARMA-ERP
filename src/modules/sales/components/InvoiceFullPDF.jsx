// src/modules/sales/components/InvoiceFullPDF.jsx
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
// ❌ ANTES:
// import QRCode from 'qrcode.react';

// ✅ AHORA:
import QRCode from 'react-qr-code';

/**
 * Componente para renderizar factura completa en formato térmico
 * Medidas: 79mm de ancho (aprox 300px a 96 DPI)
 */
const InvoiceFullPDF = React.forwardRef(({ invoiceData }, ref) => {
  const {
    empresa,
    factura,
    cliente,
    items,
    totales,
    pagado,
    cambio,
    usuario,
    leyendas
  } = invoiceData;

  // Formatear fecha
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Número a texto
  const numeroATexto = (numero) => {
    const partes = numero.toFixed(2).split('.');
    const entero = parseInt(partes[0]);
    const decimal = partes[1];
    
    // Simplificado para el ejemplo
    const unidades = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
    const decenas = ['', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
    const centenas = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
    
    if (entero === 0) return `Cero ${decimal}/100 Bolivianos`;
    if (entero < 10) return `${unidades[entero]} ${decimal}/100 Bolivianos`;
    if (entero < 100) {
      const dec = Math.floor(entero / 10);
      const uni = entero % 10;
      return `${decenas[dec]}${uni > 0 ? ' y ' + unidades[uni] : ''} ${decimal}/100 Bolivianos`;
    }
    
    return `${entero} ${decimal}/100 Bolivianos`;
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '300px',
        padding: '10px',
        backgroundColor: 'white',
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.3',
        color: '#000'
      }}
    >
      {/* ENCABEZADO */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 0.5 }}>
          {empresa.razonSocial}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          {empresa.direccionCasaMatriz}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          No. Punto de Venta {factura.puntoVenta}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          Telf: {empresa.telefono}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          {empresa.ciudad}
        </Typography>
      </Box>

      {/* TIPO DE FACTURA */}
      <Box sx={{ textAlign: 'center', my: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
          FACTURA
        </Typography>
        <Typography sx={{ fontSize: '9px' }}>
          (Con Derecho a Crédito Fiscal)
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* DATOS FISCALES */}
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '10px' }}>
          NIT: {empresa.nit}
        </Typography>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
          FACTURA N° {factura.numeroFactura}
        </Typography>
        <Typography sx={{ fontSize: '9px', wordBreak: 'break-all' }}>
          CÓD. AUTORIZACIÓN
        </Typography>
        <Typography sx={{ fontSize: '8px', wordBreak: 'break-all', mb: 0.5 }}>
          {factura.codigoAutorizacion}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* DATOS DEL CLIENTE */}
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '10px' }}>
          Nombre/Razón Social: {cliente.nombre}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          NIT/CI/CEX: {cliente.nit}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          Cod. Cliente: COD-{cliente.id}
        </Typography>
        <Typography sx={{ fontSize: '10px' }}>
          Fecha Emision: {formatFecha(factura.fechaEmision)}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'solid', my: 1 }} />

      {/* ENCABEZADO DE TABLA */}
      <Box sx={{ display: 'flex', mb: 0.5, fontSize: '9px', fontWeight: 'bold' }}>
        <Box sx={{ width: '15%' }}>Cant.</Box>
        <Box sx={{ width: '40%' }}>Precio</Box>
        <Box sx={{ width: '20%' }}>Desc.</Box>
        <Box sx={{ width: '25%', textAlign: 'right' }}>Sub Total</Box>
      </Box>

      <Divider sx={{ borderStyle: 'solid', my: 0.5 }} />

      {/* ITEMS */}
      {items.map((item, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 'bold', mb: 0.3 }}>
            {item.codigo}-{item.nombre}
          </Typography>
          <Typography sx={{ fontSize: '8px', mb: 0.3 }}>
            Unidad Medida: {item.unidadMedida}
          </Typography>
          <Box sx={{ display: 'flex', fontSize: '9px' }}>
            <Box sx={{ width: '15%' }}>{item.cantidad}</Box>
            <Box sx={{ width: '40%' }}>{item.precio.toFixed(2)}</Box>
            <Box sx={{ width: '20%' }}>{item.descuento.toFixed(2)}</Box>
            <Box sx={{ width: '25%', textAlign: 'right' }}>
              {item.subtotal.toFixed(2)}
            </Box>
          </Box>
        </Box>
      ))}

      <Divider sx={{ borderStyle: 'solid', my: 1 }} />

      {/* TOTALES */}
      <Box sx={{ mb: 1, fontSize: '10px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>SUBTOTAL Bs</span>
          <span style={{ fontWeight: 'bold' }}>{totales.subtotal.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>DESCUENTO Bs</span>
          <span style={{ fontWeight: 'bold' }}>{totales.descuentoAdicional.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span style={{ fontWeight: 'bold' }}>TOTAL Bs</span>
          <span style={{ fontWeight: 'bold' }}>{totales.total.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>PAGADO Bs</span>
          <span style={{ fontWeight: 'bold' }}>{pagado.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span>CAMBIO Bs</span>
          <span style={{ fontWeight: 'bold' }}>{cambio.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <span style={{ fontWeight: 'bold' }}>MONTO A PAGAR Bs</span>
          <span style={{ fontWeight: 'bold' }}>{totales.total.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IMPORTE BASE CRÉDITO FISCAL</span>
          <span>{totales.total.toFixed(2)}</span>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '9px', mb: 1 }}>
        SON: {numeroATexto(totales.total)}
      </Typography>

      <Divider sx={{ borderStyle: 'solid', my: 1 }} />

      {/* LEYENDAS LEGALES */}
      <Box sx={{ mb: 1, fontSize: '8px', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '8px', fontWeight: 'bold', mb: 0.5 }}>
          {leyendas.principal}
        </Typography>
        <Typography sx={{ fontSize: '7px', mb: 0.5 }}>
          {leyendas.ley453}
        </Typography>
        <Typography sx={{ fontSize: '7px', fontStyle: 'italic' }}>
          "{leyendas.documentoDigital}"
        </Typography>
      </Box>

      {/* QR CODE - ✅ USANDO react-qr-code */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <QRCode 
          value={factura.qrUrl} 
          size={120}
          level="M"
        />
      </Box>

      <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>
        Gracias por su compra
      </Typography>

      {/* PIE */}
      <Typography sx={{ fontSize: '8px', textAlign: 'center' }}>
        Usuario: {usuario}
      </Typography>
    </Box>
  );
});

InvoiceFullPDF.displayName = 'InvoiceFullPDF';

export default InvoiceFullPDF;