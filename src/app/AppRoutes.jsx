// src/app/AppRoutes.jsx - MODIFICADO con AuthProvider y protección de rutas

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginPage from "../shared/components/LoginPage";
import DashboardLayout from "../shared/components/DashboardLayout";
import Dashboard from "../shared/components/Dashboard";
import SalesPage from "../modules/sales/pages/SalesPage";
import PurchasesPage from "../modules/purchases/pages/PurchasesPage";
import TransfersPage from "../modules/transfers/pages/TransfersPage";
// Módulo de gestión de usuarios (administrativo)
import UserManagementPage from "../modules/user-management/pages/UserManagementPage";
// Módulo de gestión de productos
import ProductManagementPage from "../modules/products/pages/ProductManagementPage";

// Módulo de reportes y pedidos
import ReportManagementPage from "../modules/reports/pages/ReportManagementPage";

/**
 * Componente de rutas protegidas
 * Solo se renderiza si el usuario está autenticado
 */
function ProtectedRoutes() {
  const { isAuthenticated, isLoading, logout, user, apiPermissions } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#05305A",
        }}
      >
        Cargando...
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Depuración de permisos
  React.useEffect(() => {
    if (user?.apiPermissions) {
      console.log("🔑 [AppRoutes] API Permissions:", user.apiPermissions.map(p => ({
        opcion: p.nombreOpcion,
        ruta: p.ruta,
        subopciones: p.subOpcionesMenu?.map(s => s.nombreOpcion)
      })));
    }
  }, [user]);

  // Si está autenticado, mostrar dashboard con rutas
  console.log("📍 [ProtectedRoutes] Matching for path:", location.pathname);
  console.log("📍 [ProtectedRoutes] Available Permissions:", apiPermissions?.length);

  return (
    <DashboardLayout
      onLogout={logout}
      currentUser={user}
      userPermissions={apiPermissions}
    >
      <Routes>
        {/* PRIORIDAD: REPORTES (Movido al inicio) */}
        <Route path="/reportes/*" element={<ReportManagementPage />} />
        <Route path="/Reportes/*" element={<ReportManagementPage />} />
        <Route path="/reporte/*" element={<ReportManagementPage />} />
        <Route path="/Reporte/*" element={<ReportManagementPage />} />
        <Route path="/gestion-reportes/*" element={<ReportManagementPage />} />
        <Route path="/reportes-sucursales/*" element={<ReportManagementPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Módulo de Compras - Prioridad elevada */}
        <Route path="/compras/*" element={<PurchasesPage />} />
        <Route path="/Compras/*" element={<PurchasesPage />} />

        {/* Módulo de Traspasos */}
        <Route path="/traspasos/*" element={<TransfersPage />} />
        <Route path="/Traspasos/*" element={<TransfersPage />} />
        <Route path="/traspaso/*" element={<TransfersPage />} />
        <Route path="/Traspaso/*" element={<TransfersPage />} />

        {/* SEPARACIÓN CLARA DE FUNCIONALIDADES */}

        {/* Editar Perfil Personal - acceso desde menú de usuario */}
        {/*/<Route path="/profile" element={<EditProfilePage />} />*/}

        {/* Gestión Administrativa de Usuarios - acceso desde sidebar "Usuarios" */}
        <Route path="/users" element={<UserManagementPage key="usersList" />} />
        <Route
          path="/users/list"
          element={<UserManagementPage key="usersList" />}
        />
        <Route
          path="/users/new"
          element={<UserManagementPage key="usersNew" />}
        />
        <Route
          path="/users/*"
          element={<UserManagementPage key="usersAny" />}
        />

        {/* Módulo de productos: lista, agregar, editar */}
        <Route path="/productos" element={<ProductManagementPage />} />
        <Route path="/productos/ver" element={<ProductManagementPage />} />
        <Route path="/productos/agregar" element={<ProductManagementPage />} />
        <Route path="/productos/*" element={<ProductManagementPage />} />
        <Route
          path="/proveedor/*"
          element={<div>Módulo de Proveedores (próximamente)</div>}
        />
        <Route path="/ventas/*" element={<SalesPage />} />

        {/* REPORTES: RUTAS ULTRA-PERMISIVAS PARA EVITAR FALLOS DE MATCHING */}
        <Route path="/reportes" element={<ReportManagementPage />} />
        <Route path="/reportes/*" element={<ReportManagementPage />} />
        <Route path="/reporte/*" element={<ReportManagementPage />} />
        <Route path="/Reportes/*" element={<ReportManagementPage />} />
        <Route path="/Reporte/*" element={<ReportManagementPage />} />
        <Route path="/gestion-reportes/*" element={<ReportManagementPage />} />
        <Route path="/reportes-sucursales/*" element={<ReportManagementPage />} />
        <Route path="/sucursales/reporte/*" element={<ReportManagementPage />} />
        <Route path="/reportes-y-pedidos/*" element={<ReportManagementPage />} />
        <Route
          path="/configuracion/*"
          element={<div>Módulo de Configuración (próximamente)</div>}
        />

        <Route
          path="/access-security/*"
          element={<div>Módulo de Seguridad (próximamente)</div>}
        />
        <Route path="*" element={
          <div style={{ p: 4, textAlign: 'center' }}>
            <h2>Página no encontrada</h2>
            <p>Ruta actual: <strong>{location.pathname}</strong></p>
            <button onClick={() => window.location.href = '/dashboard'}>Volver al Inicio</button>
          </div>
        } />
      </Routes>
    </DashboardLayout>
  );
}

/**
 * Componente principal de rutas
 * Envuelve todo en el AuthProvider
 */
function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppRoutes;
