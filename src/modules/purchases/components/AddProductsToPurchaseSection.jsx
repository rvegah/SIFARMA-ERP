import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, Typography, Grid, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Paper, Divider, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, InputAdornment, Tooltip, CircularProgress,
    List, ListItem, ListItemText, Autocomplete, Stack
} from "@mui/material";
import {
    Add, Delete, Search, Save, Receipt, LocalShipping,
    ShoppingBag, Info, CheckCircle, Visibility, Edit,
    CalendarToday, Store, Inventory, LocalPostOffice,
    CheckCircleOutline, AssignmentTurnedIn, HelpOutline,
    Badge, Payments, Discount, MonetizationOn, Business,
    ShoppingCart
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { useSnackbar } from "notistack";
import purchaseService from "../services/purchaseService";

const AddProductsToPurchaseSection = ({
    createdPurchase,
    purchaseItems,
    addItemRow,
    addPurchaseItem,
    removeItemRow,
    updateItemRow,
    searchProducts,
    searchLaboratorios,
    handleSaveProducts,
    invoiceData,
    setInvoiceData,
    handleSaveInvoice,
    catalogs,
    loading,
    loadingSearch
}) => {
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
    const [editingItem, setEditingItem] = useState(null);

    // Product Search Modal (Inside Product Modal)
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchFilters, setSearchFilters] = useState({ codigo: "", nombre: "" });
    const [searchResults, setSearchResults] = useState([]);

    // Lab Autocomplete State
    const [labOptions, setLabOptions] = useState([]);
    const [labLoading, setLabLoading] = useState(false);
    const [labSearchText, setLabSearchText] = useState("");

    // Finish Purchase State
    const [isFinished, setIsFinished] = useState(false);
    const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Load Labs when searching
    useEffect(() => {
        if (labSearchText.length < 3) {
            setLabOptions([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setLabLoading(true);
            try {
                const res = await searchLaboratorios(labSearchText);
                setLabOptions(res || []);
            } catch (error) {
                console.error("Error fetching labs in UI:", error);
            } finally {
                setLabLoading(false);
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [labSearchText, searchLaboratorios]);

    const handleOpenAdd = () => {
        const newItem = {
            id: Date.now(),
            codigoProducto: null,
            referenciaNombre: "",
            codigo: "",
            nombreGenerico: "",
            concentracion: "",
            nombreComercial: "",
            presentacion: "",
            codigoLaboratorio: "",
            nombreLaboratorio: "",
            codigoIndustria: "",
            numeroLote: "",
            fechaVencimiento: "",
            cantidad: 1,
            numeroBlister: 0,
            cantidadUnidadBlister: 0,
            factorUnidad: 0,
            costoUnitario: 0,
            precioUnitario: 0,
            precioCaja: 0
        };
        setEditingItem(newItem);
        setModalMode("add");
        setModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem({ ...item });
        setModalMode("edit");
        setModalOpen(true);
    };

    const handleOpenView = (item) => {
        setEditingItem({ ...item });
        setModalMode("view");
        setModalOpen(true);
    };

    const handleSaveItem = () => {
        if (modalMode === "add") {
            addPurchaseItem(editingItem);
        } else if (modalMode === "edit") {
            // Update all fields of the existing item
            Object.keys(editingItem).forEach(key => {
                updateItemRow(editingItem.id, key, editingItem[key]);
            });
        }
        setModalOpen(false);
    };

    const updateEditingField = (field, value) => {
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = async () => {
        const results = await searchProducts(searchFilters);
        setSearchResults(results);
    };

    const handleSelectProduct = (product) => {
        updateEditingField("codigoProducto", product.producto_ID || product.id);
        updateEditingField("referenciaNombre", product.nombre || product.producto);
        setSearchOpen(false);
    };

    const updateInvoiceField = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    const getSucursalName = () => {
        if (!createdPurchase?.sucursal_ID) return "-";
        const suc = (catalogs.sucursales || []).find(s => s.sucursal_ID === createdPurchase.sucursal_ID);
        return suc?.nombreSucursal || `Sucursal ${createdPurchase.sucursal_ID}`;
    };

    const handleTerminarCompra = async () => {
        setFinishing(true);
        try {
            const res = await purchaseService.cambiarEstadoCompra(createdPurchase.comprobanteCompra_ID, "ENV");
            if (res.exitoso) {
                enqueueSnackbar("Compra terminada exitosamente", { variant: "success" });
                setIsFinished(true);
                setFinishConfirmOpen(false);
            } else {
                enqueueSnackbar(res.mensaje || "Error al terminar compra", { variant: "error" });
            }
        } catch (error) {
            console.error("Error terminando compra:", error);
            enqueueSnackbar("Error de red", { variant: "error" });
        } finally {
            setFinishing(false);
        }
    };

    // Helper to render field in modal based on mode
    const renderModalField = (label, field, type = "text", selectOptions = null) => {
        const value = editingItem?.[field] || (type === "number" ? 0 : "");

        if (modalMode === "view") {
            let displayValue = value;
            if (selectOptions) {
                const opt = selectOptions.find(o => String(o.id) === String(value));
                displayValue = opt ? opt.nombre : value;
            }
            return (
                <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{displayValue || "-"}</Typography>
                </Box>
            );
        }

        if (type === "select") {
            return (
                <TextField
                    select
                    fullWidth
                    label={label}
                    size="small"
                    value={value}
                    onChange={(e) => updateEditingField(field, e.target.value)}
                >
                    <MenuItem value="">Seleccione...</MenuItem>
                    {(selectOptions || []).map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.nombre}</MenuItem>
                    ))}
                </TextField>
            );
        }

        return (
            <TextField
                fullWidth
                label={label}
                size="small"
                type={type}
                value={value === undefined || value === null ? "" : value}
                onChange={(e) => updateEditingField(field, type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                InputLabelProps={type === "date" ? { shrink: true } : {}}
            />
        );
    };

    if (!createdPurchase) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 1. Detalle de la Compra (Design Replica) */}
            <Card sx={{
                borderRadius: 3,
                bgcolor: farmaColors.alpha.primary10,
                border: `1px solid ${farmaColors.alpha.primary20}`,
                boxShadow: "none"
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                            <CheckCircleOutline sx={{ color: farmaColors.primary }} /> Detalle de la Compra
                        </Typography>
                        <Typography variant="h6" sx={{ color: farmaColors.primary, fontWeight: 800 }}>
                            {createdPurchase.numeroCompra}
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Store color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Sucursal:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{getSucursalName()}</Typography>
                                </Box>
                            </Box>
                        </Grid> */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdPurchase.fecha?.split('T')[0]}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Inventory color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Descripción:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{createdPurchase.descripcion || "Sin descripción"}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalPostOffice color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">ID Compra:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.primary }}>{createdPurchase.comprobanteCompra_ID}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 2. Products Table Section */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingBag sx={{ color: farmaColors.primary }} /> Productos de la Compra
                        </Typography>
                        {!isFinished && (
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Añadir Producto">
                                    <IconButton
                                        onClick={handleOpenAdd}
                                        sx={{
                                            color: farmaColors.primary,
                                            bgcolor: farmaColors.alpha.primary10,
                                            '&:hover': { bgcolor: farmaColors.alpha.primary20 }
                                        }}
                                    >
                                        <Add />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Guardar Productos">
                                    <IconButton
                                        onClick={handleSaveProducts}
                                        disabled={loading || purchaseItems.length === 0}
                                        sx={{
                                            color: 'white',
                                            bgcolor: farmaColors.primary,
                                            '&:hover': { bgcolor: farmaColors.secondary },
                                            '&.Mui-disabled': { bgcolor: '#e0e0e0' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : <Save />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </Box>
                    <Divider />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10, height: 56 }}>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Código</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Nombre Genérico</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Concentración</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Presentación</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Vencimiento</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Lote</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary, textAlign: 'center' }}>N° Blis.</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary, textAlign: 'center' }}>Cant. Blis.</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary, textAlign: 'center' }}>F. Unidad</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary, textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ bgcolor: "white" }}>
                                {purchaseItems.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.codigo || "-"}</TableCell>
                                        <TableCell>{item.nombreGenerico || "-"}</TableCell>
                                        <TableCell>{item.concentracion || "-"}</TableCell>
                                        <TableCell>{item.presentacion || "-"}</TableCell>
                                        <TableCell>{item.fechaVencimiento || "-"}</TableCell>
                                        <TableCell>{item.numeroLote || "-"}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{item.numeroBlister || 0}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{item.cantidadUnidadBlister || 0}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{item.factorUnidad || 0}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title="Ver">
                                                    <IconButton size="small" color="info" onClick={() => handleOpenView(item)}>
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {!isFinished && (
                                                    <>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton size="small" color="error" onClick={() => removeItemRow(item.id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {purchaseItems.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay productos añadidos. Use el ícono "+" para comenzar.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 3. Invoice / Factura Section */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Receipt sx={{ color: farmaColors.primary }} /> Datos de Facturación
                        </Typography>
                        {!isFinished && (
                            <Tooltip title="Guardar Factura">
                                <IconButton
                                    onClick={handleSaveInvoice}
                                    disabled={loading}
                                    sx={{
                                        color: 'white',
                                        bgcolor: farmaColors.primary,
                                        '&:hover': { bgcolor: farmaColors.secondary },
                                        '&.Mui-disabled': { bgcolor: '#e0e0e0' }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : <Save />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número Factura"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Receipt sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.numeroFactura}
                                onChange={(e) => updateInvoiceField("numeroFactura", e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Fecha"
                                type="date"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <CalendarToday sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.fecha}
                                onChange={(e) => updateInvoiceField("fecha", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="NIT"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Badge sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.nit}
                                onChange={(e) => updateInvoiceField("nit", e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre Proveedor"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Business sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.nombreProveedor}
                                onChange={(e) => updateInvoiceField("nombreProveedor", e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Número Pedido"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <ShoppingCart sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.numeroPedido}
                                onChange={(e) => updateInvoiceField("numeroPedido", e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Total Compra"
                                type="number"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Payments sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.totalCompra === undefined ? "" : invoiceData.totalCompra}
                                onChange={(e) => updateInvoiceField("totalCompra", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Desc. Comercial"
                                type="number"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Discount sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.descuentoComercial === undefined ? "" : invoiceData.descuentoComercial}
                                onChange={(e) => updateInvoiceField("descuentoComercial", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Desc. Especial"
                                type="number"
                                size="small"
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Discount sx={{ color: "action.active", mr: 1 }} />
                                }}
                                value={invoiceData.descuentoEspecial === undefined ? "" : invoiceData.descuentoEspecial}
                                onChange={(e) => updateInvoiceField("descuentoEspecial", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Importe a Pagar"
                                type="number"
                                size="small"
                                value={invoiceData.importePagar === undefined ? "" : invoiceData.importePagar}
                                onChange={(e) => updateInvoiceField("importePagar", e.target.value === "" ? "" : Number(e.target.value))}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <MonetizationOn sx={{ color: farmaColors.primary, mr: 1 }} />
                                }}
                                sx={{ bgcolor: farmaColors.alpha.primary10 }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Final Action Button */}
            {!isFinished && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AssignmentTurnedIn />}
                        onClick={() => setFinishConfirmOpen(true)}
                        sx={{
                            px: 6,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            background: farmaColors.gradients.primary,
                            boxShadow: '0 8px 16px rgba(204, 108, 6, 0.2)',
                            '&:hover': { background: farmaColors.gradients.primary, transform: 'translateY(-2px)' }
                        }}
                    >
                        Terminar Compra
                    </Button>
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={finishConfirmOpen} onClose={() => setFinishConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: farmaColors.secondary }}>
                    <HelpOutline color="primary" /> Confirmar Acción
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Desea terminar la compra? Esta acción fijará los datos y no podrá modificarlos posteriormente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setFinishConfirmOpen(false)} disabled={finishing}>No</Button>
                    <Button
                        onClick={handleTerminarCompra}
                        variant="contained"
                        color="primary"
                        disabled={finishing}
                        startIcon={finishing ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Product Modal (Add/Edit/View) */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: farmaColors.primary, color: 'white' }}>
                    {modalMode === "add" ? "Añadir Producto" : modalMode === "edit" ? "Editar Producto" : "Detalle del Producto"}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            {modalMode === "view" ? (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Referencia Producto</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: farmaColors.primary }}>{editingItem?.referenciaNombre || "-"}</Typography>
                                </Box>
                            ) : (
                                <TextField
                                    fullWidth
                                    label="Referencia Producto"
                                    size="small"
                                    value={editingItem?.referenciaNombre || ""}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchOpen(true)}
                                                >
                                                    <Search color="primary" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Código", "codigo")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Nombre Genérico", "nombreGenerico")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Concentración", "concentracion")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Presentación", "presentacion")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Nombre Comercial", "nombreComercial")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {modalMode === "view" ? (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Laboratorio</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{editingItem?.nombreLaboratorio || "-"}</Typography>
                                </Box>
                            ) : (
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={labOptions}
                                    loading={labLoading}
                                    getOptionLabel={(option) => typeof option === "string" ? option : option.nombreLaboratorio || ""}
                                    onInputChange={(event, newInputValue) => setLabSearchText(newInputValue)}
                                    value={labOptions.find(l => l.laboratorio_ID === editingItem?.codigoLaboratorio) || (editingItem?.nombreLaboratorio ? { nombreLaboratorio: editingItem.nombreLaboratorio, laboratorio_ID: editingItem.codigoLaboratorio } : null)}
                                    onChange={(event, newValue) => {
                                        updateEditingField("codigoLaboratorio", newValue?.laboratorio_ID || "");
                                        updateEditingField("nombreLaboratorio", newValue?.nombreLaboratorio || "");
                                    }}
                                    isOptionEqualToValue={(option, value) => option.laboratorio_ID === value.laboratorio_ID}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Laboratorio"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {labLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Procedencia", "codigoIndustria", "select", catalogs.industrias)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Lote", "numeroLote")}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderModalField("Vencimiento", "fechaVencimiento", "date")}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {renderModalField("Cantidad", "cantidad", "number")}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {renderModalField("N° Blister", "numeroBlister", "number")}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {renderModalField("Cant. Blister", "cantidadUnidadBlister", "number")}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {renderModalField("Factor Unidad", "factorUnidad", "number")}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            {renderModalField("Costo", "costoUnitario", "number")}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            {renderModalField("Precio", "precioUnitario", "number")}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            {renderModalField("Total", "precioCaja", "number")}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ fontWeight: 600 }}>Cerrar</Button>
                    {modalMode !== "view" && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveItem}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            {modalMode === "add" ? "Añadir a Tabla" : "Guardar Cambios"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Internal Product Search Modal */}
            <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: farmaColors.secondary, color: 'white' }}>
                    Buscar Producto Referencia
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, pt: 1 }}>
                        <TextField
                            label="Código"
                            size="small"
                            value={searchFilters.codigo}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, codigo: e.target.value }))}
                        />
                        <TextField
                            label="Nombre"
                            fullWidth
                            size="small"
                            value={searchFilters.nombre}
                            onChange={(e) => setSearchFilters(prev => ({ ...prev, nombre: e.target.value }))}
                        />
                        <Button variant="contained" onClick={handleSearch} disabled={loadingSearch}>
                            {loadingSearch ? <CircularProgress size={24} color="inherit" /> : <Search />}
                        </Button>
                    </Box>
                    <Divider />
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {searchResults.map((p) => (
                            <ListItem key={p.producto_ID || p.id} button onClick={() => handleSelectProduct(p)}>
                                <ListItemText
                                    primary={p.nombre || p.producto}
                                    secondary={`Código: ${p.codigo || p.codigoProducto} | Concentración: ${p.concentracion || "-"}`}
                                />
                                <CheckCircle color="primary" sx={{ opacity: 0.5 }} />
                            </ListItem>
                        ))}
                        {searchResults.length === 0 && !loadingSearch && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">No se encontraron resultados.</Typography>
                            </Box>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSearchOpen(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddProductsToPurchaseSection;
