import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Fade,
  Link,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocalShipping as SendIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsNone as NotificationsNoneIcon,
} from "@mui/icons-material";
import { farmaColors } from "../../app/theme";
import { useAuth } from "../../context/AuthContext";

import { useNotifications } from "../../modules/notifications/hooks/useNotifications";

const NotificationPanel = ({
  open,
  onClose,
  anchorEl,
  onUnreadCountChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, fetchNotifications, loading } = useNotifications();

  useEffect(() => {
    if (open && user?.codigoSucursal_ID) {
      fetchNotifications(user.codigoSucursal_ID);
    }
  }, [open]);

  const handleViewAll = (e) => {
    e.preventDefault();
    onClose();
    navigate("/notificaciones");
  };

  const handleNotificationClick = (notif) => {
    onClose();
    if (notif.numeroTraspaso) {
      navigate(`/notificaciones/${notif.numeroTraspaso}`);
    }
  };

  if (!open) return null;

  return (
    <Fade in={open}>
      <Paper
        elevation={10}
        sx={{
          position: "absolute",
          top: "60px",
          right: "20px",
          width: "380px",
          maxWidth: "90vw",
          maxHeight: "600px",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 2000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: "#000" }}
          >
            Notificaciones
          </Typography>
          {/* <Button 
                        size="small" 
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            color: farmaColors.primary,
                            '&:hover': { bgcolor: farmaColors.alpha.primary10 }
                        }}
                    >
                        Marcar todo como leído
                    </Button> */}
        </Box>

        {/* List */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", bgcolor: "#fff" }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2">
                Cargando notificaciones...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              <NotificationsNoneIcon
                sx={{ fontSize: 48, mb: 1, opacity: 0.3 }}
              />
              <Typography variant="body2">No tienes notificaciones</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notif, index) => {
                const esEnvio = notif.esEnvio === true;
                return (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      bgcolor: !esEnvio
                        ? "transparent"
                        : farmaColors.alpha.primary10,
                      "&:hover": {
                        bgcolor: !esEnvio
                          ? "#f5f5f5"
                          : farmaColors.alpha.primary20,
                      },
                      position: "relative",
                      "&::before": esEnvio
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "4px",
                            background: farmaColors.gradients.primary,
                          }
                        : {},
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: esEnvio
                            ? farmaColors.primary
                            : farmaColors.secondary,
                          color: "white",
                        }}
                      >
                        {esEnvio ? (
                          <SendIcon fontSize="small" />
                        ) : (
                          <CheckCircleIcon fontSize="small" />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#333",
                            lineHeight: 1.4,
                            mb: 0.5,
                            fontWeight: esEnvio ? 600 : 400,
                          }}
                        >
                          {notif.descripcion}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 600 }}
                          >
                            Fecha: {notif.fecha}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 600 }}
                          >
                            UID: {notif.uid}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#fff",
          }}
        >
          <Link
            href="#"
            onClick={handleViewAll}
            underline="hover"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: farmaColors.primary,
            }}
          >
            Ver todas las notificaciones
          </Link>
        </Box>
      </Paper>
    </Fade>
  );
};

export default NotificationPanel;
