import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
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
  CircularProgress,
  Chip,
} from "@mui/material";

import { Search, Storefront, CalendarMonth } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { farmaColors } from "../../../app/theme";
import userService from "../../../services/api/userService";
import transferService from "../services/transferService";
import PageHeader from "../../../shared/components/PageHeader";

const ListaTraspasosSection = () => {
  const { enqueueSnackbar } = useSnackbar();

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [filters, setFilters] = useState({
    SucursalOrigen: "",
    SucursalDestino: "",
    FechaEnvioInicio: firstOfMonth,
    FechaEnvioFinal: today,
    CodigoProducto: "",
    NombreProducto: "",
  });

  const [sucursales, setSucursales] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService.getSucursales().then(setSucursales);
  }, []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!filters.SucursalOrigen) {
      enqueueSnackbar("Seleccione sucursal origen", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);

      const params = { ...filters };

      const res = await transferService.buscarListaTraspasos(params);

      if (res.exitoso) {
        const lista = res.datos || [];

        setData(lista); // 🔥 SIEMPRE LIMPIA O ACTUALIZA

        if (lista.length === 0) {
          enqueueSnackbar("No existe data disponible", {
            variant: "info",
          });
        }
      } else {
        setData([]); // 🔥 LIMPIA SI ERROR LÓGICO
        enqueueSnackbar(res.mensaje, { variant: "error" });
      }
    } catch (error) {
      setData([]); // 🔥 LIMPIA SI ERROR TÉCNICO
      enqueueSnackbar("Error al consultar", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Lista de Traspasos" />

      {/* FILTROS */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Filtros de búsqueda
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Sucursal Origen"
                value={filters.SucursalOrigen}
                onChange={(e) => handleChange("SucursalOrigen", e.target.value)}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                    {s.nombreSucursal}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Sucursal Destino"
                value={filters.SucursalDestino}
                onChange={(e) =>
                  handleChange("SucursalDestino", e.target.value)
                }
              >
                <MenuItem value="">Todas</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.sucursal_ID} value={s.sucursal_ID}>
                    {s.nombreSucursal}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label="Fecha Inicio"
                InputLabelProps={{ shrink: true }}
                value={filters.FechaEnvioInicio}
                onChange={(e) =>
                  handleChange("FechaEnvioInicio", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label="Fecha Fin"
                InputLabelProps={{ shrink: true }}
                value={filters.FechaEnvioFinal}
                onChange={(e) =>
                  handleChange("FechaEnvioFinal", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Código Producto"
                value={filters.CodigoProducto}
                onChange={(e) => handleChange("CodigoProducto", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre Producto"
                value={filters.NombreProducto}
                onChange={(e) => handleChange("NombreProducto", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: farmaColors.secondary }}>
                {[
                  "Sucursal",
                  "Enviado Por",
                  "Recibido Por",
                  "Estado",
                  "Fecha",
                  "Hora",
                  "Aceptado",
                  "Código",
                  "Producto",
                  "Vencimiento",
                  "C/U",
                  "P/U",
                  "P/C",
                  "Stock Ant.",
                  "Cant.",
                  "Total",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      color: "white",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
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
                  <TableCell colSpan={16} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} align="center" sx={{ py: 6 }}>
                    Sin resultados
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: farmaColors.alpha.primary10,
                      },
                    }}
                  >
                    {/* Sucursal */}
                    <TableCell>
                      <Typography fontWeight={600}>{row.sucursal}</Typography>
                    </TableCell>

                    {/* Enviado */}
                    <TableCell>
                      <Typography fontWeight={700} color="primary">
                        {row.usuarioEnvio}
                      </Typography>
                    </TableCell>

                    {/* Recibido */}
                    <TableCell>{row.usuarioRecibido || "-"}</TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Chip
                        label={row.estadoTraspaso}
                        size="small"
                        sx={{
                          bgcolor:
                            row.estadoTraspaso === "PEN"
                              ? "#fff3cd"
                              : row.estadoTraspaso === "ENV"
                                ? "#d1ecf1"
                                : "#e2e3e5",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Fecha */}
                    <TableCell>{row.fechaTraspaso?.split("T")[0]}</TableCell>

                    {/* Hora Traspaso */}
                    <TableCell>{row.horaTraspaso}</TableCell>

                    {/* Hora Aceptación */}
                    <TableCell>{row.horaAceptacion}</TableCell>

                    {/* Código */}
                    <TableCell>
                      <Chip
                        label={row.codigoProducto}
                        size="small"
                        sx={{
                          bgcolor: farmaColors.primary,
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Producto */}
                    <TableCell sx={{ minWidth: 220 }}>
                      <Typography fontWeight={600}>
                        {row.nombreProducto}
                      </Typography>
                    </TableCell>

                    {/* Vencimiento */}
                    <TableCell>{row.fechaVencimiento?.split("T")[0]}</TableCell>

                    {/* C/U */}
                    <TableCell>
                      <Chip
                        label={Number(row.costoUnitario).toFixed(2)}
                        size="small"
                        sx={{
                          bgcolor: "#f5f5f5",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* P/U */}
                    <TableCell>
                      <Chip
                        label={Number(row.precioUnitario).toFixed(2)}
                        size="small"
                        sx={{
                          bgcolor: "#ffcc80",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* P/C */}
                    <TableCell>
                      <Chip
                        label={Number(row.precioCaja).toFixed(2)}
                        size="small"
                        sx={{
                          bgcolor: "#ffe082",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Stock Anterior */}
                    <TableCell>
                      <Chip
                        label={row.stockAnterior}
                        size="small"
                        sx={{
                          bgcolor: "#e57373",
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell>
                      <Chip
                        label={row.cantidad}
                        size="small"
                        sx={{
                          bgcolor: "#4caf50",
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Total */}
                    <TableCell>
                      <Chip
                        label={Number(row.total).toFixed(2)}
                        size="small"
                        sx={{
                          bgcolor: farmaColors.primary,
                          color: "white",
                          fontWeight: 800,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
};

export default ListaTraspasosSection;
