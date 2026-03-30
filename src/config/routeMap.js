// src/config/routeMap.js
import Dashboard from "../shared/components/Dashboard";
import UserManagementPage from "../modules/user-management/pages/UserManagementPage";
import ProductManagementPage from "../modules/products/pages/ProductManagementPage";
import PurchasesPage from "../modules/purchases/pages/PurchasesPage";
import SalesPage from "../modules/sales/pages/SalesPage";
import TransfersPage from "../modules/transfers/pages/TransfersPage";
import CertificatePage from "../modules/configuration/pages/CertificatePage";

/**
 * Mapeo exacto entre las rutas devueltas por la base de datos (API) a
 * sus correspondientes componentes React.
 */
export const routeMap = {
  "/dashboard": Dashboard,

  // Mapeamos solo la RAÍZ de cada módulo. 
  // DynamicRouter se encarga de añadir el /* automáticamente.
  "/users": UserManagementPage,
  "/productos": ProductManagementPage,
  "/compras": PurchasesPage,
  "/ventas": SalesPage,
  "/traspasos": TransfersPage,
  "/configurar": CertificatePage,
};
