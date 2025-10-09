// src/modules/sales/components/PrintInvoiceModal.jsx
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert
} from '@mui/material';
import { Print, Close, Receipt, Description } from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';
import InvoiceFullPDF from './InvoiceFullPDF';
import InvoiceCompactPDF from './InvoiceCompactPDF';
import { generatePDFFromElement } from '../utils/pdfGenerator';

const PrintInvoiceModal = ({ open, onClose, invoiceData, onPrintComplete }) => {
  const [format, setFormat] = useState('full'); // 'full' o 'compact'
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  
  const fullInvoiceRef = useRef(null);
  const compactInvoiceRef = useRef(null);

  const handlePrint = async () => {
    setPrinting(true);
    setError(null);

    try {
      const element = format === 'full' ? fullInvoiceRef.current : compactInvoiceRef.current;
      
      if (!element) {
        throw new Error('No se pudo obtener el elemento para imprimir');
      }

      const filename = `FACTURA-${invoiceData.factura.numeroFactura}.pdf`;
      
      // Generar PDF y abrir diálogo de impresión
      const result = await generatePDFFromElement(element, filename, true);

      if (result.success) {
        // Notificar que se imprimió correctamente
        if (onPrintComplete) {
          onPrintComplete({
            ...invoiceData,
            pdfUrl: result.pdfUrl,
            formato: format
          });
        }

        // Cerrar modal después de 1 segundo
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('Error al imprimir:', err);
      setError(err.message || 'Error al generar la factura');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: farmaColors.secondary,
        color: 'white',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Print />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Imprimir Factura
          </Typography>
        </Box>
        <Button 
          onClick={onClose} 
          sx={{ color: 'white', minWidth: 'auto' }}
          disabled={printing}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {/* Selección de formato */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Seleccione el formato de impresión:
          </Typography>
          
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Opción Completa */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  border: format === 'full' ? `3px solid ${farmaColors.primary}` : '2px solid #e0e0e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: farmaColors.primary,
                    bgcolor: farmaColors.alpha.primary10
                  }
                }}
                onClick={() => setFormat('full')}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Description color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Factura Completa
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Incluye todos los detalles, productos, totales y leyendas legales
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              </Box>

              {/* Opción Compacta */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  border: format === 'compact' ? `3px solid ${farmaColors.primary}` : '2px solid #e0e0e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: farmaColors.primary,
                    bgcolor: farmaColors.alpha.primary10
                  }
                }}
                onClick={() => setFormat('compact')}
              >
                <FormControlLabel
                  value="compact"
                  control={<Radio />}
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Receipt color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Factura Compacta
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Solo datos esenciales y QR (estilo PIL/Estaciones)
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
            </Box>
          </RadioGroup>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Vista previa */}
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          p: 3, 
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          minHeight: 400,
          maxHeight: 500,
          overflow: 'auto'
        }}>
          {format === 'full' ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
                Vista previa - Factura Completa
              </Typography>
              <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'top' }}>
                <InvoiceFullPDF ref={fullInvoiceRef} invoiceData={invoiceData} />
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
                Vista previa - Factura Compacta
              </Typography>
              <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'top' }}>
                <InvoiceCompactPDF ref={compactInvoiceRef} invoiceData={invoiceData} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Información adicional */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Nota:</strong> Al hacer clic en "Imprimir", se abrirá automáticamente el diálogo de impresión. 
            La venta permanecerá visible en pantalla hasta que haga clic en "Nueva Venta".
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          disabled={printing}
          sx={{ px: 3 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={printing ? <CircularProgress size={20} color="inherit" /> : <Print />}
          disabled={printing}
          sx={{
            px: 3,
            bgcolor: farmaColors.primary,
            '&:hover': { bgcolor: farmaColors.primaryDark }
          }}
        >
          {printing ? 'Generando...' : 'Imprimir Factura'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintInvoiceModal;