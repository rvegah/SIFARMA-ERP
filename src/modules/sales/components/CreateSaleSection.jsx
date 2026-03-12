// src/modules/sales/components/CreateSaleSection.jsx
import React, { useState } from "react";
import { Container, Box, Button, Grid, Typography, IconButton, Chip } from "@mui/material";
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
import ClientForm from "./ClientForm";
import SaleItemsTable from "./SaleItemsTable";
import StockModal from "./StockModal";
import MySalesModal from "./MySalesModal";
import PrintInvoiceModal from "./PrintInvoiceModal";
import { enviarFacturaSIAT } from "../services/siatMockService";
import CancelInvoiceModal from "./CancelInvoiceModal";
import ProductsModal from "./ProductsModal";

const CreateSaleSection = () => {
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

    const handleViewStock = () => {
        setStockModalOpen(true);
    };

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
        if (totals.total >= 1000 && clientForm.nit === "4444") {
            enqueueSnackbar(
                "Para ventas mayores a 1000 Bs. debe ingresar un NIT/CI válido",
                {
                    variant: "error",
                }
            );
            return;
        }

        if (saleItems.length === 0) {
            enqueueSnackbar("Debe agregar al menos un producto", {
                variant: "warning",
            });
            return;
        }

        try {
            enqueueSnackbar("Generando factura...", { variant: "info" });

            const saleData = {
                cliente: clientForm,
                items: saleItems,
                totales: totals,
                pagado: clientForm.pagado,
                cambio: clientForm.cambio,
                metodoPago: "EFECTIVO",
                userId: 1,
                sucursalId: 1,
                puntoVenta: 2,
            };

            const siatResponse = await enviarFacturaSIAT(saleData);

            if (!siatResponse.success) {
                throw new Error("Error al generar factura en el SIAT");
            }

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

    const handleNewSale = () => {
        clearForm();
        enqueueSnackbar("Listo para nueva venta", { variant: "info" });
    };

    const handleLoadSale = (saleData) => {
        loadSaleData(saleData);
        setMySalesModalOpen(false);
        enqueueSnackbar("✅ Venta cargada correctamente", { variant: "success" });
    };

    const handleCancelInvoice = () => {
        if (saleItems.length === 0) {
            enqueueSnackbar("No hay ninguna factura cargada para anular", {
                variant: "warning",
            });
            return;
        }

        const invoiceData = {
            numeroFactura: "206279",
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

    const handleConfirmCancellation = async (motivo) => {
        try {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            clearForm();
            setCancelModalOpen(false);
            setInvoiceToCancel(null);
            enqueueSnackbar(`✅ Factura anulada exitosamente.`, { variant: "success" });
        } catch (error) {
            enqueueSnackbar("❌ Error al anular la factura.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleViewProducts = () => {
        setProductsModalOpen(true);
    };

    const handlePrintOffline = () => {
        enqueueSnackbar("Impresión fuera de línea en desarrollo", { variant: "info" });
    };

    const handleSaveClient = () => {
        if (!clientForm.nit || !clientForm.nombre) {
            enqueueSnackbar("Complete NIT y Nombre para guardar el cliente", { variant: "warning" });
            return;
        }
        enqueueSnackbar("Cliente guardado correctamente", { variant: "success" });
    };

    const handlePrintComplete = (printedInvoice) => {
        enqueueSnackbar("Factura generada exitosamente.", { variant: "success" });
    };

    const handleSelectProductFromModal = (product) => {
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
    };

    // Static constant from original file
    const CANCELLATION_REASONS = [
        { value: 1, label: "Factura mal emitida" },
        { value: 2, label: "Datos de cliente incorrectos" },
        { value: 3, label: "Error en productos/precios" },
        { value: 4, label: "Venta no concretada" }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <ClientForm clientForm={clientForm} setClientForm={setClientForm} handleClientSearch={handleClientSearch} totals={totals} />
            <SaleItemsTable items={saleItems} onUpdateItem={updateItem} onRemoveItem={removeItem} onAddItem={addItem} onSearchProducts={searchProducts} searchResults={searchResults} isSearching={isSearching} />

            <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Button fullWidth variant="contained" size="large" startIcon={<Print />} onClick={handlePrintInvoice} disabled={loading || saleItems.length === 0}
                        sx={{ backgroundColor: farmaColors.primary, py: 2, fontSize: "1.1rem", fontWeight: 700 }}>
                        Imprimir Factura
                    </Button>
                </Box>
                <Grid container spacing={1}>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<Add />} onClick={handleNewSale} sx={{ borderColor: farmaColors.secondary, color: farmaColors.secondary }}>Nueva Venta</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<Save />} onClick={handleSaveSale} disabled={loading || saleItems.length === 0} sx={{ borderColor: farmaColors.secondary, color: farmaColors.secondary }}>Guardar Venta</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<History />} onClick={() => setMySalesModalOpen(true)}>Mis Ventas</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<Store />} onClick={handleViewStock}>Ver Stock</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<Search />} onClick={handleViewProducts}>Productos</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<PersonAdd />} onClick={handleSaveClient}>Guardar Cliente</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<CloudOff />} onClick={handlePrintOffline} disabled={loading || saleItems.length === 0}>Imprimir FFDL</Button></Grid>
                    <Grid item xs={1.5}><Button fullWidth variant="outlined" startIcon={<Cancel />} onClick={handleCancelInvoice} disabled={saleItems.length === 0} color="error">Anular Factura</Button></Grid>
                </Grid>
            </Box>

            <Box sx={{ mt: 3, p: 2.5, backgroundColor: "#f5f5f5", borderRadius: 2, border: `2px solid ${farmaColors.secondary}` }}>
                <Grid container spacing={2}>
                    <Grid item xs={3}><Box sx={{ textAlign: "center" }}><Typography variant="caption">Subtotal</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>Bs. {totals.subtotal.toFixed(2)}</Typography></Box></Grid>
                    <Grid item xs={3}><Box sx={{ textAlign: "center" }}><Typography variant="caption">Descuento</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: "#f44336" }}>- Bs. {totals.descuentoAdicional.toFixed(2)}</Typography></Box></Grid>
                    <Grid item xs={3}><Box sx={{ textAlign: "center" }}><Typography variant="caption">Pagado</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: farmaColors.primary }}>Bs. {totals.pagado.toFixed(2)}</Typography></Box></Grid>
                    <Grid item xs={3}><Box sx={{ textAlign: "center" }}><Typography variant="caption">Cambio</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: "#4caf50" }}>Bs. {totals.cambio.toFixed(2)}</Typography></Box></Grid>
                </Grid>
            </Box>

            <StockModal open={stockModalOpen} onClose={() => setStockModalOpen(false)} product={selectedProduct} />
            <MySalesModal open={mySalesModalOpen} onClose={() => setMySalesModalOpen(false)} onLoadSale={handleLoadSale} userId={1} />
            <PrintInvoiceModal open={printModalOpen} onClose={() => setPrintModalOpen(false)} invoiceData={invoiceDataToPrint} onPrintComplete={handlePrintComplete} />
            <CancelInvoiceModal open={cancelModalOpen} onClose={() => { setCancelModalOpen(false); setInvoiceToCancel(null); }} onConfirm={handleConfirmCancellation} invoice={invoiceToCancel} loading={loading} />
            <ProductsModal open={productsModalOpen} onClose={() => setProductsModalOpen(false)} onSelectProduct={handleSelectProductFromModal} />
        </Container>
    );
};

export default CreateSaleSection;
