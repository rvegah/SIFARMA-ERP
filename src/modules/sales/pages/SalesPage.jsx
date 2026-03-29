// src/modules/sales/pages/SalesPage.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateSaleSection from "../components/CreateSaleSection";
import MyOrdersSection from "../components/MyOrdersSection";
import OrderManagementSection from "../components/OrderManagementSection";

const SalesPage = () => {
  return (
    <Routes>
      <Route index element={<CreateSaleSection />} />
      <Route path="realizar-pedidos" element={<OrderManagementSection />} />
      <Route path="mis-pedidos" element={<MyOrdersSection />} />
      {/* <Route path="pedidos/crear" element={<Navigate to="../realizar-pedidos" replace />} /> */}
      {/* <Route path="*" element={<Navigate to="." replace />} /> */}
    </Routes>
  );
};

export default SalesPage;
