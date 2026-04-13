// src/modules/reports/components/ReportePorSucursalesSection.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
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
  CircularProgress,
  Tooltip,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import { Search, Storefront, Science } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import pharmacyApiClient from "../../../services/api/pharmacyApiClient";
import productService from "../../../services/api/productService";

// ─── Colorimetría ─────────────────────────────────────────────────────────────
const getStockColor = (alertaColor, stock) => {
  if (stock < 0) return { bg: "#E1BEE7", color: "#6A1B9A", label: stock }; // morado — negativo
  switch (alertaColor?.toUpperCase()) {
    case "VERDE":
      return { bg: "#C8E6C9", color: "#1B5E20", label: stock };
    case "AMARILLO":
      return { bg: "#FFF9C4", color: "#F57F17", label: stock };
    case "ROJO":
      return { bg: "#FFCDD2", color: "#B71C1C", label: stock };
    default:
      return { bg: "#F5F5F5", color: "#616161", label: stock };
  }
};

const StockCell = ({ stock, alerta, precio }) => {
  const { bg, color } = getStockColor(alerta, stock);
  return (
    <TableCell align="center" sx={{ p: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: bg,
          borderRadius: 1.5,
          px: 1,
          py: 0.5,
          minWidth: 70,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color, fontSize: "0.85rem" }}
        >
          {stock}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color, fontSize: "0.68rem", opacity: 0.85 }}
        >
          Bs. {Number(precio).toFixed(2)}
        </Typography>
      </Box>
    </TableCell>
  );
};

const SUCURSALES = [
  { key: "sanMartin", label: "SAN MARTÍN" },
  { key: "brasil", label: "BRASIL" },
  { key: "uruguay", label: "URUGUAY" },
  { key: "tiquipaya", label: "TIQUIPAYA" },
  { key: "pacata", label: "PACATA" },
];

// ─── Componente principal ─────────────────────────────────────────────────────
const ReportePorSucursalesSection = ({ compactMode = false }) => {
  const [nombreProducto, setNombreProducto] = useState("");
  const [lineaId, setLineaId] = useState("");
  const [lineas, setLineas] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLineas, setLoadingLineas] = useState(false);
  const [searched, setSearched] = useState(false);

  // Cargar líneas al montar
  useEffect(() => {
    const loadLineas = async () => {
      try {
        setLoadingLineas(true);
        const res = await productService.getLineas();
        setLineas(res || []);
      } catch (e) {
        console.error("Error cargando líneas:", e);
      } finally {
        setLoadingLineas(false);
      }
    };
    loadLineas();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!nombreProducto && !lineaId) return;
    try {
      setLoading(true);
      const params = {};
      if (nombreProducto) params.NombreProducto = nombreProducto;
      if (lineaId) params.Linea_ID = lineaId;

      const res = await pharmacyApiClient.get(
        "/Reportes/ProductosPorSucursal",
        { params },
      );
      setResults(res.data?.datos || []);
      setSearched(true);
    } catch (e) {
      console.error("Error en reporte por sucursales:", e);
    } finally {
      setLoading(false);
    }
  }, [nombreProducto, lineaId]);

  // Búsqueda al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const totalRows = results.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Filtros */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: compactMode ? 2 : 3 }}>
          {!compactMode && (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: farmaColors.secondary, mb: 1 }}
              >
                Filtros de Búsqueda
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <TextField
              sx={{ flex: 2, minWidth: 200 }}
              size="small"
              label="Buscar por Nombre de Producto"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: farmaColors.primary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              sx={{ flex: 2, minWidth: 200 }}
              size="small"
              label={
                loadingLineas
                  ? "Cargando líneas..."
                  : "Filtrar por Línea / Laboratorio"
              }
              value={lineaId}
              onChange={(e) => setLineaId(e.target.value)}
              disabled={loadingLineas}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Science
                      sx={{ color: farmaColors.primary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Todas las líneas</MenuItem>
              {lineas.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.nombre}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="small"
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Search />
                )
              }
              onClick={handleSearch}
              disabled={loading || (!nombreProducto && !lineaId)}
              sx={{
                background:
                  farmaColors.gradients?.primary || farmaColors.primary,
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                height: 40,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            {searched && results.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setNombreProducto("");
                  setLineaId("");
                  setResults([]);
                  setSearched(false);
                }}
                sx={{
                  borderColor: farmaColors.secondary,
                  color: farmaColors.secondary,
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  height: 40,
                  whiteSpace: "nowrap",
                }}
              >
                Limpiar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Leyenda de colores */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", px: 0.5 }}>
        {[
          { bg: "#C8E6C9", color: "#1B5E20", label: "Stock alto" },
          { bg: "#FFF9C4", color: "#F57F17", label: "Stock bajo" },
          { bg: "#FFCDD2", color: "#B71C1C", label: "Sin stock" },
          { bg: "#E1BEE7", color: "#6A1B9A", label: "Stock negativo" },
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
                bgcolor: item.bg,
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
        {searched && (
          <Chip
            label={`${totalRows} producto${totalRows !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              ml: "auto",
              bgcolor: farmaColors.alpha?.secondary10,
              color: farmaColors.secondary,
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      {/* Tabla */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{ maxHeight: compactMode ? 420 : "calc(100vh - 320px)" }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    color: farmaColors.secondary,
                    bgcolor:
                      farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)",
                    minWidth: 80,
                  }}
                >
                  Código
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    color: farmaColors.secondary,
                    bgcolor:
                      farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.08)",
                    minWidth: 220,
                  }}
                >
                  Producto
                </TableCell>
                {SUCURSALES.map((s) => (
                  <TableCell
                    key={s.key}
                    align="center"
                    sx={{
                      fontWeight: 800,
                      color: "white",
                      bgcolor: farmaColors.secondary,
                      minWidth: 110,
                      fontSize: "0.75rem",
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
                      <Storefront sx={{ fontSize: 14 }} />
                      {s.label}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, fontSize: "0.65rem" }}
                    >
                      Stock / P.U.
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: "white" }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: farmaColors.primary }} />
                    <Typography
                      sx={{ mt: 2, display: "block" }}
                      color="text.secondary"
                    >
                      Cargando productos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Storefront
                      sx={{
                        fontSize: 48,
                        color: "text.disabled",
                        mb: 1,
                        opacity: 0.3,
                      }}
                    />
                    <Typography variant="h6" color="text.disabled">
                      {searched
                        ? "No se encontraron productos"
                        : "Ingrese un nombre o seleccione una línea"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((row) => (
                  <TableRow
                    key={row.producto_ID}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor:
                          farmaColors.alpha?.primary10 ||
                          "rgba(204,108,6,0.04)",
                      },
                    }}
                  >
                    {/* Código */}
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: farmaColors.secondary,
                        }}
                      >
                        {row.codigoProducto}
                      </Typography>
                    </TableCell>

                    {/* Producto con tooltip de presentación */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {row.producto}
                            </Typography>
                            <Typography variant="caption">
                              📦 {row.presentacion}
                            </Typography>
                          </Box>
                        }
                        placement="right"
                        arrow
                      >
                        <Box sx={{ cursor: "default" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.82rem",
                              color: "#1a1a1a",
                            }}
                            noWrap
                          >
                            {row.producto}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    {/* Sucursales */}
                    <StockCell
                      stock={row.sanMartinStock}
                      alerta={row.sanMartinAlertaColor}
                      precio={row.sanMartinPrecioUnitario}
                    />
                    <StockCell
                      stock={row.brasilStock}
                      alerta={row.brasilAlertaColor}
                      precio={row.brasilPrecioUnitario}
                    />
                    <StockCell
                      stock={row.uruguayStock}
                      alerta={row.uruguayAlertaColor}
                      precio={row.uruguayPrecioUnitario}
                    />
                    <StockCell
                      stock={row.tiquipayaStock}
                      alerta={row.tiquipayaAlertaColor}
                      precio={row.tiquipayaPrecioUnitario}
                    />
                    <StockCell
                      stock={row.pacataStock}
                      alerta={row.pacataAlertaColor}
                      precio={row.pacataPrecioUnitario}
                    />
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default ReportePorSucursalesSection;
