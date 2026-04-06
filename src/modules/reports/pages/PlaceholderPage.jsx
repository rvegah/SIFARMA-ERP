// src/modules/reports/pages/PlaceholderPage.jsx
import React from "react";
import { Box, Card, CardContent, Typography, Container, Breadcrumbs, Link, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Construction } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";

export default function PlaceholderPage({ titulo, subtitulo, icono }) {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader title={titulo} subtitle={subtitulo} icon={icono} />
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">Dashboard</Link>
          <Typography color="text.primary">{titulo}</Typography>
        </Breadcrumbs>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: 8, textAlign: "center" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: farmaColors.alpha?.primary10 ?? "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
            <Construction sx={{ fontSize: 40, color: farmaColors.primary }} />
          </Box>
          <Chip label="Pendiente de backend" sx={{ mb: 2, bgcolor: farmaColors.alpha?.primary20 ?? "#ffe0b2", color: farmaColors.primary, fontWeight: 700 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}>{titulo}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
            Este módulo está pendiente de implementación en el backend. Estará disponible próximamente.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}