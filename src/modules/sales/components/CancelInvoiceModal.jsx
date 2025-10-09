import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { Warning, Cancel as CancelIcon, Receipt, Person, AttachMoney } from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';

// Constantes para motivos de anulación según normativa boliviana
const CANCELLATION_REASONS = [
  { value: 'FACTURA_MAL_EMITIDA', label: '(1) FACTURA MAL EMITIDA' },
  { value: 'NOTA_CREDITO_DEBITO_MAL_EMITIDA', label: '(2) NOTA DE CRÉDITO-DÉBITO MAL EMITIDA' },
  { value: 'DATOS_EMISION_INCORRECTOS', label: '(3) DATOS DE EMISIÓN INCORRECTOS' },
  { value: 'FACTURA_NOTA_DEVUELTA', label: '(4) FACTURA O NOTA DE CRÉDITO-DÉBITO DEVUELTA' }
];

const CancelInvoiceModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  invoice,
  loading 
}) => {
  const [motivo, setMotivo] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = () => {
    if (motivo) {
      setShowConfirmation(true);
    }
  };

  const handleFinalConfirm = () => {
    onConfirm(motivo);
    handleClose();
  };

  const handleClose = () => {
    setMotivo('');
    setShowConfirmation(false);
    onClose();
  };

  const selectedReason = CANCELLATION_REASONS.find(r => r.value === motivo);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'error.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pb: 2
      }}>
        <Warning fontSize="large" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Anular Factura
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Esta acción requiere autorización y será reportada a impuestos
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pb: 2 }}>
        {!showConfirmation ? (
          <>
            {/* Alerta principal */}
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                ⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER
              </Typography>
              <Typography variant="body2">
                La factura será anulada permanentemente y el stock será restaurado automáticamente.
                Esta anulación quedará registrada en el sistema y será reportada a impuestos.
              </Typography>
            </Alert>

            {/* Información de la factura */}
            {invoice && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: farmaColors.alpha.secondary10, border: `2px solid ${farmaColors.secondary}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Receipt color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                    Información de la Factura
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Número de Factura:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {invoice.numeroFactura || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Fecha de Emisión:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {invoice.fechaEmision ? new Date(invoice.fechaEmision).toLocaleDateString('es-BO') : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Cliente:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" color="primary" />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {invoice.cliente?.nombre || 'SIN NOMBRE'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      NIT/CI: {invoice.cliente?.nit || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Total Facturado:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney fontSize="small" color="success" />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        Bs. {invoice.totales?.total?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    Productos ({invoice.items?.length || 0} items):
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                    {invoice.items?.map((item, index) => (
                      <Chip
                        key={index}
                        label={`${item.cantidad}x ${item.nombre} - Bs. ${item.subtotal?.toFixed(2)}`}
                        size="small"
                        variant="outlined"
                        sx={{ m: 0.25, fontSize: '0.7rem' }}
                      />
                    )) || <Typography variant="body2" color="text.secondary">No hay items</Typography>}
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Selector de motivo */}
            <FormControl fullWidth required>
              <InputLabel sx={{ fontWeight: 600 }}>Motivo de Anulación</InputLabel>
              <Select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                label="Motivo de Anulación"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'error.main',
                    borderWidth: 2
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un motivo</em>
                </MenuItem>
                {CANCELLATION_REASONS.map((reason) => (
                  <MenuItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Información legal */}
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                📋 NORMATIVA TRIBUTARIA:
              </Typography>
              <Typography variant="body2">
                Esta anulación será registrada automáticamente en el sistema tributario (SIAT) 
                y será incluida en los reportes mensuales a Impuestos Nacionales según normativa vigente.
              </Typography>
            </Alert>
          </>
        ) : (
          /* Pantalla de confirmación final */
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Warning sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mb: 2 }}>
              CONFIRMACIÓN FINAL
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                Está a punto de anular permanentemente:
              </Typography>
              <Typography variant="body2">
                • Factura Nº: <strong>{invoice?.numeroFactura}</strong><br />
                • Cliente: <strong>{invoice?.cliente?.nombre || 'SIN NOMBRE'}</strong><br />
                • Total: <strong>Bs. {invoice?.totales?.total?.toFixed(2)}</strong><br />
                • Motivo: <strong>{selectedReason?.label}</strong>
              </Typography>
            </Alert>
            
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 3 }}>
              ¿Está completamente seguro de continuar con la anulación?
            </Typography>
            
            <Box sx={{ bgcolor: '#fff3cd', p: 2, borderRadius: 2, border: '2px solid #ffc107' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
                💡 Recuerde: Una vez confirmada, esta acción no se puede revertir
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, bgcolor: '#f8f9fa' }}>
        {!showConfirmation ? (
          <>
            <Button 
              onClick={handleClose}
              variant="outlined"
              disabled={loading}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                fontWeight: 600,
                px: 3
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={!motivo || loading}
              startIcon={<CancelIcon />}
              sx={{
                bgcolor: 'error.main',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: 'error.dark' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {loading ? 'Procesando...' : 'Continuar con Anulación'}
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => setShowConfirmation(false)}
              variant="outlined"
              disabled={loading}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                fontWeight: 600,
                px: 3
              }}
            >
              ← Volver
            </Button>
            <Button
              onClick={handleFinalConfirm}
              variant="contained"
              disabled={loading}
              startIcon={<CancelIcon />}
              sx={{
                bgcolor: 'error.main',
                fontWeight: 700,
                px: 4,
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              {loading ? 'Anulando Factura...' : '🗸 CONFIRMAR ANULACIÓN'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CancelInvoiceModal;