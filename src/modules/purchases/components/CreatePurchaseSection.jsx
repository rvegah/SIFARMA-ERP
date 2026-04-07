// src/modules/purchases/components/CreatePurchaseSection.jsx
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
    CircularProgress
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
    Cancel
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreatePurchaseSection = ({ purchaseData, setPurchaseData, onCreate, catalogs, loading, loadingOrders }) => {

    const updateField = (field, value) => {
        setPurchaseData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card sx={{ width: "100%", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}> 
                    <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                        Nueva Compra
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Complete la información para generar el registro de compra.
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Título / Descripción"
                            value={purchaseData.descripcion || ""}
                            onChange={(e) => updateField("descripcion", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Fecha de Compra */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha de Compra"
                            type="date"
                            value={purchaseData.fechaCompra || ""}
                            onChange={(e) => updateField("fechaCompra", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
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
                            label="Sucursal"
                            value={purchaseData.sucursalId}
                            onChange={(e) => updateField("sucursalId", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Store sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.sucursales || []).map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Laboratorio / Proveedor */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Laboratorio / Proveedor"
                            value={purchaseData.codigoProveedor}
                            onChange={(e) => updateField("codigoProveedor", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Business sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.proveedores || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Numero Factura (Referencia) */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Número de Factura"
                            value={purchaseData.referencia}
                            onChange={(e) => updateField("referencia", e.target.value)}
                            InputProps={{
                                startAdornment: <Receipt sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Forma de Pago */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Forma de Pago"
                            value={purchaseData.tipoFormaPago}
                            onChange={(e) => updateField("tipoFormaPago", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Payment sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">Seleccione...</MenuItem>
                            {(catalogs.formasPago || []).map((f) => (
                                <MenuItem key={f.tipoFormaPago} value={f.tipoFormaPago}>
                                    {f.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Detalle Forma de Pago */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Detalle Forma de Pago"
                            value={purchaseData.detalleFormaPago}
                            onChange={(e) => updateField("detalleFormaPago", e.target.value)}
                            InputProps={{
                                startAdornment: <Info sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Pedido (Dinámico) */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label={loadingOrders ? "Cargando pedidos..." : "Pedido Relacionado"}
                            value={purchaseData.codigoPedido}
                            onChange={(e) => updateField("codigoPedido", e.target.value)}
                            required
                            disabled={!purchaseData.sucursalId || loadingOrders}
                            helperText={!purchaseData.sucursalId ? "Selecciona una sucursal para ver pedidos" : ""}
                            InputProps={{
                                startAdornment: <ShoppingCart sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="">
                                {loadingOrders ? "Buscando..." : "Seleccione..."}
                            </MenuItem>
                            {(catalogs.pedidos || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.numeroPedido} - {p.descripcion || "Sin descripción"}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            disabled={loading}
                            onClick={() => setPurchaseData({
                                descripcion: "",
                                fechaCompra: "",
                                sucursalId: "",
                                tipoFormaPago: "",
                                detalleFormaPago: "",
                                codigoProveedor: "",
                                referencia: "",
                                codigoPedido: ""
                            })}
                            startIcon={<Cancel />}
                            sx={{
                                borderColor: farmaColors.secondary,
                                color: farmaColors.secondary,
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                "&:hover": {
                                    borderColor: farmaColors.secondaryDark,
                                    bgcolor: farmaColors.alpha.secondary10,
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
                                background: farmaColors.gradients.primary,
                                fontWeight: 700,
                                fontSize: "1rem",
                                boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
                            }}
                        >
                            {loading ? "Registrando..." : "Guardar Compra"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreatePurchaseSection;
