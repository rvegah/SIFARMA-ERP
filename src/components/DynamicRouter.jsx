// src/components/DynamicRouter.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routeMap } from "../config/routeMap";

const Dashboard = lazy(() => import("../shared/components/Dashboard"));
const NotificationsPage = lazy(
  () => import("../shared/pages/NotificationsPage"),
);
const NotificationDetailPage = lazy(
  () => import("../shared/pages/NotificationDetailPage"),
);
const EditProfilePage = lazy(
  () => import("../modules/user-management/components/EditProfilePage"),
);
const ReportManagementPage = lazy(
  () => import("../modules/reports/pages/ReportManagementPage"),
);

const VentasReportePage = lazy(
  () => import("../modules/reports/pages/VentasReportePage"),
);
const DiarioReportePage = lazy(
  () => import("../modules/reports/pages/DiarioReportePage"),
);
const StockNegativoPage = lazy(
  () => import("../modules/reports/pages/StockNegativoPage"),
);
const MejorVentaPage = lazy(
  () => import("../modules/reports/pages/MejorVentaPage"),
);

const ReporteProductosPage = lazy(
  () => import("../modules/reports/pages/ReporteProductosPage"),
);
const ReporteSucursalesPage = lazy(
  () => import("../modules/reports/pages/ReporteSucursalesPage"),
);
const ReporteVencimientosPage = lazy(
  () => import("../modules/reports/pages/ReporteVencimientosPage"),
);
const ReporteKardexPage = lazy(
  () => import("../modules/reports/pages/ReporteKardexPage"),
);
const ReportePedidosPage = lazy(
  () => import("../modules/reports/pages/ReportePedidosPage"),
);

/*PARA LOS REPORTES DIARIOS MENSUALES Y GENERAL DIRECTO AL ROL*/
const VentasDiariasPage = lazy(
  () => import("../modules/reports/pages/VentasDiariasPage")
);

const VentasMensualesPage = lazy(
  () => import("../modules/reports/pages/VentasMensualesPage")
);
const VentasGeneralPage = lazy(
  () => import("../modules/reports/pages/VentasGeneralPage")
);

const HistorialVentasPage = lazy(
  () => import("../modules/reports/pages/HistorialVentasPage")
);

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
  "/reportes/diarios",
  "/reportes/mensual",
  "/reportes/general",
  "/reportes/historial",
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
    <Suspense fallback={<div style={{ padding: 20 }}>Cargando módulo...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Reportes con datos reales */}
        <Route path="/reportes/ventas" element={<VentasReportePage />} />
        <Route path="/reportes/operativo" element={<DiarioReportePage />} />
        <Route path="/reportes/almacenes" element={<StockNegativoPage />} />
        <Route path="/reportes/mejor-venta" element={<MejorVentaPage />} />

        {/* Reportes pendientes de backend */}
        <Route path="/reportes/productos" element={<ReporteProductosPage />} />
        <Route
          path="/reportes/sucursales"
          element={<ReporteSucursalesPage />}
        />
        <Route
          path="/reportes/vencidos"
          element={<ReporteVencimientosPage />}
        />
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

        {/* Ruta para ventas diarias */}
        <Route path="/reportes/diario" element={<VentasDiariasPage />} />
        <Route path="/reportes/mensual" element={<VentasMensualesPage />} />
        <Route path="/reportes/general" element={<VentasGeneralPage />} />
        <Route path="/reportes/historial" element={<HistorialVentasPage />} />

        {/* Fallback reportes */}
        <Route path="/reportes/*" element={<ReportManagementPage />} />
        <Route path="/reporte/*" element={<ReportManagementPage />} />
        
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
