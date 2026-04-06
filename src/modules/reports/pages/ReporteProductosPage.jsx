// src/modules/reports/pages/ReporteProductosPage.jsx
import React from "react";
import PlaceholderPage from "./PlaceholderPage";
import { Inventory } from "@mui/icons-material";

export default function ReporteProductosPage() {
  return (
    <PlaceholderPage
      titulo="Reporte de Productos"
      subtitulo="Lista de productos del almacen por sucursal"
      icono={<Inventory />}
    />
  );
}