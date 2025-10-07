// src/modules/sales/components/SaleTotals.jsx
import React from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { AttachMoney, TrendingDown, Payment, CompareArrows } from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';
import { FACTURA_SIN_NOMBRE_LIMIT } from '../constants/salesConstants';

const SaleTotals = ({ totals, clientForm, onUpdatePayment, onUpdateDiscount }) => {
  const needsValidNIT = totals.total >= FACTURA_SIN_NOMBRE_LIMIT && clientForm.nit === '4444';

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: farmaColors.secondary, fontWeight: 600 }}>
        Resumen de Pago
      </Typography>

      <Grid container spacing={2}>
        {/* Descuento Adicional */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Descuento Adicional"
            value={clientForm.descuentoAdicional}
            onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0, step: 0.1 }}
            InputProps={{
              startAdornment: <TrendingDown sx={{ color: farmaColors.primary, mr: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: farmaColors.primary
              }
            }}
            helperText="Descuento adicional sobre el total"
          />
        </Grid>

        {/* Subtotal */}
        <Grid item xs={6}>
          <Box sx={{ p: 2, bgcolor: farmaColors.alpha.secondary10, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
              Bs. {totals.subtotal.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* Descuento */}
        <Grid item xs={6}>
          <Box sx={{ p: 2, bgcolor: farmaColors.alpha.primary10, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Descuento
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.primary }}>
              - Bs. {totals.descuentoAdicional.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Total */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: farmaColors.secondary,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              TOTAL A PAGAR
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
              Bs. {totals.total.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* Alerta si necesita NIT válido */}
        {needsValidNIT && (
          <Grid item xs={12}>
            <Alert severity="warning">
              Para ventas mayores a Bs. {FACTURA_SIN_NOMBRE_LIMIT} debe ingresar un NIT/CI válido
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Pagado */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Pagado"
            value={clientForm.pagado}
            onChange={(e) => onUpdatePayment(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0, step: 0.1 }}
            InputProps={{
              startAdornment: <Payment sx={{ color: farmaColors.secondary, mr: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: farmaColors.primary
              }
            }}
          />
        </Grid>

        {/* Cambio */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: totals.cambio > 0 ? farmaColors.alpha.primary20 : '#f5f5f5',
              borderRadius: 2,
              border: totals.cambio > 0 ? `2px solid ${farmaColors.primary}` : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CompareArrows sx={{ color: farmaColors.primary }} />
              <Typography variant="body2" color="text.secondary">
                Cambio
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: totals.cambio > 0 ? farmaColors.primary : 'text.secondary'
              }}
            >
              Bs. {totals.cambio.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* Advertencia sobre cambio */}
        {totals.pagado > 0 && totals.cambio > 0 && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<AttachMoney />}>
              <Typography variant="body2">
                <strong>Importante:</strong> Verificar el cambio entregado al cliente para evitar discrepancias.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default SaleTotals;