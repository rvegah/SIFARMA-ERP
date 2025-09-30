import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './app/theme';
import { UserProvider } from './modules/user-management/context/UserContext';

// Componentes
import LoginPage from './shared/components/LoginPage';
import DashboardLayout from './shared/components/DashboardLayout';
import Dashboard from './shared/components/Dashboard';
import UserManagementPage from "./modules/user-management/pages/UserManagementPage";
import UsersPage from './modules/access-security/pages/UsersPage'; // Perfil personal

// Importar la función de validación de credenciales
import { validateCredentials } from './modules/user-management/constants/userConstants';
import { allUsers } from './modules/user-management/constants/userConstants';

// Componente para redireccionar al dashboard en sesiones restauradas
function DashboardRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Si la sesión viene de localStorage y no estamos en dashboard ni en login
    const wasAuthenticated = sessionStorage.getItem('wasAlreadyAuthenticated');
    
    if (!wasAuthenticated && location.pathname !== '/dashboard' && location.pathname !== '/') {
      // Es una sesión restaurada, redirigir al dashboard
      navigate('/dashboard', { replace: true });
    }
    
    // Marcar que ya procesamos la carga inicial
    sessionStorage.setItem('wasAlreadyAuthenticated', 'true');
  }, [navigate, location.pathname]);
  
  return children;
}

function App() {
  // Inicializar estado desde localStorage si existe
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (usuario, contrasena) => {
    // Validar credenciales y obtener permisos
    const credentials = validateCredentials(usuario, contrasena);
    
    if (credentials) {
      // Buscar el usuario completo en allUsers
      const fullUser = allUsers.find(u => u.usuario === usuario);
      
      if (fullUser) {
        console.log('✅ Login exitoso:', fullUser);
        console.log('📋 Permisos del usuario:', fullUser.permisos);
        
        // Guardar en localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(fullUser));
        
        // Limpiar la marca de sesión restaurada
        sessionStorage.removeItem('wasAlreadyAuthenticated');
        
        setCurrentUser(fullUser);
        setIsAuthenticated(true);
        return true;
      }
    }
    
    return false;
  };

  const handleLogout = () => {
    // Limpiar localStorage y sessionStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('wasAlreadyAuthenticated');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <LoginPage onLogin={handleLogin} />
        </SnackbarProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <UserProvider>
          <BrowserRouter>
            <DashboardRedirect>
              <DashboardLayout onLogout={handleLogout} currentUser={currentUser}>
                <Routes>
                  {/* Ruta principal - siempre redirige al dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard principal */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Gestión de usuarios (CRUD de usuarios) */}
                  <Route path="/users/*" element={<UserManagementPage />} />
                  
                  {/* Perfil personal del usuario actual */}
                  <Route path="/profile" element={<UsersPage />} />
                  
                  {/* Cualquier ruta desconocida redirige al dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </DashboardRedirect>
          </BrowserRouter>
        </UserProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;