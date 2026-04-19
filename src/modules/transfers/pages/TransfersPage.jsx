// src/modules/transfers/pages/TransfersPage.jsx
import React, { useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";

import { useTransfers } from "../hooks/useTransfers";
import CreateTransferSection from "../components/CreateTransferSection";
import AddProductsToTransferSection from "../components/AddProductsToTransferSection";
import MyTransfersSection from "../components/MyTransfersSection";
import PageHeader from "../../../shared/components/PageHeader";
import ListaTraspasosSection from "../components/ListaTraspasosSection";

// ─── Crear / Editar Traspaso ──────────────────────────────────────────────────
const TransfersDispatcher = () => {
  const { numeroTraspaso } = useParams();

  const {
    viewState,
    setViewState,
    loading,
    loadingCatalogs,
    loadingSearch,
    transferData,
    setTransferData,
    createdTransfer,
    transferItems,
    isReadOnly,
    catalogs,
    handleCreateTransfer,
    loadTraspasoDetalle,
    searchResults,
    searchProductsByText,
    addTransferItem,
    updateTransferItem,
    removeTransferItem,
    handleConfirmSave,
    handleTerminarTraspaso,
    purchaseList,
    selectedPurchase,
    purchaseProducts,
    loadingPurchases,
    loadingPurchaseProducts,
    fetchPurchases,
    fetchPurchaseProducts,
    copyProductsFromPurchase,
  } = useTransfers();

  useEffect(() => {
    if (numeroTraspaso) {
      loadTraspasoDetalle(numeroTraspaso);
    }
  }, [numeroTraspaso]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <PageHeader title="Módulo de Traspasos" icon={<SwapHoriz />} />
      </Box>
      <Box>
        {viewState === "creating" && (
          <CreateTransferSection
            transferData={transferData}
            setTransferData={setTransferData}
            onCreate={handleCreateTransfer}
            catalogs={catalogs}
            loading={loading}
            loadingCatalogs={loadingCatalogs}
          />
        )}
        {viewState === "adding_products" && (
          <AddProductsToTransferSection
            createdTransfer={createdTransfer}
            transferItems={transferItems}
            isReadOnly={isReadOnly}
            loading={loading}
            loadingSearch={loadingSearch}
            searchResults={searchResults}
            searchProductsByText={searchProductsByText}
            addTransferItem={addTransferItem}
            updateTransferItem={updateTransferItem}
            removeTransferItem={removeTransferItem}
            handleConfirmSave={handleConfirmSave}
            handleTerminarTraspaso={handleTerminarTraspaso}
            setViewState={setViewState}
            catalogs={catalogs}
            purchaseList={purchaseList}
            selectedPurchase={selectedPurchase}
            purchaseProducts={purchaseProducts}
            loadingPurchases={loadingPurchases}
            loadingPurchaseProducts={loadingPurchaseProducts}
            fetchPurchases={fetchPurchases}
            fetchPurchaseProducts={fetchPurchaseProducts}
            copyProductsFromPurchase={copyProductsFromPurchase}
          />
        )}
      </Box>
    </Container>
  );
};

// ─── Router ───────────────────────────────────────────────────────────────────
const TransfersPage = () => (
  <Routes>
    <Route path="nuevo" element={<TransfersDispatcher />} />
    <Route path="nuevo/:numeroTraspaso" element={<TransfersDispatcher />} />
    <Route path="mis-traspasos" element={<MyTransfersSection />} />
    <Route path="lista-traspasos" element={<ListaTraspasosSection />} />
  </Routes>
);

export default TransfersPage;
