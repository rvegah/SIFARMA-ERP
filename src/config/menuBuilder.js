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
      // O si es Traspasos (porque inyectaremos la opción)
      const isTraspaso = module.nombreOpcion?.toLowerCase().includes('traspaso');
      const hasSubOptions = (module.subOpcionesMenu && module.subOpcionesMenu.length > 0) || isTraspaso;
      
      if (!hasSubOptions && !isTraspaso) {
        console.log(`⚠️ Módulo "${module.nombreOpcion}" sin subopciones, se omite`);
      }
      return hasSubOptions;
    })
    .map(module => {
      console.log(`📦 Procesando módulo: ${module.nombreOpcion}`);

      const cleanParentName = module.nombreOpcion
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/\s+/g, '-'); // Espacios por guiones

      // Construir elemento principal del menú
      const menuItem = {
        texto: module.nombreOpcion,
        icono: getIconComponent(module.icono),
        ruta: module.ruta || `/${cleanParentName}`,
        color: module.color,
        subElementos: [],
      };

      // Construir subelementos
      if (module.subOpcionesMenu) {
        menuItem.subElementos = module.subOpcionesMenu
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(subOption => {
            // 🔥 Usar ruta del API o construir una limpia (sin espacios)
            let subRoute = subOption.ruta;

            if (!subRoute) {
              const cleanName = subOption.nombreOpcion
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
                .replace(/\s+/g, '-'); // Espacios por guiones

              subRoute = `${menuItem.ruta}/${cleanName}`;
            }

            console.log(`  └─ Subopción: ${subOption.nombreOpcion} → ${subRoute}`);

            return {
              texto: subOption.nombreOpcion,
              ruta: subRoute,
            };
          });

        // 🚀 INYECCIÓN DINÁMICA: Si es el módulo de Ventas, añadir opciones de Pedidos si no existen
        if (module.nombreOpcion === 'Ventas' || module.nombreOpcion === 'VENTAS') {
          const hasRealizarPedido = menuItem.subElementos.some(sub => sub.texto.includes('Pedido'));
          if (!hasRealizarPedido) {
            menuItem.subElementos.push(
              { texto: 'Realizar pedidos', ruta: '/ventas/pedidos/crear' },
              { texto: 'Mis pedidos', ruta: '/ventas/mis-pedidos' }
            );
          }
        }

        // 🚀 INYECCIÓN DINÁMICA: Si es el módulo de Compras, añadir opciones de Compras si no existen
        if (module.nombreOpcion === 'Compras' || module.nombreOpcion === 'COMPRAS') {
          const hasNuevaCompra = menuItem.subElementos.some(sub => sub.texto.includes('Compra'));
          if (!hasNuevaCompra) {
            menuItem.subElementos.push(
              { texto: 'Nueva Compra', ruta: '/compras/nueva' }
            );
          }
          // Añadir Compras al crédito si no existe
          const hasComprasCredito = menuItem.subElementos.some(sub => sub.texto.includes('crédito'));
          if (!hasComprasCredito) {
            menuItem.subElementos.push(
              { texto: 'Compras al crédito', ruta: '/compras/credito' }
            );
          }
          // Añadir Nueva salida si no existe
          const hasNuevaSalida = menuItem.subElementos.some(sub => sub.texto.includes('salida'));
          if (!hasNuevaSalida) {
            menuItem.subElementos.push(
              { texto: 'Nueva salida', ruta: '/compras/nueva-salida' }
            );
          }
        }
      }

      // 🚀 INYECCIÓN DINÁMICA: Traspasos (Fuera del if de subOpcionesMenu para asegurar que corra)
      if (module.nombreOpcion && module.nombreOpcion.toLowerCase().includes('traspaso')) {
        // Asegurar que subElementos existe
        if (!menuItem.subElementos) menuItem.subElementos = [];

        // Si el API ya trae opciones, nos aseguramos que "nuevo" apunte a nuestra ruta
        menuItem.subElementos.forEach(sub => {
          if (sub.texto.toLowerCase().includes('nuevo') || sub.texto.toLowerCase().includes('nueva')) {
            sub.ruta = '/traspasos/nuevo-traspaso';
          }
        });

        const hasNuevoTraspaso = menuItem.subElementos.some(sub => 
          sub.texto.toLowerCase().includes('nuevo') || sub.texto.toLowerCase().includes('nueva')
        );
        if (!hasNuevoTraspaso) {
          menuItem.subElementos.push(
            { texto: 'Nuevo Traspaso', ruta: '/traspasos/nuevo-traspaso' }
          );
        }
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