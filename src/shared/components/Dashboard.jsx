// src/shared/components/Dashboard.jsx
// Dashboard principal con datos reales desde api-farmacia
// Reemplaza el componente anterior con datos hardcodeados

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  SwapHoriz,
  CreditCard,
  Inventory,
  DeleteSweep,
  Block,
  Refresh,
  ArrowForward,
  BarChart,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { farmaColors } from "../../app/theme";
import { useAuth } from "../../context/AuthContext";
import reportesService from "../../services/api/reportesService";
import PageHeader from "./PageHeader";
import { Assessment } from "@mui/icons-material";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

// Configuración de las 7 tarjetas del dashboard
// color, icono, label, fetchKey, ruta destino al hacer click en "Más info"
const TARJETAS_CONFIG = [
  {
    key: "ventas",
    titulo: "Ventas del día",
    color: "#1b9fc2", // azul claro (como en el diseño original)
    icono: TrendingUp,
    ruta: "/reportes/ventas",
  },
  {
    key: "compras",
    titulo: "Compras del día",
    color: "#27ae60", // verde
    icono: ShoppingCart,
    ruta: "/reportes/operativo",
  },
  {
    key: "traspasos",
    titulo: "Traspasos del día",
    color: "#e67e22", // naranja
    icono: SwapHoriz,
    ruta: "/reportes/operativo", // ANTES: '/traspasos'
  },
  {
    key: "credito",
    titulo: "Compras a crédito por pagar",
    color: "#e74c3c", // rojo
    icono: CreditCard,
    ruta: "/reportes/operativo",
  },
  {
    key: "stockNegativo",
    titulo: "Productos con Stock Negativo",
    color: "#7f5af0", // violeta
    icono: Inventory,
    ruta: "/reportes/almacenes",
  },
  {
    key: "eliminadas",
    titulo: "Ventas Eliminadas del día",
    color: "#c0392b", // rojo oscuro
    icono: DeleteSweep,
    ruta: "/reportes/ventas",
  },
  {
    key: "noAceptados",
    titulo: "Traspasos no aceptados",
    color: "#2c3e50", // azul muy oscuro
    icono: Block,
    ruta: "/reportes/operativo", // ANTES: '/traspasos'
  },
];

// ─── SUBCOMPONENTE: Tarjeta de estadística ────────────────────────────────────

function StatCard({ config, value, loading, onMasInfo }) {
  const Icon = config.icono;

  return (
    <Card
      sx={{
        background: config.color,
        color: "white",
        borderRadius: 2,
        boxShadow: `0 4px 20px ${config.color}55`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 30px ${config.color}70`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: "12px !important" }}>
        {/* Fila superior: número + icono */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            {loading ? (
              <CircularProgress
                size={28}
                sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}
              />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {value}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, mt: 0.5, fontSize: "0.82rem" }}
            >
              {config.titulo}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              borderRadius: 2,
              p: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: "2rem", opacity: 0.85 }} />
          </Box>
        </Box>

        {/* Separador */}
        <Box
          sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", mt: 1.5, pt: 1 }}
        >
          <Box
            component="span"
            onClick={() => onMasInfo(config.ruta)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              opacity: 0.9,
              "&:hover": { opacity: 1, textDecoration: "underline" },
            }}
          >
            Más info
            <ArrowForward sx={{ fontSize: "0.85rem" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado para los conteos de cada tarjeta
  const [counts, setCounts] = useState({
    ventas: 0,
    compras: 0,
    traspasos: 0,
    credito: 0,
    stockNegativo: 0,
    eliminadas: 0,
    noAceptados: 0,
  });

  const [loadingCards, setLoadingCards] = useState(true);

  // Estado para el gráfico
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [loadingGrafico, setLoadingGrafico] = useState(false);

  // ── Carga de tarjetas (paralela) ───────────────────────────────────────────
  const cargarTarjetas = useCallback(async () => {
    setLoadingCards(true);
    try {
      const [
        ventasRes,
        comprasRes,
        traspasosRes,
        creditoRes,
        stockRes,
        eliminadasRes,
        noAceptadosRes,
      ] = await Promise.all([
        reportesService.getVentasDia(),
        reportesService.getComprasDia(),
        reportesService.getTraspasosDia(),
        reportesService.getComprasCredito(),
        reportesService.getProductosStockNegativo(),
        reportesService.getVentasEliminadas(),
        reportesService.getTraspasosNoAceptados(),
      ]);

      setCounts({
        ventas: ventasRes.count,
        compras: comprasRes.count,
        traspasos: traspasosRes.count,
        credito: creditoRes.count,
        stockNegativo: stockRes.count,
        eliminadas: eliminadasRes.count,
        noAceptados: noAceptadosRes.count,
      });
    } catch (err) {
      console.error("❌ Error cargando tarjetas:", err);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  // ── Carga del gráfico ──────────────────────────────────────────────────────
  const cargarGrafico = useCallback(async () => {
    setLoadingGrafico(true);
    try {
      const datos = await reportesService.getGraficoProductosMasVendidos();
      setDatosGrafico(datos.slice(0, 15));
    } catch (err) {
      console.error("❌ Error cargando gráfico:", err);
      setDatosGrafico([]);
    } finally {
      setLoadingGrafico(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    cargarTarjetas();
    cargarGrafico();
  }, []);

  const handleMasInfo = (ruta) => {
    navigate(ruta);
  };

  // Formatear nombre producto para el eje X (máx 12 chars)
  const formatXAxis = (str) => {
    if (!str) return "";
    return str.length > 14 ? str.substring(0, 12) + "…" : str;
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <PageHeader
          title="Dashboard"
          subtitle={`Panel de Administración · Sucursal: ${user?.sucursal ?? "—"}`}
          icon={<Assessment />}
          action={
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={cargarTarjetas}
                disabled={loadingCards}
                sx={{
                  bgcolor:
                    farmaColors.alpha?.primary10 ?? "rgba(204,108,6,0.1)",
                  "&:hover": {
                    bgcolor:
                      farmaColors.alpha?.primary20 ?? "rgba(204,108,6,0.2)",
                  },
                }}
              >
                <Refresh
                  sx={{
                    color: farmaColors.primary,
                    animation: loadingCards
                      ? "spin 1s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          }
        />
      </Box>

      {/* ── Grid de 7 tarjetas ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {TARJETAS_CONFIG.map((config) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={config.key}>
            <StatCard
              config={config}
              value={counts[config.key]}
              loading={loadingCards}
              onMasInfo={handleMasInfo}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Gráfico de productos más vendidos ── */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
        <CardContent sx={{ p: 3 }}>
          {/* Cabecera del gráfico */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <BarChart sx={{ color: farmaColors.primary }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: farmaColors.secondary }}
                >
                  Productos más Vendidos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Sucursal: <strong>{user?.sucursal ?? "—"}</strong>
                {datosGrafico.length > 0 && (
                  <>
                    {" "}
                    &nbsp;·&nbsp; Cantidad de Productos:{" "}
                    <strong>{datosGrafico.length}</strong>
                  </>
                )}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>              
              {/* Link a la página completa */}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/reportes/mejor-venta")}
                sx={{
                  color: farmaColors.primary,
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                  whiteSpace: "nowrap",
                }}
              >
                Ir a productos más vendidos
              </Link>
            </Box>
          </Box>

          {/* Gráfico */}
          {loadingGrafico ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 260,
              }}
            >
              <CircularProgress sx={{ color: farmaColors.primary }} />
            </Box>
          ) : datosGrafico.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 260,
              }}
            >
              <Typography color="text.secondary">
                No hay datos disponibles
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={datosGrafico}
                margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={farmaColors.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={farmaColors.primary}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="nombreProducto"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 10, fill: "#666" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#666" }}
                  label={{
                    value: "Nro Veces Vendidas",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#888" },
                  }}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${farmaColors.primary}30`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name) => [value, "Veces vendido"]}
                  labelFormatter={(label) => label}
                />
                <Area
                  type="monotone"
                  dataKey="numeroVecesVendido"
                  stroke={farmaColors.primary}
                  strokeWidth={2}
                  fill="url(#colorVentas)"
                  dot={{ fill: farmaColors.primary, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Leyenda */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: farmaColors.primary,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Gráfica productos más vendidos
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
