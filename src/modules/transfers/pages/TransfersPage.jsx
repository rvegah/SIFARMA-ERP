// src/modules/transfers/pages/TransfersPage.jsx
import React from "react";
import { Container, Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { useTransfers } from "../hooks/useTransfers";
import CreateTransferSection from "../components/CreateTransferSection";
import AddProductsToTransferSection from "../components/AddProductsToTransferSection";
import { NavigateNext } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

import { Routes, Route, Navigate } from "react-router-dom";

const TransfersDispatcher = () => {
    const transferHook = useTransfers();
    const { viewState } = transferHook;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header & Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: farmaColors.secondary, mb: 1 }}>
                    Módulo de Traspasos
                </Typography>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="#">
                        Inventario
                    </Link>
                    <Typography color="text.primary" sx={{ fontWeight: 600 }}>
                        {viewState === "creating" ? "Nuevo Traspaso" : "Añadir Productos"}
                    </Typography>
                </Breadcrumbs>
            </Box>

            {/* Dynamic Content */}
            <Box>
                {viewState === "creating" ? (
                    <CreateTransferSection 
                        transferData={transferHook.transferData}
                        setTransferData={transferHook.setTransferData}
                        onCreate={transferHook.handleCreateTransfer}
                        catalogs={transferHook.catalogs}
                        loading={transferHook.loading}
                        loadingCatalogs={transferHook.loadingCatalogs}
                    />
                ) : (
                    <AddProductsToTransferSection 
                        createdTransfer={transferHook.createdTransfer}
                        transferItems={transferHook.transferItems}
                        isReadOnly={transferHook.isReadOnly}
                        loading={transferHook.loading}
                        loadingSearch={transferHook.loadingSearch}
                        searchFilters={transferHook.searchFilters}
                        setSearchFilters={transferHook.setSearchFilters}
                        searchResults={transferHook.searchResults}
                        searchProducts={transferHook.searchProducts}
                        addTransferItem={transferHook.addTransferItem}
                        updateTransferItem={transferHook.updateTransferItem}
                        removeTransferItem={transferHook.removeTransferItem}
                        handleConfirmSave={transferHook.handleConfirmSave}
                        setViewState={transferHook.setViewState}
                        catalogs={transferHook.catalogs}
                        // Purchase Copying props
                        purchaseList={transferHook.purchaseList}
                        selectedPurchase={transferHook.selectedPurchase}
                        purchaseProducts={transferHook.purchaseProducts}
                        loadingPurchases={transferHook.loadingPurchases}
                        loadingPurchaseProducts={transferHook.loadingPurchaseProducts}
                        fetchPurchases={transferHook.fetchPurchases}
                        fetchPurchaseProducts={transferHook.fetchPurchaseProducts}
                        copyProductsFromPurchase={transferHook.copyProductsFromPurchase}
                    />
                )}
            </Box>
        </Container>
    );
};

const TransfersPage = () => {
    return (
        <Routes>
            <Route index element={<TransfersDispatcher />} />
            <Route path="nuevo-traspaso" element={<TransfersDispatcher />} />
            <Route path="*" element={<Navigate to="nuevo-traspaso" replace />} />
        </Routes>
    );
};

export default TransfersPage;
