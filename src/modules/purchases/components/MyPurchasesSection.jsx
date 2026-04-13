// src/modules/purchases/components/MyPurchasesSection.jsx
// Mis Compras — listado con filtros — patrón idéntico a MyOrdersSection

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
  Divider,
  Chip,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Search,
  ShoppingCart,
  Storefront,
  CalendarMonth,
  Rule,
  Receipt,
  LocalShipping,
  Edit,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import userService from "../../../services/api/userService";
import purchaseService from "../services/purchaseService";
import PageHeader from "../../../shared/components/PageHeader";
import { useNavigate } from "react-router-dom";

const ESTADO_OPTIONS = [
  { value: "PEN", label: "Pendiente" },
  { value: "REC", label: "Recibido" },
  { value: "ENV", label: "Enviado" },
  { value: "CER", label: "Cerrado" },
];

const ESTADO_COLORS = {
  PEN: {
    bg: farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)",
    color: farmaColors.secondary,
  },
  REC: { bg: "rgba(76,175,80,0.1)", color: "#388e3c" },
  ENV: {
    bg: farmaColors.alpha?.primary10 || "rgba(204,108,6,0.08)",
    color: farmaColors.primary,
  },
  CER: { bg: "rgba(158,158,158,0.1)", color: "#616161" },
};

const MyPurchasesSection = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    CodigoSucursal: "",
    FechaCompraInicio: "",
    FechaCompraFinal: "",
    EstadoCompra: "",
  });

  const [sucursales, setSucursales] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar sucursales al montar
  useEffect(() => {
    userService.getSucursales().then((data) => setSucursales(data || []));
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!filters.CodigoSucursal) {
      enqueueSnackbar("Seleccione una sucursal", { variant: "warning" });
      return;
    }
    if (!filters.FechaCompraInicio || !filters.FechaCompraFinal) {
      enqueueSnackbar("Ingrese el rango de fechas", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const params = {
        CodigoSucursal: filters.CodigoSucursal,
        FechaCompraInicio: filters.FechaCompraInicio,
        FechaCompraFinal: filters.FechaCompraFinal,
      };
      if (filters.EstadoCompra) params.EstadoCompra = filters.EstadoCompra;

      const res = await purchaseService.getMisCompras(params);
      if (res.exitoso) {
        setResults(res.datos || []);
        setPage(0);
        if ((res.datos || []).length === 0) {
          enqueueSnackbar("No se encontraron compras con esos criterios", {
            variant: "info",
          });
        }
      } else {
        enqueueSnackbar(res.mensaje || "Error al buscar compras", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Lista de compras no encontrado", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getEstadoChip = (estado) => {
    const raw = estado?.toUpperCase() || "";
    // Match parcial
    const key =
      Object.keys(ESTADO_COLORS).find((k) => raw.includes(k)) || "PEN";
    const colors = ESTADO_COLORS[key];
    return (
      <Chip
        label={estado || "-"}
        size="small"
        sx={{
          bgcolor: colors.bg,
          color: colors.color,
          fontWeight: 700,
          fontSize: "0.75rem",
        }}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Mis Compras"
        icon={<ShoppingCart fontSize="large" />}
      />

      {/* Filtros */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: farmaColors.secondary }}
            >
              Filtros de Búsqueda
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                required
                label="Sucursal"
                value={filters.CodigoSucursal}
                onChange={(e) =>
                  handleFilterChange("CodigoSucursal", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <Storefront sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                    {s.nombreSucursal}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha Inicio"
                value={filters.FechaCompraInicio}
                onChange={(e) =>
                  handleFilterChange("FechaCompraInicio", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha Final"
                value={filters.FechaCompraFinal}
                onChange={(e) =>
                  handleFilterChange("FechaCompraFinal", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={filters.EstadoCompra}
                onChange={(e) =>
                  handleFilterChange("EstadoCompra", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <Rule sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {ESTADO_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Search />
                  )
                }
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  background:
                    farmaColors.gradients?.primary || farmaColors.primary,
                  px: 6,
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(204,108,6,0.2)",
                }}
              >
                {loading ? "Buscando..." : "Buscar Compras"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor:
                    farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)",
                  height: 56,
                }}
              >
                {[
                  "Nº Compra",
                  "Descripción",
                  "Fecha",
                  "Proveedor",
                  "Forma Pago",
                  "Referencia",
                  "Estado",
                  "Acciones",
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 800, color: farmaColors.secondary }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: "white" }}>
              {loading && results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <ShoppingCart
                      sx={{
                        fontSize: 60,
                        color: "text.disabled",
                        mb: 2,
                        opacity: 0.3,
                      }}
                    />
                    <Typography variant="h6" color="text.disabled">
                      No se encontraron compras
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Ajusta los filtros y vuelve a buscar
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.codigo} hover sx={{ cursor: "default" }}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: farmaColors.primary }}
                        >
                          #{row.codigo}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          title={row.descripcion}
                        >
                          {row.descripcion || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(row.fechaCompra)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {/* El endpoint devuelve codigo proveedor, no nombre — mostrar codigo */}
                          {row.proveedor || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.formaPago || "-"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell>{row.referencia || "-"}</TableCell>
                      <TableCell>{getEstadoChip(row.estadoCompra)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar Compra">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                                navigate(`/compras/nueva/${row.numeroCompra}`)
                            }
                            // ajusta la ruta según tu menuBuilder
                          >
                            <Edit />
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
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página"
        />
      </Card>
    </Container>
  );
};

export default MyPurchasesSection;
