// src/modules/reports/pages/InventarioDiarioPage.jsx
// Ruta: /finanzas/inventario-diario

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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

const fmt2 = (n) => (n ?? 0).toFixed(2);
const fmtDate = (iso) => iso?.split("T")[0] ?? "";

const getAlertaStockColor = (alerta) => {
  if (alerta === "ROJO") return { bgcolor: "#FFCDD2", color: "#B71C1C" };
  if (alerta === "AMARILLO") return { bgcolor: "#FFF9C4", color: "#F57F17" };
  return { bgcolor: "#C8E6C9", color: "#1B5E20" };
};

const getAlertaVencColor = (alerta) => {
  if (alerta === "ROJO") return { bgcolor: "#FFCDD2", color: "#B71C1C" };
  if (alerta === "AMARILLO") return { bgcolor: "#FFF9C4", color: "#F57F17" };
  return { bgcolor: "#C8E6C9", color: "#1B5E20" };
};

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

export default function InventarioDiarioPage() {
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
    totalProductos: 0,
    valorInventario: 0,
    alertaRojo: 0,
    alertaAmarillo: 0,
  });

  useEffect(() => {
    const init = async () => {
      const suc = await userService.getSucursales();
      setSucursales(suc ?? []);
    };
    init();
  }, []);

  const calcularResumen = (datos) => {
    setResumen({
      totalProductos: datos.length,
      valorInventario: datos.reduce((s, d) => s + (d.valorInventario || 0), 0),
      alertaRojo: datos.filter((d) => d.alertaStock === "ROJO").length,
      alertaAmarillo: datos.filter((d) => d.alertaStock === "AMARILLO").length,
    });
  };

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal) return;
    setLoading(true);
    const res = await reportesService.getInventarioDiario({
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
          Inventario Diario
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
            Búsqueda — Sucursal es obligatoria
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

      {/* LEYENDA */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {[
          {
            bgcolor: "#FFCDD2",
            color: "#B71C1C",
            label: "Stock crítico (ROJO)",
          },
          {
            bgcolor: "#FFF9C4",
            color: "#F57F17",
            label: "Stock bajo (AMARILLO)",
          },
          { bgcolor: "#C8E6C9", color: "#1B5E20", label: "Stock OK (VERDE)" },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: 0.5,
                bgcolor: item.bgcolor,
                border: `1px solid ${item.color}30`,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: item.color, fontWeight: 600, fontSize: "0.72rem" }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

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
            label="Valor Inventario"
            value={`Bs ${fmt2(resumen.valorInventario)}`}
            color="#43a047"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Alerta Roja"
            value={resumen.alertaRojo}
            color="#e53935"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Alerta Amarilla"
            value={resumen.alertaAmarillo}
            color="#fb8c00"
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
            Detalle de Inventario
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
                  : "Seleccione una sucursal para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {[
                    "Nro",
                    "Código",
                    "Producto",
                    "Presentación",
                    "Línea",
                    "Laboratorio",
                    "Lote",
                    "F. Venc.",
                    "Días Venc.",
                    "Stk Inicial",
                    "Compras",
                    "T. Entrada",
                    "T. Salida",
                    "Ventas",
                    "Anulac.",
                    "Salidas",
                    "Stk Actual",
                    "C/U",
                    "P/U",
                    "Valor Inv.",
                    "St. Stock",
                    "St. Venc.",
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
                  const stockStyle = getAlertaStockColor(row.alertaStock);
                  const vencStyle = getAlertaVencColor(row.alertaVencimiento);
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
                      <TableCell
                        sx={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#CC6C06",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.codigoProducto}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          minWidth: 200,
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
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {row.linea}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}
                      >
                        {row.laboratorio}
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
                          label={row.diasAlVencimiento}
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
                          label={row.stockInicial}
                          size="small"
                          sx={{
                            bgcolor: "#f5f5f5",
                            color: "#616161",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.compras}
                          size="small"
                          sx={{
                            bgcolor: "#E8F5E9",
                            color: "#2E7D32",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.traspasoEntrada}
                          size="small"
                          sx={{
                            bgcolor: "#E3F2FD",
                            color: "#1565C0",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.traspasoSalida}
                          size="small"
                          sx={{
                            bgcolor: "#FFF3E0",
                            color: "#E65100",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.ventas}
                          size="small"
                          sx={{
                            bgcolor: "#FCE4EC",
                            color: "#880E4F",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.anulaciones}
                          size="small"
                          sx={{
                            bgcolor: "#F3E5F5",
                            color: "#4A148C",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.salidas}
                          size="small"
                          sx={{
                            bgcolor: "#ECEFF1",
                            color: "#37474F",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                          }}
                        />
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
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: "#CC6C06",
                          }}
                        >
                          {fmt2(row.valorInventario)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.alertaStock}
                          size="small"
                          sx={{
                            ...stockStyle,
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.alertaVencimiento}
                          size="small"
                          sx={{
                            ...vencStyle,
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        />
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
