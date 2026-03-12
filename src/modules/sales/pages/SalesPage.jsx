// src/modules/sales/pages/SalesPage.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import CreateSaleSection from "../components/CreateSaleSection";
import MyOrdersSection from "../components/MyOrdersSection";
import OrderManagementSection from "../components/OrderManagementSection";

const SalesPage = () => {
  return (
    <Routes>
      <Route index element={<CreateSaleSection />} />
      <Route path="pedidos/crear" element={<OrderManagementSection />} />
      <Route path="realizar-pedidos" element={<OrderManagementSection />} />
      <Route path="mis-pedidos" element={<MyOrdersSection />} />
    </Routes>
  );
};

export default SalesPage;
