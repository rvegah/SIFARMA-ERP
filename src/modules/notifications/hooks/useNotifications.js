// src/modules/notifications/hooks/useNotifications.js

import { useState, useRef } from "react";
import notificationService from "../../../shared/services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ FALTABA
  const lastFetchRef = useRef(null);
  const cacheRef = useRef(null);

  const fetchNotifications = async (sucursalId, force = false) => {
    const now = Date.now();

    if (!force && lastFetchRef.current && now - lastFetchRef.current < 30000) {
      return cacheRef.current;
    }

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
      setLoading(false);
    }

    return [];
  };

  return {
    notifications,
    fetchNotifications,
    loading,
  };
};
