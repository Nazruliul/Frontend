/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number; // in primary unit (pcs)
  unit: string; // e.g., 'pcs'
  minStock: number;
  cartonConversion: number; // number of pcs in one carton/box
  cartonSellingPricePrice?: number; // Optional carton price
  description?: string;
  image?: string;
}

export interface OrderItem {
  id: string; // SKU or product ID
  product: Product;
  quantity: number;
  unitSelected: "pcs" | "carton";
  price: number; // calculated based on unitSelected
  total: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  cashierId: string;
  cashierName: string;
  role: UserRole;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "Cash" | "Debit" | "QRIS";
  amountPaid: number;
  change: number;
  status: "Completed" | "Pending" | "Cancelled";
  notes?: string;
}

export interface StoreState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
  activeCart: OrderItem[];
  cartDiscount: number;
  cartTaxRate: number; // defaults to 0.11 (11% VAT)
  currentView: string; // active route
  filters: {
    category: string;
    search: string;
    dateRange: string;
  };
}
