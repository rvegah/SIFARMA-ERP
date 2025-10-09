import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup,
  TablePagination,
  Alert
} from '@mui/material';
import {
  Search,
  Close,
  Inventory,
  Add,
  LocalPharmacy,
  Science,
  Category,
  AttachMoney,
  Warning
} from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';

// Mock data para productos de farmacia
const MOCK_PRODUCTS = [
  {
    id: 1,
    codigo: '4020',
    nombre: 'IBUPROFENO 800 MG COMPR',
    presentacion: 'CAJA X 100',
    linea: 'COFAR',
    laboratorio: 'COFAR',
    stock: 732,
    stockMinimo: 50,
    precio: 1.30,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 2,
    codigo: '4133',
    nombre: 'IBUSEC 800 MG COMPR (IBUPROFENO 800 MG COMPR)',
    presentacion: 'CAJA X 100',
    linea: 'DR MEDINAT',
    laboratorio: 'UNICURE',
    stock: 692,
    stockMinimo: 50,
    precio: 1.30,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 3,
    codigo: '4005',
    nombre: 'IBUFEN 800 MG COMPR (IBUPROFENO 800 MG COMPR)',
    presentacion: 'CAJA X 100',
    linea: 'FABRO',
    laboratorio: 'FABRO',
    stock: 523,
    stockMinimo: 50,
    precio: 1.10,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 4,
    codigo: '4039',
    nombre: 'IBUSEC 600 COMPR (IBUPROFENO 600 MG COMPR)',
    presentacion: 'CAJA X 100',
    linea: 'DR MEDINAT',
    laboratorio: 'UNICURE',
    stock: 482,
    stockMinimo: 50,
    precio: 1.05,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 5,
    codigo: '4026',
    nombre: 'IBUPROFENO 800 MG COMPR',
    presentacion: 'CAJA X 100',
    linea: 'SANAT',
    laboratorio: 'SANAT',
    stock: 351,
    stockMinimo: 50,
    precio: 1.11,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 6,
    codigo: '5108',
    nombre: 'IBUPROFENO 800 MG COMPR',
    presentacion: 'CAJA X 100',
    linea: 'SAE',
    laboratorio: 'CHILE VERDE',
    stock: 338,
    stockMinimo: 50,
    precio: 1.10,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 7,
    codigo: '3108',
    nombre: 'IBUPROFENO 800 MG COMPR',
    presentacion: 'CAJA X 50',
    linea: 'DELTA',
    laboratorio: 'DELTA',
    stock: 328,
    stockMinimo: 50,
    precio: 1.20,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 8,
    codigo: '4819',
    nombre: 'IBUFLAMAR P COMPR (PARACETAMOL IBUPROFENO)',
    presentacion: 'CAJA X 100',
    linea: 'SAN FERNANDO',
    laboratorio: 'SAN FERNANDO',
    stock: 273,
    stockMinimo: 50,
    precio: 2.00,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 9,
    codigo: '5560',
    nombre: 'RETINOX 500 MG (ACIDO TRANEXAMICO 500 MG)',
    presentacion: 'CAJA X 30',
    linea: 'INTI RAYMI',
    laboratorio: 'COFAR',
    stock: 150,
    stockMinimo: 20,
    precio: 15.40,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 10,
    codigo: '6615',
    nombre: 'OFTAFILM SP COLIRIO',
    presentacion: 'CAJA X 1',
    linea: 'OFTALMOLOGIA',
    laboratorio: 'SOPHIA',
    stock: 45,
    stockMinimo: 10,
    precio: 215.00,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 11,
    codigo: '7420',
    nombre: 'DEROVIT 7000 UI CAPS (VITAMINA D3 7000 UI CAPS)',
    presentacion: 'CAJA X 30',
    linea: 'VITAMINAS',
    laboratorio: 'BAGÓ',
    stock: 89,
    stockMinimo: 15,
    precio: 15.00,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 12,
    codigo: '6374',
    nombre: 'PARACETAMOL 500 MG COMPR',
    presentacion: 'CAJA X 1000',
    linea: 'GENERICO',
    laboratorio: 'NACIONAL',
    stock: 2500,
    stockMinimo: 200,
    precio: 0.30,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 13,
    codigo: '7714',
    nombre: 'RUX 5 MG COMPR (ROSUVASTATINA 5 MG COMPR)',
    presentacion: 'CAJA X 30',
    linea: 'CARDIOVASCULAR',
    laboratorio: 'ROUX',
    stock: 67,
    stockMinimo: 20,
    precio: 14.90,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 14,
    codigo: '7041',
    nombre: 'ROYDIL CREMA',
    presentacion: 'TUBO X 30G',
    linea: 'DERMATOLOGIA',
    laboratorio: 'ROYAL',
    stock: 23,
    stockMinimo: 10,
    precio: 122.00,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 15,
    codigo: '4124',
    nombre: 'SANCOR BEBE ADVANCED 2 LIQUIDO 200 ML',
    presentacion: 'BOTELLA X 200ML',
    linea: 'NUTRICION',
    laboratorio: 'SANCOR',
    stock: 156,
    stockMinimo: 30,
    precio: 25.00,
    sucursal: 'SAN MARTIN'
  },
  // Productos con stock bajo para mostrar alertas
  {
    id: 16,
    codigo: '8001',
    nombre: 'AMOXICILINA 500 MG CAPS',
    presentacion: 'CAJA X 100',
    linea: 'ANTIBIOTICOS',
    laboratorio: 'BETA',
    stock: 5,
    stockMinimo: 50,
    precio: 8.50,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 17,
    codigo: '8002',
    nombre: 'ASPIRINA 100 MG COMPR',
    presentacion: 'CAJA X 100',
    linea: 'CARDIOVASCULAR',
    laboratorio: 'BAYER',
    stock: 0,
    stockMinimo: 30,
    precio: 12.30,
    sucursal: 'SAN MARTIN'
  }
  ,
  {
    id: 18,
    codigo: '9001',
    nombre: 'METAMIZOL 500 MG COMPR',
    presentacion: 'CAJA X 100',
    linea: 'ANALGESICOS',
    laboratorio: 'GENFAR',
    stock: 445,
    stockMinimo: 50,
    precio: 0.85,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 19,
    codigo: '9002',
    nombre: 'DICLOFENACO 75 MG/3ML INY',
    presentacion: 'CAJA X 100 AMP',
    linea: 'ANTIINFLAMATORIOS',
    laboratorio: 'PHARMA',
    stock: 234,
    stockMinimo: 30,
    precio: 2.50,
    sucursal: 'SAN MARTIN'
  },
  {
    id: 20,
    codigo: '9003',
    nombre: 'LOSARTAN 50 MG COMPR',
    presentacion: 'CAJA X 30',
    linea: 'CARDIOVASCULAR',
    laboratorio: 'TEVA',
    stock: 167,
    stockMinimo: 25,
    precio: 18.75,
    sucursal: 'SAN MARTIN'
  }
];

const ProductsModal = ({ open, onClose, onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('normal');
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const searchInputRef = useRef(null);

  // Auto-focus en el campo de búsqueda
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(MOCK_PRODUCTS);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = MOCK_PRODUCTS.filter(product => {
      if (searchType === 'normal') {
        return (
          product.nombre.toLowerCase().includes(query) ||
          product.codigo.toLowerCase().includes(query) ||
          product.linea.toLowerCase().includes(query) ||
          product.laboratorio.toLowerCase().includes(query) ||
          product.presentacion.toLowerCase().includes(query)
        );
      } else {
        // Búsqueda con 2 palabras
        const words = query.split(' ').filter(word => word.length > 0);
        if (words.length < 2) return false;
        
        return words.every(word =>
          product.nombre.toLowerCase().includes(word) ||
          product.codigo.toLowerCase().includes(word) ||
          product.linea.toLowerCase().includes(word) ||
          product.laboratorio.toLowerCase().includes(word)
        );
      }
    });

    setFilteredProducts(filtered);
    setPage(0);
  }, [searchQuery, searchType]);

  const handleSelectProduct = (product) => {
    if (product.stock === 0) {
      // Mostrar confirmación para productos sin stock
      const confirm = window.confirm(
        `⚠️ PRODUCTO SIN STOCK\n\n${product.nombre}\n\n¿Desea agregarlo de todas formas?\n(Podrá verificar en otras sucursales)`
      );
      if (!confirm) return;
    }
    
    onSelectProduct(product);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setPage(0);
    onClose();
  };

  // Cálculo de productos paginados
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${farmaColors.secondaryDark} 0%, ${farmaColors.secondary} 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalPharmacy fontSize="large" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Búsqueda de Productos
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Sección de búsqueda */}
        <Paper elevation={0} sx={{ p: 3, borderBottom: `3px solid ${farmaColors.primary}` }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              inputRef={searchInputRef}
              placeholder="Buscar por código, nombre, línea o laboratorio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: farmaColors.primary, fontSize: 24 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  '&.Mui-focused fieldset': {
                    borderColor: farmaColors.primary,
                    borderWidth: 2
                  }
                }
              }}
            />
          </Box>

          {/* Tipos de búsqueda */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Tipos de búsqueda:
            </Typography>
            <RadioGroup
              row
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <FormControlLabel
                value="normal"
                control={<Radio size="small" />}
                label="Búsqueda Normal"
                sx={{ mr: 3 }}
              />
              <FormControlLabel
                value="twoWords"
                control={<Radio size="small" />}
                label="Búsqueda con 2 palabras"
              />
            </RadioGroup>
          </Box>

          {/* Estadísticas de búsqueda */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              label={`${filteredProducts.length} productos encontrados`}
              icon={<Inventory />}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            {searchQuery && (
              <Typography variant="body2" color="text.secondary">
                Búsqueda: "{searchQuery}"
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Tabla de productos */}
        <TableContainer sx={{ maxHeight: 'calc(90vh - 300px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 100 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Category fontSize="small" />
                    Cód
                  </Box>
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 80 }}>
                  Item
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 350 }}>
                  Nombre Genérico/Forma Farmacéutica
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 150 }}>
                  Presentación
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Category fontSize="small" />
                    Línea
                  </Box>
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Science fontSize="small" />
                    Laboratorio
                  </Box>
                </TableCell>
                <TableCell sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 100 }}>
                  Sucursal
                </TableCell>
                <TableCell align="center" sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 80 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                    <Inventory fontSize="small" />
                    Stock
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 100 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    <AttachMoney fontSize="small" />
                    P/U
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ bgcolor: '#2c2c2c', color: 'white', fontWeight: 700, minWidth: 100 }}>
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product, index) => {
                const isLowStock = product.stock <= product.stockMinimo;
                const isOutOfStock = product.stock === 0;
                
                return (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': { bgcolor: farmaColors.alpha.primary10 },
                      bgcolor: isOutOfStock ? 'rgba(244, 67, 54, 0.05)' : 
                              isLowStock ? 'rgba(255, 152, 0, 0.05)' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {/* Código */}
                    <TableCell>
                      <Chip
                        label={product.codigo}
                        size="small"
                        sx={{
                          bgcolor: farmaColors.primary,
                          color: 'white',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>

                    {/* Item (índice) */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>

                    {/* Nombre */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {product.nombre}
                        </Typography>
                        {(isOutOfStock || isLowStock) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Warning 
                              fontSize="small" 
                              color={isOutOfStock ? 'error' : 'warning'} 
                            />
                            <Typography 
                              variant="caption" 
                              color={isOutOfStock ? 'error' : 'warning.main'}
                              sx={{ fontWeight: 600 }}
                            >
                              {isOutOfStock ? 'SIN STOCK' : 'STOCK BAJO'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    {/* Presentación */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {product.presentacion}
                      </Typography>
                    </TableCell>

                    {/* Línea */}
                    <TableCell>
                      <Chip
                        label={product.linea}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    {/* Laboratorio */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {product.laboratorio}
                      </Typography>
                    </TableCell>

                    {/* Sucursal */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {product.sucursal}
                      </Typography>
                    </TableCell>

                    {/* Stock */}
                    <TableCell align="center">
                      <Chip
                        label={product.stock}
                        size="small"
                        sx={{
                          bgcolor: isOutOfStock ? '#f44336' : 
                                  isLowStock ? '#ff9800' : '#4caf50',
                          color: 'white',
                          fontWeight: 700,
                          minWidth: 50
                        }}
                      />
                    </TableCell>

                    {/* Precio */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                        {product.precio.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Acción */}
                    <TableCell align="center">
                      <Tooltip title="Agregar a la venta">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                          sx={{
                            bgcolor: farmaColors.primary,
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: farmaColors.primaryDark }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Mensaje cuando no hay resultados */}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Search sx={{ fontSize: 60, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary">
                        No se encontraron productos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 
                          `No hay resultados para "${searchQuery}"` : 
                          'Ingrese un término de búsqueda'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {filteredProducts.length > 0 && (
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Productos por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count}`
            }
            sx={{
              borderTop: `2px solid ${farmaColors.alpha.primary20}`,
              '& .MuiTablePagination-toolbar': {
                minHeight: 52
              }
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', gap: 2 }}>
        <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
          <Typography variant="body2">
            💡 <strong>Tip:</strong> Haga clic en cualquier producto para agregarlo a la venta. 
            Use búsqueda con 2 palabras para resultados más específicos.
          </Typography>
        </Alert>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: farmaColors.secondary,
            color: farmaColors.secondary,
            fontWeight: 600,
            px: 3
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductsModal;