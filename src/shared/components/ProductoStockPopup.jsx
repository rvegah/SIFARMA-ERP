// src/shared/components/ProductoStockPopup.jsx
// Popup de stock detallado por sucursal
// Reutilizable en Compras, Pedidos y Ventas
// Uso: <ProductoStockPopup codigoProducto="INT-0376" />
// Al hacer clic en el código se abre el popup automáticamente.

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
  Grid,
} from "@mui/material";
import {
  Close,
  Storefront,
  Inventory,
  CalendarMonth,
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { farmaColors } from "../../app/theme";
import pharmacyApiClient from "../../services/api/pharmacyApiClient";

// ─── Helpers de color ─────────────────────────────────────────────────────────
const ALERTA_CONFIG = {
  VERDE: {
    bg: "#C8E6C9",
    color: "#1B5E20",
    icon: <CheckCircle sx={{ fontSize: 14 }} />,
    label: "Óptimo",
  },
  AMARILLO: {
    bg: "#FFF9C4",
    color: "#F57F17",
    icon: <Warning sx={{ fontSize: 14 }} />,
    label: "Bajo",
  },
  ROJO: {
    bg: "#FFCDD2",
    color: "#B71C1C",
    icon: <Warning sx={{ fontSize: 14 }} />,
    label: "Crítico",
  },
};

const getAlertaConfig = (alerta) =>
  ALERTA_CONFIG[alerta?.toUpperCase()] || {
    bg: "#F5F5F5",
    color: "#616161",
    icon: null,
    label: alerta || "-",
  };

const AlertaChip = ({ alerta }) => {
  const cfg = getAlertaConfig(alerta);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        bgcolor: cfg.bg,
        color: cfg.color,
        px: 1,
        py: 0.3,
        borderRadius: 1,
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
};

const StockBadge = ({ value, alerta }) => {
  const cfg = getAlertaConfig(alerta);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: cfg.bg,
        color: cfg.color,
        px: 1.5,
        py: 0.5,
        borderRadius: 1.5,
        fontWeight: 800,
        fontSize: "0.9rem",
        minWidth: 48,
      }}
    >
      {value}
    </Box>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatPrice = (val) =>
  val !== null && val !== undefined ? `Bs. ${Number(val).toFixed(2)}` : "-";

// ─── Tarjeta de resumen por sucursal ─────────────────────────────────────────
const SucursalCard = ({ data }) => {
  const stockCfg = getAlertaConfig(data.alertaStock);
  const vencCfg = getAlertaConfig(data.alertaVencimiento);

  return (
    <Box
      sx={{
        border: `2px solid ${stockCfg.bg}`,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header sucursal */}
      <Box
        sx={{
          bgcolor: farmaColors.secondary,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Storefront sx={{ color: "white", fontSize: 16 }} />
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: 700, fontSize: "0.8rem" }}
          >
            {data.sucursal}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <AlertaChip alerta={data.alertaStock} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.5, bgcolor: "white" }}>
        {/* Stock principal */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.65rem" }}
            >
              STOCK ACTUAL
            </Typography>
            <StockBadge value={data.stockActual} alerta={data.alertaStock} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.65rem" }}
            >
              STOCK INICIAL
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: farmaColors.secondary }}
            >
              {data.stockInicial}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.65rem" }}
            >
              NRO. VENDIDO
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#f44336" }}
            >
              {data.totalVendido}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.65rem" }}
            >
              NRO. RESERVADO
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#FF9800" }}
            >
              {data.totalReservado}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Lotes y vencimientos */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.8 }}
          >
            <Inventory sx={{ fontSize: 13, color: farmaColors.primary }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: farmaColors.secondary,
                fontSize: "0.68rem",
              }}
            >
              LOTES ({data.cantidadLotes})
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.62rem", display: "block" }}
              >
                Mín
              </Typography>
              <Chip
                label={data.loteMIN || "-"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.68rem",
                  fontFamily: "monospace",
                  bgcolor:
                    farmaColors.alpha?.primary10 || "rgba(204,108,6,0.08)",
                  color: farmaColors.primary,
                  fontWeight: 700,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.62rem", display: "block" }}
              >
                Máx
              </Typography>
              <Chip
                label={data.loteMAX || "-"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.68rem",
                  fontFamily: "monospace",
                  bgcolor:
                    farmaColors.alpha?.primary10 || "rgba(204,108,6,0.08)",
                  color: farmaColors.primary,
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Vencimientos */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.8 }}
          >
            <CalendarMonth sx={{ fontSize: 13, color: vencCfg.color }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: farmaColors.secondary,
                fontSize: "0.68rem",
              }}
            >
              VENCIMIENTOS
            </Typography>
            <AlertaChip alerta={data.alertaVencimiento} />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.62rem", display: "block" }}
              >
                Más próximo
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: vencCfg.color,
                  fontSize: "0.72rem",
                }}
              >
                {formatDate(data.vencimientoMIN)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.62rem", display: "block" }}
              >
                Más lejano
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: vencCfg.color,
                  fontSize: "0.72rem",
                }}
              >
                {formatDate(data.vencimientoMAX)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Precios */}
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.8 }}
          >
            <TrendingUp sx={{ fontSize: 13, color: "#4CAF50" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: farmaColors.secondary,
                fontSize: "0.68rem",
              }}
            >
              COSTOS Y PRECIOS
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {[
              {
                label: "Costo mín",
                value: formatPrice(data.costoMIN),
                color: "#1565C0",
              },
              {
                label: "Costo máx",
                value: formatPrice(data.costoMAX),
                color: "#1565C0",
              },
              {
                label: "Costo prom",
                value: formatPrice(data.costoPromedio),
                color: "#0D47A1",
                bold: true,
              },
              {
                label: "P/U mín",
                value: formatPrice(data.precioUnitarioMIN),
                color: "#2E7D32",
              },
              {
                label: "P/U máx",
                value: formatPrice(data.precioUnitarioMAX),
                color: "#2E7D32",
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  flex: "1 1 80px",
                  bgcolor: "#F8F9FA",
                  borderRadius: 1,
                  px: 0.8,
                  py: 0.4,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: "0.58rem" }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: item.bold ? 800 : 700,
                    color: item.color,
                    fontSize: "0.7rem",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stock mín/máx configurados */}
        <Box sx={{ mt: 1.2, display: "flex", gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              bgcolor: "#FFF3E0",
              borderRadius: 1,
              px: 0.8,
              py: 0.4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.58rem" }}
            >
              Stock mín config.
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#E65100", fontSize: "0.7rem" }}
            >
              {data.stockMinimo}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              bgcolor: "#E8F5E9",
              borderRadius: 1,
              px: 0.8,
              py: 0.4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.58rem" }}
            >
              Stock máx config.
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.7rem" }}
            >
              {data.stockMaximo}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Chip clickeable del código de producto ───────────────────────────────────
export const CodigoProductoChip = ({ codigo, sx = {} }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = useCallback(
    async (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent?.stopImmediatePropagation(); // ← AGREGAR
      setOpen(true);
      if (data) return;
      try {
        setLoading(true);
        setError(null);
        const res = await pharmacyApiClient.get(
          "/Reportes/ProductosStockPorSucursal",
          { params: { CodigoProducto: codigo } },
        );
        setData(res.data?.datos || null);
      } catch (err) {
        setError("No se pudo cargar el stock del producto.");
      } finally {
        setLoading(false);
      }
    },
    [codigo, data],
  );

  return (
    <>
      <Tooltip title="Ver stock por sucursal" placement="top" arrow>
        <Chip
          label={codigo}
          size="small"
          onClick={handleClick}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            e.nativeEvent?.stopImmediatePropagation(); // ← AGREGAR
          }}
          data-codigo-chip="true"
          inputProps={{ "data-codigo-chip": "true" }}
          sx={{
            bgcolor: farmaColors.primary,
            color: "white",
            fontWeight: 700,
            fontSize: "0.72rem",
            height: 22,
            fontFamily: "monospace",
            cursor: "pointer",
            flexShrink: 0,
            "&:hover": {
              bgcolor: farmaColors.secondary,
              transform: "scale(1.05)",
            },
            transition: "all 0.15s ease",
            ...sx,
          }}
        />
      </Tooltip>

      <ProductoStockPopup
        open={open}
        onClose={() => setOpen(false)}
        codigoProducto={codigo}
        data={data}
        loading={loading}
        error={error}
      />
    </>
  );
};

// ─── Popup principal ──────────────────────────────────────────────────────────
const ProductoStockPopup = ({
  open,
  onClose,
  codigoProducto,
  data,
  loading,
  error,
}) => {
  const totalStock =
    data?.preciosSucursales?.reduce(
      (sum, s) => sum + (s.stockActual || 0),
      0,
    ) || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          zIndex: 20000,
        },
      }}
      sx={{ zIndex: 20000 }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            bgcolor: farmaColors.secondary,
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Storefront sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: 800, lineHeight: 1.2 }}
              >
                {data?.producto || codigoProducto}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}
              >
                <Chip
                  label={codigoProducto}
                  size="small"
                  sx={{
                    bgcolor: farmaColors.primary,
                    color: "white",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    height: 20,
                    fontSize: "0.7rem",
                  }}
                />
                {!loading && data && (
                  <Chip
                    label={`Stock total: ${totalStock}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 700,
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: "#F8F9FA" }}>
        {/* Loading */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: farmaColors.primary }} size={48} />
            <Typography color="text.secondary">
              Cargando stock por sucursal...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              bgcolor: "#FFEBEE",
              borderRadius: 2,
            }}
          >
            <Warning sx={{ color: "#B71C1C", fontSize: 32 }} />
            <Typography color="error" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Data */}
        {!loading && !error && data && (
          <>
            {/* Resumen rápido en tabla */}
            <Box
              sx={{
                mb: 2.5,
                bgcolor: "white",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Box sx={{ px: 2, py: 1, bgcolor: farmaColors.primary }}>
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  Resumen de Stock
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor:
                          farmaColors.alpha?.secondary10 ||
                          "rgba(5,48,90,0.08)",
                      }}
                    >
                      {[
                        "Sucursal",
                        "Stock Actual",
                        "Vendido",
                        "Lotes",
                        "Costo Prom.",
                        "P/U",
                        "Alerta Stock",
                        "Alerta Venc.",
                      ].map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontWeight: 700,
                            color: farmaColors.secondary,
                            fontSize: "0.72rem",
                            py: 0.8,
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.preciosSucursales.map((s) => (
                      <TableRow
                        key={s.sucursal}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor:
                              farmaColors.alpha?.primary10 ||
                              "rgba(204,108,6,0.04)",
                          },
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                        >
                          {s.sucursal}
                        </TableCell>
                        <TableCell>
                          <StockBadge
                            value={s.stockActual}
                            alerta={s.alertaStock}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#f44336",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                          }}
                        >
                          {s.totalVendido}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.78rem" }}>
                          {s.cantidadLotes}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.78rem",
                            color: "#1565C0",
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(s.costoPromedio)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.78rem",
                            color: "#2E7D32",
                            fontWeight: 600,
                          }}
                        >
                          {s.precioUnitarioMIN === s.precioUnitarioMAX
                            ? formatPrice(s.precioUnitarioMIN)
                            : `${formatPrice(s.precioUnitarioMIN)} – ${formatPrice(s.precioUnitarioMAX)}`}
                        </TableCell>
                        <TableCell>
                          <AlertaChip alerta={s.alertaStock} />
                        </TableCell>
                        <TableCell>
                          <AlertaChip alerta={s.alertaVencimiento} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Cards detalladas por sucursal */}
            <Grid container spacing={2}>
              {data.preciosSucursales.map((s) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.sucursal}>
                  <SucursalCard data={s} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductoStockPopup;
export { ProductoStockPopup };
