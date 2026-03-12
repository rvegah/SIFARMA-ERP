// src/modules/purchases/components/CreditPurchasesListSection.jsx
import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CircularProgress,
    IconButton,
    Chip,
    Tooltip
} from "@mui/material";
import {
    Search,
    CreditCard,
    Receipt,
    Visibility,
    FilterList,
    CalendarMonth,
    Storefront,
    LocalShipping
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const CreditPurchasesListSection = ({
    loading,
    filters,
    results,
    catalogs,
    updateFilter,
    onSearch
}) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Header / Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Box
                    sx={{
                        background: farmaColors.gradients.primary,
                        p: 1.5,
                        borderRadius: 3,
                        display: "flex",
                        boxShadow: "0 4px 15px rgba(0,82,155,0.2)"
                    }}
                >
                    <CreditCard sx={{ color: "white", fontSize: 30 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                        Compras al Crédito
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestión y seguimiento de facturas con pagos pendientes o realizados.
                    </Typography>
                </Box>
            </Box>

            {/* Search Filters Card */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "visible" }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                        <FilterList sx={{ color: farmaColors.primary }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                            Filtros de Búsqueda
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Sucursal"
                                value={filters.CodigoSucursal}
                                onChange={(e) => updateFilter("CodigoSucursal", e.target.value)}
                                InputProps={{
                                    startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="" disabled>Seleccione una sucursal</MenuItem>
                                {catalogs.sucursales.map((s) => (
                                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                        {s.nombreSucursal}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Tipo Forma Pago"
                                value={filters.TipoFormaPago}
                                onChange={(e) => updateFilter("TipoFormaPago", e.target.value)}
                            >
                                <MenuItem value="" disabled>Seleccione forma de pago</MenuItem>
                                {catalogs.formasPago.map((f) => (
                                    <MenuItem key={f.tipoFormaPago} value={f.tipoFormaPago}>
                                        {f.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="Proveedor"
                                value={filters.CodigoProveedor}
                                onChange={(e) => updateFilter("CodigoProveedor", e.target.value)}
                                InputProps={{
                                    startAdornment: <LocalShipping sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Todos los proveedores</MenuItem>
                                {catalogs.proveedores.map((p) => (
                                    <MenuItem key={p.codigo} value={p.codigo}>
                                        {p.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Saldo a Pagar"
                                value={filters.TieneSaldoPago}
                                onChange={(e) => updateFilter("TieneSaldoPago", e.target.value)}
                            >
                                <MenuItem value="" disabled>Seleccione saldo</MenuItem>
                                <MenuItem value={true}>Con monto a Pagar</MenuItem>
                                <MenuItem value={false}>Pagados</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Fecha Inicio"
                                value={filters.FechaCompraInicio}
                                onChange={(e) => updateFilter("FechaCompraInicio", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Fecha Final"
                                value={filters.FechaCompraFinal}
                                onChange={(e) => updateFilter("FechaCompraFinal", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={8}>
                            <TextField
                                fullWidth
                                label="Número de Factura"
                                placeholder="Ingrese número de factura"
                                value={filters.NumeroFactura}
                                onChange={(e) => updateFilter("NumeroFactura", e.target.value)}
                                InputProps={{
                                    startAdornment: <Receipt sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", alignItems: "flex-end" }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                onClick={onSearch}
                                disabled={loading}
                                sx={{
                                    height: 56,
                                    borderRadius: 3,
                                    background: farmaColors.gradients.primary,
                                    fontSize: "1.1rem",
                                    fontWeight: 700
                                }}
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Results Section */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Proveedor</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>No. Factura</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="right">Monto Deuda</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="right">Monto Pago</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="right">Saldo</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }}>Observaciones</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: farmaColors.secondary }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2 }} color="text.secondary">Cargando resultados...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No se encontraron resultados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                results
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{row.nombreProveedor}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {row.numeroFacturaCompra || "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: farmaColors.primary, fontWeight: 700 }}>
                                                Bs. {row.montoDeuda?.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: "success.main", fontWeight: 700 }}>
                                                Bs. {row.montoPago?.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: "error.main", fontWeight: 700 }}>
                                                Bs. {row.montoSaldo?.toFixed(2)}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Typography variant="body2" noWrap title={row.observaciones}>
                                                    {row.observaciones || "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.estado === "PEN" ? "Pendiente" : "Finalizado"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: row.estado === "PEN" ? farmaColors.alpha.secondary10 : farmaColors.alpha.primary10,
                                                        color: row.estado === "PEN" ? farmaColors.secondary : farmaColors.primary,
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Ver Detalle">
                                                    <IconButton color="primary" size="small">
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={results.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Card>
        </Box>
    );
};

export default CreditPurchasesListSection;
