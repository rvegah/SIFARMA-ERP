// src/modules/sales/pages/SalesPage.jsx
import React, { useState } from 'react';
import { Container, Box, Button, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { 
  Add, 
  Save, 
  Print, 
  Inventory, 
  History,
  Store,
  Cancel,
  CloudOff,
  PersonAdd,
  Search
} from '@mui/icons-material';
import { farmaColors } from '../../../app/theme';
import { useSales } from '../hooks/useSales';
import ClientForm from '../components/ClientForm';
import SaleItemsTable from '../components/SaleItemsTable';
import StockModal from '../components/StockModal';
import MySalesModal from '../components/MySalesModal';

const SalesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const {
    clientForm,
    saleItems,
    searchResults,
    isSearching,
    loading,
    setClientForm,
    searchProducts,
    handleClientSearch,
    addItem,
    updateItem,
    removeItem,
    calculateTotals,
    saveSale,
    invoiceSale,
    clearForm,
  } = useSales();

  const totals = React.useMemo(() => calculateTotals(), [saleItems, clientForm]);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mySalesModalOpen, setMySalesModalOpen] = useState(false);

  // Ver stock en sucursales
  const handleViewStock = () => {
    setStockModalOpen(true);
  };

  // Guardar venta sin facturar (< 5 Bs)
  const handleSaveSale = async () => {
    if (totals.total >= 5) {
      enqueueSnackbar('Esta opción es solo para ventas menores a 5 Bs.', { variant: 'warning' });
      return;
    }

    const result = await saveSale();
    if (result.success) {
      enqueueSnackbar(result.message, { variant: 'success' });
      clearForm();
    } else {
      enqueueSnackbar(result.message, { variant: 'error' });
    }
  };

  // Imprimir factura
  const handlePrintInvoice = async () => {
    // Validar NIT para ventas >= 1000 Bs
    if (totals.total >= 1000 && clientForm.nit === '4444') {
      enqueueSnackbar('Para ventas mayores a 1000 Bs. debe ingresar un NIT/CI válido', { 
        variant: 'error' 
      });
      return;
    }

    const result = await invoiceSale();
    if (result.success) {
      enqueueSnackbar('Factura generada. Verifique la entrega de productos al cliente.', { 
        variant: 'success',
        autoHideDuration: 5000
      });
      // NO limpiar formulario - vendedora debe verificar entrega
    } else {
      enqueueSnackbar(result.message, { variant: 'error' });
    }
  };

  // Nueva venta
  const handleNewSale = () => {
    clearForm();
    enqueueSnackbar('Listo para nueva venta', { variant: 'info' });
  };

  // Cargar venta desde historial
  const handleLoadSale = (sale) => {
    setClientForm({
      nit: sale.cliente.nit,
      nombre: sale.cliente.nombre,
      tipoDocumento: sale.cliente.tipoDocumento,
      celular: sale.cliente.celular || '',
      email: sale.cliente.email || '',
      complemento: sale.cliente.complemento || '',
      fechaNacimiento: sale.cliente.fechaNacimiento || '',
      descuentoAdicional: sale.descuentoAdicional || 0,
      pagado: sale.pagado || 0,
      cambio: sale.cambio || 0
    });
    setMySalesModalOpen(false);
    enqueueSnackbar('Venta cargada. Puede modificar y generar nueva factura.', { variant: 'info' });
  };

  // Anular factura
  const handleCancelInvoice = () => {
    enqueueSnackbar('Modal de anulación en desarrollo', { variant: 'info' });
  };

  // Ver productos
  const handleViewProducts = () => {
    enqueueSnackbar('Modal de productos en desarrollo', { variant: 'info' });
  };

  // Imprimir FFDL (Fuera de línea)
  const handlePrintOffline = () => {
    enqueueSnackbar('Impresión fuera de línea en desarrollo', { variant: 'info' });
  };

  // Guardar/Actualizar cliente
  const handleSaveClient = () => {
    if (!clientForm.nit || !clientForm.nombre) {
      enqueueSnackbar('Complete NIT y Nombre para guardar el cliente', { variant: 'warning' });
      return;
    }
    enqueueSnackbar('Cliente guardado correctamente', { variant: 'success' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Formulario de cliente */}
      <ClientForm
        clientForm={clientForm}
        setClientForm={setClientForm}
        handleClientSearch={handleClientSearch}
        totals={totals}
      />

      {/* Tabla de items CON búsqueda integrada */}
      <SaleItemsTable
        items={saleItems}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onAddItem={addItem}
        onSearchProducts={searchProducts}
        searchResults={searchResults}
        isSearching={isSearching}
      />

      {/* SECCIÓN DE BOTONES */}
      <Box sx={{ mt: 3 }}>
        {/* BOTÓN PRINCIPAL: Imprimir Factura */}
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Print />}
            onClick={handlePrintInvoice}
            disabled={loading || saleItems.length === 0}
            sx={{
              backgroundColor: farmaColors.primary,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: `0 4px 12px ${farmaColors.alpha.primary30}`,
              '&:hover': { 
                backgroundColor: farmaColors.primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${farmaColors.alpha.primary30}`
              },
              transition: 'all 0.2s'
            }}
          >
            Imprimir Factura
          </Button>
        </Box>

        {/* Botones secundarios - TODOS EN UNA FILA */}
        <Grid container spacing={1}>
          {/* Nueva Venta */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={handleNewSale}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10
                }
              }}
            >
              Nueva Venta
            </Button>
          </Grid>

          {/* Guardar Venta */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveSale}
              disabled={loading || saleItems.length === 0}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10
                }
              }}
            >
              Guardar Venta
            </Button>
          </Grid>

          {/* Mis Ventas */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<History />}
              onClick={() => setMySalesModalOpen(true)}
              sx={{
                borderColor: '#757575',
                color: '#424242',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#424242',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Mis Ventas
            </Button>
          </Grid>

          {/* Ver Stock */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Store />}
              onClick={handleViewStock}
              sx={{
                borderColor: '#757575',
                color: '#424242',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#424242',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Ver Stock
            </Button>
          </Grid>

          {/* Productos */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Search />}
              onClick={handleViewProducts}
              sx={{
                borderColor: '#757575',
                color: '#424242',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#424242',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Productos
            </Button>
          </Grid>

          {/* Guardar Cliente */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={handleSaveClient}
              sx={{
                borderColor: '#757575',
                color: '#424242',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#424242',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Guardar Cliente
            </Button>
          </Grid>

          {/* Imprimir FFDL */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CloudOff />}
              onClick={handlePrintOffline}
              disabled={loading || saleItems.length === 0}
              sx={{
                borderColor: '#757575',
                color: '#424242',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#424242',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Imprimir FFDL
            </Button>
          </Grid>

          {/* Anular Factura */}
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancelInvoice}
              disabled={saleItems.length === 0}
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                py: 1,
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: 'rgba(244, 67, 54, 0.05)'
                }
              }}
            >
              Anular Factura
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Totales de venta */}
      <Box
        sx={{
          mt: 3,
          p: 2.5,
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: `2px solid ${farmaColors.secondary}`
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                Subtotal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                Bs. {totals.subtotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                Descuento
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                - Bs. {totals.descuentoAdicional.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                Pagado
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: farmaColors.primary }}>
                Bs. {totals.pagado.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                Cambio
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                Bs. {totals.cambio.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Modales */}
      <StockModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        product={selectedProduct}
      />

      <MySalesModal
        open={mySalesModalOpen}
        onClose={() => setMySalesModalOpen(false)}
        onLoadSale={handleLoadSale}
        userId={1}
      />
    </Container>
  );
};

export default SalesPage;