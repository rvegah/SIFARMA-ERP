// src/modules/products/components/ProductList.jsx
// Lista de productos con búsqueda avanzada y paginación

import React, { useState } from "react";
import {
    Container,
    Typography,
    Grid,
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    IconButton,
    CircularProgress,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
} from "@mui/icons-material";
import { useProductContext } from "../context/ProductContext";
import { farmaColors } from "/src/app/theme";

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
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}
            >
                Gestión de Productos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Administración del inventario de productos
            </Typography>

            {/* Panel de Filtros */}
            <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <Grid container spacing={2} alignItems="center">

                    {/* Fila 1: Sucursal (Obligatorio), Código, Nombre */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Sucursal *</InputLabel>
                            <Select
                                value={searchFilters.sucursalId || ""}
                                label="Sucursal *"
                                onChange={(e) => updateSearchFilters("sucursalId", e.target.value)}
                                sx={{ bgcolor: "white" }}
                            >
                                {catalogs?.sucursales?.length === 0 ? (
                                    <MenuItem disabled>Cargando sucursales...</MenuItem>
                                ) : (
                                    catalogs?.sucursales?.map((s) => (
                                        <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                                            {s.nombreSucursal}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            label="Código"
                            placeholder="Ej: TEC-0127"
                            value={searchFilters.codigo || ""}
                            onChange={(e) => updateSearchFilters("codigo", e.target.value)}
                            size="small"
                            sx={{ bgcolor: "white" }}
                        />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            label="Nombre Producto"
                            placeholder="Buscar por nombre..."
                            value={searchFilters.nombre || ""}
                            onChange={(e) => updateSearchFilters("nombre", e.target.value)}
                            size="small"
                            sx={{ bgcolor: "white" }}
                            onKeyDown={(e) => { if (e.key === "Enter") searchProducts(); }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: "action.active", fontSize: 20 }} />
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
                            sx={{ height: 40, bgcolor: farmaColors.primary }}
                        >
                            Buscar
                        </Button>
                    </Grid>

                    {/* Fila 2: Línea y Laboratorio (Dropdowns dependientes) */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Línea</InputLabel>
                            <Select
                                value={searchFilters.linea || ""}
                                label="Línea"
                                onChange={(e) => updateSearchFilters("linea", e.target.value)}
                                sx={{ bgcolor: "white" }}
                            >
                                <MenuItem value=""><em>Todas las líneas</em></MenuItem>
                                {catalogs?.lineas?.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small" disabled={!searchFilters.linea}>
                            <InputLabel>Laboratorio</InputLabel>
                            <Select
                                value={searchFilters.laboratorio || ""}
                                label="Laboratorio"
                                onChange={(e) => updateSearchFilters("laboratorio", e.target.value)}
                                sx={{ bgcolor: searchFilters.linea ? "white" : "#f0f0f0" }}
                            >
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {catalogs?.filterLaboratorios?.map((lab) => (
                                    <MenuItem key={lab.id} value={lab.id}>
                                        {lab.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Botón Nuevo Producto */}
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onCreateProduct}
                    sx={{
                        bgcolor: farmaColors.accent,
                        "&:hover": { bgcolor: farmaColors.primary },
                    }}
                >
                    Nuevo Producto
                </Button>
            </Box>

            {/* Tabla de Resultados */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: farmaColors.primary }}>
                        <TableRow>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Código</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Producto</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Presentación</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>País</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Precio (Bs.)</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                                        Buscando productos...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => (
                                <TableRow
                                    key={product.producto_ID || product.id}
                                    hover
                                    sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}
                                >
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>
                                        {product.codigoProducto || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {product.producto || product.nombre || "-"}
                                        </Typography>
                                        {product.accionTerapeutica && (
                                            <Typography variant="caption" color="text.secondary">
                                                {product.accionTerapeutica}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.presentacion || product.unidadMedida || "-"}</TableCell>
                                    <TableCell>{product.nombrePais || "-"}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                        {product.precioUnitario != null
                                            ? Number(product.precioUnitario).toFixed(2)
                                            : "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            title="Editar"
                                            onClick={() => handleEditClick(product)}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            title="Eliminar"
                                            onClick={() => handleDeleteClick(product)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                    Seleccione una Sucursal y presione "Buscar" para ver los productos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={products.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </TableContainer>

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, product: null })}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Desea eliminar el producto{" "}
                        <strong>
                            {deleteDialog.product?.producto || deleteDialog.product?.nombre}
                        </strong>
                        ? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, product: null })}>
                        Cancelar
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductList;
