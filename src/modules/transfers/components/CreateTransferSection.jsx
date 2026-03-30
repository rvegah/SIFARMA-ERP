// src/modules/transfers/components/CreateTransferSection.jsx
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
    SwapHoriz,
    Description as DescriptionIcon,
    Storefront,
    Event,
    Notes,
    Send,
    CompareArrows
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreateTransferSection = ({ transferData, setTransferData, onCreate, catalogs, loading, loadingCatalogs }) => {

    const updateField = (field, value) => {
        setTransferData(prev => ({ ...prev, [field]: value }));
    };

    if (loadingCatalogs) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                        background: farmaColors.gradients.primary,
                        p: 1.5,
                        borderRadius: 3,
                        display: 'flex',
                        boxShadow: "0 4px 15px rgba(0,82,155,0.2)"
                    }}>
                        <SwapHoriz sx={{ color: "white", fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Nuevo Traspaso entre Sucursales
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Defina las sucursales de origen y destino para el movimiento de mercadería.
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} /> */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Nuevo Traspaso entre Sucursales
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    {/* Título / Descripción */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Resumen del Traspaso"
                            placeholder="Ej: Traspaso de stock crítico - Sucursal San Martín"
                            value={transferData.descripcion}
                            onChange={(e) => updateField("descripcion", e.target.value)}
                            InputProps={{
                                startAdornment: <DescriptionIcon sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Sucursal Origen */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Sucursal Origen"
                            value={transferData.codigoSucursalOrigen}
                            onChange={(e) => updateField("codigoSucursalOrigen", e.target.value)}
                            InputProps={{
                                startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione origen</MenuItem>
                            {catalogs.sucursales.map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Sucursal Destino */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Sucursal Destino"
                            value={transferData.codigoSucursalDestino}
                            onChange={(e) => updateField("codigoSucursalDestino", e.target.value)}
                            InputProps={{
                                startAdornment: <CompareArrows sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione destino</MenuItem>
                            {catalogs.sucursales.map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Fecha de Envío */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            label="Fecha Estimada de Envío"
                            type="date"
                            value={transferData.fechaEnvio}
                            onChange={(e) => updateField("fechaEnvio", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <Event sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Observaciones (Textarea) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Observaciones"
                            placeholder="Instrucciones adicionales para el transporte o motivo del traspaso..."
                            value={transferData.observaciones}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                            InputProps={{
                                startAdornment: <Notes sx={{ color: "action.active", mt: 1, mr: 1 }} />,
                                sx: { alignItems: 'flex-start' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={onCreate}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                background: farmaColors.gradients.primary,
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                boxShadow: "0 6px 20px rgba(0,82,155,0.3)"
                            }}
                        >
                            {loading ? "Iniciando Traspaso..." : "Iniciar Traspaso y Añadir Productos"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreateTransferSection;
