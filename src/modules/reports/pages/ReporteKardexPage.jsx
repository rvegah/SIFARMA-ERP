// src/modules/reports/pages/ReporteKardexPage.jsx
import React from "react";
import PlaceholderPage from "./PlaceholderPage";
import { Receipt } from "@mui/icons-material";

export default function ReporteKardexPage() {
  return (
    <PlaceholderPage
      titulo="Reporte Kardex"
      subtitulo="Movimientos de ventas, traspasos y compras"
      icono={<Receipt />}
    />
  );
}