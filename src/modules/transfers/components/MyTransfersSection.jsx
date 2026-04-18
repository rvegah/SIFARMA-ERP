// src/modules/transfers/components/MyTransfersSection.jsx
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
  SwapHoriz,
  Storefront,
  CalendarMonth,
  Rule,
  Edit,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import userService from "../../../services/api/userService";
import transferService from "../services/transferService";
import PageHeader from "../../../shared/components/PageHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ESTADO_OPTIONS = [
  { value: "PEN", label: "Pendiente" },
  { value: "ENV", label: "Enviado" },  
];

/*const ESTADO_OPTIONS = [
  { value: "PEN", label: "Pendiente" },
  { value: "ENV", label: "Enviado" },
  { value: "REC", label: "Recibido" },
  { value: "APR", label: "Aprobado" },
  { value: "CER", label: "Cerrado" },
];*/

const ESTADO_COLORS = {
  PEN: {
    bg: farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)",
    color: farmaColors.secondary,
  },
  ENV: {
    bg: farmaColors.alpha?.primary10 || "rgba(204,108,6,0.08)",
    color: farmaColors.primary,
  },
  REC: { bg: "rgba(76,175,80,0.1)", color: "#388e3c" },
  APR: { bg: "rgba(33,150,243,0.1)", color: "#1565C0" },
  CER: { bg: "rgba(158,158,158,0.1)", color: "#616161" },
};

const getEstadoChip = (estado) => {
  const raw = estado?.toUpperCase() || "";
  const key = Object.keys(ESTADO_COLORS).find((k) => raw.includes(k)) || "PEN";
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

const MyTransfersSection = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [filters, setFilters] = useState({
    SucursalOrigen: user?.codigoSucursal_ID || "",
    SucursalDestino: "",
    FechaTraspasoInicio: firstOfMonth,
    FechaTraspasoFinal: today,
    EstadoTraspaso: "",
  });

  const [sucursales, setSucursales] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    userService.getSucursales().then((data) => setSucursales(data || []));
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!filters.SucursalOrigen) {
      enqueueSnackbar("Seleccione una sucursal de origen", {
        variant: "warning",
      });
      return;
    }
    if (!filters.FechaTraspasoInicio || !filters.FechaTraspasoFinal) {
      enqueueSnackbar("Ingrese el rango de fechas", { variant: "warning" });
      return;
    }
    try {
      setLoading(true);
      const params = {
        SucursalOrigen: filters.SucursalOrigen,
        FechaTraspasoInicio: filters.FechaTraspasoInicio,
        FechaTraspasoFinal: filters.FechaTraspasoFinal,
      };
      if (filters.SucursalDestino)
        params.SucursalDestino = filters.SucursalDestino;
      if (filters.EstadoTraspaso)
        params.EstadoTraspaso = filters.EstadoTraspaso;

      const res = await transferService.buscarTraspasos(params);
      if (res.exitoso) {
        setResults(res.datos || []);
        setPage(0);
        if ((res.datos || []).length === 0) {
          enqueueSnackbar("No se encontraron traspasos con esos criterios", {
            variant: "info",
          });
        }
      } else {
        enqueueSnackbar(res.mensaje || "Error al buscar traspasos", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al buscar traspasos", { variant: "error" });
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Mis Traspasos" icon={<SwapHoriz fontSize="large" />} />

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
            {/* Sucursal Origen */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                required
                label="Sucursal Origen"
                value={filters.SucursalOrigen}
                onChange={(e) =>
                  handleFilterChange("SucursalOrigen", e.target.value)
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

            {/* Sucursal Destino */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Sucursal Destino"
                value={filters.SucursalDestino}
                onChange={(e) =>
                  handleFilterChange("SucursalDestino", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <Storefront sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                    {s.nombreSucursal}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fecha Inicio */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha Inicio"
                value={filters.FechaTraspasoInicio}
                onChange={(e) =>
                  handleFilterChange("FechaTraspasoInicio", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            {/* Fecha Final */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha Final"
                value={filters.FechaTraspasoFinal}
                onChange={(e) =>
                  handleFilterChange("FechaTraspasoFinal", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarMonth sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={filters.EstadoTraspaso}
                onChange={(e) =>
                  handleFilterChange("EstadoTraspaso", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <Rule sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              >
                <MenuItem value="">Todos</MenuItem>
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
                {loading ? "Buscando..." : "Buscar Traspasos"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla */}
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
                  "Nº Traspaso",
                  "Descripción",
                  "Fecha",
                  "Origen",
                  "Destino",
                  "Productos",
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
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                    <InventoryIcon
                      sx={{
                        fontSize: 60,
                        color: "text.disabled",
                        mb: 2,
                        opacity: 0.3,
                      }}
                    />
                    <Typography variant="h6" color="text.disabled">
                      No se encontraron traspasos
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
                    <TableRow key={row.codigoTraspaso} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: farmaColors.primary }}
                        >
                          {row.numeroTraspaso}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          title={row.observaciones}
                        >
                          {row.observaciones || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(row.fechaTraspaso)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.sucursalOrigen || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.sucursalDestino || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.numeroProductos ?? 0}
                          size="small"
                          sx={{
                            bgcolor: farmaColors.alpha?.secondary10,
                            color: farmaColors.secondary,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>{getEstadoChip(row.estadoTraspaso)}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            row.puedeEditar ? "Editar Traspaso" : "Ver Traspaso"
                          }
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              navigate(`/traspasos/nuevo/${row.numeroTraspaso}`)
                            }
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

export default MyTransfersSection;
