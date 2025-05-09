export interface Product {
  productId?: string;
  isActive: boolean;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  unitId: string;
  category?: ProductCategory;
  unit?: Unit;
  buyingPrice: number;
  marginPct?: number;
  marginAmt?: number;
  sellingPrice: number;
  taxPreference: string;
  taxCode?: string;
  taxPct: number;

  marginPctOrAmt?: string;
  margin?: number;
}

export interface ProductCategory {
  categoryId?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Unit {
  unitId?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface GTN {
  inventoryId: string;
  gtn: string;
  qtyOnHand: number;
  product: {
    productId: string;
    code: string;
    name: string;
    taxPct?: number;
    taxCode?: string;
    isActive?: boolean;
  };
  unit: { unitId: string; code: string; name: string; isActive?: boolean };
  buyingPrice?: number;
  sellingPrice?: number;
  marginPct?: number;
  marginAmt?: number;
}

export interface TID {
  id: string;
  code: string;
  name: string;
  taxPct?: number;
  taxCode?: string;
  isActive?: boolean;
}
