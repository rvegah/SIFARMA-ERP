// src/modules/reports/pages/MejorVentaPage.jsx

import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link,
  Container,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import { useAuth } from "../../../context/AuthContext";
import ProductoBuscador from "../components/ProductoBuscador";
import TextField from "@mui/material/TextField";

const MejorVentaChart = lazy(() => import("../components/MejorVentaChart"));

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt2 = (n) => Number(n ?? 0).toFixed(2);

function SummaryCard({ label, value, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1.5px solid ${color}22`,
        borderTop: `4px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color, mt: 0.25 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── TAB 1: Gráfico por mes (ya existente) ────────────────────────────────────
function TabGrafico() {
  const { user } = useAuth();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (m) => {
    setLoading(true);
    const res = await reportesService.buscarGraficoProductosMasVendidos(m);
    setDatos(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar(mes);
  }, [mes]);

  const formatXAxis = (str) =>
    str?.length > 12 ? str.substring(0, 10) + "…" : str;

  return (
    <Box>
      {/* Filtro mes */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{ bgcolor: "#05305A", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Filtro por Mes
          </Typography>
        </Box>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={mes}
                  label="Mes"
                  onChange={(e) => setMes(e.target.value)}
                >
                  {MESES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Chip
                label={`${datos.length} productos`}
                sx={{ bgcolor: "#CC6C0615", color: "#CC6C06", fontWeight: 700 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{ bgcolor: "#05305A", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            {MESES.find((m) => m.value === mes)?.label} — Sucursal:{" "}
            {user?.sucursal ?? "—"}
          </Typography>
        </Box>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#CC6C06" }} />
            </Box>
          ) : datos.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No hay datos para el mes seleccionado
              </Typography>
            </Box>
          ) : (
            <Suspense fallback={<div>Cargando gráfico...</div>}>
              <MejorVentaChart datos={datos} formatXAxis={formatXAxis} />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Detalle de Productos
          </Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                {[
                  "#",
                  "Código",
                  "Producto",
                  "Nro Veces Vendido",
                  "Monto Recaudado",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      py: 1,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : datos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    No hay datos
                  </TableCell>
                </TableRow>
              ) : (
                datos.map((r, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell
                      sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                    >
                      {i + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "#CC6C06",
                        fontWeight: 600,
                      }}
                    >
                      {r.codigo}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", fontWeight: 500 }}>
                      {r.nombreProducto}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={r.numeroVecesVendido}
                        size="small"
                        sx={{
                          bgcolor: "#CC6C06",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      {r.montoRecaudado}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

// ── TAB 2: Productos más vendidos por fecha/sucursal ─────────────────────────
function TabProductosMasVendidos() {
  const [data, setData] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [filtros, setFiltros] = useState({
    codigoSucursal: "",
    fechaInicio: primerDiaMes,
    fechaFinal: hoy,
    producto: null,
  });

  const [resumen, setResumen] = useState({
    total: 0,
    totalVeces: 0,
    totalCantidad: 0,
  });

  useEffect(() => {
    userService.getSucursales().then((res) => setSucursales(res ?? []));
  }, []);

  const calcularResumen = (datos) => {
    setResumen({
      total: datos.length,
      totalVeces: datos.reduce((s, d) => s + (d.numeroVecesVendido || 0), 0),
      totalCantidad: datos.reduce((s, d) => s + (d.cantidadVendido || 0), 0),
    });
  };

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal) return;
    setLoading(true);
    const res = await reportesService.getProductosMasVendidos({
      codigoSucursal: filtros.codigoSucursal,
      fechaInicio: filtros.fechaInicio,
      fechaFinal: filtros.fechaFinal,
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setData(res);
    calcularResumen(res);
    setLoading(false);
  };

  const puedesBuscar =
    filtros.codigoSucursal && filtros.fechaInicio && filtros.fechaFinal;

  return (
    <Box>
      {/* FILTROS */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{ bgcolor: "#05305A", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Búsqueda — Sucursal y fechas son obligatorios
          </Typography>
        </Box>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Sucursal *</InputLabel>
                <Select
                  value={filtros.codigoSucursal}
                  label="Sucursal *"
                  onChange={(e) =>
                    setFiltros({ ...filtros, codigoSucursal: e.target.value })
                  }
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {sucursales.map((s) => (
                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                      {s.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Inicio *"
                type="date"
                size="small"
                fullWidth
                value={filtros.fechaInicio}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaInicio: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Final *"
                type="date"
                size="small"
                fullWidth
                value={filtros.fechaFinal}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaFinal: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={3} />

            {/* FILA 2 */}
            <Grid item xs={12} sm={8}>
              <ProductoBuscador
                codigoSucursal={filtros.codigoSucursal || 0}
                value={filtros.producto}
                onSelect={(p) => setFiltros({ ...filtros, producto: p })}
                onClear={() => setFiltros({ ...filtros, producto: null })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                disabled={!puedesBuscar || loading}
                sx={{
                  height: "40px",
                  bgcolor: puedesBuscar ? "#CC6C06" : "grey.400",
                  "&:hover": { bgcolor: "#a85705" },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 1.5,
                }}
                onClick={handleBuscar}
              >
                Ver Reporte
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* RESUMEN */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            label="Total Productos"
            value={resumen.total}
            color="#1e88e5"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            label="Total Veces Vendido"
            value={resumen.totalVeces}
            color="#CC6C06"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            label="Cantidad Vendida"
            value={resumen.totalCantidad}
            color="#43a047"
          />
        </Grid>
      </Grid>

      {/* TABLA */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Detalle de Productos Más Vendidos
          </Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#CC6C06" }} />
            </Box>
          ) : data.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography color="text.secondary">
                {puedesBuscar
                  ? "Sin resultados"
                  : "Seleccione sucursal y fechas para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {[
                    "Nro",
                    "Código",
                    "Producto",
                    "Presentación",
                    "Nro Veces Vendido",
                    "Cantidad Vendida",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        color: "#05305A",
                        whiteSpace: "nowrap",
                        py: 1,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell
                      sx={{ color: "text.secondary", fontSize: "0.72rem" }}
                    >
                      {i + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "#CC6C06",
                        fontWeight: 600,
                      }}
                    >
                      {row.codigoProducto}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.nombreProducto}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.72rem",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.presentacion}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.numeroVecesVendido}
                        size="small"
                        sx={{
                          bgcolor: "#CC6C06",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.cantidadVendido}
                        size="small"
                        sx={{
                          bgcolor: "#43a047",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Card>
    </Box>
  );
}

// ── PÁGINA PRINCIPAL CON TABS ─────────────────────────────────────────────────
export default function MejorVentaPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader
          title="Productos más Vendidos"
          subtitle="Análisis de ventas por mes y por período"
          icon={<BarChartIcon />}
        />
        <Breadcrumbs>
          <Link
            component={RouterLink}
            to="/dashboard"
            underline="hover"
            color="inherit"
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Productos más vendidos</Typography>
        </Breadcrumbs>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          "& .MuiTab-root": { fontWeight: 600 },
          "& .Mui-selected": { color: "#CC6C06" },
          "& .MuiTabs-indicator": { bgcolor: "#CC6C06" },
        }}
      >
        <Tab label="Gráfico por Mes" />
        <Tab label="Reporte por Período" />
      </Tabs>

      {tab === 0 && <TabGrafico />}
      {tab === 1 && <TabProductosMasVendidos />}
    </Container>
  );
}
