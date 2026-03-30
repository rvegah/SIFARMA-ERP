// src/modules/configuration/pages/CertificatePage.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Update as UpdateIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { farmaColors } from '../../../app/theme';
import PageHeader from '../../../shared/components/PageHeader';
import configurationService from '../services/configurationService';
import { useSnackbar } from 'notistack';

const CertificatePage = () => {
  const { user, codigoEquipoComputo_ID } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleUpdateCertificate = async () => {
    if (!codigoEquipoComputo_ID) {
      enqueueSnackbar('No se encontró el ID del equipo de cómputo en la sesión.', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        codigoEquipoComputo: codigoEquipoComputo_ID,
        motivoCambio: "Cambio de certificado por seguridad.",
        empleadoAlta: user?.id || user?.codigoEmpleado || 1
      };

      const result = await configurationService.guardarCertificado(payload);

      if (result.success) {
        setSuccessModal(true);
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Error al actualizar el certificado', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        title="Certificado de Cómputo"
        subtitle="Configuración y actualización de certificados digitales de seguridad."
        icon={<SecurityIcon />}
      />

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: `1px solid ${farmaColors.alpha.secondary10}`
            }}
          >
            <Box
              sx={{
                background: farmaColors.gradients.secondary,
                p: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <VerifiedIcon sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Estado del Certificado
              </Typography>
            </Box>

            <CardContent sx={{ p: 5 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                  CERTIFICADO ACTUAL
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 3,
                    bgcolor: farmaColors.alpha.primary10,
                    borderRadius: 3,
                    border: `2px dashed ${farmaColors.primary}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontWeight: 800,
                      color: farmaColors.primary,
                      letterSpacing: 4,
                      textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    XXX-XX-XXX-XXXXX
                  </Typography>
                  {/* <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    * Este certificado es estático y de solo lectura.
                  </Typography> */}
                </Paper>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ bgcolor: farmaColors.alpha.secondary10, p: 1, borderRadius: 2 }}>
                    <SecurityIcon sx={{ color: farmaColors.secondary }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Seguridad Encriptada</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Su certificado utiliza algoritmos de encriptación avanzados para proteger todas las transacciones de la sucursal.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UpdateIcon />}
                    onClick={handleUpdateCertificate}
                    disabled={loading}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      background: farmaColors.gradients.primary,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      boxShadow: `0 8px 25px ${farmaColors.alpha.primary30}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 35px ${farmaColors.alpha.primary40}`,
                      }
                    }}
                  >
                    {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CERTIFICADO'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Modal */}
      <Dialog
        open={successModal}
        onClose={() => setSuccessModal(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 2, textAlign: 'center' }
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: farmaColors.secondary }}>
            ¡Cambio Exitoso!
          </DialogTitle>
          <Typography variant="body1" color="text.secondary">
            Se ha cambiado exitosamente su certificado digital por motivos de seguridad.
            El cambio ha sido registrado correctamente en el sistema central.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            onClick={() => setSuccessModal(false)}
            sx={{
              px: 6,
              borderRadius: 3,
              bgcolor: farmaColors.secondary,
              '&:hover': { bgcolor: farmaColors.secondaryDark }
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificatePage;
