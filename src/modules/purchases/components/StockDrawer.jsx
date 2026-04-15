// src/modules/purchases/components/StockDrawer.jsx
// Drawer lateral que muestra el reporte de stock por sucursal dentro de Compras

import React from "react";
import { Drawer, Box, Typography, IconButton, Divider } from "@mui/material";
import { Close, Storefront } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import ReportePorSucursalesSection from "../../reports/components/ReportePorSucursalesSection";

const StockDrawer = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: "90vw", md: "85vw", lg: "80vw" },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header del drawer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          bgcolor: farmaColors.secondary,
          color: "white",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Storefront />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Stock por Sucursal
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Consulte disponibilidad antes de comprar
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Contenido */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 2,
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <ReportePorSucursalesSection compactMode />
        </Box>
      </Box>
    </Drawer>
  );
};

export default StockDrawer;
