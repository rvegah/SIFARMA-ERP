import { useState, useRef, useCallback } from "react";
import notificationService from "../../../shared/services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const lastFetchRef = useRef(0);
  const cacheRef = useRef([]);
  const inFlightRef = useRef(false);

  const fetchNotifications = useCallback(async (sucursalId, force = false) => {
    const now = Date.now();

    // 🔥 Evita spam
    if (!force && now - lastFetchRef.current < 30000) {
      return cacheRef.current;
    }

    // 🔥 Evita doble llamada simultánea
    if (inFlightRef.current) return cacheRef.current;

    inFlightRef.current = true;
    setLoading(true);

    try {
      const res = await notificationService.getNotificaciones(sucursalId);

      if (res.exitoso) {
        const data = res.datos || [];

        setNotifications(data);
        cacheRef.current = data;
        lastFetchRef.current = now;

        return data;
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }

    return [];
  }, []);

  // 🔥 INVALIDAR CACHE (clave PRO)
  const invalidateCache = () => {
    lastFetchRef.current = 0;
  };

  return {
    notifications,
    fetchNotifications,
    loading,
    invalidateCache, // 👈 NUEVO
  };
};