import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  LocalShipping as SendIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsNone as NotificationsNoneIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { farmaColors } from "../../app/theme";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../services/notificationService";
import PageHeader from "../components/PageHeader";

// Helper function to pick a tone based on index
const getCardTone = (index, esEnvio) => {
  // If "esEnvio" is true, it should have a primary-like unread appearance
  // If false, it should have a secondary-like read appearance (or white tone)
  // We apply 3 distinct variations of these base colors
  
  if (esEnvio) {
    const tones = [
      farmaColors.alpha.primary10,
      farmaColors.alpha.primary20,
      "rgba(0, 150, 136, 0.05)" // A slightly different primary tint
    ];
    return tones[index % 3];
  } else {
    const tones = [
      "#ffffff",
      "#fdfdfd",
      "#fafafa"
    ];
    return tones[index % 3];
  }
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.codigoSucursal_ID) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.buscarNotificaciones(user.codigoSucursal_ID);
      if (res.exitoso) {
        setNotifications(res.datos || []);
      } else {
        console.error("Error fetching notifications:", res.mensaje);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: "1400px", margin: "0 auto" }}>
      <PageHeader 
        title="Todas las Notificaciones" 
        subtitle="Mantente al día con los traspasos y eventos importantes de tu sucursal."
        icon={<NotificationsIcon />}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            bgcolor: "rgba(0,0,0,0.01)",
            border: `2px dashed ${farmaColors.alpha.secondary20}`,
            borderRadius: 4,
            mt: 4
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700 }}>
            No tienes notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Te avisaremos cuando haya nuevos traspasos o eventos.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {notifications.map((notif, index) => {
            const esEnvio = notif.esEnvio === true;
            const bgColor = getCardTone(index, esEnvio);

            return (
              <Grid item xs={12} sm={6} md={4} key={notif.numeroTraspaso || index}>
                <Card
                  elevation={esEnvio ? 3 : 1}
                  onClick={() => notif.numeroTraspaso && navigate(`/notificaciones/${notif.numeroTraspaso}`)}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    bgcolor: bgColor,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    borderLeft: esEnvio ? `4px solid ${farmaColors.primary}` : "4px solid transparent",
                    border: !esEnvio ? "1px solid rgba(0,0,0,0.08)" : "none",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2, height: "100%" }}>
                    
                    {/* Sección Izquierda: Icono */}
                    <Box>
                      <Avatar
                        sx={{
                          bgcolor: esEnvio ? farmaColors.primary : farmaColors.secondary,
                          color: "white",
                          width: 48,
                          height: 48,
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      >
                        {esEnvio ? <SendIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </Box>

                    {/* Sección Derecha: Datos */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: esEnvio ? 700 : 500,
                          color: "#2C3E50",
                          mb: 1.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {notif.descripcion}
                      </Typography>
                      
                      <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <Box>
                           <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 600 }}>
                              Fecha
                           </Typography>
                           <Typography variant="body2" sx={{ fontWeight: 500, color: farmaColors.primary }}>
                             {notif.fecha}
                           </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                           <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 600 }}>
                              UID
                           </Typography>
                           <Typography variant="body2" sx={{ fontWeight: 700, color: "#555" }}>
                             {notif.uid}
                           </Typography>
                        </Box>
                      </Box>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default NotificationsPage;
