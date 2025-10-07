// src/modules/sales/components/StockBySucursalModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import { Close, Store } from '@mui/icons-material';
import SalesService from '../services/salesService';
import { farmaColors } from '../../../app/theme';

const StockBySucursalModal = ({ open, onClose, productId }) => {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    if (open && productId) {
      loadStockData();
    }
  }, [open, productId]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const data = await SalesService.getStockBySucursal(productId);
      setStockData(data);
    } catch (error) {
      console.error('Error cargando stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: farmaColors.secondary,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store />
          <Typography variant="h6">Stock por Sucursal</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: farmaColors.alpha.primary10 }}>
                  <TableCell sx={{ fontWeight: 600 }}>Sucursal</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Stock</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.sucursal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.stock}
                        size="small"
                        color={row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'error'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: farmaColors.primary, fontWeight: 600 }}>
                        Bs. {row.precio.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockBySucursalModal;