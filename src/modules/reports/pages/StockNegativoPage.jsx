// REEMPLAZAR todo el contenido de StockNegativoPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Breadcrumbs,
  Link,
  Container,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search, Inventory, Storefront } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import reportesService from "../../../services/api/reportesService";
import userService from "../../../services/api/userService";
import ProductoBuscador from "../components/ProductoBuscador";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt2 = (n) => Number(n ?? 0).toFixed(2);

const getStockStyle = (alerta, stock) => {
  if (stock < 0) return { bgcolor: "#E1BEE7", color: "#6A1B9A" };
  switch (alerta?.toUpperCase()) {
    case "VERDE":
      return { bgcolor: "#C8E6C9", color: "#1B5E20" };
    case "AMARILLO":
      return { bgcolor: "#FFF9C4", color: "#F57F17" };
    case "ROJO":
      return { bgcolor: "#FFCDD2", color: "#B71C1C" };
    default:
      return { bgcolor: "#F5F5F5", color: "#616161" };
  }
};

const detectarSucursales = (datos) => {
  if (!datos?.length) return [];
  return Object.keys(datos[0])
    .filter((k) => k.endsWith("Stock") && k !== "stockActual")
    .map((k) => ({
      key: k.replace("Stock", ""),
      label: k
        .replace("Stock", "")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .toUpperCase(),
    }));
};

function StockCell({ stock, alerta, precio }) {
  const style = getStockStyle(alerta, stock);
  return (
    <TableCell align="center" sx={{ p: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          ...style,
          borderRadius: 1.5,
          px: 1,
          py: 0.5,
          minWidth: 80,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: style.color, fontSize: "0.85rem" }}
        >
          {stock}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: style.color, fontSize: "0.68rem", opacity: 0.85 }}
        >
          Bs {fmt2(precio)}
        </Typography>
      </Box>
    </TableCell>
  );
}

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
          {typeof value === "number" && label !== "Total Productos"
            ? `Bs ${fmt2(value)}`
            : value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── TAB 1: Stock Negativo ─────────────────────────────────────────────────────
function TabStockNegativo() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(async () => {
    setLoading(true);
    setDatos(await reportesService.buscarProductosStockNegativo());
    setLoading(false);
  }, []);

  useEffect(() => {
    buscar();
  }, []);

  return (
    <Box>
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
          sx={{ bgcolor: "#7f5af0", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600 }}
          >
            Búsqueda
          </Typography>
        </Box>
        <CardContent>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={buscar}
            sx={{ bgcolor: "#7f5af0", "&:hover": { bgcolor: "#6b46e0" } }}
          >
            Buscar Stock Negativos
          </Button>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{ mb: 2, borderRadius: 2, bgcolor: farmaColors.secondary }}
      >
        <CardContent sx={{ py: "12px !important" }}>
          <Typography sx={{ color: "white", fontWeight: 700 }}>
            CANTIDAD PRODUCTOS CON STOCK NEGATIVOS:{" "}
            <Chip
              label={datos.length}
              size="small"
              sx={{
                bgcolor: datos.length > 0 ? "#e74c3c" : "#27ae60",
                color: "white",
                fontWeight: 800,
              }}
            />
          </Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: farmaColors.primary }} />
        </Box>
      ) : (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: farmaColors.secondary }}>
                  {[
                    "Código",
                    "Producto",
                    "Forma Farmacéutica",
                    "Presentación",
                    "Línea",
                    "Laboratorio",
                    "Stock",
                    "P/U",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: "white",
                        fontWeight: 700,
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
                {datos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No se encontraron productos con stock negativo
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
                      <TableCell
                        sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                      >
                        {r.formaFarmaceutica}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {r.presentacion}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {r.linea}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.72rem" }}>
                        {r.laboratorio}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={r.stockActual}
                          size="small"
                          sx={{
                            bgcolor: r.stockActual < 0 ? "#e74c3c" : "#27ae60",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        {r.precioUnitario}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}
    </Box>
  );
}

// ── TAB 2: Stock Almacén Sucursal ─────────────────────────────────────────────
function TabStockAlmacen() {
  const [data, setData] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalesTabla, setSucursalesTabla] = useState([]);
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

  const [totales, setTotales] = useState({
    productos: 0,
    compras: 0,
    ventas: 0,
    utilidad: 0,
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

  const handleBuscar = async () => {
    if (!filtros.codigoSucursal || !filtros.lineaId) return;
    setLoading(true);
    const res = await reportesService.getStockAlmacenSucursal({
      codigoSucursal: filtros.codigoSucursal,
      lineaId: filtros.lineaId,
      laboratorioId: filtros.laboratorioId || "",
      codigoProducto: filtros.producto?.codigoProducto ?? "",
      nombreProducto: filtros.producto?.nombreProducto ?? "",
    });
    setData(res);
    setSucursalesTabla(detectarSucursales(res));
    setTotales({
      productos: res.length,
      compras: res.reduce((s, d) => s + (d.comprasTotales || 0), 0),
      ventas: res.reduce((s, d) => s + (d.ventasTotales || 0), 0),
      utilidad: res.reduce((s, d) => s + (d.utilidad || 0), 0),
    });
    setLoading(false);
  };

  const puedesBuscar = filtros.codigoSucursal && filtros.lineaId;

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
            Búsqueda — Sucursal y Línea son obligatorios
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

            <Grid item xs={12} sm={3} />

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
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {[
          { bgcolor: "#C8E6C9", color: "#1B5E20", label: "Stock alto" },
          { bgcolor: "#FFF9C4", color: "#F57F17", label: "Stock bajo" },
          { bgcolor: "#FFCDD2", color: "#B71C1C", label: "Sin stock" },
          { bgcolor: "#E1BEE7", color: "#6A1B9A", label: "Stock negativo" },
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
        {data.length > 0 && (
          <Chip
            label={`${data.length} productos`}
            size="small"
            sx={{
              ml: "auto",
              bgcolor: "#05305A14",
              color: "#05305A",
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      {/* TOTALES */}
      {data.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <SummaryCard
              label="Total Productos"
              value={totales.productos}
              color="#1e88e5"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard
              label="Total Compras"
              value={totales.compras}
              color="#43a047"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard
              label="Total Ventas"
              value={totales.ventas}
              color="#CC6C06"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard
              label="Utilidad"
              value={totales.utilidad}
              color="#8e24aa"
            />
          </Grid>
        </Grid>
      )}

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
            Stock por Sucursal — Stock / P.U.
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
                  : "Seleccione Sucursal y Línea para buscar"}
              </Typography>
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      bgcolor: "rgba(5,48,90,0.06)",
                      whiteSpace: "nowrap",
                      minWidth: 80,
                    }}
                  >
                    Código
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      bgcolor: "rgba(5,48,90,0.06)",
                      minWidth: 200,
                    }}
                  >
                    Producto
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      bgcolor: "rgba(5,48,90,0.06)",
                      minWidth: 90,
                    }}
                  >
                    C. Total
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      bgcolor: "rgba(5,48,90,0.06)",
                      minWidth: 90,
                    }}
                  >
                    V. Total
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: "#05305A",
                      bgcolor: "rgba(5,48,90,0.06)",
                      minWidth: 90,
                    }}
                  >
                    Utilidad
                  </TableCell>
                  {sucursalesTabla.map((s) => (
                    <TableCell
                      key={s.key}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        bgcolor: "#05305A",
                        fontSize: "0.72rem",
                        whiteSpace: "nowrap",
                        minWidth: 100,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <Storefront sx={{ fontSize: 13 }} />
                        {s.label}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.8, fontSize: "0.62rem" }}
                      >
                        Stock / P.U.
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow
                    key={row.producto_ID ?? i}
                    hover
                    sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
                  >
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
                    <TableCell
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",                        
                      }}
                    >
                      {row.producto}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.72rem" }}>
                      {fmt2(row.comprasTotales)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.72rem" }}>
                      {fmt2(row.ventasTotales)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: row.utilidad > 0 ? "#43a047" : "text.secondary",
                      }}
                    >
                      {fmt2(row.utilidad)}
                    </TableCell>
                    {sucursalesTabla.map((s) => (
                      <StockCell
                        key={s.key}
                        stock={row[`${s.key}Stock`] ?? 0}
                        alerta={row[`${s.key}AlertaColor`]}
                        precio={row[`${s.key}PrecioUnitario`] ?? 0}
                      />
                    ))}
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
export default function StockNegativoPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader
          title="Almacenes"
          subtitle="Stock negativo y stock por sucursal"
          icon={<Inventory />}
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
          <Typography color="text.primary">Almacenes</Typography>
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
        <Tab label="Stock Negativo" />
        <Tab label="Stock Almacén por Sucursal" />
      </Tabs>

      {tab === 0 && <TabStockNegativo />}
      {tab === 1 && <TabStockAlmacen />}
    </Container>
  );
}
