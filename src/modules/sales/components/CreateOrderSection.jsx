// src/modules/reports/components/CreateOrderSection.jsx
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
    Divider
} from "@mui/material";
import { farmaColors } from "../../../app/theme";

const CreateOrderSection = ({ orderData, updateData, onNext, catalogs }) => {
    return (
        <Card sx={{ maxWidth: 700, mx: "auto", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary }}>
                    Crear Nuevo Pedido
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Complete la información básica del pedido para continuar añadiendo productos.
                </Typography>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Sucursal"
                            value={orderData.sucursalId}
                            onChange={(e) => updateData("sucursalId", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione una sucursal</MenuItem>
                            {(catalogs.sucursales || []).map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Proveedor"
                            value={orderData.proveedorId}
                            onChange={(e) => updateData("proveedorId", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione un proveedor</MenuItem>
                            {(catalogs.proveedores || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha del Pedido"
                            type="date"
                            value={orderData.fecha}
                            onChange={(e) => updateData("fecha", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Línea"
                            value={orderData.lineaId}
                            onChange={(e) => updateData("lineaId", e.target.value)}
                            required
                        >
                            <MenuItem value="">Seleccione una línea</MenuItem>
                            {(catalogs.lineas || []).map((l) => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Laboratorio"
                            value={orderData.laboratorioId}
                            onChange={(e) => updateData("laboratorioId", e.target.value)}
                            required
                            disabled={!orderData.lineaId}
                        >
                            <MenuItem value="">Seleccione un laboratorio</MenuItem>
                            {(catalogs.laboratorios || []).map((l) => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Descripción"
                            placeholder="Ingresa una descripción del pedido"
                            value={orderData.descripcion}
                            onChange={(e) => updateData("descripcion", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Observaciones"
                            placeholder="Ingresa observaciones adicionales"
                            value={orderData.observaciones}
                            onChange={(e) => updateData("observaciones", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={onNext}
                            sx={{
                                py: 2,
                                borderRadius: 2,
                                background: farmaColors.gradients.primary,
                                fontWeight: 700,
                                fontSize: "1rem"
                            }}
                        >
                            Crear Pedido
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreateOrderSection;
