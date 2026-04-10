// src/modules/reports/pages/MejorVentaPage.jsx
// Ruta: /reportes/mejor-venta

import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { BarChart as BarChartIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import reportesService from "../../../services/api/reportesService";
import { useAuth } from "../../../context/AuthContext";
import { lazy, Suspense } from "react";

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

export default function MejorVentaPage() {
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
    str?.length > 12 ? str.substring(0, 10) + "u2026" : str;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader
          title="Productos más Vendidos"
          subtitle={`Top productos por sucursal u00b7 ${user?.sucursal ?? "u2014"}`}
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

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 160 }}>
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
                label={`Cantidad de Productos: ${datos.length}`}
                sx={{
                  bgcolor: farmaColors.alpha?.primary10 ?? "#fff3e0",
                  color: farmaColors.primary,
                  fontWeight: 700,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 2 }}
          >
            {MESES.find((m) => m.value === mes)?.label}
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: farmaColors.primary }} />
            </Box>
          ) : datos.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
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

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 2, color: farmaColors.secondary }}
          >
            Detalle de productos
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: farmaColors.secondary }}>
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
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
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
                      sx={{ bgcolor: i % 2 === 0 ? "#fafafa" : "white" }}
                    >
                      <TableCell sx={{ fontSize: "0.78rem", color: "#999" }}>
                        {i + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.78rem" }}>
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
                            bgcolor: farmaColors.primary,
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
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
