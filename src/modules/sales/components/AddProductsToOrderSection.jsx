// src/modules/sales/components/AddProductsToOrderSection.jsx
import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Stack,
    Dialog
} from "@mui/material";
import XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Search,
    Add,
    Delete,
    CheckCircle,
    CalendarToday,
    Store,
    LocalPostOffice,
    Inventory,
    ShoppingCart,
    FileDownload,
    PictureAsPdf,
    TableView,
    QrCode,
    Title
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const AddProductsToOrderSection = ({
    orderData,
    searchFilters,
    setSearchFilters,
    searchResults,
    onSearch,
    selectedProducts,
    onAdd,
    onRemove,
    onUpdateQty,
    onSave,
    loading,
    isReadOnly,
    canEdit,
    onStatusChange,
    clearStorage,
    catalogs,
    onUpdateObservation // Need to add this to useOrders or handle locally
}) => {
    // Pagination for search results
    const [searchPage, setSearchPage] = React.useState(0);
    // Pagination for selected products
    const [selectedPage, setSelectedPage] = React.useState(0);
    const rowsPerPage = 10;

    // Confirmation Dialog State
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [pendingExport, setPendingExport] = React.useState(null); // 'excel' | 'pdf'

    const sucursal = (catalogs.sucursales || []).find(s => s.sucursal_ID === orderData.sucursalId);
    const sucursalName = sucursal?.nombreSucursal || "Sucursal";

    const totalProducts = selectedProducts.length;

    // Reset selected page if items are removed and current page becomes empty
    React.useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(selectedProducts.length / rowsPerPage) - 1);
        if (selectedPage > maxPage) {
            setSelectedPage(maxPage);
        }
    }, [selectedProducts.length, selectedPage]);

    // Reset selected page to 0 when a new item is added (to show the prepended item)
    React.useEffect(() => {
        setSelectedPage(0);
    }, [selectedProducts.length]);

    // Keyboard shortcuts (Ctrl + S)
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!isReadOnly && !loading && selectedProducts.length > 0) {
                    onSave(true); // stayOnPage = true
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSave, isReadOnly, loading, selectedProducts.length]);

    const handleSearch = () => {
        setSearchPage(0);
        onSearch();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Helper for observation updates in selected products
    const handleObservationChange = (productId, observation) => {
        if (onUpdateQty) {
            if (window._updateSelectionObservation) {
                window._updateSelectionObservation(productId, observation);
            }
        }
    };

    const handleExportExcel = () => {
        if (selectedProducts.length === 0) return;

        if (canEdit) {
            setPendingExport('excel');
            setConfirmOpen(true);
        } else {
            executeExportExcel();
        }
    };

    const executeExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Define Styles
        const headerStyle = {
            fill: { fgColor: { rgb: "00529B" } }, // Sifarma Blue
            font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };

        const subHeaderStyle = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "E3F2FD" } },
            border: {
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        };

        const cellStyle = {
            alignment: { vertical: "center" },
            border: {
                bottom: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        };

        // 1. Create Data Array with Styling Objects
        const data = [
            // Section 1: Detalle del Pedido
            [{ v: "DETALLE DEL PEDIDO", s: headerStyle }, "", "", ""],
            [{ v: "Sucursal", s: subHeaderStyle }, { v: sucursalName, s: cellStyle }, { v: "Fecha", s: subHeaderStyle }, { v: orderData.fecha, s: cellStyle }],
            [{ v: "ID Pedido", s: subHeaderStyle }, { v: orderData.pedidoProveedor_ID || "Pendiente", s: cellStyle }, { v: "Descripción", s: subHeaderStyle }, { v: orderData.descripcion || "Sin descripción", s: cellStyle }],
            [], // Spacer
            // Section 2: Productos
            [{ v: "PRODUCTOS DEL PEDIDO", s: headerStyle }, "", "", "", "", "", "", "", "", "", ""],
            [
                { v: "#", s: subHeaderStyle },
                { v: "Producto", s: subHeaderStyle },
                { v: "Código", s: subHeaderStyle },
                { v: "Presentación", s: subHeaderStyle },
                { v: "Unidad", s: subHeaderStyle },
                { v: "Línea", s: subHeaderStyle },
                { v: "Laboratorio", s: subHeaderStyle },
                { v: "Lote", s: subHeaderStyle },
                { v: "Vencimiento", s: subHeaderStyle },
                { v: "Cantidad", s: subHeaderStyle },
                { v: "Observación", s: subHeaderStyle }
            ]
        ];

        // Add Product rows
        selectedProducts.forEach((p, index) => {
            data.push([
                { v: index + 1, s: cellStyle },
                { v: p.producto || p.nombre, s: cellStyle },
                { v: p.codigoProducto || p.codigo, s: cellStyle },
                { v: p.presentacion, s: cellStyle },
                { v: p.unidadMedida, s: cellStyle },
                { v: p.linea, s: cellStyle },
                { v: p.laboratorio, s: cellStyle },
                { v: p.numeroLote || "S/N", s: cellStyle },
                { v: formatDate(p.fechaVencimiento), s: cellStyle },
                { v: p.cantidad, s: cellStyle },
                { v: p.observacionesFila || "", s: cellStyle }
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Merge cells for headers
        ws["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Detalle del Pedido header
            { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } } // Productos header
        ];

        // Column Widths
        ws['!cols'] = [
            { wch: 5 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 30 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Pedido");
        XLSX.writeFile(wb, `Pedido_${orderData.numeroPedido || orderData.pedidoProveedor_ID || "Nuevo"}.xlsx`);
    };

    const handleExportPDF = () => {
        if (selectedProducts.length === 0) return;

        if (canEdit) {
            setPendingExport('pdf');
            setConfirmOpen(true);
        } else {
            executeExportPDF();
        }
    };

    const executeExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more space
        const primaryColor = [0, 82, 155]; // Sifarma Blue approximation

        // -- Header / Title --
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 297, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text("SIFARMA - REPORTE DE PEDIDO", 14, 13);

        // -- Order Details Section --
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DETALLE DEL PEDIDO", 14, 30);
        doc.line(14, 32, 283, 32);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const startY = 38;
        const col1 = 14;
        const col2 = 100;

        doc.text(`Sucursal: ${sucursalName}`, col1, startY);
        doc.text(`Fecha: ${orderData.fecha}`, col1, startY + 6);
        doc.text(`ID Pedido: ${orderData.pedidoProveedor_ID || "Pendiente"}`, col2, startY);
        doc.text(`Descripción: ${orderData.descripcion || "Sin descripción"}`, col2, startY + 6);

        // -- Products Table --
        const tableColumn = ["#", "Producto", "Código", "Present.", "Línea", "Cant.", "Observación"];
        const tableRows = selectedProducts.map((p, index) => [
            index + 1,
            `${p.producto || p.nombre}\n(${p.laboratorio})`,
            p.codigoProducto || p.codigo,
            p.presentacion,
            p.linea,
            p.cantidad,
            p.observacionesFila || ""
        ]);

        autoTable(doc, {
            startY: startY + 15,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 248, 255] },
            margin: { left: 14, right: 14 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 80 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 20 },
                6: { cellWidth: 'auto' }
            }
        });

        doc.save(`Pedido_${orderData.numeroPedido || orderData.pedidoProveedor_ID || "Nuevo"}.pdf`);
    };

    const handleConfirmExport = async () => {
        setConfirmOpen(false);
        const success = await onStatusChange(orderData.numeroPedido, 'ENV');
        if (success) {
            if (clearStorage) clearStorage();
            if (pendingExport === 'excel') executeExportExcel();
            else if (pendingExport === 'pdf') executeExportPDF();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* 1. Detalle del Pedido */}
            <Card sx={{
                borderRadius: 3,
                bgcolor: farmaColors.alpha.primary10,
                border: `1px solid ${farmaColors.alpha.primary20}`,
                boxShadow: "none"
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                            <CheckCircle sx={{ color: farmaColors.primary }} /> Detalle del Pedido
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Exportar a Excel">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<FileDownload />}
                                    onClick={handleExportExcel}
                                    sx={{
                                        color: "#1d6f42",
                                        borderColor: "#1d6f42",
                                        "&:hover": { borderColor: "#145a32", bgcolor: "rgba(29, 111, 66, 0.04)" }
                                    }}
                                >
                                    Excel
                                </Button>
                            </Tooltip>
                            <Tooltip title="Exportar a PDF">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<PictureAsPdf />}
                                    onClick={handleExportPDF}
                                    sx={{
                                        color: "#c31b1b",
                                        borderColor: "#c31b1b",
                                        "&:hover": { borderColor: "#9a1515", bgcolor: "rgba(195, 27, 27, 0.04)" }
                                    }}
                                >
                                    PDF
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Store color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Sucursal:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{sucursalName}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{orderData.fecha}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Inventory color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Descripción:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{orderData.descripcion || "Sin descripción"}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalPostOffice color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">ID Pedido:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.primary }}>{orderData.pedidoProveedor_ID || "Pendiente"}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 2. Búsqueda de Productos - Only visible if canEdit is true */}
            {canEdit && (
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, mb: 3, fontWeight: 600 }}>
                            Búsqueda de Productos
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Buscar por Código"
                                    placeholder="Ej: MED001"
                                    value={searchFilters.codigo}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, codigo: e.target.value }))}
                                    InputProps={{
                                        startAdornment: <QrCode sx={{ color: "action.active", mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Buscar por Nombre"
                                    placeholder="Ej: Ibuprofeno"
                                    value={searchFilters.nombre}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, nombre: e.target.value }))}
                                    InputProps={{
                                        startAdornment: <Title sx={{ color: "action.active", mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                        onClick={handleSearch}
                                        disabled={loading}
                                        sx={{ 
                                            background: farmaColors.gradients.primary,
                                            height: 56,
                                            borderRadius: 2,
                                            fontWeight: 700
                                        }}
                                    >
                                        Buscar
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* 3. Resultados de Búsqueda - Only visible if canEdit is true */}
            {canEdit && (
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600 }}>
                                Resultados de Búsqueda
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                                    <TableRow sx={{ height: 56 }}>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Detalle del Producto</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Stock</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Lote</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Vencimiento</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="right">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ bgcolor: "white" }}>
                                    {searchResults.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body2" color="text.secondary">Realice una búsqueda para ver productos</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        searchResults
                                            .slice(searchPage * rowsPerPage, (searchPage + 1) * rowsPerPage)
                                            .map((p) => {
                                                const isAdded = selectedProducts.some(sp => (sp.producto_ID || sp.id) === (p.producto_ID || p.id));
                                                return (
                                                    <TableRow key={p.producto_ID || p.id} hover>
                                                        <TableCell>{p.codigoProducto || p.codigo}</TableCell>
                                                        <TableCell sx={{ maxWidth: 400 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {p.producto || p.nombre} - {p.presentacion} - {p.unidadMedida}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                {p.linea} | {p.laboratorio}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: farmaColors.primary }}>
                                                            {p.stockProducto || p.stock || 0}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 500 }}>
                                                            {p.numeroLote || "S/N"}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 500 }}>
                                                            {formatDate(p.fechaVencimiento) || "-"}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {isAdded ? (
                                                                <Chip label="Añadido" size="small" variant="outlined" color="success" sx={{ fontWeight: 700 }} />
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    startIcon={<Add />}
                                                                    onClick={() => onAdd(p)}
                                                                    sx={{ 
                                                                        bgcolor: farmaColors.primary, 
                                                                        borderRadius: 2,
                                                                        fontWeight: 700,
                                                                        px: 2
                                                                    }}
                                                                >
                                                                    Añadir
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {searchResults.length > rowsPerPage && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Button disabled={searchPage === 0} onClick={() => setSearchPage(prev => prev - 1)}>Anterior</Button>
                                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                    Página {searchPage + 1} de {Math.ceil(searchResults.length / rowsPerPage)}
                                </Typography>
                                <Button disabled={searchPage === Math.ceil(searchResults.length / rowsPerPage) - 1} onClick={() => setSearchPage(prev => prev + 1)}>Siguiente</Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 4. Productos del Pedido */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600 }}>
                            Productos del Pedido
                        </Typography>
                        <Chip label={`${totalProducts} items`} color="primary" size="small" />
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                                <TableRow sx={{ height: 56 }}>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Producto</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary, width: 150 }}>Cantidad</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Observación</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="right">Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ bgcolor: "white" }}>
                                {selectedProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                            <ShoppingCart sx={{ fontSize: 40, color: "text.disabled", mb: 1, opacity: 0.5 }} />
                                            <Typography color="text.secondary" variant="body2">No hay productos en el pedido</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    selectedProducts
                                        .slice(selectedPage * rowsPerPage, (selectedPage + 1) * rowsPerPage)
                                        .map((p) => (
                                            <TableRow key={p.producto_ID || p.id}>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.secondary }}>
                                                        {p.producto || p.nombre} - {p.presentacion} - {p.unidadMedida} - {p.linea} - {p.laboratorio}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
                                                        {p.numeroLote || "S/N"} | {formatDate(p.fechaVencimiento)} |
                                                        <Box component="span" sx={{ ml: 1, fontWeight: 700, color: farmaColors.primary, bgcolor: farmaColors.alpha.primary10, px: 0.5, borderRadius: 0.5 }}>
                                                            Stock: {p.stockProducto || p.stock || 0}
                                                        </Box>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {canEdit && !p.isReadOnlyRow ? (
                                                        <TextField
                                                            type="number"
                                                            disabled={isReadOnly}
                                                            value={p.cantidad}
                                                            onChange={(e) => onUpdateQty(p.producto_ID || p.id, e.target.value)}
                                                            inputProps={{ min: 1 }}
                                                            sx={{
                                                                "& .MuiInputBase-root": { height: 44 }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2">{p.cantidad}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {canEdit && !p.isReadOnlyRow ? (
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Añadir observación..."
                                                            variant="standard"
                                                            disabled={isReadOnly}
                                                            value={p.observacionesFila || ""}
                                                            onChange={(e) => {
                                                                if (onUpdateQty) {
                                                                    onUpdateQty(p.producto_ID || p.id, p.cantidad, e.target.value);
                                                                }
                                                            }}
                                                            sx={{
                                                                "& .MuiInput-underline:before": { borderBottomColor: farmaColors.alpha.secondary20 }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {p.observacionesFila || "-"}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {canEdit && !p.isReadOnlyRow && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={isReadOnly}
                                                            onClick={() => onRemove(p.producto_ID || p.id)}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination for selected products */}
                    {selectedProducts.length > rowsPerPage && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button disabled={selectedPage === 0} onClick={() => setSelectedPage(prev => prev - 1)}>Anterior</Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                Página {selectedPage + 1} de {Math.ceil(selectedProducts.length / rowsPerPage)}
                            </Typography>
                            <Button disabled={selectedPage === Math.ceil(selectedProducts.length / rowsPerPage) - 1} onClick={() => setSelectedPage(prev => prev + 1)}>Siguiente</Button>
                        </Box>
                    )}

                    {/* Footer con Guardar - Only if canEdit is true */}
                    {canEdit && !isReadOnly && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                                onClick={onSave}
                                disabled={loading || selectedProducts.length === 0}
                                sx={{ 
                                    background: farmaColors.gradients.primary, 
                                    px: 5, 
                                    height: 56, 
                                    borderRadius: 2,
                                    fontWeight: 700 
                                }}
                            >
                                {loading ? "Guardando..." : "Guardar Pedido"}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog for Exports */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: farmaColors.secondary, mb: 2 }}>
                        Confirmar Envío
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Su pedido será cambiado al estado <strong>"Enviado"</strong>. ¿Está de acuerdo con realizar esta acción?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                            No
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmExport}
                            sx={{ background: farmaColors.gradients.primary, fontWeight: 700, px: 3 }}
                        >
                            Si
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default AddProductsToOrderSection;
