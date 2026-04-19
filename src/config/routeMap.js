// src/config/routeMap.js
import { lazy } from "react";

// Módulos principales
const Dashboard = lazy(() => import("../shared/components/Dashboard"));
const UserManagementPage = lazy(() => import("../modules/user-management/pages/UserManagementPage"));
const ProductManagementPage = lazy(() => import("../modules/products/pages/ProductManagementPage"));
const PurchasesPage = lazy(() => import("../modules/purchases/pages/PurchasesPage"));
const SalesPage = lazy(() => import("../modules/sales/pages/SalesPage"));
const TransfersPage = lazy(() => import("../modules/transfers/pages/TransfersPage"));
const CertificatePage = lazy(() => import("../modules/configuration/pages/CertificatePage"));

// Reportes
const ReportManagementPage = lazy(() => import("../modules/reports/pages/ReportManagementPage"));

// Reportes con endpoint activo
const VentasReportePage = lazy(() => import("../modules/reports/pages/VentasReportePage"));
const StockNegativoPage = lazy(() => import("../modules/reports/pages/StockNegativoPage"));
const MejorVentaPage = lazy(() => import("../modules/reports/pages/MejorVentaPage"));

// Reportes pendientes
const ReporteProductosPage = lazy(() => import("../modules/reports/pages/ReporteProductosPage"));
const ReporteSucursalesPage = lazy(() => import("../modules/reports/pages/ReporteSucursalesPage"));
const ReporteVencimientosPage = lazy(() => import("../modules/reports/pages/ReporteVencimientosPage"));
const ReporteKardexPage = lazy(() => import("../modules/reports/pages/ReporteKardexPage"));
const ReportePedidosPage = lazy(() => import("../modules/reports/pages/ReportePedidosPage"));

const VentasDiariasPage = lazy(() => import("../modules/reports/pages/VentasDiariasPage"));
const VentasMensualesPage = lazy(() => import("../modules/reports/pages/VentasMensualesPage"));
const VentasGeneralPage   = lazy(() => import("../modules/reports/pages/VentasGeneralPage"));

const HistorialVentasPage = lazy(() => import("../modules/reports/pages/HistorialVentasPage"));

const InventarioDiarioPage = lazy(() => import("../modules/reports/pages/InventarioDiarioPage"));
const InventarioLineaPage = lazy(() => import("../modules/reports/pages/InventarioLineaPage"));
const KardexMovimientoPage = lazy(() => import("../modules/reports/pages/KardexMovimientoPage"));

export const routeMap = {
  "/dashboard": Dashboard,

  // Módulos principales
  "/users": UserManagementPage,
  "/productos": ProductManagementPage,
  "/compras": PurchasesPage,
  "/ventas": SalesPage,
  "/traspasos": TransfersPage,
  "/configurar": CertificatePage,

  // Reportes con datos reales
  "/reportes/ventas": VentasReportePage,  
  "/reportes/almacenes": StockNegativoPage,
  "/reportes/mejor-venta": MejorVentaPage,

  // Reportes pendientes
  "/reportes/productos": ReporteProductosPage,
  "/reportes/sucursales": ReporteSucursalesPage,
  "/reportes/vencidos": ReporteVencimientosPage,
  "/reportes/kardex": ReporteKardexPage,
  "/reportes/pedidos": ReportePedidosPage,

  // Fallback
  "/reportes": ReportManagementPage,

  "/reportes/diario": VentasDiariasPage,
  "/reportes/mensual":  VentasMensualesPage,
  "/reportes/general":  VentasGeneralPage,
  "/reportes/historial": HistorialVentasPage,

  "/finanzas/inventario-diario": InventarioDiarioPage,
  "/finanzas/linea": InventarioLineaPage,
  "/finanzas/kardex": KardexMovimientoPage,
};