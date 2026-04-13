// src/modules/purchases/pages/PurchasesPage.jsx
import React, { useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

import { usePurchases } from "../hooks/usePurchases";
import { useCreditPurchases } from "../hooks/useCreditPurchases";
import { useInventoryOutput } from "../hooks/useInventoryOutput";

// Flujo Nueva Compra
import CreatePurchaseSection from "../components/CreatePurchaseSection";
import AddProductsToPurchaseSection from "../components/AddProductsToPurchaseSection";
import CreditPaymentSection from "../components/CreditPaymentSection";

// Sin cambios
import CreditPurchasesListSection from "../components/CreditPurchasesListSection";
import CreateInventoryOutputSection from "../components/CreateInventoryOutputSection";
import AddProductsToInventoryOutputSection from "../components/AddProductsToInventoryOutputSection";
import MyPurchasesSection from "../components/MyPurchasesSection";

import PageHeader from "../../../shared/components/PageHeader";

// ─── Nueva Compra ─────────────────────────────────────────────────────────────
const PurchasesDispatcher = () => {
  const { numeroCompra } = useParams();
  const {
    viewState,
    setViewState,
    loading,
    loadingOrders,
    isSearching,
    searchQuery,
    setSearchQuery,
    searchResults,
    purchaseData,
    setPurchaseData,
    purchaseItems,
    createdPurchase,
    invoiceData,
    setInvoiceData,
    creditData,
    setCreditData,
    catalogs,
    handleCreatePurchase,
    searchProducts,
    addPurchaseItem,
    updatePurchaseItem,
    removePurchaseItem,
    calculateTotal,
    handleSaveProducts,
    handleSaveInvoice,
    handleTerminarCompra,
    handlePagarCredito,
    loadCompraDetalle,
  } = usePurchases();

  useEffect(() => {
    if (numeroCompra) {
      loadCompraDetalle(numeroCompra);
    }
  }, [numeroCompra]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader title="Módulo de Compras" icon={<ShoppingCart />} />
      <Box sx={{ mt: 2 }}>
        {/* PASO 1: Cabecera */}
        {viewState === "creating" && (
          <CreatePurchaseSection
            purchaseData={purchaseData}
            setPurchaseData={setPurchaseData}
            onCreate={handleCreatePurchase}
            catalogs={catalogs}
            loading={loading}
            loadingOrders={loadingOrders}
          />
        )}

        {/* PASO 1b: Crédito */}
        {viewState === "paying_credit" && (
          <CreditPaymentSection
            creditData={creditData}
            setCreditData={setCreditData}
            onSave={handlePagarCredito}
            loading={loading}
          />
        )}

        {/* PASO 2: Productos + Factura (misma pantalla) */}
        {viewState === "adding_products" && (
          <AddProductsToPurchaseSection
            createdPurchase={createdPurchase}
            purchaseItems={purchaseItems}
            onAddItem={addPurchaseItem}
            onUpdateItem={updatePurchaseItem}
            onRemoveItem={removePurchaseItem}
            onSearchProducts={searchProducts}
            searchResults={searchResults}
            isSearching={isSearching}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSaveProducts={handleSaveProducts}
            handleSaveInvoice={handleSaveInvoice}
            handleTerminarCompra={handleTerminarCompra}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            calculateTotal={calculateTotal}
            loading={loading}
            setViewState={setViewState}
          />
        )}
      </Box>
    </Container>
  );
};

// ─── Compras al Crédito (sin cambios) ────────────────────────────────────────
const CreditPurchasesWrapper = () => {
  const creditPurchases = useCreditPurchases();
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader title="Compras al Crédito" icon={<ShoppingCart />} />
      <CreditPurchasesListSection {...creditPurchases} />
    </Container>
  );
};

// ─── Salida de Inventario (sin cambios) ──────────────────────────────────────
const InventoryOutputWrapper = () => {
  const inventoryOutput = useInventoryOutput();
  const {
    viewState,
    outputData,
    setOutputData,
    handleCreateOutput,
    catalogs,
    loading,
    loadingCatalogs,
  } = inventoryOutput;
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader title="Salida de Inventario" icon={<ShoppingCart />} />
      {viewState === "creating" ? (
        <CreateInventoryOutputSection
          outputData={outputData}
          setOutputData={setOutputData}
          onCreate={handleCreateOutput}
          catalogs={catalogs}
          loading={loading}
          loadingCatalogs={loadingCatalogs}
        />
      ) : (
        <AddProductsToInventoryOutputSection {...inventoryOutput} />
      )}
    </Container>
  );
};

// ─── Router ───────────────────────────────────────────────────────────────────
const PurchasesPage = () => (
  <Routes>
    <Route path="nueva" element={<PurchasesDispatcher />} />
    <Route path="nueva/:numeroCompra" element={<PurchasesDispatcher />} />
    <Route path="credito" element={<CreditPurchasesWrapper />} />
    <Route path="salida" element={<InventoryOutputWrapper />} />
    <Route path="mis-compras" element={<MyPurchasesSection />} />
  </Routes>
);

export default PurchasesPage;
