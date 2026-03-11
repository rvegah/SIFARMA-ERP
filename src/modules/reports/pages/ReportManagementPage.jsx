// src/modules/reports/pages/ReportManagementPage.jsx
import React from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Breadcrumbs,
    Link
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Assessment,
    GetApp,
    ShoppingCart
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const ReportManagementPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header & Breadcrumbs */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link
                            component={RouterLink}
                            underline="hover"
                            color="inherit"
                            to="/dashboard"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Reportes</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                        Reporte por sucursales
                    </Typography>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ minHeight: '400px', border: '2px dashed #05305A', p: 3, borderRadius: 2, bgcolor: "#fff" }}>
                <Card sx={{ maxWidth: 600, mx: "auto", mt: 2, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <Assessment sx={{ fontSize: 60, color: farmaColors.primary, mb: 2, opacity: 0.8 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary }}>
                            Reportes por Sucursales
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Seleccione una acción para gestionar los reportes y pedidos de sucursal.
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="large"
                                    startIcon={<GetApp />}
                                    sx={{
                                        py: 2,
                                        borderRadius: 2,
                                        borderColor: farmaColors.primary,
                                        color: farmaColors.primary,
                                        "&:hover": { borderColor: farmaColors.primaryDark, bgcolor: "rgba(0,0,0,0.02)" }
                                    }}
                                    onClick={() => window.alert("Generando Excel...")}
                                >
                                    Generar Excel
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<ShoppingCart />}
                                    sx={{
                                        py: 2,
                                        borderRadius: 2,
                                        background: farmaColors.gradients.primary,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                    }}
                                    onClick={() => navigate("/ventas/pedidos/crear")}
                                >
                                    Realizar Pedido
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ReportManagementPage;
