// src/modules/reports/components/CreateOrderSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
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
import { 
    Storefront, 
    LocalShipping, 
    CalendarMonth, 
    Category, 
    Science, 
    Description, 
    RateReview,
    Cancel
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreateOrderSection = ({ orderData, updateData, onNext, catalogs }) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ width: '100%', borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.05)", border: `1px solid ${farmaColors.alpha.secondary10}` }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Crear Nuevo Pedido
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Sucursal"
                            value={orderData.sucursalId}
                            onChange={(e) => updateData("sucursalId", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione...</MenuItem>
                            {(catalogs.sucursales || []).map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Proveedor"
                            value={orderData.proveedorId}
                            onChange={(e) => updateData("proveedorId", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <LocalShipping sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione...</MenuItem>
                            {(catalogs.proveedores || []).map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Fecha del Pedido"
                            type="date"
                            value={orderData.fecha}
                            onChange={(e) => updateData("fecha", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                            InputProps={{
                                startAdornment: <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Línea"
                            value={orderData.lineaId}
                            onChange={(e) => updateData("lineaId", e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Category sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione...</MenuItem>
                            {(catalogs.lineas || []).map((l) => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Laboratorio"
                            value={orderData.laboratorioId}
                            onChange={(e) => updateData("laboratorioId", e.target.value)}
                            required
                            disabled={!orderData.lineaId}
                            InputProps={{
                                startAdornment: <Science sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione...</MenuItem>
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
                            value={orderData.descripcion}
                            onChange={(e) => updateData("descripcion", e.target.value)}
                            InputProps={{
                                startAdornment: <Description sx={{ color: "action.active", mt: 1, mr: 1 }} />,
                                sx: { alignItems: 'flex-start' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Observaciones"
                            value={orderData.observaciones}
                            onChange={(e) => updateData("observaciones", e.target.value)}
                            InputProps={{
                                startAdornment: <RateReview sx={{ color: "action.active", mt: 1, mr: 1 }} />,
                                sx: { alignItems: 'flex-start' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate("/ventas/mis-pedidos")}
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
                            onClick={onNext}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: 2,
                                background: farmaColors.gradients.primary,
                                fontWeight: 700,
                                fontSize: "1rem",
                                boxShadow: `0 4px 12px ${farmaColors.alpha.primary30}`
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
