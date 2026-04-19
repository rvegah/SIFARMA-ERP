// src/modules/reports/pages/KardexMovimientoPage.jsx
// Ruta: /finanzas/kardex

import React, { useEffect, useState, useCallback } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

const fmt2 = (n) => (n ?? 0).toFixed(2);
const fmtDate = (iso) => iso?.split("T")[0] ?? "";

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function EmptyOrLoading({ loading, puedesBuscar }) {
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress sx={{ color: "#CC6C06" }} />
      </Box>
    );
  return (
    <Box sx={{ textAlign: "center", py: 5 }}>
      <Typography color="text.secondary">
        {puedesBuscar
          ? "Sin resultados para los filtros seleccionados"
          : "Seleccione Sucursal y fechas para buscar"}
      </Typography>
    </Box>
  );
}

// ─── Tabla Ventas ─────────────────────────────────────────────────────────────
function TablaVentas({ datos, loading, puedesBuscar }) {
  if (loading || !datos.length)
    return <EmptyOrLoading loading={loading} puedesBuscar={puedesBuscar} />;
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            {[
              "Nro",
              "Fecha",
              "Hora",
              "Usuario",
              "N° Factura",
              "Tipo",
              "Código",
              "Producto",
              "Presentación",
              "Lote",
              "Cant. Salida",
              "Stk Ant.",
              "Stk Act.",
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
          {datos.map((row, i) => (
            <TableRow
              key={i}
              hover
              sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
            >
              <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                {i + 1}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {fmtDate(row.fechaMovimiento)}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>
                {row.horaMovimiento}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.nombreUsuario}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroFactura}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.tipoMovimiento}
                  size="small"
                  sx={{
                    bgcolor: "#FCE4EC",
                    color: "#880E4F",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  color: "#CC6C06",
                  fontWeight: 600,
                }}
              >
                {row.codigoProducto}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", minWidth: 180 }}>
                {row.nombreProducto}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {row.presentacion}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroLote}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.cantidadSalida}
                  size="small"
                  sx={{
                    bgcolor: "#FCE4EC",
                    color: "#880E4F",
                    fontSize: "0.70rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockAnterior ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockActual ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
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
                  color: row.descuento > 0 ? "#e53935" : "text.secondary",
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
                    color: "#CC6C06",
                  }}
                >
                  {fmt2(row.total)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Tabla Traspasos ──────────────────────────────────────────────────────────
function TablaTraspasos({ datos, loading, puedesBuscar }) {
  if (loading || !datos.length)
    return <EmptyOrLoading loading={loading} puedesBuscar={puedesBuscar} />;
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 1300 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            {[
              "Nro",
              "Fecha",
              "Hora",
              "Hora Acept.",
              "N° Traspaso",
              "Estado",
              "Tipo",
              "Origen",
              "Destino",
              "Enviado Por",
              "Recibe",
              "Código",
              "Producto",
              "Presentación",
              "Lote",
              "Cant. Salida",
              "Stk Ant.",
              "Stk Act.",
              "P/U",
              "Observaciones",
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
          {datos.map((row, i) => (
            <TableRow
              key={i}
              hover
              sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
            >
              <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                {i + 1}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {fmtDate(row.fechaMovimiento)}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>
                {row.horaMovimiento}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>
                {row.horaAceptacion}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroTraspaso}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.estadoTraspaso}
                  size="small"
                  sx={{
                    bgcolor:
                      row.estadoTraspaso === "REC" ? "#C8E6C9" : "#FFF9C4",
                    color: row.estadoTraspaso === "REC" ? "#1B5E20" : "#F57F17",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={row.tipoMovimiento}
                  size="small"
                  sx={{
                    bgcolor: "#FFF3E0",
                    color: "#E65100",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={row.sucursalOrigen}
                  size="small"
                  sx={{
                    bgcolor: "#05305A14",
                    color: "#05305A",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={row.sucursalDestino}
                  size="small"
                  sx={{
                    bgcolor: "#CC6C0614",
                    color: "#CC6C06",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.usuarioEnvio}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.usuarioRecibe}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  color: "#CC6C06",
                  fontWeight: 600,
                }}
              >
                {row.codigoProducto}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", minWidth: 180 }}>
                {row.nombreProducto}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {row.presentacion}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroLote}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.cantidadSalida}
                  size="small"
                  sx={{
                    bgcolor: "#FFF3E0",
                    color: "#E65100",
                    fontSize: "0.70rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockAnterior ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockActual ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontSize: "0.78rem", fontWeight: 600 }}
              >
                {fmt2(row.precioUnitario)}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  color: "text.secondary",
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.observaciones}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Tabla Compras ────────────────────────────────────────────────────────────
function TablaCompras({ datos, loading, puedesBuscar }) {
  if (loading || !datos.length)
    return <EmptyOrLoading loading={loading} puedesBuscar={puedesBuscar} />;
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 1400 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            {[
              "Nro",
              "Fecha",
              "Hora",
              "Hora Acept.",
              "N° Factura",
              "Tipo",
              "Estado",
              "Proveedor",
              "Laboratorio",
              "Usuario",
              "Código",
              "Producto",
              "Presentación",
              "Lote",
              "Cant. Entrada",
              "Stk Ant.",
              "Stk Act.",
              "C/U",
              "P/U",
              "Total",
              "Crédito",
              "Observaciones",
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
          {datos.map((row, i) => (
            <TableRow
              key={i}
              hover
              sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
            >
              <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                {i + 1}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {fmtDate(row.fechaMovimiento)}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>
                {row.horaMovimiento}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>
                {row.horaAceptacion}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroFactura}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.tipoMovimiento}
                  size="small"
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={row.estadoCompra}
                  size="small"
                  sx={{
                    bgcolor: row.estadoCompra === "HAB" ? "#C8E6C9" : "#FFCDD2",
                    color: row.estadoCompra === "HAB" ? "#1B5E20" : "#B71C1C",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.nombreProveedor}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.laboratorio}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {row.nombreUsuario}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  color: "#CC6C06",
                  fontWeight: 600,
                }}
              >
                {row.codigoProducto}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", minWidth: 180 }}>
                {row.nombreProducto}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {row.presentacion}
              </TableCell>
              <TableCell sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                {row.numeroLote}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.cantidadEntrada}
                  size="small"
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.70rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockAnterior ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.stockActual ?? 0}
                  size="small"
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.70rem",
                    fontWeight: 600,
                  }}
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
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    color: "#CC6C06",
                  }}
                >
                  {fmt2(row.total)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={row.esCredito ? "Crédito" : "Contado"}
                  size="small"
                  sx={{
                    bgcolor: row.esCredito ? "#FFF9C4" : "#C8E6C9",
                    color: row.esCredito ? "#F57F17" : "#1B5E20",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "0.72rem",
                  color: "text.secondary",
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.observaciones}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function KardexMovimientoPage() {
  const [tab, setTab] = useState(0);
  const [ventas, setVentas] = useState([]);
  const [traspasos, setTraspasos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lineas, setLineas] = useState([]);

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
    codigoUsuario: 0,
    lineaId: "",
    producto: null,
  });

  useEffect(() => {
    const init = async () => {
      const [suc, usr, lin] = await Promise.all([
        userService.getSucursales(),
        userService.getEmpleadosUsuarios(),
        reportesService.getLineasProductos(),
      ]);
      setSucursales(suc ?? []);
      setUsuarios(usr ?? []);
      setLineas(lin ?? []);
    };
    init();
  }, []);

  const handleBuscar = useCallback(async () => {
    if (!filtros.codigoSucursal) return;
    setLoading(true);
    const res = await reportesService.getKardexMovimiento({
      codigoSucursal: filtros.codigoSucursal,
      fechaInicio: filtros.fechaInicio,
      fechaFinal: filtros.fechaFinal,
      codigoUsuario: filtros.codigoUsuario || null,
      lineaId: filtros.lineaId || null,
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setVentas(res.ventas ?? []);
    setTraspasos(res.traspasos ?? []);
    setCompras(res.compras ?? []);
    setLoading(false);
  }, [filtros]);

  const puedesBuscar =
    !!filtros.codigoSucursal && !!filtros.fechaInicio && !!filtros.fechaFinal;

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
          Kardex de Movimientos
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: "#880E4F", fontWeight: 600 }}
          >
            Ventas: {ventas.length}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#E65100", fontWeight: 600 }}
          >
            Traspasos: {traspasos.length}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#2E7D32", fontWeight: 600 }}
          >
            Compras: {compras.length}
          </Typography>
        </Box>
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
            Búsqueda — Sucursal y fechas son obligatorias
          </Typography>
        </Box>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* FILA 1 */}
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

            <Grid item xs={12} sm={2}>
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

            <Grid item xs={12} sm={2}>
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

            <Grid item xs={12} sm={2}>
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

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Línea</InputLabel>
                <Select
                  value={filtros.lineaId}
                  label="Línea"
                  onChange={(e) =>
                    setFiltros({ ...filtros, lineaId: e.target.value })
                  }
                >
                  <MenuItem value="">Todas</MenuItem>
                  {lineas.map((l) => (
                    <MenuItem key={l.codigoLinea} value={l.codigoLinea}>
                      {l.nombreLinea}
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
                Ver Kardex
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 0,
          "& .MuiTab-root": { fontWeight: 600 },
          "& .Mui-selected": { color: "#CC6C06" },
          "& .MuiTabs-indicator": { bgcolor: "#CC6C06" },
        }}
      >
        <Tab label={`Ventas (${ventas.length})`} />
        <Tab label={`Traspasos (${traspasos.length})`} />
        <Tab label={`Compras (${compras.length})`} />
      </Tabs>

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
        }}
      >
        <TabPanel value={tab} index={0}>
          <TablaVentas
            datos={ventas}
            loading={loading}
            puedesBuscar={puedesBuscar}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TablaTraspasos
            datos={traspasos}
            loading={loading}
            puedesBuscar={puedesBuscar}
          />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <TablaCompras
            datos={compras}
            loading={loading}
            puedesBuscar={puedesBuscar}
          />
        </TabPanel>
      </Card>
    </Box>
  );
}
