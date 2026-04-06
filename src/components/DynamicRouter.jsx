// src/components/DynamicRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routeMap } from "../config/routeMap";

import Dashboard from "../shared/components/Dashboard";
import NotificationsPage from "../shared/pages/NotificationsPage";
import NotificationDetailPage from "../shared/pages/NotificationDetailPage";
import EditProfilePage from "../modules/user-management/components/EditProfilePage";
import ReportManagementPage from "../modules/reports/pages/ReportManagementPage";

// Reportes con endpoint activo — siempre disponibles
import VentasReportePage from "../modules/reports/pages/VentasReportePage";
import DiarioReportePage from "../modules/reports/pages/DiarioReportePage";
import StockNegativoPage from "../modules/reports/pages/StockNegativoPage";
import MejorVentaPage from "../modules/reports/pages/MejorVentaPage";

// Reportes placeholder — siempre disponibles
import ReporteProductosPage from "../modules/reports/pages/ReporteProductosPage";
import ReporteSucursalesPage from "../modules/reports/pages/ReporteSucursalesPage";
import ReporteVencimientosPage from "../modules/reports/pages/ReporteVencimientosPage";
import ReporteKardexPage from "../modules/reports/pages/ReporteKardexPage";
import ReportePedidosPage from "../modules/reports/pages/ReportePedidosPage";

// Rutas exactas (sin /*)
const EXACT_ROUTES = new Set([
  "/dashboard",
  "/reportes/ventas",
  "/reportes/diario",
  "/reportes/almacenes",
  "/reportes/mejor-venta",
  "/reportes/productos",
  "/reportes/sucursales",
  "/reportes/vencidos",
  "/reportes/kardex",
  "/reportes/pedidos",
]);

export default function DynamicRouter({ apiPermissions }) {
  const findModuleRoot = (path) => {
    if (!path) return null;
    if (routeMap[path]) return path;
    const segments = path.split("/").filter(Boolean);
    for (let i = segments.length - 1; i > 0; i--) {
      const prefix = "/" + segments.slice(0, i).join("/");
      if (routeMap[prefix]) return prefix;
    }
    return null;
  };

  const activeModuleRoots = new Set();
  if (Array.isArray(apiPermissions)) {
    apiPermissions.forEach((module) => {
      const root = findModuleRoot(module.ruta);
      if (root) activeModuleRoots.add(root);
      if (module.subOpcionesMenu) {
        module.subOpcionesMenu.forEach((sub) => {
          const subRoot = findModuleRoot(sub.ruta);
          if (subRoot) activeModuleRoots.add(subRoot);
        });
      }
    });
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Reportes con datos reales */}
      <Route path="/reportes/ventas" element={<VentasReportePage />} />
      <Route path="/reportes/diario" element={<DiarioReportePage />} />
      <Route path="/reportes/almacenes" element={<StockNegativoPage />} />
      <Route path="/reportes/mejor-venta" element={<MejorVentaPage />} />

      {/* Reportes pendientes de backend */}
      <Route path="/reportes/productos" element={<ReporteProductosPage />} />
      <Route path="/reportes/sucursales" element={<ReporteSucursalesPage />} />
      <Route path="/reportes/vencidos" element={<ReporteVencimientosPage />} />
      <Route path="/reportes/kardex" element={<ReporteKardexPage />} />
      <Route path="/reportes/pedidos" element={<ReportePedidosPage />} />

      {/* Ruteo dinamico por modulos */}
      {[...activeModuleRoots].map((ruta) => {
        const Component = routeMap[ruta];
        const path = EXACT_ROUTES.has(ruta) ? ruta : `${ruta}/*`;
        return <Route key={ruta} path={path} element={<Component />} />;
      })}

      {/* Rutas estaticas */}
      <Route path="/profile" element={<EditProfilePage />} />
      <Route path="/notificaciones" element={<NotificationsPage />} />
      <Route
        path="/notificaciones/:numeroTraspaso"
        element={<NotificationDetailPage />}
      />

      {/* Fallback reportes */}
      <Route path="/reportes/*" element={<ReportManagementPage />} />
      <Route path="/reporte/*" element={<ReportManagementPage />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
