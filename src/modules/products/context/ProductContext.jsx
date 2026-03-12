// src/modules/products/context/ProductContext.jsx

import React, { createContext, useContext } from "react";
import { useProducts } from "../hooks/useProducts";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const productState = useProducts();
  return (
    <ProductContext.Provider value={productState}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext debe usarse dentro de ProductProvider");
  }
  return context;
};
