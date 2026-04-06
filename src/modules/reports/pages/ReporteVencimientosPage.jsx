// src/modules/reports/pages/ReporteVencimientosPage.jsx
import React from "react";
import PlaceholderPage from "./PlaceholderPage";
import { Warning } from "@mui/icons-material";

export default function ReporteVencimientosPage() {
  return (
    <PlaceholderPage
      titulo="Productos Vencidos"
      subtitulo="Productos proximos a vencer en la sucursal"
      icono={<Warning />}
    />
  );
}