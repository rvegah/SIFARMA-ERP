// src/modules/sales/components/MySalesModal.jsx
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
  IconButton,
  Typography,
  Box,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Close,
  Refresh,
  Visibility,
  Print,
  Search
} from '@mui/icons-material';
import SalesService from '../services/salesService';
import { farmaColors } from '../../../app/theme';
import { SALE_STATUS } from '../constants/salesConstants';

const MySalesModal = ({ open, onClose, onLoadSale, userId }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    numeroFactura: '',
    nitCliente: ''
  });

  useEffect(() => {
    if (open && userId) {
      loadSales();
    }
  }, [open, userId]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await SalesService.getUserSales(userId, filters);
      setSales(data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadSales();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SALE_STATUS.INVOICED:
        return 'success';
      case SALE_STATUS.SAVED:
        return 'warning';
      case SALE_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case SALE_STATUS.INVOICED:
        return 'Facturada';
      case SALE_STATUS.SAVED:
        return 'Guardada';
      case SALE_STATUS.CANCELLED:
        return 'Anulada';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '70vh' }
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
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Mis Ventas del Día
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Filtros */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: farmaColors.alpha.secondary10 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Fecha Desde"
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Fecha Hasta"
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Nº Factura"
                value={filters.numeroFactura}
                onChange={(e) => setFilters({ ...filters, numeroFactura: e.target.value })}
                placeholder="F-123456"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                sx={{ 
                  bgcolor: farmaColors.primary,
                  '&:hover': { bgcolor: farmaColors.primaryDark }
                }}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Ventas */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : sales.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron ventas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Intente ajustar los filtros de búsqueda
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nº Factura</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>NIT/CI</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow 
                    key={sale.id}
                    sx={{ 
                      '&:hover': { bgcolor: farmaColors.alpha.primary10 },
                      opacity: sale.status === SALE_STATUS.CANCELLED ? 0.6 : 1
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(sale.fechaCreacion || sale.fechaEmision)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {sale.numeroFactura || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sale.cliente?.nombre || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {sale.cliente?.nit || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.primary }}>
                        Bs. {sale.totales?.total.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(sale.status)}
                        size="small"
                        color={getStatusColor(sale.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              console.log('Ver venta:', sale);
                              // TODO: Abrir modal de detalles
                            }}
                            sx={{ color: farmaColors.secondary }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {sale.status === SALE_STATUS.INVOICED && (
                          <Tooltip title="Reimprimir">
                            <IconButton
                              size="small"
                              onClick={() => {
                                console.log('Reimprimir factura:', sale);
                                // TODO: Regenerar PDF
                              }}
                              sx={{ color: farmaColors.primary }}
                            >
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {sale.status !== SALE_STATUS.CANCELLED && (
                          <Tooltip title="Cargar venta">
                            <IconButton
                              size="small"
                              onClick={() => {
                                onLoadSale(sale);
                                onClose();
                              }}
                              sx={{ color: 'success.main' }}
                            >
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Resumen */}
        {!loading && sales.length > 0 && (
          <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: farmaColors.alpha.primary10 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Ventas
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {sales.filter(s => s.status === SALE_STATUS.INVOICED).length}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Guardadas
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {sales.filter(s => s.status === SALE_STATUS.SAVED).length}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Monto Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.primary }}>
                  Bs. {sales
                    .filter(s => s.status === SALE_STATUS.INVOICED)
                    .reduce((sum, s) => sum + (s.totales?.total || 0), 0)
                    .toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MySalesModal;