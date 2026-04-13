// src/modules/purchases/components/InvoiceDataSection.jsx
// Datos de la factura de compra — sección independiente, paso 3 del flujo

import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Chip,
} from "@mui/material";
import {
    Receipt,
    CalendarToday,
    Badge,
    Business,
    ShoppingCart,
    Payments,
    Discount,
    MonetizationOn,
    Save,
    AssignmentTurnedIn,
    ArrowBack,
    HelpOutline,
    CheckCircleOutline,
    Inventory,
    LocalPostOffice,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const InvoiceDataSection = ({
    createdPurchase,
    invoiceData,
    setInvoiceData,
    handleSaveInvoice,
    handleTerminarCompra,
    loading,
    setViewState,
}) => {
    const [isFinished, setIsFinished] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [finishing, setFinishing] = useState(false);

    const updateField = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirmTerminar = async () => {
        setFinishing(true);
        try {
            const ok = await handleTerminarCompra();
            if (ok) {
                setIsFinished(true);
                setConfirmOpen(false);
            }
        } finally {
            setFinishing(false);
        }
    };

    if (!createdPurchase) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Cabecera resumen */}
            <Card sx={{
                borderRadius: 3,
                bgcolor: farmaColors.alpha?.primary10 || "rgba(204,108,6,0.05)",
                border: `1px solid ${farmaColors.alpha?.primary20 || "rgba(204,108,6,0.1)"}`,
                boxShadow: "none",
            }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {!isFinished && (
                                <Tooltip title="Volver a productos">
                                    <IconButton size="small" onClick={() => setViewState("adding_products")}>
                                        <ArrowBack fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Typography variant="h6" sx={{ color: farmaColors.secondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                                <CheckCircleOutline sx={{ color: farmaColors.primary }} />
                                Datos de Facturación
                            </Typography>
                        </Box>
                        <Chip
                            label={createdPurchase.numeroCompra || `#${createdPurchase.comprobanteCompra_ID}`}
                            sx={{ bgcolor: farmaColors.primary, color: "white", fontWeight: 800 }}
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarToday sx={{ color: "action.active", fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha Compra</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {createdPurchase.fecha?.split('T')[0] || "-"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Inventory sx={{ color: "action.active", fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Descripción</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {createdPurchase.descripcion || "Sin descripción"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LocalPostOffice sx={{ color: "action.active", fontSize: 18 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">ID Compra</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.primary }}>
                                        {createdPurchase.comprobanteCompra_ID}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Formulario de factura */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                                Factura del Proveedor
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Registre los datos de la factura entregada por el proveedor.
                            </Typography>
                        </Box>
                        {!isFinished && (
                            <Tooltip title="Guardar factura">
                                <IconButton
                                    onClick={handleSaveInvoice}
                                    disabled={loading}
                                    sx={{
                                        color: "white",
                                        bgcolor: farmaColors.primary,
                                        "&:hover": { bgcolor: farmaColors.secondary },
                                        "&.Mui-disabled": { bgcolor: "#e0e0e0" },
                                    }}
                                >
                                    {loading ? <CircularProgress size={22} color="inherit" /> : <Save />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número de Factura"
                                size="small"
                                value={invoiceData.numeroFactura || ""}
                                onChange={(e) => updateField("numeroFactura", e.target.value)}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Receipt sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Fecha de Factura"
                                type="date"
                                size="small"
                                value={invoiceData.fecha || ""}
                                onChange={(e) => updateField("fecha", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <CalendarToday sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="NIT Proveedor"
                                size="small"
                                value={invoiceData.nit || ""}
                                onChange={(e) => updateField("nit", e.target.value)}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Badge sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre del Proveedor"
                                size="small"
                                value={invoiceData.nombreProveedor || ""}
                                onChange={(e) => updateField("nombreProveedor", e.target.value)}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Business sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Número de Pedido (referencia)"
                                size="small"
                                value={invoiceData.numeroPedido || ""}
                                onChange={(e) => updateField("numeroPedido", e.target.value)}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <ShoppingCart sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Total Compra"
                                type="number"
                                size="small"
                                value={invoiceData.totalCompra === undefined ? "" : invoiceData.totalCompra}
                                onChange={(e) => updateField("totalCompra", e.target.value === "" ? "" : Number(e.target.value))}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Payments sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Desc. Comercial"
                                type="number"
                                size="small"
                                value={invoiceData.descuentoComercial === undefined ? "" : invoiceData.descuentoComercial}
                                onChange={(e) => updateField("descuentoComercial", e.target.value === "" ? "" : Number(e.target.value))}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Discount sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Desc. Especial"
                                type="number"
                                size="small"
                                value={invoiceData.descuentoEspecial === undefined ? "" : invoiceData.descuentoEspecial}
                                onChange={(e) => updateField("descuentoEspecial", e.target.value === "" ? "" : Number(e.target.value))}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <Discount sx={{ color: "action.active", mr: 1, fontSize: 20 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Importe a Pagar"
                                type="number"
                                size="small"
                                value={invoiceData.importePagar === undefined ? "" : invoiceData.importePagar}
                                onChange={(e) => updateField("importePagar", e.target.value === "" ? "" : Number(e.target.value))}
                                InputProps={{
                                    readOnly: isFinished,
                                    startAdornment: <MonetizationOn sx={{ color: farmaColors.primary, mr: 1, fontSize: 20 }} />
                                }}
                                sx={{ bgcolor: isFinished ? undefined : farmaColors.alpha?.primary10 || "rgba(204,108,6,0.05)" }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Botón terminar compra */}
            {!isFinished && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AssignmentTurnedIn />}
                        onClick={() => setConfirmOpen(true)}
                        sx={{
                            px: 6,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            background: farmaColors.gradients?.primary || farmaColors.primary,
                            boxShadow: "0 6px 16px rgba(204,108,6,0.25)",
                            "&:hover": { transform: "translateY(-2px)" },
                        }}
                    >
                        Terminar Compra
                    </Button>
                </Box>
            )}

            {isFinished && (
                <Box sx={{
                    p: 3, borderRadius: 2, textAlign: "center",
                    bgcolor: "rgba(76,175,80,0.1)", border: "2px solid #4CAF50"
                }}>
                    <CheckCircleOutline sx={{ fontSize: 48, color: "#4CAF50", mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#388e3c" }}>
                        ¡Compra finalizada correctamente!
                    </Typography>
                </Box>
            )}

            {/* Diálogo de confirmación */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: farmaColors.secondary }}>
                    <HelpOutline color="primary" /> Confirmar Cierre
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Desea terminar la compra? Esta acción fijará los datos y no podrá modificarlos posteriormente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} disabled={finishing}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmTerminar}
                        variant="contained"
                        color="primary"
                        disabled={finishing}
                        startIcon={finishing ? <CircularProgress size={18} color="inherit" /> : null}
                    >
                        Sí, Terminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvoiceDataSection;