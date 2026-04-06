// src/config/routeMap.js
import Dashboard from "../shared/components/Dashboard";
import UserManagementPage from "../modules/user-management/pages/UserManagementPage";
import ProductManagementPage from "../modules/products/pages/ProductManagementPage";
import PurchasesPage from "../modules/purchases/pages/PurchasesPage";
import SalesPage from "../modules/sales/pages/SalesPage";
import TransfersPage from "../modules/transfers/pages/TransfersPage";
import CertificatePage from "../modules/configuration/pages/CertificatePage";
import ReportManagementPage from "../modules/reports/pages/ReportManagementPage";

// Reportes con endpoint activo
import VentasReportePage from "../modules/reports/pages/VentasReportePage";
import DiarioReportePage from "../modules/reports/pages/DiarioReportePage";
import StockNegativoPage from "../modules/reports/pages/StockNegativoPage";
import MejorVentaPage from "../modules/reports/pages/MejorVentaPage";

// Reportes pendientes de backend (placeholder)
import ReporteProductosPage from "../modules/reports/pages/ReporteProductosPage";
import ReporteSucursalesPage from "../modules/reports/pages/ReporteSucursalesPage";
import ReporteVencimientosPage from "../modules/reports/pages/ReporteVencimientosPage";
import ReporteKardexPage from "../modules/reports/pages/ReporteKardexPage";
import ReportePedidosPage from "../modules/reports/pages/ReportePedidosPage";

export const routeMap = {
  "/dashboard": Dashboard,

  // Modulos principales
  "/users":      UserManagementPage,
  "/productos":  ProductManagementPage,
  "/compras":    PurchasesPage,
  "/ventas":     SalesPage,
  "/traspasos":  TransfersPage,
  "/configurar": CertificatePage,

  // Reportes con datos reales
  "/reportes/ventas":       VentasReportePage,
  "/reportes/diario":       DiarioReportePage,
  "/reportes/almacenes":    StockNegativoPage,
  "/reportes/mejor-venta":  MejorVentaPage,

  // Reportes pendientes de backend
  "/reportes/productos":          ReporteProductosPage,
  "/reportes/sucursales":         ReporteSucursalesPage,
  "/reportes/vencidos":           ReporteVencimientosPage,
  "/reportes/kardex":             ReporteKardexPage,
  "/reportes/pedidos":            ReportePedidosPage,

  // Fallback generico
  "/reportes": ReportManagementPage,
};