// src/modules/purchases/components/AddProductsToInventoryOutputSection.jsx
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
    Warning as WarningIcon
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const AddProductsToInventoryOutputSection = ({
    createdOutput,
    outputItems,
    isReadOnly,
    loading,
    loadingSearch,
    searchFilters,
    setSearchFilters,
    searchResults,
    searchProducts,
    addOutputItem,
    updateOutputItem,
    removeOutputItem,
    handleConfirmSave,
    setViewState
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [searchPage, setSearchPage] = useState(0);
    const [selectedPage, setSelectedPage] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const rowsPerPage = 10;

    const handleSearch = () => {
        setSearchPage(0);
        searchProducts();
    };

    const handleAdd = (prod) => {
        // We add with default quantity 1 and no observation
        addOutputItem(prod, 1, "");
        enqueueSnackbar && enqueueSnackbar("Producto añadido a la lista", { variant: "success", autoHideDuration: 1000 });
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
                                <CheckCircleOutline sx={{ color: farmaColors.primary }} /> Detalle de la Salida
                            </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: farmaColors.primary, fontWeight: 800 }}>
                            {createdOutput?.numeroSalida || "---"}
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdOutput?.fechaSalida?.split('T')[0]}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Descripción:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdOutput?.descripcion || "Sin descripción"}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ConfirmationNumber sx={{ color: "action.active", fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">ID Salida:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.primary }}>{createdOutput?.salida_ID}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 2. Búsqueda de Productos */}
            {!isReadOnly && (
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, mb: 3, fontWeight: 600 }}>
                            Búsqueda de Productos
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
                                                const pId = p.producto_ID || p.id;
                                                const isAdded = outputItems.some(item => (item.producto_ID || item.id) === pId && item.numeroLote === p.numeroLote);
                                                return (
                                                    <TableRow key={`${pId}-${p.numeroLote}-${idx}`} hover>
                                                        <TableCell>{p.codigoProducto || p.codigo}</TableCell>
                                                        <TableCell sx={{ maxWidth: 400 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {p.producto || p.nombreProducto || p.nombre}
                                                                {p.presentacion ? ` - ${p.presentacion}` : ""}
                                                                {p.unidadMedida ? ` - ${p.unidadMedida}` : ""}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                {p.laboratorio} | {p.linea}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Lote: {p.numeroLote || "S/N"}
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
                                                                    onClick={() => addOutputItem(p, 1, "")}
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

            {/* 4. Productos de la Salida */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${farmaColors.alpha.secondary10}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingBag sx={{ color: farmaColors.primary }} /> Productos de la Salida
                        </Typography>
                        <Chip label={`${outputItems.length} items`} color="primary" size="small" />
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
                                {outputItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isReadOnly ? 4 : 5} align="center" sx={{ py: 6 }}>
                                            <InventoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1, opacity: 0.5 }} />
                                            <Typography color="text.secondary">No hay productos añadidos aún.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    outputItems
                                        .slice(selectedPage * rowsPerPage, (selectedPage + 1) * rowsPerPage)
                                        .map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.secondary }}>
                                                        {item.producto || item.nombreProducto || item.nombre}
                                                        {item.presentacion ? ` - ${item.presentacion}` : ""}
                                                        {item.unidadMedida ? ` - ${item.unidadMedida}` : ""}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                                        {item.laboratorio || ""} {item.linea ? `| ${item.linea}` : ""}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                                                        Lote: {item.numeroLote || "S/N"}
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
                                                            value={item.cantidad === undefined ? "" : item.cantidad}
                                                            onChange={(e) => updateOutputItem(idx, "cantidad", e.target.value === "" ? "" : Number(e.target.value))}
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
                                                            onChange={(e) => updateOutputItem(idx, "observaciones", e.target.value)}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.observaciones || "-"}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                {!isReadOnly && (
                                                    <TableCell align="center">
                                                        <IconButton color="error" size="small" onClick={() => removeOutputItem(idx)}>
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

                    {outputItems.length > rowsPerPage && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button disabled={selectedPage === 0} onClick={() => setSelectedPage(prev => prev - 1)}>Anterior</Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                Página {selectedPage + 1} de {Math.ceil(outputItems.length / rowsPerPage)}
                            </Typography>
                            <Button disabled={selectedPage >= Math.ceil(outputItems.length / rowsPerPage) - 1} onClick={() => setSelectedPage(prev => prev + 1)}>Siguiente</Button>
                        </Box>
                    )}

                    {!isReadOnly && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                onClick={() => setConfirmOpen(true)}
                                disabled={loading || outputItems.length === 0}
                                sx={{ background: farmaColors.gradients.primary, px: 5, py: 1.5, borderRadius: 2 }}
                            >
                                {loading ? "Guardando..." : "Guardar Salida"}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                    <WarningIcon color="warning" /> Confirmar Guardado
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea guardar esta salida? Una vez guardada ya no podrá editar ni modificar la información.
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
                        Sí, Guardar Salida
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddProductsToInventoryOutputSection;
