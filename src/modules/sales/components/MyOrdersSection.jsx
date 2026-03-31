// src/modules/sales/components/MyOrdersSection.jsx
import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Divider,
    Chip,
    CircularProgress,
    Tooltip
} from "@mui/material";
import {
    History,
    FilterList,
    Storefront,
    CalendarMonth,
    Numbers,
    Rule,
    Search
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import userService from "../../../services/api/userService";
import orderService from "../services/orderService";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";

const STATUS_OPTIONS = [
    { value: "PEN", label: "Pendiente" },
    { value: "APR", label: "Aprobado" },
    { value: "ENV", label: "Enviado" },
    { value: "REC", label: "Recibido" },
    { value: "CER", label: "Cerrado" }
];

const MyOrdersSection = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        codigoSucursal: "",
        numeroPedido: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFinal: new Date().toISOString().split("T")[0],
        estadoPedido: ""
    });

    const [catalogs, setCatalogs] = useState({
        sucursales: []
    });

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    useEffect(() => {
        userService.getSucursales().then(data => {
            setCatalogs({ sucursales: data });
        });
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = async () => {
        if (!filters.codigoSucursal || !filters.estadoPedido) {
            window.alert("Sucursal y Estado de Pedido son obligatorios.");
            return;
        }

        const hasNumAndDatesSet = filters.numeroPedido || (filters.fechaInicio && filters.fechaFinal);
        if (!hasNumAndDatesSet) {
            window.alert("Debe ingresar Numero de Pedido o el rango de Fechas.");
            return;
        }

        try {
            setLoading(true);
            const params = {
                CodigoSucursal: filters.codigoSucursal,
                NumeroPedido: filters.numeroPedido,
                FechaInicio: filters.fechaInicio ? new Date(filters.fechaInicio).toISOString() : "",
                FechaFinal: filters.fechaFinal ? new Date(filters.fechaFinal).toISOString() : "",
                EstadoPedido: filters.estadoPedido
            };

            const response = await orderService.getMisPedidos(params);
            if (response.exitoso) {
                setSearchResults(response.datos || []);
                setPage(0);
            } else {
                window.alert(response.mensaje || "Error al buscar pedidos");
            }
        } catch (error) {
            console.error(error);
            window.alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleEditOrder = (order) => {
        navigate(`/ventas/pedidos/crear?numeroPedido=${order.numeroPedido}`);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <PageHeader
                title="Mis Pedidos"
                // subtitle="Consulta el historial y estado de tus pedidos realizados."
                icon={<History fontSize="large" />}
            />

            {/* Filtros de Búsqueda */}
            <Card sx={{ borderRadius: 3, mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ p: 4 }}>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <FilterList color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Filtros de Búsqueda</Typography>
                    </Box> */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                                Filtros de Búsqueda
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <TextField
                                select
                                fullWidth
                                label="Sucursal"
                                value={filters.codigoSucursal}
                                onChange={(e) => handleFilterChange("codigoSucursal", e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Seleccione sucursal</MenuItem>
                                {catalogs.sucursales.map(s => (
                                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>{s.nombreSucursal}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <TextField
                                fullWidth
                                label="Fecha Inicio"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.fechaInicio}
                                onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                                InputProps={{
                                    startAdornment: <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <TextField
                                fullWidth
                                label="Fecha Fin"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.fechaFinal}
                                onChange={(e) => handleFilterChange("fechaFinal", e.target.value)}
                                InputProps={{
                                    startAdornment: <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <TextField
                                fullWidth
                                label="Nº de Pedido"
                                // placeholder="Ej: PED-2026-..."
                                value={filters.numeroPedido}
                                onChange={(e) => handleFilterChange("numeroPedido", e.target.value)}
                                InputProps={{
                                    startAdornment: <Numbers sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <TextField
                                select
                                fullWidth
                                label="Estado"
                                value={filters.estadoPedido}
                                onChange={(e) => handleFilterChange("estadoPedido", e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <Rule sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Seleccione estado</MenuItem>
                                {STATUS_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                onClick={handleSearch}
                                disabled={loading}
                                sx={{
                                    background: farmaColors.gradients.primary,
                                    px: 6,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    height: 56
                                }}
                            >
                                {loading ? "Buscando..." : "Buscar Pedidos"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabla de Resultados */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                            <TableRow sx={{ height: 56 }}>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Nº Pedido</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Usuario</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Sucursal</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Descripción</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ bgcolor: "white" }}>
                            {searchResults.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <History sx={{ fontSize: 60, color: "text.disabled", mb: 2, opacity: 0.3 }} />
                                        <Typography variant="h6" color="text.disabled">No se encontraron pedidos</Typography>
                                        <Typography variant="body2" color="text.disabled">Ajusta tus filtros y vuelve a buscar</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                searchResults
                                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                    .map((order) => (
                                        <TableRow key={order.codigoPedido} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: farmaColors.primary }}>
                                                    {order.numeroPedido}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">ID: {order.codigoPedido}</Typography>
                                            </TableCell>
                                            <TableCell>{order.nombreUsuario || "N/A"}</TableCell>
                                            <TableCell>{order.sucursal || "N/A"}</TableCell>
                                            <TableCell sx={{ maxWidth: 250 }}>
                                                <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {order.descripcion}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.fechaPedido).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.estadoPedido}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        bgcolor: farmaColors.alpha.primary10,
                                                        color: farmaColors.primary
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Editar detalles del pedido">
                                                    <IconButton color="primary" onClick={() => handleEditOrder(order)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {searchResults.length > rowsPerPage && (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1, borderTop: `1px solid ${farmaColors.alpha.secondary10}` }}>
                        <Button disabled={page === 0} onClick={() => setPage(prev => prev - 1)}>Anterior</Button>
                        <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                            Página {page + 1} de {Math.ceil(searchResults.length / rowsPerPage)}
                        </Typography>
                        <Button disabled={page === Math.ceil(searchResults.length / rowsPerPage) - 1} onClick={() => setPage(prev => prev + 1)}>Siguiente</Button>
                    </Box>
                )}
            </Card>
        </Container>
    );
};

export default MyOrdersSection;
