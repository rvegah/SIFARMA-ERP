// src/config/menuBuilder.js - Construye el menú dinámicamente desde el API
// REEMPLAZA a menuPermissions.js (código estático)

import { getIconComponent } from './iconMapper';

/**
 * Construye el menú dinámicamente desde los permisos del API
 * 
 * @param {Array} apiPermissions - Array de permisos desde el API
 * @returns {Array} Array de elementos del menú para DashboardLayout
 * 
 * Entrada (API):
 * [{
 *   nombreOpcion: "Usuarios",
 *   icono: "Group",
 *   color: "#4A5FFF",
 *   orden: 1,
 *   descripcion: "/users",  // ← Ahora contiene la RUTA
 *   subOpcionesMenu: [...]
 * }]
 * 
 * Salida (para DashboardLayout):
 * [{
 *   texto: "Usuarios",
 *   icono: Group, // Componente MUI
 *   ruta: "/users", // ← Tomada directamente del API
 *   color: "#4A5FFF",
 *   subElementos: [...]
 * }]
 */
export const buildMenuFromApi = (apiPermissions) => {
  if (!apiPermissions || !Array.isArray(apiPermissions)) {
    console.warn('⚠️ menuBuilder: No se recibieron permisos del API');
    return [];
  }

  console.log('🔨 menuBuilder: Construyendo menú desde API...', {
    modulos: apiPermissions.length
  });

  const menu = apiPermissions
    .filter(module => {
      // Solo mostrar módulos que tengan al menos 1 subopción
      const hasSubOptions = (module.subOpcionesMenu && module.subOpcionesMenu.length > 0);
      
      if (!hasSubOptions) {
        console.log(`⚠️ Módulo "${module.nombreOpcion}" sin subopciones, se omite`);
      }
      return hasSubOptions;
    })
    .map(module => {
      console.log(`📦 Procesando módulo: ${module.nombreOpcion}`);

      // Construir elemento principal del menú
      const menuItem = {
        texto: module.nombreOpcion,
        icono: getIconComponent(module.icono),
        ruta: module.ruta || `/${module.nombreOpcion.toLowerCase().replace(/\s+/g, '-')}`,
        color: module.color,
        subElementos: [],
      };

      // Construir subelementos
      if (module.subOpcionesMenu) {
        menuItem.subElementos = module.subOpcionesMenu
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(subOption => {
            console.log(`  └─ Subopción: ${subOption.nombreOpcion} → ${subOption.ruta}`);
            return {
              texto: subOption.nombreOpcion,
              ruta: subOption.ruta || "/dashboard",
            };
          });
      }

      console.log(`✅ Módulo "${module.nombreOpcion}" procesado:`, {
        ruta: menuItem.ruta,
        subopciones: menuItem.subElementos.length
      });

      return menuItem;
    })
    .sort((a, b) => {
      // Ordenar por el orden del API si está disponible
      const orderA = apiPermissions.find(m => m.nombreOpcion === a.texto)?.orden || 999;
      const orderB = apiPermissions.find(m => m.nombreOpcion === b.texto)?.orden || 999;
      return orderA - orderB;
    });

  // 🛠️ INYECCIÓN MANUAL: Agregar "Configuración" si no viene del API o agregar sub-item
  const configMenuIndex = menu.findIndex(m => m.texto === "Configuracion" || m.texto === "Configuración");
  const certSubItem = {
    texto: "Certificado de Cómputo",
    ruta: "/configurar/certificados"
  };

  if (configMenuIndex !== -1) {
    // Si ya existe, nos aseguramos de que tenga el sub-item
    const subExists = menu[configMenuIndex].subElementos.some(s => s.ruta === certSubItem.ruta);
    if (!subExists) {
      menu[configMenuIndex].subElementos.push(certSubItem);
    }
  } else {
    // Si no existe, lo creamos
    menu.push({
      texto: "Configuracion",
      icono: getIconComponent("Security"),
      ruta: "/configurar",
      color: "#05305A",
      subElementos: [certSubItem]
    });
  }

  console.log('✅ menuBuilder: Menú construido exitosamente', {
    elementos: menu.length,
    menu: menu
  });

  return menu;
};

/**
 * Función de compatibilidad con el código existente
 * Reemplaza a getFilteredMenuItems() de menuPermissions.js
 * 
 * IMPORTANTE: Esta función mantiene el mismo nombre para no romper código existente
 * 
 * @param {Array} apiPermissions - Permisos desde el API
 * @returns {Array} Menú construido
 */
export const getFilteredMenuItems = (apiPermissions) => {
  console.log('🔄 getFilteredMenuItems llamado con:', apiPermissions?.length, 'módulos');
  return buildMenuFromApi(apiPermissions);
};

export default {
  buildMenuFromApi,
  getFilteredMenuItems,
};