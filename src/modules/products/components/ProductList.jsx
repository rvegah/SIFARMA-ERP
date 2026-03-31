// src/modules/products/components/ProductList.jsx
// Lista de productos con búsqueda avanzada y paginación - Estandarizado
import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Grid,
    Button,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    IconButton,
    CircularProgress,
    TablePagination,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    InputAdornment
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    Inventory,
    Storefront,
    QrCode,
    Category,
    Science,
    Label,
    Visibility
} from "@mui/icons-material";
import { useProductContext } from "../context/ProductContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";

const ProductList = ({ onCreateProduct, onEditProduct }) => {
    const {
        products,
        searchFilters,
        updateSearchFilters,
        loading,
        searchProducts,
        catalogs,
        handleDeleteProduct,
        prepareEditProduct,
    } = useProductContext();

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Diálogo de confirmación de eliminación
    const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedProducts = products.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleEditClick = (product) => {
        prepareEditProduct(product);
        onEditProduct(product);
    };

    const handleDeleteClick = (product) => {
        setDeleteDialog({ open: true, product });
    };

    const confirmDelete = () => {
        if (deleteDialog.product) {
            handleDeleteProduct(deleteDialog.product);
        }
        setDeleteDialog({ open: false, product: null });
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <PageHeader
                title="Gestión de Productos"
                // subtitle="Administración del inventario de productos"
                icon={<Inventory />}
            />

            {/* Filtros de Búsqueda */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "visible", mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                            Filtros de Búsqueda
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Sucursal"
                                value={searchFilters.sucursalId || ""}
                                onChange={(e) => updateSearchFilters("sucursalId", e.target.value)}
                                InputProps={{
                                    startAdornment: <Storefront sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                {catalogs?.sucursales?.map((s) => (
                                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                        {s.nombreSucursal}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                label="Código"
                                value={searchFilters.codigo || ""}
                                onChange={(e) => updateSearchFilters("codigo", e.target.value)}
                                InputProps={{
                                    startAdornment: <QrCode sx={{ color: "action.active", mr: 1 }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                label="Nombre Producto"
                                value={searchFilters.nombre || ""}
                                onChange={(e) => updateSearchFilters("nombre", e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") searchProducts(); }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Label sx={{ color: "action.active", mr: 1 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
                                onClick={searchProducts}
                                disabled={loading}
                                sx={{
                                    height: 56,
                                    background: farmaColors.gradients.primary,
                                    fontWeight: 700,
                                    borderRadius: 2
                                }}
                            >
                                Buscar
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Línea"
                                value={searchFilters.linea || ""}
                                onChange={(e) => updateSearchFilters("linea", e.target.value)}
                                InputProps={{
                                    startAdornment: <Category sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                {catalogs?.lineas?.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                disabled={!searchFilters.linea}
                                label="Laboratorio"
                                value={searchFilters.laboratorio || ""}
                                onChange={(e) => updateSearchFilters("laboratorio", e.target.value)}
                                InputProps={{
                                    startAdornment: <Science sx={{ color: "action.active", mr: 1 }} />
                                }}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                {catalogs?.filterLaboratorios?.map((lab) => (
                                    <MenuItem key={lab.id} value={lab.id}>
                                        {lab.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Acciones */}
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onCreateProduct}
                    sx={{
                        background: farmaColors.gradients.primary,
                        fontWeight: 700,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
                    }}
                >
                    Nuevo Producto
                </Button>
            </Box>

            {/* Tabla de Resultados */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                            <TableRow sx={{ height: 56 }}>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }}>Código</TableCell>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }}>Producto</TableCell>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }}>Presentación</TableCell>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }}>País</TableCell>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }} align="right">Precio (Bs.)</TableCell>
                                <TableCell sx={{ color: farmaColors.secondary, fontWeight: 800 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ bgcolor: "white" }}>
                            {loading && products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2 }} color="text.secondary">Cargando productos...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Inventory sx={{ fontSize: 40, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            {searchFilters.sucursalId ? "No se encontraron productos" : "Seleccione una sucursal para buscar"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <TableRow key={product.producto_ID || product.id} hover>
                                        <TableCell sx={{ fontWeight: 700, color: farmaColors.primary }}>
                                            {product.codigoProducto || product.codigo || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {product.producto || product.nombre || "-"}
                                            </Typography>
                                            {product.accionTerapeutica && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {product.accionTerapeutica}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{product.presentacion || product.unidadMedida || "-"}</TableCell>
                                        <TableCell>{product.nombrePais || product.pais || "-"}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                            Bs. {Number(product.precioUnitario || product.precioVenta || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEditClick(product)}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(product)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
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
                    count={products.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                    sx={{ borderTop: "1px solid rgba(224, 224, 224, 0.4)" }}
                />
            </Card>

            {/* Diálogo de Eliminación */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, product: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: farmaColors.secondary }}>
                    <Inventory color="error" /> Confirmar Eliminación
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar el producto <strong>{deleteDialog.product?.producto || deleteDialog.product?.nombre}</strong>?
                        Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, product: null })}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductList;
