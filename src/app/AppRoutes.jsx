import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from '../shared/components/LoginPage'
import DashboardLayout from '../shared/components/DashboardLayout'
import Dashboard from '../shared/components/Dashboard'
import SalesPage from '../modules/sales/pages/SalesPage'

// Módulo de perfil personal (existente)
import UsersPage from '../modules/access-security/pages/UsersPage'

// NUEVO: Módulo de gestión de usuarios (administrativo)
import UserManagementPage from '../modules/user-management/pages/UserManagementPage'

function AppRoutes() {
  // Estado para manejar si el usuario está logueado
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const navigate = useNavigate()

  // Función para manejar el login
  const handleLogin = (usuario, contrasena) => {
    // Por ahora, cualquier usuario/contraseña es válida
    if (usuario && contrasena) {
      setIsAuthenticated(true)
      setJustLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setJustLoggedIn(false)
    // Limpiar cualquier estado persistente si lo hay
    localStorage.removeItem('currentRoute')
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Si acabamos de hacer login, forzar render del dashboard
  if (justLoggedIn) {
    setTimeout(() => {
      navigate('/dashboard', { replace: true })
      setJustLoggedIn(false)
    }, 0)
    
    return (
      <DashboardLayout onLogout={handleLogout}>
        <Dashboard />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* SEPARACIÓN CLARA DE FUNCIONALIDADES */}
        
        {/* Editar Perfil Personal - acceso desde menú de usuario */}
        <Route path="/profile" element={<UsersPage />} />
        
        {/* Gestión Administrativa de Usuarios - acceso desde sidebar "Usuarios" */}
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/users/list" element={<UserManagementPage />} />
        <Route path="/users/new" element={<UserManagementPage />} />
        <Route path="/users/*" element={<UserManagementPage />} />
        
        {/* Rutas futuras de otros módulos */}
        <Route path="/productos/*" element={<div>Módulo de Productos (próximamente)</div>} />
        <Route path="/compras/*" element={<div>Módulo de Compras (próximamente)</div>} />
        <Route path="/proveedor/*" element={<div>Módulo de Proveedores (próximamente)</div>} />
        <Route path="/ventas/*" element={<SalesPage />} />
        <Route path="/traspasos/*" element={<div>Módulo de Traspasos (próximamente)</div>} />
        <Route path="/reportes/*" element={<div>Módulo de Reportes (próximamente)</div>} />
        <Route path="/configuracion/*" element={<div>Módulo de Configuración (próximamente)</div>} />
        
        <Route path="/access-security/*" element={<div>Módulo de Seguridad (próximamente)</div>} />
        <Route path="*" element={<div>Página no encontrada</div>} />


      </Routes>
    </DashboardLayout>
  )
}

export default AppRoutes