import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
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
  Checkbox,
  Button,
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
import PageHeader from "../components/PageHeader";

const NotificationDetailPage = () => {
  const { numeroTraspaso } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Selection state
  const [selectedRows, setSelectedRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
  const isEnv = data?.estado === "ENV";

  const handleToggleRow = (idx) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleRecibir = async () => {
    setSubmitting(true);
    try {
      const res = await notificationService.cambiarEstadoTraspaso(
        data.numeroTraspaso,
        "REC",
      );
      if (res.exitoso) {
        enqueueSnackbar("Traspaso marcado como Recibido", {
          variant: "success",
        });

        // 🔥 ESTA ES LA LINEA QUE TE FALTA
        window.dispatchEvent(new Event("notifications:update"));

        setSelectedRows([]);
        fetchDetalle();
      } else {
        enqueueSnackbar(res.mensaje || "Error al recibir traspaso", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error al recibir traspaso:", error);
      enqueueSnackbar("Error de red", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <PageHeader
        title="Detalle de Traspaso"
        subtitle={`Información detallada sobre el movimiento de mercadería: ${data?.numeroTraspaso || numeroTraspaso}`}
        icon={<LocalShipping />}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 3,
              borderWidth: 2,
              borderColor: farmaColors.secondary,
              color: farmaColors.secondary,
              fontWeight: 700,
              "&:hover": {
                borderWidth: 2,
                borderColor: farmaColors.secondaryDark,
              },
            }}
          >
            Volver a Notificaciones
          </Button>
        }
      />

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
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday
                    sx={{ color: "action.active", fontSize: 20 }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.fecha ? data.fecha.split("T")[0] : "---"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentTurnedIn
                    sx={{ color: "action.active", fontSize: 20 }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Estado:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.estado || "---"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionIcon
                    sx={{ color: "action.active", fontSize: 20 }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Observación:
                    </Typography>
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
              sx={{
                color: farmaColors.secondary,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ShoppingBag sx={{ color: farmaColors.primary }} /> Productos en
              Traspaso
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${transferItems.length} items`}
                color="primary"
                size="small"
              />
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead
                sx={{ bgcolor: farmaColors.alpha.secondary10, height: 56 }}
              >
                <TableRow>
                  {isEnv && (
                    <TableCell
                      sx={{
                        width: 50,
                        fontWeight: 800,
                        color: farmaColors.secondary,
                      }}
                    ></TableCell>
                  )}
                  <TableCell
                    sx={{ fontWeight: 800, color: farmaColors.secondary }}
                  >
                    Producto
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: farmaColors.secondary }}
                  >
                    Lote
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: farmaColors.secondary }}
                  >
                    Unidad / Línea / Lab
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: farmaColors.secondary,
                      width: 120,
                    }}
                  >
                    Cantidad
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: farmaColors.secondary }}
                  >
                    Acción Ref.
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: "white" }}>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isEnv ? 6 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : transferItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isEnv ? 6 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <InventoryIcon
                        sx={{
                          fontSize: 40,
                          color: "text.disabled",
                          mb: 1,
                          opacity: 0.5,
                        }}
                      />
                      <Typography color="text.secondary">
                        La solicitud de productos devolvió lista vacía.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transferItems.map((item, idx) => (
                    <TableRow
                      key={idx}
                      sx={
                        isEnv && selectedRows.includes(idx)
                          ? { bgcolor: "#e8f5e9" }
                          : {}
                      }
                    >
                      {isEnv && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(idx)}
                            onChange={() => handleToggleRow(idx)}
                            color="success"
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: farmaColors.secondary }}
                        >
                          {item.producto}
                        </Typography>
                        {item.skU_ID !== 0 && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", color: "text.secondary" }}
                          >
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
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "text.secondary" }}
                        >
                          {item.laboratorio || "---"}{" "}
                          {item.linea ? `| ${item.linea}` : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 800, color: farmaColors.primary }}
                        >
                          {item.cantidad}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.accion || "---"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: farmaColors.alpha.primary10,
                            color: farmaColors.primary,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {isEnv && (
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "flex-end",
                borderTop: `1px solid ${farmaColors.alpha.secondary10}`,
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AssignmentTurnedIn />
                  )
                }
                onClick={handleRecibir}
                disabled={
                  submitting ||
                  transferItems.length === 0 ||
                  selectedRows.length !== transferItems.length
                }
                sx={{
                  background: farmaColors.gradients.primary,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)",
                }}
              >
                {submitting ? "PROCESANDO..." : "MARCAR COMO RECIBIDO"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationDetailPage;
