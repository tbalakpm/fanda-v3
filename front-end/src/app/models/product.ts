export interface Product {
  _id?: string;
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
  _id?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Unit {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface GTN {
  _id: string;
  gtn: string;
  qtyOnHand: number;
  productId: TID;
  unitId: TID;
  buyingPrice?: number;
  sellingPrice?: number;
  marginPct?: number;
  marginAmt?: number;
}

export interface TID {
  _id: string;
  code: string;
  name: string;
  taxPct?: number;
  taxCode?: string;
  isActive?: boolean;
}
