// src/modules/purchases/hooks/usePurchaseStore.js
// Persistencia local de compras en progreso — patrón idéntico a useOrderStore

const BASE_KEY = "@sifarma/purchase_";
const NEW_PURCHASE_KEY = "NEW_PURCHASE";

export const usePurchaseStore = () => {
  const getStorageKey = (id) => {
    const key = id || NEW_PURCHASE_KEY;
    return `${BASE_KEY}${key}`;
  };

  /**
   * Guarda el estado actual de la compra en localStorage
   */
  const savePendingPurchase = (id, purchaseData, purchaseItems) => {
    try {
      const key = getStorageKey(id);
      localStorage.setItem(
        key,
        JSON.stringify({
          purchaseData,
          purchaseItems,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Error saving pending purchase:", error);
    }
  };

  /**
   * Recupera la compra guardada si existe
   */
  const getPendingPurchase = (id) => {
    try {
      const key = getStorageKey(id);
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading pending purchase:", error);
      return null;
    }
  };

  /**
   * Limpia el almacenamiento para un ID específico
   */
  const clearPendingPurchase = (id) => {
    try {
      const key = getStorageKey(id);
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing pending purchase:", error);
    }
  };

  /**
   * Verifica si hay una compra pendiente válida
   */
  const hasPendingPurchase = (id) => {
    const data = getPendingPurchase(id);
    if (!data) return false;
    if (!id) {
      return !!(
        data.purchaseItems?.length > 0 || data.purchaseData?.sucursalId
      );
    }
    return !!(data.purchaseItems?.length > 0);
  };
  
  return {
    savePendingPurchase,
    getPendingPurchase,
    clearPendingPurchase,
    hasPendingPurchase,    
  };
};
