// src/components/DynamicRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routeMap } from '../config/routeMap';

// Rutas Globales / Estáticas
import Dashboard from "../shared/components/Dashboard";
import NotificationsPage from "../shared/pages/NotificationsPage";
import NotificationDetailPage from "../shared/pages/NotificationDetailPage";
import EditProfilePage from "../modules/user-management/components/EditProfilePage";
import ReportManagementPage from "../modules/reports/pages/ReportManagementPage";

export default function DynamicRouter({ apiPermissions }) {
  // Función para encontrar la raíz del módulo mapeada en routeMap.js
  const findModuleRoot = (path) => {
    if (!path) return null;
    if (routeMap[path]) return path;
    
    // Buscar el prefijo más largo que coincida en routeMap
    const segments = path.split('/').filter(Boolean);
    for (let i = segments.length - 1; i > 0; i--) {
      const prefix = '/' + segments.slice(0, i).join('/');
      if (routeMap[prefix]) return prefix;
    }
    return null;
  };

  // Determinar qué "Entradas de Módulo" (roots) necesitamos activar según los permisos
  const activeModuleRoots = new Set();
  
  if (Array.isArray(apiPermissions)) {
    apiPermissions.forEach(module => {
      const root = findModuleRoot(module.ruta);
      if (root) activeModuleRoots.add(root);
      
      if (module.subOpcionesMenu) {
        module.subOpcionesMenu.forEach(sub => {
          const subRoot = findModuleRoot(sub.ruta);
          if (subRoot) activeModuleRoots.add(subRoot);
        });
      }
    });
  }

  return (
    <Routes>
      {/* Redirección Inicial Obligatoria */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Ruteo Dinámico por Módulos (usando comodín /* para permitir rutas anidadas) */}
      {[...activeModuleRoots].map((ruta) => {
        const Component = routeMap[ruta];
        
        // Si no es el dashboard, le añadimos /* para permitir sub-rutas internas
        // Esto hace que el mapeo sea "una sola vez" en routeMap y el componente PAGE se encargue de lo interno.
        const path = (ruta === "/dashboard") ? ruta : `${ruta}/*`;

        return (
          <Route
            key={ruta}
            path={path}
            element={<Component />}
          />
        );
      })}

      {/* Rutas Estáticas Intocables (No dependen de que existan en el menú) */}
      <Route path="/profile" element={<EditProfilePage />} />
      <Route path="/notificaciones" element={<NotificationsPage />} />
      <Route path="/notificaciones/:numeroTraspaso" element={<NotificationDetailPage />} />
      
      {/* 
         Fallback TEMPORAL de Reportes, en caso de que estas dependan de lógica 
         interna comodín. Si el API envía un path exacto ej. /reportes/diario 
         se puede retirar este asterisco y mapearlo exactamente en routeMap.js 
      */}
      <Route path="/reportes/*" element={<ReportManagementPage />} />
      <Route path="/reporte/*" element={<ReportManagementPage />} />

      {/* Rutas no encontradas -> Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
