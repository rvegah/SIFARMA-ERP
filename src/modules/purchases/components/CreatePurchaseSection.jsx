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
import { ShoppingCart } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreatePurchaseSection = ({ purchaseData, setPurchaseData, onCreate, catalogs, loading, loadingOrders }) => {

    const updateField = (field, value) => {
        setPurchaseData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card sx={{ maxWidth: 800, mx: "auto", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    {/* <Box sx={{
                                    background: farmaColors.gradients.primary,
                                    p: 1.5,
                                    borderRadius: 3,
                                    display: 'flex',
                                    boxShadow: "0 4px 15px rgba(0,82,155,0.2)"
                                }}>
                                    <Output sx={{ color: "white", fontSize: 30 }} />
                                </Box> */}
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Nueva Compra
                        </Typography>
                        {/* <Typography variant="body2" color="text.secondary">
                                        Complete la información para generar el registro de salida.
                                    </Typography> */}
                    </Box>
                </Box>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    {/* Título */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Título / Descripción"
                            placeholder="Ej: Compra de stock mensual"
                            value={purchaseData.descripcion}
                            onChange={(e) => updateField("descripcion", e.target.value)}
                            required
                        />
                    </Grid>

                    {/* Fecha de Compra */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha de Compra"
                            type="date"
                            value={purchaseData.fechaCompra}
                            onChange={(e) => updateField("fechaCompra", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Sucursal */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Sucursal"
                            value={purchaseData.sucursalId}
                            onChange={(e) => updateField("sucursalId", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione sucursal</MenuItem>
                            {(catalogs.sucursales || []).map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Laboratorio / Proveedor */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Laboratorio / Proveedor"
                            value={purchaseData.codigoProveedor}
                            onChange={(e) => updateField("codigoProveedor", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione proveedor</MenuItem>
                            {(catalogs.proveedores || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Numero Factura (Referencia) */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Número de Factura"
                            placeholder="Ej: FAC-12345"
                            value={purchaseData.referencia}
                            onChange={(e) => updateField("referencia", e.target.value)}
                        />
                    </Grid>

                    {/* Forma de Pago */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Forma de Pago"
                            value={purchaseData.tipoFormaPago}
                            onChange={(e) => updateField("tipoFormaPago", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione forma de pago</MenuItem>
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
                            placeholder="Ej: Pago con cheque 987"
                            value={purchaseData.detalleFormaPago}
                            onChange={(e) => updateField("detalleFormaPago", e.target.value)}
                        />
                    </Grid>

                    {/* Pedido (Dinámico) */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label={loadingOrders ? "Cargando pedidos..." : "Pedido Relacionado"}
                            value={purchaseData.codigoPedido}
                            onChange={(e) => updateField("codigoPedido", e.target.value)}
                            required
                            disabled={!purchaseData.sucursalId || loadingOrders}
                            helperText={!purchaseData.sucursalId ? "Selecciona una sucursal para ver pedidos disponibles" : ""}
                        >
                            <MenuItem value="">
                                {loadingOrders ? "Buscando..." : (catalogs.pedidos.length > 0 ? "Seleccione un pedido" : "No hay pedidos pendientes")}
                            </MenuItem>
                            {(catalogs.pedidos || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.numeroPedido} - {p.descripcion || "Sin descripción"}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={onCreate}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                py: 2,
                                borderRadius: 2,
                                background: farmaColors.gradients.primary,
                                fontWeight: 700,
                                fontSize: "1rem"
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
