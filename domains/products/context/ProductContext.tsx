'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product, ProductSupply } from '../types/product.types';

export interface ProductData {
  name: string;
  description?: string;
  price: number;
  currentPrice?: number;
  supplies: ProductSupply[];
}

interface ProductContextValue {
  product: ProductData;
  setProduct: (data: ProductData | ((prev: ProductData) => ProductData)) => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

interface ProductProviderProps {
  children: ReactNode;
  initialProduct?: Product;
}

export function ProductProvider({ children, initialProduct }: ProductProviderProps) {
  const [product, setProduct] = useState<ProductData>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || 0,
    currentPrice: initialProduct?.currentPrice,
    supplies: initialProduct?.supplies || [],
  });

  return (
    <ProductContext.Provider value={{ product, setProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider');
  }
  return context;
}
