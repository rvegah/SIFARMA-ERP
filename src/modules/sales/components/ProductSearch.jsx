// src/modules/sales/components/ProductSearch.jsx
import React, { useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Search, Inventory } from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';

const ProductSearch = ({ 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  isSearching, 
  onSelectProduct 
}) => {
  const searchInputRef = useRef(null);

  // Auto-focus en el campo de búsqueda al cargar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Manejar tecla Enter para seleccionar producto
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && searchResults.length === 1) {
      onSelectProduct(searchResults[0]);
      onSearchChange(''); // Limpiar búsqueda
    }
  };

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      {/* Barra azul oscura con título */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${farmaColors.secondaryDark} 0%, ${farmaColors.secondary} 100%)`,
          px: 2,
          py: 1.5,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>
          Detalle Ventas
        </Typography>
        
        {/* Campo de búsqueda dentro de la barra */}
        <TextField
          fullWidth
          inputRef={searchInputRef}
          placeholder="Lector de Código de Barras"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: farmaColors.primary }} />
              </InputAdornment>
            ),
            endAdornment: isSearching && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontSize: '0.875rem',
              '&.Mui-focused fieldset': {
                borderColor: farmaColors.primary,
                borderWidth: 2
              }
            }
          }}
        />
      </Box>

      {/* Lista de resultados con scroll */}
      {searchQuery.length >= 2 && searchResults.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 350,
            overflow: 'auto',
            zIndex: 1000,
            border: `3px solid ${farmaColors.primary}`,
            borderRadius: 2,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: farmaColors.primary,
              borderRadius: '4px'
            }
          }}
        >
          <List sx={{ p: 0 }}>
            {searchResults.map((product) => (
              <ListItem
                key={product.id}
                button
                onClick={() => {
                  onSelectProduct(product);
                  onSearchChange(''); // Limpiar búsqueda
                }}
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  '&:hover': {
                    bgcolor: farmaColors.alpha.primary10
                  },
                  py: 2,
                  px: 2
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {/* Código del producto */}
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
                      {/* Nombre del producto */}
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {product.nombre}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {/* Línea y Presentación */}
                      <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                        {product.linea} | {product.presentacion}
                      </Typography>
                      
                      {/* Stock y Precio */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Chip
                          icon={<Inventory />}
                          label={`Stock: ${product.stock}`}
                          size="small"
                          color={product.stock > product.stockMinimo ? 'success' : 'error'}
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            fontWeight: 600
                          }}
                        />
                        <Chip
                          label={`P/U: Bs. ${product.precio.toFixed(2)}`}
                          size="small"
                          sx={{ 
                            bgcolor: farmaColors.secondary,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Mensaje cuando no hay resultados */}
      {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            p: 3,
            zIndex: 1000,
            textAlign: 'center',
            border: `2px solid ${farmaColors.alpha.secondary20}`
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            No se encontraron productos con "{searchQuery}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProductSearch;