// src/modules/transfers/components/AddProductsToTransferSection.jsx
import React, { useState } from "react";
import { useSnackbar } from "notistack";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Tooltip,
    Divider,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import {
    Add,
    Search,
    Delete,
    Save,
    ArrowBack,
    CheckCircleOutline,
    CalendarToday,
    ShoppingBag,
    Description as DescriptionIcon,
    ConfirmationNumber,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    LocalShipping,
    Storefront,
    ContentCopy,
    Visibility,
    Assessment,
    RestartAlt
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import transferService from "../services/transferService";


const AddProductsToTransferSection = ({
    createdTransfer,
    transferItems,
    isReadOnly,
    loading,
    loadingSearch,
    searchFilters,
    setSearchFilters,
    searchResults,
    searchProducts,
    addTransferItem,
    updateTransferItem,
    removeTransferItem,
    handleConfirmSave,
    setViewState,
    catalogs,
    // Purchase Copying props
    purchaseList,
    selectedPurchase,
    purchaseProducts,
    loadingPurchases,
    loadingPurchaseProducts,
    fetchPurchases,
    fetchPurchaseProducts,
    copyProductsFromPurchase
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [searchPage, setSearchPage] = useState(0);
    const [selectedPage, setSelectedPage] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [purchasePage, setPurchasePage] = useState(0);
    const rowsPerPage = 10;

    // Report State
    const [reportLabInput, setReportLabInput] = useState("");
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportPage, setReportPage] = useState(0);

    const handleSearch = () => {
        setSearchPage(0);
        searchProducts();
    };

    const handleFetchReport = async () => {
        if (!reportLabInput.trim()) {
            enqueueSnackbar("Ingrese un laboratorio para reportar", { variant: "warning" });
            return;
        }
        try {
            setReportLoading(true);
            const res = await transferService.getProductosSucursalReporte(reportLabInput);
            if (res.exitoso) {
                setReportData(res.datos || []);
                setReportPage(0);
                if (res.datos?.length === 0) enqueueSnackbar("No se encontraron resultados", { variant: "info" });
            } else {
                enqueueSnackbar(res.mensaje || "Error al obtener reporte", { variant: "error" });
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            enqueueSnackbar("Error de red al obtener reporte", { variant: "error" });
            setReportData([]);
        } finally {
            setReportLoading(false);
        }
    };

    const handleResetReport = () => {
        setReportLabInput("");
        setReportData([]);
        setReportPage(0);
    };

    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "-";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderBranchCells = (branchArr, isLast = false) => {
        const branchData = branchArr && branchArr.length > 0 ? branchArr[0] : null;
        if (!branchData) {
            return (
                <React.Fragment>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center" sx={{ borderRight: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)' }}>-</TableCell>
                </React.Fragment>
            );
        }

        const { stockProducto, precioUnitario, numeroLote, fechaVencimiento, diasVencimiento, stockMinimo } = branchData;
        const stockColor = stockProducto === 0 ? '#ffcdd2' : '#fff9c4';

        return (
            <React.Fragment>
                <Tooltip title={
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Días Vto: {diasVencimiento}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Stock Mín: {stockMinimo}</Typography>
                    </Box>
                }>
                    <TableCell align="center" sx={{ bgcolor: stockColor, fontWeight: 700, cursor: 'help' }}>
                        {stockProducto}
                    </TableCell>
                </Tooltip>
                <TableCell align="center">{precioUnitario}</TableCell>
                <TableCell align="center">{numeroLote || "-"}</TableCell>
                <TableCell align="center" sx={{ borderRight: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)' }}>
                    {formatDate(fechaVencimiento)}
                </TableCell>
            </React.Fragment>
        );
    };

    const getBranchName = (id) => {
        const branch = catalogs.sucursales.find(s => s.sucursal_ID === id);
        return branch ? branch.nombreSucursal : `ID: ${id}`;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 1. Detalle de la Cabecera */}
            <Card sx={{
                borderRadius: 3,
                bgcolor: farmaColors.alpha.primary10,
                border: `1px solid ${farmaColors.alpha.primary20}`,
                boxShadow: "none"
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Volver">
                                <IconButton onClick={() => setViewState("creating")} disabled={isReadOnly} size="small">
                                    <ArrowBack />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                                <LocalShipping sx={{ color: farmaColors.primary }} /> Detalle del Traspaso
                            </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: farmaColors.primary, fontWeight: 800 }}>
                            {createdTransfer?.numeroTraspaso || "---"}
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha Envío:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdTransfer?.fechaEnvio?.split('T')[0]}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Storefront sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Origen:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{getBranchName(createdTransfer?.sucursalOrigen_ID)}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Storefront sx={{ color: farmaColors.primary, fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Destino:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{getBranchName(createdTransfer?.sucursalDestino_ID)}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Descripción:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdTransfer?.observaciones || "Sin observaciones"}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 5. Productos por Sucursal Report */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}` }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assessment sx={{ color: farmaColors.primary }} /> Productos del Laboratorio
                        </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Laboratorio"
                                    placeholder="Ej: INTI"
                                    size="small"
                                    value={reportLabInput}
                                    onChange={(e) => setReportLabInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFetchReport()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={reportLoading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                                        onClick={handleFetchReport}
                                        disabled={reportLoading}
                                        sx={{ background: farmaColors.gradients.primary }}
                                    >
                                        Buscar Productos
                                    </Button>
                                    <Tooltip title="Reestablecer">
                                        <IconButton
                                            onClick={handleResetReport}
                                            sx={{
                                                bgcolor: farmaColors.alpha.secondary10,
                                                '&:hover': { bgcolor: farmaColors.alpha.secondary20 },
                                                color: 'text.secondary'
                                            }}
                                        >
                                            <RestartAlt />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {reportData.length > 10 && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button disabled={reportPage === 0} onClick={() => setReportPage(prev => prev - 1)}>Anterior</Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                Página {reportPage + 1} de {Math.ceil(reportData.length / 10)}
                            </Typography>
                            <Button disabled={reportPage >= Math.ceil(reportData.length / 10) - 1} onClick={() => setReportPage(prev => prev + 1)}>Siguiente</Button>
                        </Box>
                    )}

                </CardContent>
            </Card>

            {/* 2. Búsqueda de Productos */}
            {!isReadOnly && (
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, mb: 3, fontWeight: 600 }}>
                            Búsqueda de Productos (Sucursal Origen)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Buscar por Código"
                                    placeholder="Ej: COD123"
                                    size="small"
                                    value={searchFilters.codigo}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, codigo: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Buscar por Nombre"
                                    placeholder="Ej: Paracetamol"
                                    size="small"
                                    value={searchFilters.nombre}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, nombre: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={loadingSearch ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                    onClick={handleSearch}
                                    disabled={loadingSearch}
                                    sx={{ background: farmaColors.gradients.primary }}
                                >
                                    Buscar
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* 3. Resultados de Búsqueda */}
            {!isReadOnly && (
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
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Detalle del Producto</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Lote / Vence</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchResults.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body2" color="text.secondary">Realice una búsqueda para ver productos</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        searchResults
                                            .slice(searchPage * rowsPerPage, (searchPage + 1) * rowsPerPage)
                                            .map((p, idx) => {
                                                const isAdded = transferItems.some(item => item.producto_ID === p.producto_ID && item.lote_ID === p.lote_ID);
                                                return (
                                                    <TableRow key={`${p.producto_ID}-${p.lote_ID}-${idx}`} hover>
                                                        <TableCell>{p.codigoProducto || p.codigo}</TableCell>
                                                        <TableCell sx={{ maxWidth: 400 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {p.producto || p.nombre}
                                                                {p.presentacion ? ` - ${p.presentacion}` : ""}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                {p.laboratorio} | {p.linea}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Lote: {p.numeroLote || p.codigoLote || "S/N"}
                                                            </Typography>
                                                            <Typography variant="caption" color="error">
                                                                Vence: {p.fechaVencimiento || "---"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {isAdded ? (
                                                                <Chip label="Añadido" size="small" variant="outlined" color="success" />
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    startIcon={<Add />}
                                                                    onClick={() => addTransferItem(p, 1, "")}
                                                                    sx={{ bgcolor: farmaColors.primary, borderRadius: 2 }}
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
                                <Button disabled={searchPage >= Math.ceil(searchResults.length / rowsPerPage) - 1} onClick={() => setSearchPage(prev => prev + 1)}>Siguiente</Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 4. Productos del Traspaso */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingBag sx={{ color: farmaColors.primary }} /> Productos en Traspaso
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!isReadOnly && (
                                <Tooltip title="Copiar Productos de Compra">
                                    <IconButton
                                        onClick={() => {
                                            setCopyDialogOpen(true);
                                            fetchPurchases();
                                        }}
                                        sx={{
                                            color: farmaColors.primary,
                                            bgcolor: farmaColors.alpha.primary10,
                                            '&:hover': { bgcolor: farmaColors.alpha.primary20 }
                                        }}
                                    >
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Chip label={`${transferItems.length} items`} color="primary" size="small" />
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Producto</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Lote / Vence</TableCell>
                                    <TableCell sx={{ fontWeight: 800, width: 120 }}>Cantidad</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Observaciones</TableCell>
                                    {!isReadOnly && <TableCell align="center">Acción</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transferItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isReadOnly ? 4 : 5} align="center" sx={{ py: 6 }}>
                                            <InventoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1, opacity: 0.5 }} />
                                            <Typography color="text.secondary">No hay productos en la lista.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transferItems
                                        .slice(selectedPage * rowsPerPage, (selectedPage + 1) * rowsPerPage)
                                        .map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.secondary }}>
                                                        {item.producto}
                                                        {item.presentacion ? ` - ${item.presentacion}` : ""}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                                        {item.laboratorio || ""} {item.linea ? `| ${item.linea}` : ""}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                                                        Lote: {item.codigoLote || "S/N"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                                        Vence: {item.fechaVencimiento || "---"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {!isReadOnly ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.cantidad}
                                                            onChange={(e) => updateTransferItem(idx, "cantidad", Number(e.target.value))}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2">{item.cantidad}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {!isReadOnly ? (
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Observación..."
                                                            size="small"
                                                            variant="standard"
                                                            value={item.observaciones || ""}
                                                            onChange={(e) => updateTransferItem(idx, "observaciones", e.target.value)}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.observaciones || "-"}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                {!isReadOnly && (
                                                    <TableCell align="center">
                                                        <IconButton color="error" size="small" onClick={() => removeTransferItem(idx)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {transferItems.length > rowsPerPage && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button disabled={selectedPage === 0} onClick={() => setSelectedPage(prev => prev - 1)}>Anterior</Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                Página {selectedPage + 1} de {Math.ceil(transferItems.length / rowsPerPage)}
                            </Typography>
                            <Button disabled={selectedPage >= Math.ceil(transferItems.length / rowsPerPage) - 1} onClick={() => setSelectedPage(prev => prev + 1)}>Siguiente</Button>
                        </Box>
                    )}

                    {!isReadOnly && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                onClick={() => setConfirmOpen(true)}
                                disabled={loading || transferItems.length === 0}
                                sx={{ background: farmaColors.gradients.primary, px: 5, py: 1.5, borderRadius: 2 }}
                            >
                                {loading ? "Guardando..." : "Guardar Traspaso"}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 5. Productos por Sucursal Report */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}` }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assessment sx={{ color: farmaColors.primary }} /> Lista de productos del Laboratorio
                        </Typography>
                    </Box>
                    {/* <Box sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Laboratorio"
                                    placeholder="Ej: INTI"
                                    size="small"
                                    value={reportLabInput}
                                    onChange={(e) => setReportLabInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFetchReport()}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={reportLoading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                                        onClick={handleFetchReport}
                                        disabled={reportLoading}
                                        sx={{ background: farmaColors.gradients.primary }}
                                    >
                                        Buscar Productos
                                    </Button>
                                    <Tooltip title="Reestablecer">
                                        <IconButton
                                            onClick={handleResetReport}
                                            sx={{
                                                bgcolor: farmaColors.alpha.secondary10,
                                                '&:hover': { bgcolor: farmaColors.alpha.secondary20 },
                                                color: 'text.secondary'
                                            }}
                                        >
                                            <RestartAlt />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box> */}

                    {reportData.length > 0 && (
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>SUCURSALES</TableCell>
                                        <TableCell colSpan={4} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>SAN MARTIN</TableCell>
                                        <TableCell colSpan={4} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>URUGUAY</TableCell>
                                        <TableCell colSpan={4} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>BRASIL</TableCell>
                                        <TableCell colSpan={4} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>TIQUIPAYA</TableCell>
                                        <TableCell colSpan={4} align="center" sx={{ fontWeight: 800, bgcolor: farmaColors.alpha.secondary10 }}>PACATA</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50", borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Producto</TableCell>

                                        {/* San Martin */}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Stock</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>P/U</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>N° Lote</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Vencimiento</TableCell>

                                        {/* Uruguay */}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Stock</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>P/U</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>N° Lote</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Vencimiento</TableCell>

                                        {/* Brasil */}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Stock</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>P/U</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>N° Lote</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Vencimiento</TableCell>

                                        {/* Tiquipaya */}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Stock</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>P/U</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>N° Lote</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Vencimiento</TableCell>

                                        {/* Pacata */}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Stock</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>P/U</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>N° Lote</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Vencimiento</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.slice(reportPage * 10, (reportPage + 1) * 10).map((row, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant="body2" fontWeight="700" color="primary">{row.codigoProducto}</Typography></TableCell>
                                            <TableCell sx={{ minWidth: 200, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                <Typography variant="body2" fontWeight="600">{row.nombreProducto}</Typography>
                                            </TableCell>

                                            {renderBranchCells(row.sucursal_SanMaterin)}
                                            {renderBranchCells(row.sucursal_Uruguay)}
                                            {renderBranchCells(row.sucursal_Brasil)}
                                            {renderBranchCells(row.sucursal_Tiquipaya)}
                                            {renderBranchCells(row.sucursal_Pacata, true)}

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {reportData.length > 10 && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button disabled={reportPage === 0} onClick={() => setReportPage(prev => prev - 1)}>Anterior</Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                Página {reportPage + 1} de {Math.ceil(reportData.length / 10)}
                            </Typography>
                            <Button disabled={reportPage >= Math.ceil(reportData.length / 10) - 1} onClick={() => setReportPage(prev => prev + 1)}>Siguiente</Button>
                        </Box>
                    )}

                </CardContent>
            </Card>

            {/* Copy Products from Purchase Dialog */}
            <Dialog
                open={copyDialogOpen}
                onClose={() => setCopyDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: farmaColors.secondary }}>
                    <ContentCopy color="primary" /> Copiar Productos de Compra
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* List of Purchases */}
                        <Grid item xs={12} md={5}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}>
                                1. Seleccione una Compra
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 450 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Fecha</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Número / Descr.</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Ver</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loadingPurchases ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : purchaseList.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">No hay compras recientes</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            [...purchaseList]
                                                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                                .slice(purchasePage * 10, (purchasePage + 1) * 10)
                                                .map((c) => (
                                                    <TableRow
                                                        key={c.codigo}
                                                        hover
                                                        selected={selectedPurchase === c.numeroCompra}
                                                        sx={{
                                                            '&.Mui-selected': { bgcolor: farmaColors.alpha.primary10 },
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => fetchPurchaseProducts(c.numeroCompra)}
                                                    >
                                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                            {c.fecha?.split('T')[0]}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.numeroCompra}</Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 150 }}>
                                                                {c.descripcion}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                color={selectedPurchase === c.numeroCompra ? "primary" : "default"}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {purchaseList.length > 10 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                                    <Button size="small" disabled={purchasePage === 0} onClick={() => setPurchasePage(p => p - 1)}>Ant.</Button>
                                    <Typography variant="caption" sx={{ alignSelf: 'center' }}>{purchasePage + 1} / {Math.ceil(purchaseList.length / 10)}</Typography>
                                    <Button size="small" disabled={purchasePage >= Math.ceil(purchaseList.length / 10) - 1} onClick={() => setPurchasePage(p => p + 1)}>Sig.</Button>
                                </Box>
                            )}
                        </Grid>

                        {/* Purchase Details */}
                        <Grid item xs={12} md={7}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}>
                                2. Productos de la Compra
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 450 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Código / Producto</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Lote</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Stock</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Vence</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loadingPurchaseProducts ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                                    <CircularProgress size={30} />
                                                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">Cargando productos...</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : !selectedPurchase ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                                    <Typography variant="body2" color="text.disabled">Seleccione una compra de la izquierda</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : purchaseProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                                    <Typography variant="body2" color="text.secondary">Esta compra no tiene productos vinculados</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            purchaseProducts.map((p, idx) => (
                                                <TableRow key={idx} hover>
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: farmaColors.primary }}>{p.codigoProducto}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.producto}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>ID: {p.lote_ID}</Typography>
                                                        <Typography variant="caption" sx={{ display: 'block' }}>{p.numeroLote}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip label={p.stockProducto} size="small" color={p.stockProducto > 0 ? "success" : "default"} variant="outlined" />
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'error.main', fontWeight: 600, fontSize: '0.75rem' }}>
                                                        {p.fechaVencimiento?.split('T')[0]}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, bgcolor: 'grey.50' }}>
                    <Button onClick={() => setCopyDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Cancelar
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        onClick={() => {
                            copyProductsFromPurchase();
                            setCopyDialogOpen(false);
                        }}
                        variant="contained"
                        disabled={purchaseProducts.length === 0}
                        startIcon={<ContentCopy />}
                        sx={{ background: farmaColors.gradients.primary, px: 4, fontWeight: 700, borderRadius: 2 }}
                    >
                        Copiar Selección a Traspaso
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                    <WarningIcon color="warning" /> Confirmar Guardado
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea guardar este traspaso? Una vez guardado ya no podrá editar ni modificar la relación de productos.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        No, cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            setConfirmOpen(false);
                            handleConfirmSave();
                        }}
                        variant="contained"
                        color="primary"
                        sx={{ background: farmaColors.gradients.primary, px: 3, fontWeight: 700 }}
                    >
                        Sí, Guardar Traspaso
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddProductsToTransferSection;
