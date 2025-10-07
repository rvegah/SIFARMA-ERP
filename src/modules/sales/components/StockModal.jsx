// src/modules/sales/components/StockModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';
import SalesService from '../services/salesService';

const StockModal = ({ open, onClose, product }) => {
  const [stockBySucursal, setStockBySucursal] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && product) {
      loadStock();
    }
  }, [open, product]);

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await SalesService.getStockBySucursal(product.id);
      setStockBySucursal(data);
    } catch (error) {
      console.error('Error cargando stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${farmaColors.secondary} 0%, ${farmaColors.secondaryLight} 100%)`,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h6">Stock por Sucursal</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {product.nombre}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Stock</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P/U</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P/C</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : stockBySucursal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay información de stock
                  </TableCell>
                </TableRow>
              ) : (
                stockBySucursal.map((item, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.sucursal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.stock}
                        size="small"
                        sx={{
                          backgroundColor: item.stock > 0 ? '#4caf50' : '#f44336',
                          color: 'white',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{item.precioUnitario.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{item.precioCaja?.toFixed(2) || '0.00'}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Información del producto */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Información del Producto
          </Typography>
          <Typography variant="body2">
            <strong>Código:</strong> {product.codigo}
          </Typography>
          <Typography variant="body2">
            <strong>Nombre:</strong> {product.nombre}
          </Typography>
          {product.presentacion && (
            <Typography variant="body2">
              <strong>Presentación:</strong> {product.presentacion}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: farmaColors.secondary }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockModal;