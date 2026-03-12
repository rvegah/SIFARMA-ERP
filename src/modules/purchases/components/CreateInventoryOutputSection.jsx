// src/modules/purchases/components/CreateInventoryOutputSection.jsx
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
import { Output, Description, Storefront, Event, Category, Person, ReceiptLong } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreateInventoryOutputSection = ({ outputData, setOutputData, onCreate, catalogs, loading, loadingCatalogs }) => {

    const updateField = (field, value) => {
        setOutputData(prev => ({ ...prev, [field]: value }));
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                        background: farmaColors.gradients.primary,
                        p: 1.5,
                        borderRadius: 3,
                        display: 'flex',
                        boxShadow: "0 4px 15px rgba(0,82,155,0.2)"
                    }}>
                        <Output sx={{ color: "white", fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Nueva Salida de Inventario
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Complete la información para generar el registro de salida.
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
                            label="Resumen de Salida"
                            placeholder="Ej: Salida por ajuste de merma - Marzo"
                            value={outputData.descripcion}
                            onChange={(e) => updateField("descripcion", e.target.value)}
                            InputProps={{
                                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Sucursal */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Sucursal"
                            value={outputData.codigoSucursal}
                            onChange={(e) => updateField("codigoSucursal", e.target.value)}
                            InputProps={{
                                startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione sucursal</MenuItem>
                            {catalogs.sucursales.map((s) => (
                                <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                    {s.nombreSucursal}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Motivo de Salida */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Motivo de Salida"
                            value={outputData.codigoMotivoSalida}
                            onChange={(e) => updateField("codigoMotivoSalida", e.target.value)}
                            InputProps={{
                                startAdornment: <Category sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione motivo</MenuItem>
                            {catalogs.motivosSalida.map((m) => (
                                <MenuItem key={m.tipoMotivoSalidaId} value={m.tipoMotivoSalidaId}>
                                    {m.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Fecha de Salida */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            label="Fecha de Salida"
                            type="date"
                            value={outputData.fechaSalida}
                            onChange={(e) => updateField("fechaSalida", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <Event sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Proveedor (Opcional según contexto, pero pedido) */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Proveedor / Laboratorio (Referencia)"
                            value={outputData.codigoProveedor}
                            onChange={(e) => updateField("codigoProveedor", e.target.value)}
                        >
                            <MenuItem value="">Sin proveedor específico</MenuItem>
                            {catalogs.proveedores.map((p) => (
                                <MenuItem key={p.codigo} value={p.codigo}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Responsable */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Responsable"
                            value={outputData.codigoResponsable}
                            onChange={(e) => updateField("codigoResponsable", e.target.value)}
                            InputProps={{
                                startAdornment: <Person sx={{ color: "action.active", mr: 1 }} />
                            }}
                        >
                            <MenuItem value="" disabled>Seleccione responsable</MenuItem>
                            {catalogs.responsables.map((r) => (
                                <MenuItem key={r.codigoUsuario} value={r.codigoUsuario}>
                                    {r.nombreCompleto}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Documento de Referencia */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Documento de Referencia"
                            placeholder="Ej: Acta #1234"
                            value={outputData.documentoReferencia}
                            onChange={(e) => updateField("documentoReferencia", e.target.value)}
                            InputProps={{
                                startAdornment: <ReceiptLong sx={{ color: "action.active", mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Observaciones (Textarea) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Observaciones Detalladas"
                            placeholder="Ingrese más detalles sobre la salida..."
                            value={outputData.observaciones}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={onCreate}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Output />}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                background: farmaColors.gradients.primary,
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                boxShadow: "0 6px 20px rgba(0,82,155,0.3)"
                            }}
                        >
                            {loading ? "Registrando..." : "Crear Registro de Salida"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreateInventoryOutputSection;
