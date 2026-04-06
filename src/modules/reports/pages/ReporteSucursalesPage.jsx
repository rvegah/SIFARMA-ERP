// src/modules/reports/pages/ReporteSucursalesPage.jsx
import React from "react";
import PlaceholderPage from "./PlaceholderPage";
import { Store } from "@mui/icons-material";

export default function ReporteSucursalesPage() {
  return (
    <PlaceholderPage
      titulo="Reporte por Sucursales"
      subtitulo="Stock y precios de productos por sucursal"
      icono={<Store />}
    />
  );
}