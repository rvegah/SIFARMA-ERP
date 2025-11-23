// src/App.jsx - FIX sin doble router

import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./app/theme";

import { UserProvider } from "./modules/user-management/context/UserContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Componentes
import LoginPage from "./shared/components/LoginPage";
import DashboardLayout from "./shared/components/DashboardLayout";
import Dashboard from "./shared/components/Dashboard";
import UserManagementPage from "./modules/user-management/pages/UserManagementPage";
import EditProfilePage from "./modules/user-management/components/EditProfilePage";
import SalesPage from "./modules/sales/pages/SalesPage";

// Redirección después de login
function DashboardRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const wasAuthenticated = sessionStorage.getItem("wasAlreadyAuthenticated");

    if (!wasAuthenticated) {
      console.log("🔄 Primera carga después del login, redirigiendo al dashboard");
      navigate("/dashboard", { replace: true });
      sessionStorage.setItem("wasAlreadyAuthenticated", "true");
    }
  }, [navigate]);

  return children;
}

// Rutas protegidas
function ProtectedRoutes() {
  const { isAuthenticated, isLoading, logout, user, apiPermissions } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <UserProvider>
      <DashboardRedirect>
        <DashboardLayout
          onLogout={logout}
          currentUser={{ ...user, apiPermissions }}
        >
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users/*" element={<UserManagementPage />} />
            <Route path="/profile" element={<EditProfilePage />} />
            <Route path="/ventas/*" element={<SalesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      </DashboardRedirect>
    </UserProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
