// src/modules/purchases/components/CreatePurchaseSection.jsx
// Cabecera de nueva compra — paso 1 del flujo

import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Divider,
    CircularProgress,
} from "@mui/material";
import {
    Description,
    CalendarToday,
    Store,
    Business,
    Receipt,
    Payment,
    Info,
    ShoppingCart,
    Save,
    Cancel,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreatePurchaseSection = ({
    purchaseData,
    setPurchaseData,
    onCreate,
    catalogs,
    loading,
    loadingOrders,
    onCancel,
}) => {
    const updateField = (field, value) => {
        setPurchaseData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card sx={{ width: "100%", borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.05)", border: `1px solid ${farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)"}` }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                        Nueva Compra
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Complete la información para registrar la compra al proveedor.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    {/* Descripción */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Título / Descripción"
                            value={purchaseData.descripcion || ""}
                            onChange={(e) => updateField("descripcion", e.target.value)}
                            InputProps={{
                                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Fecha */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            required
                            label="Fecha de Compra"
                            type="date"
                            value={purchaseData.fechaCompra || ""}
                            onChange={(e) => updateField("fechaCompra", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <CalendarToday sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Sucursal */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Sucursal"
                            value={purchaseData.sucursalId || ""}
                            onChange={(e) => updateField("sucursalId", e.target.value)}
                            InputProps={{
                                startAdornment: <Store sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.sucursales || []).map(s => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Proveedor */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Laboratorio / Proveedor"
                            value={purchaseData.codigoProveedor || ""}
                            onChange={(e) => updateField("codigoProveedor", e.target.value)}
                            InputProps={{
                                startAdornment: <Business sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.proveedores || []).map(p => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Número factura (referencia) */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Número de Factura (referencia)"
                            value={purchaseData.referencia || ""}
                            onChange={(e) => updateField("referencia", e.target.value)}
                            InputProps={{
                                startAdornment: <Receipt sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Forma de pago */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Forma de Pago"
                            value={purchaseData.tipoFormaPago || ""}
                            onChange={(e) => updateField("tipoFormaPago", e.target.value)}
                            InputProps={{
                                startAdornment: <Payment sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.formasPago || []).map(f => (
                                <MenuItem key={f.tipoFormaPago} value={f.tipoFormaPago}>
                                    {f.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Detalle forma de pago */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Detalle Forma de Pago"
                            value={purchaseData.detalleFormaPago || ""}
                            onChange={(e) => updateField("detalleFormaPago", e.target.value)}
                            InputProps={{
                                startAdornment: <Info sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Pedido relacionado — carga dinámica según sucursal */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label={loadingOrders ? "Cargando pedidos..." : "Pedido Relacionado (opcional)"}
                            value={purchaseData.codigoPedido || ""}
                            onChange={(e) => updateField("codigoPedido", e.target.value)}
                            disabled={!purchaseData.sucursalId || loadingOrders}
                            helperText={!purchaseData.sucursalId ? "Seleccione una sucursal para ver pedidos" : ""}
                            InputProps={{
                                startAdornment: <ShoppingCart sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">
                                {loadingOrders ? "Buscando pedidos..." : "Sin pedido relacionado"}
                            </MenuItem>
                            {(catalogs.pedidos || []).map(p => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.numeroPedido} — {p.descripcion || "Sin descripción"}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Botones */}
                    <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            disabled={loading}
                            onClick={onCancel || (() => setPurchaseData({
                                descripcion: "",
                                fechaCompra: "",
                                sucursalId: "",
                                tipoFormaPago: "",
                                detalleFormaPago: "",
                                codigoProveedor: "",
                                referencia: "",
                                codigoPedido: ""
                            }))}
                            startIcon={<Cancel />}
                            sx={{
                                borderColor: farmaColors.secondary,
                                color: farmaColors.secondary,
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                "&:hover": {
                                    borderColor: farmaColors.secondary,
                                    bgcolor: farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.05)",
                                },
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={onCreate}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: 2,
                                background: farmaColors.gradients?.primary || farmaColors.primary,
                                fontWeight: 700,
                                fontSize: "1rem",
                                boxShadow: "0 4px 12px rgba(204,108,6,0.2)",
                            }}
                        >
                            {loading ? "Creando..." : "Crear Compra"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreatePurchaseSection;