import React, { useState } from "react";
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
    Tooltip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useAuth } from "../../../context/AuthContext";
import purchaseService from "../services/purchaseService";
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
import PageHeader from "../../../shared/components/PageHeader";

const CreditPurchasesListSection = ({
    loading,
    filters,
    results,
    catalogs,
    updateFilter,
    onSearch
}) => {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal states
    const [selectedItem, setSelectedItem] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [paying, setPaying] = useState(false);

    const handleOpenView = (item) => {
        setSelectedItem(item);
        setOpenViewModal(true);
    };

    const handlePayCredit = async () => {
        setPaying(true);
        try {
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0].substring(0, 5); // "19:10"
            const dateString = now.toISOString().split('T')[0];

            const payload = {
                codigoComprobanteCompra: selectedItem.comprobanteCompra_ID,
                fecha: dateString,
                hora: timeString,
                conceptoPago: selectedItem.conceptoPago || "Pago de Crédito",
                montoDeuda: selectedItem.montoDeuda || 0,
                montoPago: selectedItem.montoPago || 0,
                montoSaldo: selectedItem.montoSaldo || 0,
                numeroRecibo: selectedItem.numeroRecibo || "",
                numeroCheque: selectedItem.numeroCheque || "",
                bancoEmitido: selectedItem.bancoEmitido || "",
                numeroDiasPago: selectedItem.numeroDiasPago || 0,
                observaciones: selectedItem.observaciones || "Pago registrado desde UI",
                codigoEmpleadoAlta: user?.codigoEmpleado || user?.id || 1
            };

            const response = await purchaseService.pagarCredito(payload);
            if (response.exitoso || response.exito) {
                enqueueSnackbar("Crédito pagado correctamente", { variant: "success" });
                setOpenConfirmModal(false);
                setOpenViewModal(false);
                if (onSearch) onSearch();
            } else {
                enqueueSnackbar(response.mensaje || "Error al pagar crédito", { variant: "error" });
            }
        } catch (err) {
            console.error(err);
            enqueueSnackbar("Error de red", { variant: "error" });
        } finally {
            setPaying(false);
        }
    };

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
            {/* <PageHeader 
                title="Compras al Crédito"
                subtitle="Gestión y seguimiento de facturas con pagos pendientes o realizados."
                icon={<CreditCard />}
            /> */}

            {/* Search Filters Card */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "visible" }}>
                <CardContent sx={{ p: 4 }}>
                    {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                        <FilterList sx={{ color: farmaColors.primary }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.secondary }}>
                            Filtros de Búsqueda
                        </Typography>
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
                                <MenuItem value="">Seleccione...</MenuItem>
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
                                <MenuItem value="">Seleccione...</MenuItem>
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
                                <MenuItem value="">Seleccione...</MenuItem>
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
                                    borderRadius: 2,
                                    background: farmaColors.gradients.primary,
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
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
                            <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10, height: 56 }}>
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
                        <TableBody sx={{ bgcolor: "white" }}>
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
                                                    <IconButton color="primary" size="small" onClick={() => handleOpenView(row)}>
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

            {/* View Modal */}
            <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: farmaColors.secondary, color: 'white' }}>
                    Detalles del Crédito
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedItem && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                                <Typography variant="body1" fontWeight={600}>{selectedItem.nombreProveedor || "-"}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Número de Factura</Typography>
                                <Typography variant="body1" fontWeight={600}>{selectedItem.numeroFacturaCompra || "-"}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Monto Deuda</Typography>
                                <Typography variant="body1" fontWeight={600} color="primary">Bs. {selectedItem.montoDeuda?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Monto Pago</Typography>
                                <Typography variant="body1" fontWeight={600} color="success.main">Bs. {selectedItem.montoPago?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Saldo</Typography>
                                <Typography variant="body1" fontWeight={600} color="error.main">Bs. {selectedItem.montoSaldo?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Fecha Compra</Typography>
                                <Typography variant="body1" fontWeight={600}>{formatDate(selectedItem.fechaCompra)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Forma de Pago</Typography>
                                <Typography variant="body1">{selectedItem.nombreTipoFormaPago || "-"}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Días de Pago</Typography>
                                <Typography variant="body1">{selectedItem.numeroDiasPago || "-"}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                                <Typography variant="body1">{selectedItem.observaciones || "Sin observaciones"}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenViewModal(false)}>Cerrar</Button>
                    {selectedItem?.estado === "PEN" && (
                        <Button variant="contained" color="primary" onClick={() => setOpenConfirmModal(true)}>
                            Pagar Crédito
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Confirm Payment Modal */}
            <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
                <DialogTitle sx={{ color: farmaColors.secondary }}>Confirmar Pago</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea pagar este crédito por un pago de Bs. {selectedItem?.montoPago?.toFixed(2) || "0.00"}?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenConfirmModal(false)} disabled={paying}>No</Button>
                    <Button
                        onClick={handlePayCredit}
                        variant="contained"
                        color="success"
                        disabled={paying}
                        startIcon={paying ? <CircularProgress size={20} color="inherit" /> : <Receipt />}
                    >
                        Sí, Pagar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreditPurchasesListSection;
