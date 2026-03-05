// src/modules/sales/pages/SalesPage.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, Button, Grid, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
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
  Search,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { useSales } from "../hooks/useSales";
import ClientForm from "../components/ClientForm";
import SaleItemsTable from "../components/SaleItemsTable";
import StockModal from "../components/StockModal";
import MySalesModal from "../components/MySalesModal";
import PrintInvoiceModal from "../components/PrintInvoiceModal";
import siatApiService from "../services/siatApiService";
import CancelInvoiceModal from "../components/CancelInvoiceModal";
import ProductsModal from "../components/ProductsModal";
import { useAuth } from "../../../context/AuthContext";

const CANCELLATION_REASONS = [
  { value: 1, label: "Error en la transcripción" },
  { value: 2, label: "Devolución" },
  { value: 3, label: "Descuento o bonificación" },
  { value: 4, label: "Otro" },
];

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
    loadSaleData,
  } = useSales();

  const totals = React.useMemo(
    () => calculateTotals(),
    [saleItems, clientForm],
  );

  // ✅ NUEVO: Estado para catálogos dinámicos SIAT
  const [tiposDocumentoIdentidad, setTiposDocumentoIdentidad] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mySalesModalOpen, setMySalesModalOpen] = useState(false);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [invoiceDataToPrint, setInvoiceDataToPrint] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);

  const [productsModalOpen, setProductsModalOpen] = useState(false);

  const [invoiced, setInvoiced] = useState(false);

  //Saber si el usuario es admin para mostrar opciones avanzadas
  const { user } = useAuth();
  const isAdmin = user?.rol === "Administrador";

  // Cargar catálogos SIAT al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const tiposDoc = await siatApiService.getTiposDocumentoIdentidad();
        setTiposDocumentoIdentidad(tiposDoc);        
        console.log("✅ Tipos de documento cargados:", tiposDoc.length);
      } catch (err) {
        console.error("❌ Error al cargar catálogos SIAT:", err);
        // Sin fallback hardcodeado — ClientForm tiene su propio fallback
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  // Ver stock en sucursales
  const handleViewStock = () => {
    setStockModalOpen(true);
  };

  // Guardar venta sin facturar (< 5 Bs)
  const handleSaveSale = async () => {
    if (totals.total >= 5) {
      enqueueSnackbar("Esta opción es solo para ventas menores a 5 Bs.", {
        variant: "warning",
      });
      return;
    }

    const result = await saveSale();
    if (result.success) {
      enqueueSnackbar(result.message, { variant: "success" });
      clearForm();
    } else {
      enqueueSnackbar(result.message, { variant: "error" });
    }
  };

  const handlePrintInvoice = async () => {
    if (saleItems.length === 0) {
      enqueueSnackbar("Debe agregar al menos un producto", {
        variant: "warning",
      });
      return;
    }
    enqueueSnackbar("Generando factura...", { variant: "info" });
    try {
      const result = await invoiceSale();
      if (!result.success) {
        enqueueSnackbar(result.message || "Error al generar la factura", {
          variant: "error",
        });
        return;
      }
      const invoice = result.invoice;
      const invoiceData = {
        empresa: {
          razonSocial: "FARMADINAMICA S.R.L.",
          nit: "425567025",
          direccionCasaMatriz:
            "Av. San Martin Nº 808 Esq. Av. Aroma Zona Central",
          telefono: "4547052",
          ciudad: "Cochabamba",
        },
        factura: {
          facturaId: invoice.facturaId,
          numeroFactura: invoice.numeroFactura,
          codigoAutorizacion: invoice.cuf,
          cuf: invoice.cuf,
          fechaEmision: invoice.fechaEmision,
          qrUrl: invoice.urlVerificacion,
          estado: invoice.estado,
        },
        cliente: {
          nit: clientForm.nit,
          nombre: clientForm.nombre,
          celular: clientForm.celular,
          email: clientForm.email,
        },
        items: saleItems.map((item) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          descuento: item.descuento,
          subtotal: item.subtotal,
          unidadMedida: item.unidadMedida,
        })),
        totales: {
          subtotal: totals.subtotal,
          descuentoAdicional: totals.descuentoAdicional,
          total: totals.total,
        },
        pagado: clientForm.pagado,
        cambio: clientForm.cambio,
        usuario: "Usuario Sistema",
        leyendas: {
          principal:
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY",
          ley453:
            "Ley N° 453: En caso de incumplimiento a lo ofertado o convenido, el proveedor debe reparar o sustituir el producto.",
          documentoDigital:
            "Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea",
        },
      };
      setInvoiceDataToPrint(invoiceData);
      setPrintModalOpen(true);
      setInvoiced(true);
      enqueueSnackbar(
        invoice.estado === "VALIDATED"
          ? "✅ Factura validada por SIAT"
          : "⏳ Factura pendiente de validación",
        { variant: "success" },
      );
    } catch (error) {
      enqueueSnackbar(error.message || "Error al generar la factura", {
        variant: "error",
      });
    }
  };

  // Nueva venta
  const handleNewSale = () => {
    setInvoiced(false);
    clearForm();
    enqueueSnackbar("Listo para nueva venta", { variant: "info" });
  };

  // Cargar venta desde historial
  const handleLoadSale = (saleData) => {
    console.log("🔄 Recuperando venta desde modal:", saleData);
    loadSaleData(saleData);
    setMySalesModalOpen(false);

    if (saleData.metadata?.status === "FACTURADA") {
      enqueueSnackbar(
        "✅ Venta facturada cargada. Puede agregar productos y generar nueva factura (se anulará la anterior automáticamente).",
        { variant: "info", autoHideDuration: 6000 },
      );
    } else if (saleData.metadata?.status === "GUARDADA") {
      enqueueSnackbar(
        "✅ Venta guardada cargada. Puede modificar y facturar.",
        { variant: "info", autoHideDuration: 4000 },
      );
    } else {
      enqueueSnackbar("✅ Venta cargada correctamente", { variant: "success" });
    }
  };

  // Anular factura
  const handleCancelInvoice = () => {
    if (saleItems.length === 0) {
      enqueueSnackbar("No hay ninguna factura cargada para anular", {
        variant: "warning",
      });
      return;
    }

    const facturaId = invoiceDataToPrint?.factura?.facturaId;
    if (!facturaId) {
      enqueueSnackbar(
        "Cargue la factura desde 'Mis Ventas' para poder anularla",
        { variant: "warning" },
      );
      return;
    }
    setInvoiceToCancel({
      facturaId,
      numeroFactura: invoiceDataToPrint.factura.numeroFactura,
      fechaEmision: invoiceDataToPrint.factura.fechaEmision,
      cliente: { nombre: clientForm.nombre, nit: clientForm.nit },
      totales: { total: totals.total },
      items: saleItems.map((i) => ({
        nombre: i.nombre,
        cantidad: i.cantidad,
        subtotal: i.subtotal,
      })),
    });
    setCancelModalOpen(true);
  };

  const handleConfirmCancellation = async (codigoMotivo) => {
    try {
      await siatApiService.anularFactura(
        invoiceToCancel.facturaId,
        codigoMotivo,
      );
      clearForm();
      setInvoiceDataToPrint(null);
      setCancelModalOpen(false);
      setInvoiceToCancel(null);
      const motivoLabel = CANCELLATION_REASONS.find(
        (r) => r.value === codigoMotivo,
      )?.label;
      enqueueSnackbar(`✅ Factura anulada. Motivo: ${motivoLabel}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(error.message || "Error al anular la factura", {
        variant: "error",
      });
    }
  };

  // Ver productos
  const handleViewProducts = () => {
    setProductsModalOpen(true);
  };

  // Imprimir FFDL (Fuera de línea)
  const handlePrintOffline = () => {
    enqueueSnackbar("Impresión fuera de línea en desarrollo", {
      variant: "info",
    });
  };

  // Guardar/Actualizar cliente
  const handleSaveClient = () => {
    if (!clientForm.nit || !clientForm.nombre) {
      enqueueSnackbar("Complete NIT y Nombre para guardar el cliente", {
        variant: "warning",
      });
      return;
    }
    enqueueSnackbar("Cliente guardado correctamente", { variant: "success" });
  };

  const handlePrintComplete = (printedInvoice) => {
    console.log("✅ Factura impresa:", printedInvoice);
    enqueueSnackbar(
      "Factura generada exitosamente. Verifique la entrega de productos al cliente.",
      { variant: "success", autoHideDuration: 5000 },
    );
  };

  const handleSelectProductFromModal = (product) => {
    console.log("📦 Producto seleccionado desde modal:", product);
    const productForSale = {
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      unidadMedida: "CAJA",
      presentacion: product.presentacion,
      linea: product.linea,
      laboratorio: product.laboratorio,
      cantidad: 1,
      descuento: 0,
    };
    addItem(productForSale);
    enqueueSnackbar(`✅ ${product.nombre} agregado a la venta`, {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Formulario de cliente
          ✅ Se pasan tiposDocumentoIdentidad y loadingCatalogos como props */}
      <ClientForm
        clientForm={clientForm}
        setClientForm={setClientForm}
        handleClientSearch={handleClientSearch}
        totals={totals}
        tiposDocumentoIdentidad={tiposDocumentoIdentidad}
        loadingCatalogos={loadingCatalogos}        
        isAdmin={isAdmin}
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
        invoiced={invoiced}
      />

      {/* SECCIÓN DE BOTONES */}
      <Box sx={{ mt: 3 }}>
        {/* BOTÓN PRINCIPAL: Imprimir Factura */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Print />}
            onClick={handlePrintInvoice}
            disabled={loading || saleItems.length === 0 || invoiced}
            sx={{
              width: "300px",
              backgroundColor: farmaColors.primary,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              boxShadow: `0 4px 12px ${farmaColors.alpha.primary30}`,
              "&:hover": {
                backgroundColor: farmaColors.primaryDark,
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${farmaColors.alpha.primary30}`,
              },
              transition: "all 0.2s",
            }}
          >
            Imprimir Factura
          </Button>
        </Box>

        {/* Botones secundarios */}
        <Grid container spacing={1}>
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
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10,
                },
              }}
            >
              Nueva Venta
            </Button>
          </Grid>

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
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10,
                },
              }}
            >
              Guardar Venta
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<History />}
              onClick={() => setMySalesModalOpen(true)}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Mis Ventas
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Store />}
              onClick={handleViewStock}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Ver Stock
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Search />}
              onClick={handleViewProducts}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Productos
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={handleSaveClient}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Guardar Cliente
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CloudOff />}
              onClick={handlePrintOffline}
              disabled={loading || saleItems.length === 0}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Imprimir FFDL
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancelInvoice}
              disabled={saleItems.length === 0}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "error.dark",
                  bgcolor: "rgba(244, 67, 54, 0.05)",
                },
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
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          border: `2px solid ${farmaColors.secondary}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Subtotal
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: farmaColors.secondary }}
              >
                Bs. {totals.subtotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Descuento
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#f44336" }}
              >
                - Bs. {totals.descuentoAdicional.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Pagado
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: farmaColors.primary }}
              >
                Bs. {totals.pagado.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Cambio
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#4caf50" }}
              >
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

      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoiceData={invoiceDataToPrint}
        onPrintComplete={handlePrintComplete}
      />

      <CancelInvoiceModal
        open={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setInvoiceToCancel(null);
        }}
        onConfirm={handleConfirmCancellation}
        invoice={invoiceToCancel}
        loading={loading}
      />

      <ProductsModal
        open={productsModalOpen}
        onClose={() => setProductsModalOpen(false)}
        onSelectProduct={handleSelectProductFromModal}
      />
    </Container>
  );
};

export default SalesPage;
