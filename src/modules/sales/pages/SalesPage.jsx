// src/modules/sales/pages/SalesPage.jsx
import React, { useState } from "react";
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
import { enviarFacturaSIAT } from "../services/siatMockService";
import CancelInvoiceModal from "../components/CancelInvoiceModal";
import ProductsModal from "../components/ProductsModal";

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
    [saleItems, clientForm]
  );

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mySalesModalOpen, setMySalesModalOpen] = useState(false);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [invoiceDataToPrint, setInvoiceDataToPrint] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);

  const [productsModalOpen, setProductsModalOpen] = useState(false);

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

  // Imprimir factura
  const handlePrintInvoice = async () => {
    // Validar NIT para ventas >= 1000 Bs
    if (totals.total >= 1000 && clientForm.nit === "4444") {
      enqueueSnackbar(
        "Para ventas mayores a 1000 Bs. debe ingresar un NIT/CI válido",
        {
          variant: "error",
        }
      );
      return;
    }

    // Validar que haya items
    if (saleItems.length === 0) {
      enqueueSnackbar("Debe agregar al menos un producto", {
        variant: "warning",
      });
      return;
    }

    try {
      // Mostrar loading
      enqueueSnackbar("Generando factura...", { variant: "info" });

      // 1. Preparar datos de la venta
      const saleData = {
        cliente: clientForm,
        items: saleItems,
        totales: totals,
        pagado: clientForm.pagado,
        cambio: clientForm.cambio,
        metodoPago: "EFECTIVO",
        userId: 1, // TODO: obtener del contexto de usuario
        sucursalId: 1,
        puntoVenta: 2,
      };

      // 2. Enviar al SIAT (mock) y obtener datos de factura
      const siatResponse = await enviarFacturaSIAT(saleData);

      if (!siatResponse.success) {
        throw new Error("Error al generar factura en el SIAT");
      }

      // 3. Preparar datos para impresión
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
          numeroFactura: siatResponse.data.numeroFactura,
          codigoAutorizacion: siatResponse.data.codigoAutorizacion,
          cuf: siatResponse.data.cuf,
          fechaEmision: siatResponse.data.fechaEmision,
          qrUrl: siatResponse.data.qrUrl,
          puntoVenta: saleData.puntoVenta,
        },
        cliente: {
          id: clientForm.id || Date.now(),
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
        usuario: "Usuario Sistema", // TODO: obtener del contexto
        leyendas: {
          principal:
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY",
          ley453:
            "Ley N° 453: En caso de incumplimiento a lo ofertado o convenido, el proveedor debe reparar o sustituir el producto.",
          documentoDigital:
            "Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea",
        },
      };

      // 4. Guardar cliente para futuras ventas
      // TODO: Implementar guardado en BD o localStorage
      console.log(
        "💾 Guardando datos del cliente para futuras ventas:",
        clientForm
      );

      // 5. Abrir modal de impresión
      setInvoiceDataToPrint(invoiceData);
      setPrintModalOpen(true);

      enqueueSnackbar("Factura generada. Seleccione el formato de impresión.", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error al generar factura:", error);
      enqueueSnackbar(error.message || "Error al generar la factura", {
        variant: "error",
      });
    }
  };

  // Nueva venta
  const handleNewSale = () => {
    clearForm();
    enqueueSnackbar("Listo para nueva venta", { variant: "info" });
  };

  // Cargar venta desde historial
  const handleLoadSale = (saleData) => {
    console.log("🔄 Recuperando venta desde modal:", saleData);

    // Usar la nueva función del hook para cargar TODO
    loadSaleData(saleData);

    // Cerrar modal
    setMySalesModalOpen(false);

    // Mensaje informativo según el estado de la venta
    if (saleData.metadata?.status === "FACTURADA") {
      enqueueSnackbar(
        "✅ Venta facturada cargada. Puede agregar productos y generar nueva factura (se anulará la anterior automáticamente).",
        {
          variant: "info",
          autoHideDuration: 6000,
        }
      );
    } else if (saleData.metadata?.status === "GUARDADA") {
      enqueueSnackbar(
        "✅ Venta guardada cargada. Puede modificar y facturar.",
        {
          variant: "info",
          autoHideDuration: 4000,
        }
      );
    } else {
      enqueueSnackbar("✅ Venta cargada correctamente", { variant: "success" });
    }
  };

  // Anular factura
  const handleCancelInvoice = () => {
    // Verificar que hay una venta cargada para anular
    if (saleItems.length === 0) {
      enqueueSnackbar("No hay ninguna factura cargada para anular", {
        variant: "warning",
      });
      return;
    }

    // TODO: Aquí deberías verificar si la venta actual tiene una factura asociada
    // Por ahora simulamos con los datos actuales
    const invoiceData = {
      numeroFactura: "206279", // Este debería venir de la BD
      fechaEmision: new Date().toISOString(),
      cliente: {
        nombre: clientForm.nombre || "SIN NOMBRE",
        nit: clientForm.nit || "4444",
      },
      totales: {
        total: totals.total,
      },
      items: saleItems.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      })),
    };

    setInvoiceToCancel(invoiceData);
    setCancelModalOpen(true);
  };

  // 4. Función para confirmar anulación:
  const handleConfirmCancellation = async (motivo) => {
    try {
      console.log("🚫 Anulando factura:", {
        factura: invoiceToCancel,
        motivo: motivo,
        usuario: "Usuario Actual", // TODO: obtener del contexto
        timestamp: new Date().toISOString(),
      });

      // Simulación de llamada al SIAT para anular
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Implementar llamada real al SIAT
      // const siatResponse = await anularFacturaSIAT({
      //   numeroFactura: invoiceToCancel.numeroFactura,
      //   motivo: motivo,
      //   codigoAutorizacion: invoiceToCancel.codigoAutorizacion
      // });

      // Restaurar stock de los productos
      saleItems.forEach((item) => {
        console.log(`📦 Restaurando stock: ${item.nombre} +${item.cantidad}`);
        // TODO: Implementar restauración de stock en BD
      });

      // Limpiar formulario
      clearForm();
      setCancelModalOpen(false);
      setInvoiceToCancel(null);

      enqueueSnackbar(
        `✅ Factura anulada exitosamente. Motivo: ${
          CANCELLATION_REASONS.find((r) => r.value === motivo)?.label
        }`,
        {
          variant: "success",
          autoHideDuration: 6000,
        }
      );
    } catch (error) {
      console.error("Error al anular factura:", error);
      enqueueSnackbar("❌ Error al anular la factura. Intente nuevamente.", {
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
      {
        variant: "success",
        autoHideDuration: 5000,
      }
    );

    // NO limpiar formulario - vendedora debe verificar entrega
    // El formulario se limpiará solo al hacer clic en "Nueva Venta"
  };

  const handleSelectProductFromModal = (product) => {
    console.log("📦 Producto seleccionado desde modal:", product);

    // Convertir a formato compatible con addItem
    const productForSale = {
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      unidadMedida: "CAJA", // Default, se puede cambiar después
      presentacion: product.presentacion,
      linea: product.linea,
      laboratorio: product.laboratorio,
      cantidad: 1, // Cantidad inicial
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

          {/* Mis Ventas */}
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

          {/* Ver Stock */}
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

          {/* Productos */}
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

          {/* Guardar Cliente */}
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

          {/* Imprimir FFDL */}
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

          {/* Anular Factura */}
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

      {/* Modal de impresión */}
      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoiceData={invoiceDataToPrint}
        onPrintComplete={handlePrintComplete}
      />

      {/* Modal de anulación */}
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

      {/* Modal de productos */}
      <ProductsModal
        open={productsModalOpen}
        onClose={() => setProductsModalOpen(false)}
        onSelectProduct={handleSelectProductFromModal}
      />
      
    </Container>
  );
};

export default SalesPage;
