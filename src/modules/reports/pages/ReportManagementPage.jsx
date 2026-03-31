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
    Link,
    Divider
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Assessment,
    GetApp,
    ShoppingCart
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";

const ReportManagementPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header & Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <PageHeader 
                    title="Reportes por Sucursales"
                    subtitle="Gestión de reportes, descargas y pedidos de mercadería."
                    icon={<Assessment />}
                />
                <Breadcrumbs aria-label="breadcrumb">
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
            </Box>

            {/* Main Content */}
            <Box sx={{ minHeight: '400px', p: 3, borderRadius: 4, bgcolor: "rgba(0,0,0,0.01)", border: `1px solid ${farmaColors.alpha.secondary10}` }}>
                <Card sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 2, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <CardContent sx={{ p: 6, textAlign: "center" }}>
                        <Box sx={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '50%', 
                            bgcolor: farmaColors.alpha.primary10, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3
                        }}>
                            <Assessment sx={{ fontSize: 40, color: farmaColors.primary }} />
                        </Box>
                        
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: farmaColors.secondary }}>
                            Gestión de Reportes
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 500, mx: 'auto' }}>
                            Acceda a las herramientas de generación de reportes detallados por sucursal y la gestión de pedidos de mercadería.
                        </Typography>

                        <Divider sx={{ mb: 5 }} />

                        <Grid container spacing={3} justifyContent="center">
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="large"
                                    startIcon={<GetApp />}
                                    sx={{
                                        py: 2.5,
                                        borderRadius: 3,
                                        borderWidth: 2,
                                        borderColor: farmaColors.primary,
                                        color: farmaColors.primary,
                                        fontWeight: 700,
                                        "&:hover": { borderWidth: 2, borderColor: farmaColors.primaryDark, bgcolor: farmaColors.alpha.primary10 }
                                    }}
                                    onClick={() => window.alert("Generando Excel...")}
                                >
                                    Descargar Reporte Excel
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<ShoppingCart />}
                                    sx={{
                                        py: 2.5,
                                        borderRadius: 3,
                                        background: farmaColors.gradients.primary,
                                        fontWeight: 700,
                                        boxShadow: `0 8px 20px ${farmaColors.alpha.primary30}`
                                    }}
                                    onClick={() => navigate("/ventas/pedidos/crear")}
                                >
                                    Realizar Nuevo Pedido
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
