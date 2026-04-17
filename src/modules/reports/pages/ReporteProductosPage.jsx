// src/modules/reports/pages/ReporteProductosPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

const fmt2 = (n) => (n ?? 0).toFixed(2);

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

const getStockColor = (stock) => {
  if (stock < 0) return { bgcolor: "#E1BEE7", color: "#6A1B9A" };
  if (stock === 0) return { bgcolor: "#FFCDD2", color: "#B71C1C" };
  if (stock <= 5) return { bgcolor: "#FFF9C4", color: "#F57F17" };
  return { bgcolor: "#C8E6C9", color: "#1B5E20" };
};

export default function ReporteProductosPage() {
  const [data, setData] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabs, setLoadingLabs] = useState(false);

  const [filtros, setFiltros] = useState({
    codigoSucursal: "",
    lineaId: "",
    laboratorioId: "",
    producto: null,
  });

  const [resumen, setResumen] = useState({
    totalProductos: 0,
    totalStock: 0,
    sinStock: 0,
    stockNegativo: 0,
  });

  useEffect(() => {
    const init = async () => {
      const [suc, lin] = await Promise.all([
        userService.getSucursales(),
        reportesService.getLineasProductos(),
      ]);
      setSucursales(suc ?? []);
      setLineas(lin ?? []);
    };
    init();
  }, []);

  // Cargar laboratorios cuando cambia la línea
  useEffect(() => {
    if (!filtros.lineaId) {
      setLaboratorios([]);
      setFiltros((f) => ({ ...f, laboratorioId: "" }));
      return;
    }
    const fetchLabs = async () => {
      setLoadingLabs(true);
      const res = await reportesService.getLaboratoriosPorLinea(
        filtros.lineaId,
      );
      setLaboratorios(res ?? []);
      setFiltros((f) => ({ ...f, laboratorioId: "" }));
      setLoadingLabs(false);
    };
    fetchLabs();
  }, [filtros.lineaId]);

  const calcularResumen = (datos) => {
    setResumen({
      totalProductos: datos.length,
      totalStock: datos.reduce((s, d) => s + (d.stockActual || 0), 0),
      sinStock: datos.filter((d) => d.stockActual === 0).length,
      stockNegativo: datos.filter((d) => d.stockActual < 0).length,
    });
  };

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal || !filtros.lineaId) return;
    setLoading(true);
    const res = await reportesService.getListaProductos({
      codigoSucursal: filtros.codigoSucursal,
      lineaId: filtros.lineaId,
      laboratorioId: filtros.laboratorioId || "",
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setData(res);
    calcularResumen(res);
    setLoading(false);
  };

  const puedesBuscar = filtros.codigoSucursal && filtros.lineaId;

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
          Lista de Productos
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
            Búsqueda — Sucursal y Línea son obligatorios
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

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Línea *</InputLabel>
                <Select
                  value={filtros.lineaId}
                  label="Línea *"
                  onChange={(e) =>
                    setFiltros({ ...filtros, lineaId: e.target.value })
                  }
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {lineas.map((l) => (
                    <MenuItem key={l.codigoLinea} value={l.codigoLinea}>
                      {l.nombreLinea}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl
                fullWidth
                size="small"
                disabled={!filtros.lineaId || loadingLabs}
              >
                <InputLabel>
                  {loadingLabs ? "Cargando..." : "Laboratorio"}
                </InputLabel>
                <Select
                  value={filtros.laboratorioId}
                  label={loadingLabs ? "Cargando..." : "Laboratorio"}
                  onChange={(e) =>
                    setFiltros({ ...filtros, laboratorioId: e.target.value })
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {laboratorios.map((l) => (
                    <MenuItem
                      key={l.codigoLaboratorio}
                      value={l.codigoLaboratorio}
                    >
                      {l.nombreLaboratorio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              {/* placeholder para alinear */}
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
            label="Total Productos"
            value={resumen.totalProductos}
            color="#1e88e5"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Stock Total"
            value={resumen.totalStock}
            color="#43a047"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Sin Stock"
            value={resumen.sinStock}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Stock Negativo"
            value={resumen.stockNegativo}
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
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Detalle de Productos
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
                  ? "Sin resultados para los filtros seleccionados"
                  : "Seleccione Sucursal y Línea para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {[
                    "Nro",
                    "Sucursal",
                    "Código",
                    "Producto",
                    "Forma Farm.",
                    "Presentación",
                    "Línea",
                    "Laboratorio",
                    "Stock",
                    "C/U",
                    "P/U",
                    "P/C",
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
                  const stockStyle = getStockColor(row.stockActual);
                  return (
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
                        sx={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#CC6C06",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {row.codigoProducto}
                      </TableCell>                      
                      <TableCell
                        sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                      >
                        {row.nombreProducto}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                      >
                        {row.formaFarmaceutica}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}
                      >
                        {row.presentacion}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {row.linea}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {row.laboratorio}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.stockActual}
                          size="small"
                          sx={{
                            ...stockStyle,
                            fontWeight: 700,
                            fontSize: "0.72rem",
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
                      <TableCell align="right" sx={{ fontSize: "0.78rem" }}>
                        {fmt2(row.precioCaja)}
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
