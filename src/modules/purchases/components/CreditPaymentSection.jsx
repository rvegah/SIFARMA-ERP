// src/modules/purchases/components/CreditPaymentSection.jsx
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
    FormControlLabel,
    Switch,
    InputAdornment
} from "@mui/material";
import { ReceiptLong, AccountBalance, Payment } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreditPaymentSection = ({ creditData, setCreditData, onSave, loading }) => {
    // Local state for the Recibo vs Cheque toggle
    const [useCheque, setUseCheque] = useState(false);

    const updateField = (field, value) => {
        setCreditData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = (e) => {
        const isCheque = e.target.checked;
        setUseCheque(isCheque);

        // Reset the opposite fields
        if (isCheque) {
            updateField("numeroRecibo", "");
        } else {
            updateField("numeroCheque", "");
            updateField("bancoEmitido", "");
        }
    };

    return (
        <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment sx={{ color: farmaColors.primary }} /> Registro de Crédito
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Ingrese los detalles del crédito para esta compra antes de proceder.
                </Typography>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    {/* Fecha y Hora */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha"
                            type="date"
                            value={creditData.fecha}
                            onChange={(e) => updateField("fecha", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Hora"
                            type="time"
                            value={creditData.hora}
                            onChange={(e) => updateField("hora", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Concepto Pago */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Concepto de Pago"
                            placeholder="Ej: Pago inicial de compra stock"
                            value={creditData.conceptoPago}
                            onChange={(e) => updateField("conceptoPago", e.target.value)}
                            required
                        />
                    </Grid>

                    {/* Montos */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Monto Deuda"
                            type="number"
                            value={creditData.montoDeuda}
                            onChange={(e) => updateField("montoDeuda", Number(e.target.value))}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                            }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Monto Pago"
                            type="number"
                            value={creditData.montoPago}
                            onChange={(e) => updateField("montoPago", Number(e.target.value))}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                            }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Monto Saldo"
                            type="number"
                            value={creditData.montoSaldo}
                            onChange={(e) => updateField("montoSaldo", Number(e.target.value))}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                            }}
                            required
                        />
                    </Grid>

                    {/* Toggle Recibo / Cheque */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useCheque}
                                        onChange={handleToggle}
                                        color="primary"
                                    />
                                }
                                label={useCheque ? "Usar Cheque / Banco" : "Usar Recibo"}
                            />
                        </Box>
                    </Grid>

                    {!useCheque ? (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Número de Recibo"
                                placeholder="Ej: REC-1001"
                                value={creditData.numeroRecibo}
                                onChange={(e) => updateField("numeroRecibo", e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><ReceiptLong fontSize="small" /></InputAdornment>,
                                }}
                            />
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Número de Cheque"
                                    placeholder="Ej: CHQ-550"
                                    value={creditData.numeroCheque}
                                    onChange={(e) => updateField("numeroCheque", e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Payment fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Banco de Emisión"
                                    placeholder="Ej: Banco Mercantil"
                                    value={creditData.bancoEmitido}
                                    onChange={(e) => updateField("bancoEmitido", e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><AccountBalance fontSize="small" /></InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Dias Pago */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Número de Días Pago"
                            type="number"
                            value={creditData.numeroDiasPago}
                            onChange={(e) => updateField("numeroDiasPago", Number(e.target.value))}
                        />
                    </Grid>

                    {/* Observaciones */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Observaciones"
                            multiline
                            rows={3}
                            value={creditData.observaciones}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={onSave}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                py: 2,
                                borderRadius: 2,
                                background: farmaColors.gradients.primary,
                                fontWeight: 700,
                                fontSize: "1rem"
                            }}
                        >
                            {loading ? "Procesando..." : "Crear Crédito"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CreditPaymentSection;
