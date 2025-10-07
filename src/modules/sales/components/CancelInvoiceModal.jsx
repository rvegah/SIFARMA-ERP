// src/modules/sales/components/CancelInvoiceModal.jsx
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
  Paper
} from '@mui/material';
import { Warning, Cancel as CancelIcon } from '@mui/icons-material';
import { CANCELLATION_REASONS } from '../constants/salesConstants';
import { farmaColors } from '../../../app/theme';

const CancelInvoiceModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  invoice,
  loading 
}) => {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (motivo) {
      onConfirm(motivo);
    }
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

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
        gap: 1
      }}>
        <Warning />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Anular Factura
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Esta acción NO se puede deshacer
          </Typography>
          <Typography variant="body2">
            La factura será anulada y el stock será restaurado automáticamente.
          </Typography>
        </Alert>

        {invoice && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: farmaColors.alpha.secondary10 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Información de la factura:
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Número:</strong> {invoice.numeroFactura || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Cliente:</strong> {invoice.cliente?.nombre || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Total:</strong> Bs. {invoice.totales?.total.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2">
                <strong>Items:</strong> {invoice.items?.length || 0} productos
              </Typography>
            </Box>
          </Paper>
        )}

        <FormControl fullWidth required>
          <InputLabel>Motivo de Anulación</InputLabel>
          <Select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            label="Motivo de Anulación"
            sx={{
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main'
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

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Esta anulación quedará registrada en el sistema 
            y será reportada a impuestos según normativa vigente.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderColor: farmaColors.secondary,
            color: farmaColors.secondary
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
            '&:hover': { bgcolor: 'error.dark' }
          }}
        >
          {loading ? 'Anulando...' : 'Confirmar Anulación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelInvoiceModal;