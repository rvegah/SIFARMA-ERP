// src/modules/reports/pages/ReportePedidosPage.jsx
import React from "react";
import PlaceholderPage from "./PlaceholderPage";
import { ShoppingCart } from "@mui/icons-material";

export default function ReportePedidosPage() {
  return (
    <PlaceholderPage
      titulo="Reporte de Pedidos"
      subtitulo="Pedidos realizados por sucursal"
      icono={<ShoppingCart />}
    />
  );
}