// src/modules/reports/pages/ReportePedidosPage.jsx

import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField,
  Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

function SummaryCard({ label, value, color }) {
  return (
    <Card elevation={0} sx={{ border: `1.5px solid ${color}22`, borderTop: `4px solid ${color}`, borderRadius: 2 }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color, mt: 0.25 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function ReportePedidosPage() {
  const [data, setData] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const [filtros, setFiltros] = useState({
    codigoSucursal: "",
    fechaInicio:    primerDiaMes,
    fechaFinal:     hoy,
    producto:       null,
  });

  const [resumen, setResumen] = useState({
    totalRegistros: 0,
    totalCantidad:  0,
    totalLineas:    0,
  });

  useEffect(() => {
    userService.getSucursales().then((res) => setSucursales(res ?? []));
  }, []);

  const calcularResumen = (datos) => {
    const lineasUnicas = new Set(datos.map((d) => d.linea)).size;
    setResumen({
      totalRegistros: datos.length,
      totalCantidad:  datos.reduce((s, d) => s + (d.cantidad || 0), 0),
      totalLineas:    lineasUnicas,
    });
  };

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal) return;
    setLoading(true);
    const res = await reportesService.getPedidosSucursal({
      codigoSucursal: filtros.codigoSucursal,
      fechaInicio:    filtros.fechaInicio,
      fechaFinal:     filtros.fechaFinal,
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setData(res);
    calcularResumen(res);
    setLoading(false);
  };

  const puedesBuscar = filtros.codigoSucursal && filtros.fechaInicio && filtros.fechaFinal;

  return (
    <Box>
      {/* ENCABEZADO */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, pb: 1.5, borderBottom: "2px solid #CC6C0622" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#05305A" }}>Pedidos por Sucursal</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{data.length} registros</Typography>
      </Box>

      {/* FILTROS */}
      <Card elevation={0} sx={{ mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}>
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>
            Búsqueda — Sucursal y fechas son obligatorios
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
                  onChange={(e) => setFiltros({ ...filtros, codigoSucursal: e.target.value })}
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {sucursales.map((s) => (
                    <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>{s.nombreSucursal}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Inicio *" type="date" size="small" fullWidth
                value={filtros.fechaInicio}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha Final *" type="date" size="small" fullWidth
                value={filtros.fechaFinal}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFiltros({ ...filtros, fechaFinal: e.target.value })}
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
                variant="contained" fullWidth startIcon={<SearchIcon />}
                disabled={!puedesBuscar || loading}
                sx={{
                  height: "40px",
                  bgcolor: puedesBuscar ? "#CC6C06" : "grey.400",
                  "&:hover": { bgcolor: "#a85705" },
                  fontWeight: 600, textTransform: "none", borderRadius: 1.5,
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
          <SummaryCard label="Total Registros" value={resumen.totalRegistros} color="#1e88e5" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Total Cantidad"  value={resumen.totalCantidad}  color="#43a047" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Líneas Distintas" value={resumen.totalLineas}   color="#CC6C06" />
        </Grid>
      </Grid>

      {/* TABLA */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>Detalle de Pedidos</Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#CC6C06" }} />
            </Box>
          ) : data.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography color="text.secondary">
                {puedesBuscar ? "Sin resultados" : "Seleccione sucursal y fechas para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {["Nro","Sucursal","Línea","Código","Producto","Presentación","Cantidad"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#05305A", whiteSpace: "nowrap", py: 1 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} hover sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem" }}>{i + 1}</TableCell>
                    <TableCell>
                      <Chip label={row.sucursal} size="small"
                        sx={{ bgcolor: "#05305A14", color: "#05305A", fontWeight: 600, fontSize: "0.68rem" }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem" }}>{row.linea}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#CC6C06", fontWeight: 600 }}>
                      {row.codigoProducto}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", fontWeight: 500, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Tooltip title={row.nombreProducto} arrow>
                        <span>{row.nombreProducto}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                      {row.presentacion}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={row.cantidad} size="small" color="primary"
                        sx={{ fontWeight: 700, fontSize: "0.72rem" }} />
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