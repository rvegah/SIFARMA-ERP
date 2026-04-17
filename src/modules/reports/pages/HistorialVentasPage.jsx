// src/modules/reports/pages/HistorialVentasPage.jsx

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

const fmt = (iso) => {
  if (!iso || iso.startsWith("0001")) return "—";
  return iso.replace("T", " ").substring(0, 16);
};

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

export default function HistorialVentasPage() {
  const [data, setData] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  const [filtros, setFiltros] = useState({
    codigoSucursal: "",
    codigoUsuario:  "",
    fecha:          hoy,
    producto:       null,
  });

  const [resumen, setResumen] = useState({
    totalRegistros: 0,
    totalCantidad:  0,
    eliminados:     0,
  });

  useEffect(() => {
    const init = async () => {
      const [suc, usu] = await Promise.all([
        userService.getSucursales(),
        userService.getEmpleadosUsuarios(),
      ]);
      setSucursales(suc ?? []);
      setUsuarios(usu ?? []);
    };
    init();
  }, []);

  const calcularResumen = (datos) => {
    setResumen({
      totalRegistros: datos.length,
      totalCantidad:  datos.reduce((s, d) => s + (d.cantidad || 0), 0),
      eliminados:     datos.filter((d) => !d.fechaEliminacion?.startsWith("0001")).length,
    });
  };

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal || !filtros.codigoUsuario || !filtros.fecha) return;
    setLoading(true);
    const res = await reportesService.getHistorialVentas({
      codigoSucursal: filtros.codigoSucursal,
      codigoUsuario:  filtros.codigoUsuario,
      fecha:          filtros.fecha,
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setData(res);
    calcularResumen(res);
    setLoading(false);
  };

  const puedesBuscar = filtros.codigoSucursal && filtros.codigoUsuario && filtros.fecha;

  return (
    <Box>
      {/* ENCABEZADO */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, pb: 1.5, borderBottom: "2px solid #CC6C0622" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#05305A" }}>Historial de Ventas</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{data.length} registros</Typography>
      </Box>

      {/* FILTROS */}
      <Card elevation={0} sx={{ mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}>
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>
            Búsqueda — Sucursal, Usuario y Fecha son obligatorios
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
              <FormControl fullWidth size="small" required>
                <InputLabel>Usuario *</InputLabel>
                <Select
                  value={filtros.codigoUsuario}
                  label="Usuario *"
                  onChange={(e) => setFiltros({ ...filtros, codigoUsuario: e.target.value })}
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {usuarios.map((u) => (
                    <MenuItem key={u.codigoUsuario || u.usuario_ID} value={u.codigoUsuario || u.usuario_ID}>
                      {u.nombreCompleto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha *"
                type="date"
                size="small"
                fullWidth
                required
                value={filtros.fecha}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
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
          <SummaryCard label="Total Registros" value={resumen.totalRegistros} color="#1e88e5" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Total Cantidad"  value={resumen.totalCantidad}  color="#43a047" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Con Eliminación" value={resumen.eliminados}     color="#e53935" />
        </Grid>
      </Grid>

      {/* TABLA */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#05305A", px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>Detalle Historial</Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#CC6C06" }} />
            </Box>
          ) : data.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography color="text.secondary">
                {puedesBuscar ? "Sin resultados" : "Seleccione Sucursal, Usuario y Fecha para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  {["Nro","Sucursal","F. Facturación","F. Eliminación","Código","Producto","Cantidad","Motivo","Usuario"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#05305A", whiteSpace: "nowrap", py: 1 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => {
                  const fueEliminado = row.fechaEliminacion && !row.fechaEliminacion.startsWith("0001");
                  return (
                    <TableRow key={i} hover sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem" }}>{i + 1}</TableCell>
                      <TableCell>
                        <Chip label={row.sucursal} size="small"
                          sx={{ bgcolor: "#05305A14", color: "#05305A", fontWeight: 600, fontSize: "0.68rem" }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        <Chip label={fmt(row.fechaFacturacion)} size="small"
                          sx={{ bgcolor: "#CC6C06", color: "white", fontSize: "0.7rem", fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {fueEliminado ? (
                          <Chip label={fmt(row.fechaEliminacion)} size="small"
                            sx={{ bgcolor: "#e53935", color: "white", fontSize: "0.7rem", fontWeight: 600 }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#CC6C06", fontWeight: 600 }}>
                        {row.codigoProducto}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.78rem", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Tooltip title={row.nombreProducto} arrow>
                          <span>{row.nombreProducto}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.cantidad}
                          size="small"
                          color={row.cantidad > 0 ? "primary" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem", color: "text.secondary", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Tooltip title={row.motivo} arrow>
                          <span>{row.motivo}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap", fontWeight: 500 }}>
                        {row.nombreUsuario}
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