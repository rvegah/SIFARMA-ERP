// REEMPLAZAR: todo el contenido de VentasDiariasPage.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt2 = (n) => (n ?? 0).toFixed(2);
const fmtDate = (iso) => iso?.split("T")[0] ?? "";
const CODIGO_RE = /^[A-Z]{2,4}-\d{3,6}$/i;

function SummaryCard({ label, value, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1.5px solid ${color}22`,
        borderTop: `4px solid ${color}`,
        borderRadius: 2,
        bgcolor: "background.paper",
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

// ── component ────────────────────────────────────────────────────────────────
export default function VentasDiariasPage() {
  const [data, setData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  const [sucursales, setSucursales] = useState([]);

  const [filtros, setFiltros] = useState({
    fechaInicio: hoy,
    fechaFinal: hoy,
    codigoSucursal: 0,
    codigoUsuario: 0,
    producto: null, // campo unificado
  });

  useEffect(() => {
    cargarUsuarios();
    cargarSucursales(); // <-- nuevo
    handleBuscar();
  }, []);

  const cargarSucursales = async () => {
    const res = await userService.getSucursales();
    setSucursales(res ?? []);
  };

  const [resumen, setResumen] = useState({
    totalVenta: 0,
    totalCantidad: 0,
    totalDescuento: 0,
    utilidad: 0,
  });

  const cargarUsuarios = async () => {
    const res = await userService.getEmpleadosUsuarios();
    setUsuarios(res);
  };

  const calcularResumen = (datos) => {
    let totalVenta = 0,
      totalCantidad = 0,
      totalDescuento = 0,
      utilidad = 0;
    datos.forEach((d) => {
      totalVenta += d.total || 0;
      totalCantidad += d.cantidad || 0;
      totalDescuento += d.descuento || 0;
      utilidad += (d.precioUnitario - d.costoUnitario) * (d.cantidad || 0);
    });
    setResumen({ totalVenta, totalCantidad, totalDescuento, utilidad });
  };

  const handleBuscar = async () => {
    setLoading(true);
    const payload = {
      fechaInicio: filtros.fechaInicio,
      fechaFinal: filtros.fechaFinal,
      codigoSucursal: filtros.codigoSucursal || 0,
      codigoUsuario: filtros.codigoUsuario,
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    };
    const res = await reportesService.getVentasDiarias(payload); // o getVentasMensuales
    setData(res);
    calcularResumen(res);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ENCABEZADO */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          pb: 1.5,
          borderBottom: "2px solid #CC6C0622",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#05305A" }}>
          Ventas Diarias
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {data.length} registros
        </Typography>
      </Box>

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
            Búsqueda
          </Typography>
        </Box>

        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* FILA 1 */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Inicio"
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
                label="Fecha Final"
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

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={filtros.codigoSucursal}
                  label="Sucursal"
                  onChange={(e) =>
                    setFiltros({ ...filtros, codigoSucursal: e.target.value })
                  }
                >
                  <MenuItem value={0}>Todas</MenuItem>
                  {sucursales.map((s) => (
                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                      {s.nombreSucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={filtros.codigoUsuario}
                  label="Usuario"
                  onChange={(e) =>
                    setFiltros({ ...filtros, codigoUsuario: e.target.value })
                  }
                >
                  <MenuItem value={0}>Todos</MenuItem>
                  {usuarios.map((u) => (
                    <MenuItem
                      key={u.codigoUsuario || u.usuario_ID}
                      value={u.codigoUsuario || u.usuario_ID}
                    >
                      {u.nombreCompleto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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
                sx={{
                  height: "40px",
                  bgcolor: "#CC6C06",
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
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Total Venta"
            value={`Bs ${fmt2(resumen.totalVenta)}`}
            color="#1e88e5"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Cantidad"
            value={resumen.totalCantidad}
            color="#43a047"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Descuentos"
            value={`Bs ${fmt2(resumen.totalDescuento)}`}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Utilidad"
            value={`Bs ${fmt2(resumen.utilidad)}`}
            color="#8e24aa"
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
        {/* cabecera de tabla */}
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Detalle de Ventas
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
                Sin resultados para los filtros seleccionados
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {[
                    "Nro",
                    "Usuario",
                    "Sucursal",
                    "Fecha",
                    "Hora",
                    "Código",
                    "Producto",
                    "Descripción",
                    "Lote",
                    "F. Venc.",
                    "Stk Ant.",
                    "Cant.",
                    "C/U",
                    "P/U",
                    "Dto.",
                    "Total",
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
                {data.map((row, i) => {
                  const sinMovimiento = (row.cantidad ?? 0) === 0;
                  return (
                    <TableRow
                      key={i}
                      hover
                      sx={{
                        opacity: sinMovimiento ? 0.45 : 1,
                        "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                      }}
                    >
                      <TableCell
                        sx={{ color: "text.secondary", fontSize: "0.72rem" }}
                      >
                        {i + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                        }}
                      >
                        {row.nombreUsuario}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.sucursal}
                          size="small"
                          sx={{
                            bgcolor: "#05305A14",
                            color: "#05305A",
                            fontWeight: 600,
                            fontSize: "0.68rem",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}
                      >
                        {fmtDate(row.fechaVenta)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.78rem" }}>
                        {row.horaVenta}
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
                          whiteSpace: "nowrap",
                          fontSize: "0.78rem",
                          maxWidth: 220,
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
                        {row.descripcion}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}
                      >
                        {row.numeroLote}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.72rem",
                          whiteSpace: "nowrap",
                          color: "text.secondary",
                        }}
                      >
                        {fmtDate(row.fechaVencimiento)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.stockAnterior ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1565c0",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.cantidad}
                          size="small"
                          color={sinMovimiento ? "default" : "primary"}
                          sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.78rem" }}>
                        {fmt2(row.costoUnitario)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        {fmt2(row.precioUnitario)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.78rem",
                          color:
                            row.descuento > 0 ? "#e53935" : "text.secondary",
                        }}
                      >
                        {fmt2(row.descuento)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: sinMovimiento ? "text.disabled" : "#CC6C06",
                          }}
                        >
                          {fmt2(row.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Card>
    </Box>
  );
}
