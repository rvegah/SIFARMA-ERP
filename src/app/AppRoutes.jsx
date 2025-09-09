import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../shared/components/LoginPage'
import DashboardLayout from '../shared/components/DashboardLayout'
import Dashboard from '../shared/components/Dashboard'

function AppRoutes() {
  // Estado para manejar si el usuario está logueado
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Función para manejar el login
  const handleLogin = (usuario, contrasena) => {
    // Por ahora, cualquier usuario/contraseña es válida
    if (usuario && contrasena) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/access-security/*" element={<div>Módulo de Seguridad (próximamente)</div>} />
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default AppRoutes