// src/components/DeviceValidationModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Computer,
  Wifi,
  Security,
} from "@mui/icons-material";

const DeviceValidationModal = ({
  open,
  validationResult,
  onContinue,
  onCancel,
}) => {
  if (!validationResult) return null;

  const { success, detectedIP, expectedIPs, nombreEquipo, message, error } =
    validationResult;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          // Solo permitir cerrar con ESC, no con click fuera
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          pb: 1,
          background: success
            ? "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)"
            : error
            ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
            : "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {success ? <CheckCircle /> : <Error />}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {success
              ? "Dispositivo Autorizado"
              : error
              ? "Error de Validación"
              : "Acceso Denegado"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Información del dispositivo detectado */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Wifi color="action" />
            IP Detectada:
          </Typography>
          <Chip
            label={detectedIP || "No detectada"}
            color={detectedIP ? "primary" : "default"}
            sx={{ fontFamily: "monospace" }}
          />
        </Box>

        {/* Información del equipo asignado */}
        {nombreEquipo && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Computer color="action" />
              Equipo Asignado:
            </Typography>
            <Chip
              label={nombreEquipo}
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        {/* IPs permitidas para el equipo */}
        {expectedIPs && expectedIPs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Security color="action" />
              IPs Autorizadas:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {expectedIPs.map((ip, index) => (
                <Chip
                  key={index}
                  label={ip}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor:
                      ip === detectedIP
                        ? "rgba(76, 175, 80, 0.1)"
                        : "transparent",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Mensaje de resultado */}
        <Alert
          severity={success ? "success" : error ? "warning" : "error"}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="body2">{message}</Typography>

          {!success && !error && (
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, opacity: 0.8 }}
            >
              Por favor, contacte al administrador del sistema para autorizar
              este dispositivo.
            </Typography>
          )}
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {success ? (
          <Button
            onClick={onContinue}
            variant="contained"
            color="success"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 20px rgba(76, 175, 80, 0.3)",
              },
            }}
          >
            Continuar al Sistema
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              onClick={onCancel}
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Volver al Login
            </Button>
            {error && (
              <Button
                onClick={onContinue}
                variant="contained"
                color="warning"
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
              >
                Continuar sin validar
              </Button>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeviceValidationModal;
