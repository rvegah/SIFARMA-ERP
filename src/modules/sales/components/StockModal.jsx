// src/modules/sales/components/StockModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Close,
  Store,
  SwapHoriz,
  Warning,
  CheckCircle,
  LocalShipping,
  Inventory,
  Phone,
  LocationOn,
  ArrowForward,
} from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';

// Mock de sucursales
const SUCURSALES = [
  { 
    id: 1, 
    nombre: 'BRASIL', 
    direccion: 'Av. Brasil #1234', 
    telefono: '4547053',
    responsable: 'María García',
    horario: '8:00 - 22:00'
  },
  { 
    id: 2, 
    nombre: 'SAN MARTIN', 
    direccion: 'Av. San Martin #808', 
    telefono: '4547052',
    responsable: 'Juan Pérez',
    horario: '8:00 - 22:00'
  },
  { 
    id: 3, 
    nombre: 'URUGUAY', 
    direccion: 'Calle Uruguay #567', 
    telefono: '4547054',
    responsable: 'Carlos López',
    horario: '8:00 - 22:00'
  },
  { 
    id: 4, 
    nombre: 'TIQUIPAYA', 
    direccion: 'Av. Ecológica #234', 
    telefono: '4547055',
    responsable: 'Ana Rodríguez',
    horario: '8:00 - 20:00'
  }
];

// Mock data de stock por sucursales
const MOCK_STOCK_DATA = {
  'IBUPROFENO 800 MG COMPR': [
    { sucursalId: 1, stock: 450, precio: 1.30, ubicacion: 'ESTANTE-B-05' },
    { sucursalId: 2, stock: 732, precio: 1.30, ubicacion: 'ESTANTE-A-12' },
    { sucursalId: 3, stock: 280, precio: 1.35, ubicacion: 'ESTANTE-A-08' },
    { sucursalId: 4, stock: 120, precio: 1.32, ubicacion: 'ESTANTE-C-03' }
  ],
  'MENTISAN LATA 15 GR': [
    { sucursalId: 1, stock: 850, precio: 9.00, ubicacion: 'ESTANTE-A-10' },
    { sucursalId: 2, stock: 1129, precio: 9.00, ubicacion: 'ESTANTE-B-03' },
    { sucursalId: 3, stock: 620, precio: 9.00, ubicacion: 'ESTANTE-C-07' },
    { sucursalId: 4, stock: 290, precio: 9.00, ubicacion: 'ESTANTE-D-04' }
  ]
};

const StockModal = ({ open, onClose, product = null, currentSucursalId = 1 }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockBySucursal, setStockBySucursal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para el traspaso
  const [transferMode, setTransferMode] = useState(false);
  const [transferData, setTransferData] = useState({
    fromSucursal: null,
    toSucursal: currentSucursalId,
    cantidad: 1,
    motivo: '',
    contactoOrigen: '',
    contactoDestino: '',
    tiempoEstimado: '30 minutos'
  });
  const [transferStep, setTransferStep] = useState(0);
  const [transferLoading, setTransferLoading] = useState(false);

  // Cargar datos cuando se abre el modal o cambia el producto
  useEffect(() => {
    if (open && (product || searchQuery)) {
      loadStockData();
    }
  }, [open, product, searchQuery]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar producto mock o el buscado
      const productName = product?.nombre || searchQuery || 'IBUPROFENO 800 MG COMPR';
      const stockData = MOCK_STOCK_DATA[productName] || MOCK_STOCK_DATA['IBUPROFENO 800 MG COMPR'];
      
      // Combinar datos de stock con información de sucursales
      const enrichedData = stockData.map(stock => {
        const sucursal = SUCURSALES.find(s => s.id === stock.sucursalId);
        return {
          ...stock,
          ...sucursal,
          isCurrentSucursal: stock.sucursalId === currentSucursalId
        };
      });
      
      setStockBySucursal(enrichedData);
      setSelectedProduct({ nombre: productName });
    } catch (error) {
      console.error('Error cargando stock:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar proceso de traspaso
  const handleStartTransfer = (fromSucursal) => {
    if (fromSucursal.stock === 0) {
      alert('No hay stock disponible en esta sucursal');
      return;
    }
    
    setTransferData({
      ...transferData,
      fromSucursal: fromSucursal,
      toSucursal: currentSucursalId,
      maxCantidad: fromSucursal.stock
    });
    setTransferMode(true);
    setTransferStep(0);
  };

  // Procesar el traspaso
  const handleConfirmTransfer = async () => {
    setTransferLoading(true);
    
    try {
      // Simular proceso de traspaso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada al API para registrar el traspaso
      console.log('🔄 Traspaso registrado:', {
        producto: selectedProduct.nombre,
        desde: transferData.fromSucursal.nombre,
        hacia: SUCURSALES.find(s => s.id === transferData.toSucursal)?.nombre,
        cantidad: transferData.cantidad,
        motivo: transferData.motivo,
        solicitante: 'Usuario Actual',
        fecha: new Date().toISOString()
      });
      
      // Actualizar stock localmente (mock)
      const updatedStock = stockBySucursal.map(stock => {
        if (stock.sucursalId === transferData.fromSucursal.sucursalId) {
          return { ...stock, stock: stock.stock - transferData.cantidad };
        }
        if (stock.sucursalId === transferData.toSucursal) {
          return { ...stock, stock: stock.stock + transferData.cantidad };
        }
        return stock;
      });
      
      setStockBySucursal(updatedStock);
      
      // Mostrar éxito
      alert(`✅ Traspaso autorizado!\n\nSe traspadarán ${transferData.cantidad} unidades de ${selectedProduct.nombre}\nDesde: ${transferData.fromSucursal.nombre}\nHacia: ${SUCURSALES.find(s => s.id === transferData.toSucursal)?.nombre}\n\n⏱️ Tiempo estimado: ${transferData.tiempoEstimado}\n\n📞 El responsable de ${transferData.fromSucursal.nombre} ha sido notificado.`);
      
      // Resetear
      setTransferMode(false);
      setTransferData({
        fromSucursal: null,
        toSucursal: currentSucursalId,
        cantidad: 1,
        motivo: '',
        contactoOrigen: '',
        contactoDestino: '',
        tiempoEstimado: '30 minutos'
      });
      setTransferStep(0);
      
    } catch (error) {
      console.error('Error en traspaso:', error);
      alert('❌ Error al procesar el traspaso. Intente nuevamente.');
    } finally {
      setTransferLoading(false);
    }
  };

  // Calcular totales
  const totalStock = stockBySucursal.reduce((sum, item) => sum + item.stock, 0);
  const stockLocal = stockBySucursal.find(s => s.isCurrentSucursal)?.stock || 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: '70vh'
        }
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
          <Store />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Stock en Sucursales
          </Typography>
          {selectedProduct && (
            <Chip 
              label={selectedProduct.nombre}
              sx={{ 
                bgcolor: 'white', 
                color: farmaColors.secondary,
                fontWeight: 600,
                ml: 2
              }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Modo normal - Ver stock */}
        {!transferMode ? (
          <>
            {/* Barra de búsqueda */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadStockData();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button 
                      onClick={loadStockData}
                      variant="contained"
                      sx={{ 
                        bgcolor: farmaColors.primary,
                        ml: 1
                      }}
                    >
                      Buscar
                    </Button>
                  )
                }}
              />
            </Box>

            {/* Resumen de stock */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: farmaColors.alpha.primary10 }}>
                  <Typography variant="caption" color="text.secondary">
                    Stock Total (Todas las sucursales)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: farmaColors.primary }}>
                    {totalStock}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="caption" color="text.secondary">
                    Stock Local (Tu sucursal)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {stockLocal}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="caption" color="text.secondary">
                    Disponible en otras sucursales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {totalStock - stockLocal}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabla de stock por sucursal */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                      <TableCell sx={{ fontWeight: 600 }}>Sucursal</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Stock</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Precio</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockBySucursal.map((item) => (
                      <TableRow 
                        key={item.sucursalId}
                        sx={{ 
                          bgcolor: item.isCurrentSucursal ? farmaColors.alpha.primary10 : 'white',
                          '&:hover': { bgcolor: farmaColors.alpha.primary10 }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {item.nombre}
                            </Typography>
                            {item.isCurrentSucursal && (
                              <Chip 
                                label="TU SUCURSAL" 
                                size="small" 
                                color="primary"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.direccion}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700,
                              color: item.stock === 0 ? '#f44336' : 
                                     item.stock < 10 ? '#ff9800' : '#4caf50'
                            }}
                          >
                            {item.stock}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            Bs. {item.precio.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.ubicacion} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.responsable}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {item.telefono}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {!item.isCurrentSucursal && item.stock > 0 && (
                            <Tooltip title="Solicitar traspaso de esta sucursal">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<SwapHoriz />}
                                onClick={() => handleStartTransfer(item)}
                                sx={{
                                  bgcolor: farmaColors.primary,
                                  '&:hover': { bgcolor: farmaColors.primaryDark }
                                }}
                              >
                                Traspasar
                              </Button>
                            </Tooltip>
                          )}
                          {item.isCurrentSucursal && (
                            <Chip 
                              label="LOCAL" 
                              color="success" 
                              size="small"
                            />
                          )}
                          {!item.isCurrentSucursal && item.stock === 0 && (
                            <Chip 
                              label="SIN STOCK" 
                              color="error" 
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Advertencia sobre traspasos */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Nota importante:</strong> Los traspasos entre sucursales deben ser coordinados físicamente. 
                El sistema registrará el movimiento pero es responsabilidad del personal realizar el traslado real del producto.
              </Typography>
            </Alert>
          </>
        ) : (
          /* Modo traspaso - Formulario paso a paso */
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Solicitud de Traspaso de Producto
            </Typography>

            <Stepper activeStep={transferStep} sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Detalles del Traspaso</StepLabel>
              </Step>
              <Step>
                <StepLabel>Coordinación</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirmación</StepLabel>
              </Step>
            </Stepper>

            {/* Step 1: Detalles */}
            {transferStep === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: '#ffebee' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#d32f2f' }}>
                        ORIGEN (Desde)
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {transferData.fromSucursal?.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transferData.fromSucursal?.direccion}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                        <Chip 
                          icon={<Inventory />}
                          label={`Stock: ${transferData.fromSucursal?.stock}`}
                          color="error"
                          size="small"
                        />
                        <Chip 
                          icon={<Phone />}
                          label={transferData.fromSucursal?.telefono}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#388e3c' }}>
                        DESTINO (Hacia)
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={transferData.toSucursal}
                          onChange={(e) => setTransferData({...transferData, toSucursal: e.target.value})}
                        >
                          {SUCURSALES.map(suc => (
                            <MenuItem key={suc.id} value={suc.id}>
                              {suc.nombre} {suc.id === currentSucursalId && '(Tu sucursal)'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {SUCURSALES.find(s => s.id === transferData.toSucursal)?.direccion}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    label="Cantidad a traspasar"
                    type="number"
                    fullWidth
                    value={transferData.cantidad}
                    onChange={(e) => setTransferData({
                      ...transferData, 
                      cantidad: Math.min(e.target.value, transferData.maxCantidad)
                    })}
                    InputProps={{
                      inputProps: { 
                        min: 1, 
                        max: transferData.maxCantidad 
                      }
                    }}
                    helperText={`Máximo disponible: ${transferData.maxCantidad} unidades`}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Motivo del traspaso"
                    fullWidth
                    multiline
                    rows={3}
                    value={transferData.motivo}
                    onChange={(e) => setTransferData({...transferData, motivo: e.target.value})}
                    placeholder="Ej: Cliente esperando, stock agotado en sucursal local..."
                    required
                  />
                </Box>
              </Box>
            )}

            {/* Step 2: Coordinación */}
            {transferStep === 1 && (
              <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Es obligatorio coordinar con el responsable de la sucursal origen antes de confirmar el traspaso.
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Persona que recogerá el producto"
                      fullWidth
                      value={transferData.contactoDestino}
                      onChange={(e) => setTransferData({...transferData, contactoDestino: e.target.value})}
                      placeholder="Nombre del encargado"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Tiempo estimado de traslado"
                      fullWidth
                      select
                      value={transferData.tiempoEstimado}
                      onChange={(e) => setTransferData({...transferData, tiempoEstimado: e.target.value})}
                    >
                      <MenuItem value="15 minutos">15 minutos</MenuItem>
                      <MenuItem value="30 minutos">30 minutos</MenuItem>
                      <MenuItem value="1 hora">1 hora</MenuItem>
                      <MenuItem value="2 horas">2 horas</MenuItem>
                      <MenuItem value="Mismo día">Mismo día</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    📞 Contactar a:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">
                      <strong>{transferData.fromSucursal?.responsable}</strong>
                    </Typography>
                    <Chip 
                      icon={<Phone />}
                      label={transferData.fromSucursal?.telefono}
                      color="warning"
                      onClick={() => alert(`Llamar a: ${transferData.fromSucursal?.telefono}`)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Horario: {transferData.fromSucursal?.horario}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Step 3: Confirmación */}
            {transferStep === 2 && (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Por favor, revise los detalles del traspaso antes de confirmar.
                  </Typography>
                </Alert>

                <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Resumen del Traspaso
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Producto:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedProduct?.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Cantidad:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: farmaColors.primary }}>
                        {transferData.cantidad} unidades
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Desde:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {transferData.fromSucursal?.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Hacia:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {SUCURSALES.find(s => s.id === transferData.toSucursal)?.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Motivo:</Typography>
                      <Typography variant="body2">
                        {transferData.motivo}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Responsable de recoger:</Typography>
                      <Typography variant="body2">
                        {transferData.contactoDestino}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Tiempo estimado:</Typography>
                      <Typography variant="body2">
                        {transferData.tiempoEstimado}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="error" icon={<Warning />}>
                    <Typography variant="body2">
                      <strong>IMPORTANTE:</strong> Al confirmar, usted se compromete a:
                    </Typography>
                    <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                      <li>Recoger físicamente el producto en la sucursal origen</li>
                      <li>Transportarlo a la sucursal destino en el tiempo indicado</li>
                      <li>Actualizar el sistema una vez completado el traslado</li>
                    </ul>
                  </Alert>
                </Paper>
              </Box>
            )}

            {/* Botones de navegación */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (transferStep === 0) {
                    setTransferMode(false);
                  } else {
                    setTransferStep(transferStep - 1);
                  }
                }}
              >
                {transferStep === 0 ? 'Cancelar' : 'Anterior'}
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {transferStep < 2 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => {
                      // Validaciones por paso
                      if (transferStep === 0) {
                        if (!transferData.motivo) {
                          alert('Por favor ingrese el motivo del traspaso');
                          return;
                        }
                      }
                      if (transferStep === 1) {
                        if (!transferData.contactoDestino) {
                          alert('Por favor ingrese quién recogerá el producto');
                          return;
                        }
                      }
                      setTransferStep(transferStep + 1);
                    }}
                    sx={{
                      bgcolor: farmaColors.primary,
                      '&:hover': { bgcolor: farmaColors.primaryDark }
                    }}
                  >
                    Siguiente
                  </Button>
                )}
                
                {transferStep === 2 && (
                  <Button
                    variant="contained"
                    startIcon={transferLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    onClick={handleConfirmTransfer}
                    disabled={transferLoading}
                    sx={{
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' }
                    }}
                  >
                    {transferLoading ? 'Procesando...' : 'Confirmar Traspaso'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined" sx={{ px: 3 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockModal;