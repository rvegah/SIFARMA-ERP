import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  ShoppingBag,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  LocalShipping,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { farmaColors } from "../../app/theme";
import notificationService from "../services/notificationService";

const NotificationDetailPage = () => {
  const { numeroTraspaso } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (numeroTraspaso) {
      fetchDetalle();
    }
  }, [numeroTraspaso]);

  const fetchDetalle = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getDetalleTraspaso(numeroTraspaso);
      if (res.exitoso) {
        setData(res.datos);
      } else {
        console.error("Error al obtener detalle:", res.mensaje);
      }
    } catch (error) {
      console.error("Fallo al cargar el detalle del traspaso.", error);
    } finally {
      setLoading(false);
    }
  };

  const transferItems = data?.productos || [];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 4 }}>
      {/* 1. Detalle de la Cabecera */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: farmaColors.alpha.primary10,
          border: `1px solid ${farmaColors.alpha.primary20}`,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Volver a Notificaciones">
                <IconButton onClick={() => navigate(-1)} size="small">
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Typography
                variant="h6"
                sx={{
                  color: farmaColors.secondary,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocalShipping sx={{ color: farmaColors.primary }} /> Detalle del Traspaso (Solo Vista)
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: farmaColors.primary, fontWeight: 800 }}>
              {data?.numeroTraspaso || numeroTraspaso}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ color: "action.active", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.fecha ? data.fecha.split("T")[0] : "---"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentTurnedIn sx={{ color: "action.active", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Estado:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.estado || "---"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionIcon sx={{ color: "action.active", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Observación:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.obsevacion || "Sin observación"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* 2. Productos del Traspaso (Tabla LECTURA) */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${farmaColors.alpha.secondary10}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: farmaColors.secondary, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
            >
              <ShoppingBag sx={{ color: farmaColors.primary }} /> Productos en Traspaso
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label={`${transferItems.length} items`} color="primary" size="small" />
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Lote</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Unidad / Línea / Lab</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: 120 }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Acción Ref.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : transferItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <InventoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1, opacity: 0.5 }} />
                      <Typography color="text.secondary">La solicitud de productos devolvió lista vacía.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transferItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: farmaColors.secondary }}>
                          {item.producto}
                        </Typography>
                        {item.skU_ID !== 0 && (
                          <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                            SKU ID: {item.skU_ID}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Lote: {item.numeroLote || "S/N"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>{item.unidad || "---"}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                          {item.laboratorio || "---"} {item.linea ? `| ${item.linea}` : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: farmaColors.primary }}>
                          {item.cantidad}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.accion || "---"}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: farmaColors.alpha.primary10, color: farmaColors.primary }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationDetailPage;
