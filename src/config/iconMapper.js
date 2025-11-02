// src/config/iconMapper.js - Mapeo de strings de iconos a componentes MUI

import {
  Group,
  Inventory,
  ShoppingCart,
  Warehouse,
  PointOfSale,
  SwapHoriz,
  Assessment,
  Security,
  HelpOutline,
} from '@mui/icons-material';

/**
 * Diccionario que mapea nombres de iconos (strings del API) a componentes MUI
 * 
 * IMPORTANTE: Los nombres deben coincidir EXACTAMENTE con lo que devuelve el API
 * 
 * Si el backend agrega nuevos iconos, agregarlos aquí también
 */
const ICON_COMPONENTS = {
  'Group': Group,
  'Inventory': Inventory,
  'Shop': ShoppingCart,
  'Warehouse': Warehouse,
  'Checkout': PointOfSale,
  'SwapHoriz': SwapHoriz,
  'Assessment': Assessment,
  'Security': Security,
};

/**
 * Obtiene el componente de icono según el nombre del API
 * 
 * @param {string} iconName - Nombre del icono desde el API
 * @returns {React.Component} Componente de icono MUI
 * 
 * @example
 * getIconComponent('Group') // → Group component
 * getIconComponent('??') // → HelpOutline (icono por defecto)
 */
export const getIconComponent = (iconName) => {
  if (ICON_COMPONENTS[iconName]) {
    return ICON_COMPONENTS[iconName];
  }
  
  console.warn(`⚠️ Icono no encontrado: "${iconName}", usando icono por defecto`);
  return HelpOutline;
};

export default {
  getIconComponent,
};