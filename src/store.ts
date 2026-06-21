/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, reactive, watch, nextTick } from "vue";
import { User, Product, Category, OrderItem, Transaction, UserRole } from "./types";

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  { id: "u-1", username: "admin", name: "KAPI Master Admin", role: "admin", email: "admin@kapi.com", lastLogin: "2026-06-10T08:30:00Z" },
  { id: "u-2", username: "staff", name: "Dewi Sartika (Cashier)", role: "staff", email: "dewi@kapi.com", lastLogin: "2026-06-10T11:45:00Z" },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: "c-1", name: "Espresso & Coffee", code: "COF", description: "Brewed and espresso-based beverages" },
  { id: "c-2", name: "Artisanal Tea", code: "TEA", description: "Warm and iced specialty teas" },
  { id: "c-3", name: "Pastry & Bakery", code: "PAS", description: "Cakes, croissants, and freshly baked good" },
  { id: "c-4", name: "Snack & Mains", code: "SNK", description: "Savory snacks and quick main dishes" },
  { id: "c-5", name: "Packaged Drinks", code: "BOT", description: "Bottled cold refreshers and water" },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p-1",
    sku: "KAPI-COF-001",
    name: "Aura Espresso Blend",
    barcode: "8991234560012",
    categoryId: "c-1",
    purchasePrice: 15000,
    sellingPrice: 28000,
    stock: 120,
    unit: "pcs",
    minStock: 20,
    cartonConversion: 24,
    description: "Signature premium espresso shot, rich crema, notes of chocolate and berries"
  },
  {
    id: "p-2",
    sku: "KAPI-COF-002",
    name: "Classic Iced Latte",
    barcode: "8991234560029",
    categoryId: "c-1",
    purchasePrice: 18000,
    sellingPrice: 32000,
    stock: 85,
    unit: "pcs",
    minStock: 15,
    cartonConversion: 12,
    description: "Double espresso with silky cold milk poured over crystal ice blocks"
  },
  {
    id: "p-3",
    sku: "KAPI-COF-003",
    name: "Caramel Macchiato Twist",
    barcode: "8991234560036",
    categoryId: "c-1",
    purchasePrice: 22000,
    sellingPrice: 38000,
    stock: 60,
    unit: "pcs",
    minStock: 10,
    cartonConversion: 12,
    description: "Espresso with steamed milk, vanilla syrup, drizzled with homemade sweet caramel sauce"
  },
  {
    id: "p-4",
    sku: "KAPI-TEA-001",
    name: "Matcha Zen Latte",
    barcode: "8991234560043",
    categoryId: "c-2",
    purchasePrice: 21000,
    sellingPrice: 35000,
    stock: 12,
    unit: "pcs",
    minStock: 15,
    cartonConversion: 10,
    description: "High-grade organic Uji matcha whisks, smooth steamed pasture milk"
  },
  {
    id: "p-5",
    sku: "KAPI-TEA-002",
    name: "Imperial Peach Oolong",
    barcode: "8991234560050",
    categoryId: "c-2",
    purchasePrice: 14000,
    sellingPrice: 26000,
    stock: 45,
    unit: "pcs",
    minStock: 10,
    cartonConversion: 20,
    description: "Premium oolong tea base cold-brewed with ripe white peach nectar extract"
  },
  {
    id: "p-6",
    sku: "KAPI-PAS-001",
    name: "Buttery Almond Croissant",
    barcode: "8991234560067",
    categoryId: "c-3",
    purchasePrice: 12000,
    sellingPrice: 24000,
    stock: 5,
    unit: "pcs",
    minStock: 10,
    cartonConversion: 6,
    description: "Flaky layered butter croissant topped with almond cream and toasted almond slices"
  },
  {
    id: "p-7",
    sku: "KAPI-PAS-002",
    name: "Tiramisu Gateau Slice",
    barcode: "8991234560074",
    categoryId: "c-3",
    purchasePrice: 25000,
    sellingPrice: 42000,
    stock: 14,
    unit: "pcs",
    minStock: 8,
    cartonConversion: 4,
    description: "Traditional Italian mascarpone cake slice dipped in strong KAPI espresso"
  },
  {
    id: "p-8",
    sku: "KAPI-SNK-001",
    name: "Gourmet Truffle Fries",
    barcode: "8991234560081",
    categoryId: "c-4",
    purchasePrice: 16000,
    sellingPrice: 30000,
    stock: 40,
    unit: "pcs",
    minStock: 8,
    cartonConversion: 10,
    description: "Crispy cut potatoes tossed in white truffle oil, grated parmesan and fresh parsley"
  },
  {
    id: "p-9",
    sku: "KAPI-SNK-002",
    name: "Smoked Chicken Rigatoni",
    barcode: "8991234560098",
    categoryId: "c-4",
    purchasePrice: 28000,
    sellingPrice: 48000,
    stock: 22,
    unit: "pcs",
    minStock: 5,
    cartonConversion: 8,
    description: "Creamy white garlic sauce pasta with house-smoked sliced chicken breast"
  },
  {
    id: "p-10",
    sku: "KAPI-BOT-001",
    name: "Sparkling Citrus Tonic",
    barcode: "8991234560104",
    categoryId: "c-5",
    purchasePrice: 8000,
    sellingPrice: 16000,
    stock: 200,
    unit: "pcs",
    minStock: 30,
    cartonConversion: 24,
    description: "Carbonated refreshing spring water with calamansi and cold-sealed lime essence"
  },
  {
    id: "p-11",
    sku: "KAPI-BOT-002",
    name: "KAPI Artisan Forest Water",
    barcode: "8991234560111",
    categoryId: "c-5",
    purchasePrice: 3000,
    sellingPrice: 7000,
    stock: 350,
    unit: "pcs",
    minStock: 50,
    cartonConversion: 24,
    description: "Ultra-filtered premium alkaline spring water in carbon-neutral glass bottles"
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-20260610001",
    invoiceNumber: "INV/20260610/0001",
    date: "2026-06-10T09:12:00Z",
    cashierId: "u-2",
    cashierName: "Dewi Sartika (Cashier)",
    role: "staff",
    items: [
      {
        id: "p-2_pcs",
        product: DEFAULT_PRODUCTS[1],
        quantity: 2,
        unitSelected: "pcs",
        price: 32000,
        total: 64000
      },
      {
        id: "p-6_pcs",
        product: DEFAULT_PRODUCTS[5],
        quantity: 1,
        unitSelected: "pcs",
        price: 24000,
        total: 24000
      }
    ],
    subtotal: 88000,
    tax: 9680,
    discount: 5000,
    total: 92680,
    paymentMethod: "QRIS",
    amountPaid: 92680,
    change: 0,
    status: "Completed",
    notes: "Dine-in at Table 4"
  },
  {
    id: "tx-20260610002",
    invoiceNumber: "INV/20260610/0002",
    date: "2026-06-10T11:32:00Z",
    cashierId: "u-1",
    cashierName: "KAPI Master Admin",
    role: "admin",
    items: [
      {
        id: "p-1_pcs",
        product: DEFAULT_PRODUCTS[0],
        quantity: 1,
        unitSelected: "pcs",
        price: 28000,
        total: 28000
      },
      {
        id: "p-10_pcs",
        product: DEFAULT_PRODUCTS[9],
        quantity: 12,
        unitSelected: "pcs",
        price: 16000,
        total: 192000
      }
    ],
    subtotal: 220000,
    tax: 24200,
    discount: 0,
    total: 244200,
    paymentMethod: "Cash",
    amountPaid: 250000,
    change: 5800,
    status: "Completed",
    notes: "Takeaway order"
  },
  {
    id: "tx-20260610003",
    invoiceNumber: "INV/20260610/0003",
    date: "2026-06-10T14:15:00Z",
    cashierId: "u-2",
    cashierName: "Dewi Sartika (Cashier)",
    role: "staff",
    items: [
      {
        id: "p-3_pcs",
        product: DEFAULT_PRODUCTS[2],
        quantity: 3,
        unitSelected: "pcs",
        price: 38000,
        total: 114000
      },
      {
        id: "p-7_pcs",
        product: DEFAULT_PRODUCTS[6],
        quantity: 2,
        unitSelected: "pcs",
        price: 42000,
        total: 84000
      }
    ],
    subtotal: 198000,
    tax: 21780,
    discount: 10000,
    total: 209780,
    paymentMethod: "Debit",
    amountPaid: 209780,
    change: 0,
    status: "Completed",
    notes: "Debit BCA Swipe"
  }
];

// Reactive states
export const currentUser = ref<User | null>(null);
export const users = ref<User[]>(DEFAULT_USERS);
export const products = ref<Product[]>([]);
export const categories = ref<Category[]>([]);
export const transactions = ref<Transaction[]>([]);
export const activeCart = ref<OrderItem[]>([]);
export const cartDiscount = ref<number>(0);
export const cartTaxRate = ref<number>(0.11);
export const currentView = ref<string>("login");

// Filters
export const searchQuery = ref("");
export const selectedCategory = ref("all");
export const transactionSearchQuery = ref("");
export const transactionDateFilter = ref("all");
export const loginError = ref<string | null>(null);

// Initialize states
export function initializeStore() {
  try {
    const storedUser = localStorage.getItem("kapi_current_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      currentUser.value = u;
      if (u.role === "admin") {
        currentView.value = "dashboard-admin";
      } else if (u.role === "customer") {
        currentView.value = "customer-portal";
      } else {
        currentView.value = "dashboard-user";
      }
    } else {
      currentView.value = "login";
    }
    
    const storedProds = localStorage.getItem("kapi_products");
    if (storedProds) {
      products.value = JSON.parse(storedProds);
    } else {
      products.value = DEFAULT_PRODUCTS;
      localStorage.setItem("kapi_products", JSON.stringify(DEFAULT_PRODUCTS));
    }

    const storedCats = localStorage.getItem("kapi_categories");
    if (storedCats) {
      categories.value = JSON.parse(storedCats);
    } else {
      categories.value = DEFAULT_CATEGORIES;
      localStorage.setItem("kapi_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }

    const storedTxs = localStorage.getItem("kapi_transactions");
    if (storedTxs) {
      transactions.value = JSON.parse(storedTxs);
    } else {
      transactions.value = DEFAULT_TRANSACTIONS;
      localStorage.setItem("kapi_transactions", JSON.stringify(DEFAULT_TRANSACTIONS));
    }
  } catch (e) {
    console.error("Failed to load local storage state for KAPI POS", e);
    products.value = DEFAULT_PRODUCTS;
    categories.value = DEFAULT_CATEGORIES;
    transactions.value = DEFAULT_TRANSACTIONS;
  }
}

// Watchers for persistent storage
watch(products, (newVal) => {
  if (newVal.length > 0) {
    localStorage.setItem("kapi_products", JSON.stringify(newVal));
  }
}, { deep: true });

watch(categories, (newVal) => {
  if (newVal.length > 0) {
    localStorage.setItem("kapi_categories", JSON.stringify(newVal));
  }
}, { deep: true });

watch(transactions, (newVal) => {
  if (newVal.length > 0) {
    localStorage.setItem("kapi_transactions", JSON.stringify(newVal));
  }
}, { deep: true });

// Actions
export const login = (username: string, roleRequested?: UserRole): boolean => {
  loginError.value = null;
  let userFound = users.value.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!userFound && roleRequested) {
    userFound = {
      id: `u-${Date.now()}`,
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1) + " (KAPI Member)",
      role: roleRequested,
      email: `${username}@kapi.com`,
      lastLogin: new Date().toISOString(),
    };
  } else if (!userFound) {
    if (username.toLowerCase() === "admin") {
      userFound = users.value[0];
    } else if (username.toLowerCase() === "staff") {
      userFound = users.value[1];
    } else if (username.toLowerCase() === "customer" || username.toLowerCase() === "konsumen") {
      userFound = {
        id: "u-3",
        username: "customer",
        name: "Pembeli Umum (Konsumen)",
        role: "customer",
        email: "customer@kapi.com",
        lastLogin: new Date().toISOString()
      };
    }
  }

  if (userFound) {
    const updatedUser = {
      ...userFound,
      lastLogin: new Date().toISOString(),
    };
    currentUser.value = updatedUser;
    localStorage.setItem("kapi_current_user", JSON.stringify(updatedUser));
    
    if (updatedUser.role === "admin") {
      currentView.value = "dashboard-admin";
    } else if (updatedUser.role === "customer") {
      currentView.value = "customer-portal";
    } else {
      currentView.value = "dashboard-user";
    }
    return true;
  } else {
    loginError.value = "Invalid credentials. Try entering 'admin', 'staff', or 'customer'.";
    return false;
  }
};

export const logout = () => {
  currentUser.value = null;
  localStorage.removeItem("kapi_current_user");
  activeCart.value = [];
  cartDiscount.value = 0;
  searchQuery.value = "";
  selectedCategory.value = "all";
  currentView.value = "login";
};

export const addProduct = (prodData: Omit<Product, "id">) => {
  const newProduct: Product = {
    ...prodData,
    id: `p-${Date.now()}`,
  };
  products.value = [newProduct, ...products.value];
};

export const updateProduct = (updatedProd: Product) => {
  products.value = products.value.map((p) => (p.id === updatedProd.id ? { ...updatedProd } : p));
  
  activeCart.value = activeCart.value.map((item) => {
    if (item.product.id === updatedProd.id) {
      const isCarton = item.unitSelected === "carton";
      const freshPrice = isCarton
        ? updatedProd.sellingPrice * updatedProd.cartonConversion
        : updatedProd.sellingPrice;
      return {
        ...item,
        product: { ...updatedProd },
        price: freshPrice,
        total: freshPrice * item.quantity,
      };
    }
    return item;
  });
};

export const deleteProduct = (id: string) => {
  products.value = products.value.filter((p) => p.id !== id);
  activeCart.value = activeCart.value.filter((item) => item.product.id !== id);
};

export const addCategory = (catData: Omit<Category, "id">) => {
  const newCategory: Category = {
    ...catData,
    id: `c-${Date.now()}`,
  };
  categories.value = [...categories.value, newCategory];
};

export const updateCategory = (updatedCat: Category) => {
  categories.value = categories.value.map((c) => (c.id === updatedCat.id ? { ...updatedCat } : c));
};

export const deleteCategory = (id: string) => {
  categories.value = categories.value.filter((c) => c.id !== id);
  if (selectedCategory.value === id) {
    selectedCategory.value = "all";
  }
};

export const addToCart = (product: Product, unitSelected: "pcs" | "carton" = "pcs") => {
  const cartItemId = `${product.id}_${unitSelected}`;
  const pricing = unitSelected === "carton" 
    ? product.sellingPrice * product.cartonConversion 
    : product.sellingPrice;

  const existingIndex = activeCart.value.findIndex((item) => item.id === cartItemId);
  if (existingIndex !== -1) {
    const existing = activeCart.value[existingIndex];
    const newQty = existing.quantity + 1;
    const targetPhysicalQuantity = unitSelected === "carton" 
      ? newQty * product.cartonConversion 
      : newQty;

    if (targetPhysicalQuantity > product.stock) {
      return;
    }
    activeCart.value[existingIndex] = {
      ...existing,
      quantity: newQty,
      total: newQty * pricing
    };
  } else {
    const initialPhysicalQuantity = unitSelected === "carton" 
      ? product.cartonConversion 
      : 1;

    if (initialPhysicalQuantity > product.stock) {
      return;
    }

    activeCart.value.push({
      id: cartItemId,
      product,
      quantity: 1,
      unitSelected,
      price: pricing,
      total: pricing
    });
  }
};

export const updateCartQty = (productId: string, quantity: number, unitSelected: "pcs" | "carton" = "pcs") => {
  const cartItemId = `${productId}_${unitSelected}`;
  if (quantity <= 0) {
    removeFromCart(productId, unitSelected);
    return;
  }

  const prod = products.value.find((p) => p.id === productId);
  if (!prod) return;

  const requestedPhysicalUnits = unitSelected === "carton"
    ? quantity * prod.cartonConversion
    : quantity;

  const existingIndex = activeCart.value.findIndex((item) => item.id === cartItemId);
  if (existingIndex === -1) return;

  if (requestedPhysicalUnits > prod.stock) {
    const maxQuantityAllowed = unitSelected === "carton"
      ? Math.floor(prod.stock / prod.cartonConversion)
      : prod.stock;

    if (maxQuantityAllowed <= 0) {
      removeFromCart(productId, unitSelected);
      return;
    }

    const rate = unitSelected === "carton" ? prod.sellingPrice * prod.cartonConversion : prod.sellingPrice;
    activeCart.value[existingIndex] = {
      ...activeCart.value[existingIndex],
      quantity: maxQuantityAllowed,
      total: maxQuantityAllowed * rate
    };
    return;
  }

  const pricing = unitSelected === "carton" ? prod.sellingPrice * prod.cartonConversion : prod.sellingPrice;
  activeCart.value[existingIndex] = {
    ...activeCart.value[existingIndex],
    quantity,
    total: quantity * pricing
  };
};

export const toggleCartUnit = (productId: string) => {
  const pcsItem = activeCart.value.find(i => i.product.id === productId && i.unitSelected === "pcs");
  const cartonItem = activeCart.value.find(i => i.product.id === productId && i.unitSelected === "carton");
  
  if (pcsItem) {
    const prod = pcsItem.product;
    removeFromCart(productId, "pcs");
    addToCart(prod, "carton");
  } else if (cartonItem) {
    const prod = cartonItem.product;
    removeFromCart(productId, "carton");
    addToCart(prod, "pcs");
  }
};

export const removeFromCart = (productId: string, unitSelected: "pcs" | "carton") => {
  const cartItemId = `${productId}_${unitSelected}`;
  activeCart.value = activeCart.value.filter((item) => item.id !== cartItemId);
};

export const updateCartDiscount = (amount: number) => {
  cartDiscount.value = Math.max(0, amount);
};

export const clearCart = () => {
  activeCart.value = [];
  cartDiscount.value = 0;
};

export const checkout = (
  paymentMethod: "Cash" | "Debit" | "QRIS",
  amountPaid: number,
  notes?: string
): { success: boolean; transaction?: Transaction; error?: string } => {
  if (activeCart.value.length === 0) {
    return { success: false, error: "Your shopping cart is empty!" };
  }

  let itemsSubtotal = 0;
  const itemsWithUpdatedRef: OrderItem[] = [];

  for (const item of activeCart.value) {
    const dbProd = products.value.find((p) => p.id === item.product.id);
    if (!dbProd) {
      return { success: false, error: `Product '${item.product.name}' is no longer in inventory.` };
    }

    const reqQtyInPcs = item.unitSelected === "carton" 
      ? item.quantity * dbProd.cartonConversion 
      : item.quantity;

    if (dbProd.stock < reqQtyInPcs) {
      return {
        success: false,
        error: `Insufficient product catalog stock for '${item.product.name}'. Available: ${dbProd.stock}, Requested: ${reqQtyInPcs} ${dbProd.unit}`
      };
    }

    itemsSubtotal += item.total;
    itemsWithUpdatedRef.push({ ...item });
  }

  const calculatedTax = Math.round(itemsSubtotal * cartTaxRate.value);
  const finalTotal = Math.max(0, itemsSubtotal + calculatedTax - cartDiscount.value);

  if (amountPaid < finalTotal && paymentMethod === "Cash") {
    return {
      success: false,
      error: `Insufficient cash amount paid! Net Total: Rp ${finalTotal.toLocaleString()}, Paid: Rp ${amountPaid.toLocaleString()}`
    };
  }

  // Decrement stocks
  products.value = products.value.map((prod) => {
    const matchCartItems = activeCart.value.filter((item) => item.product.id === prod.id);
    if (matchCartItems.length === 0) return prod;

    const totalDeductedPcs = matchCartItems.reduce((acc, item) => {
      return acc + (item.unitSelected === "carton" ? item.quantity * prod.cartonConversion : item.quantity);
    }, 0);

    return {
      ...prod,
      stock: Math.max(0, prod.stock - totalDeductedPcs)
    };
  });

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const dailyTxCount = transactions.value.filter((t) => t.id.includes(todayStr)).length;
  const invNumber = `INV/${todayStr.slice(0, 4)}/${todayStr.slice(4, 6)}/${todayStr.slice(6, 8)}/${String(dailyTxCount + 1).padStart(4, "0")}`;
  const newTxId = `tx-${todayStr}${String(dailyTxCount + 1).padStart(3, "0")}`;

  const newTransaction: Transaction = {
    id: newTxId,
    invoiceNumber: invNumber,
    date: new Date().toISOString(),
    cashierId: currentUser.value?.id || "unknown",
    cashierName: currentUser.value?.name || "System POS Cashier",
    role: currentUser.value?.role || "staff",
    items: itemsWithUpdatedRef,
    subtotal: itemsSubtotal,
    tax: calculatedTax,
    discount: cartDiscount.value,
    total: finalTotal,
    paymentMethod,
    amountPaid: paymentMethod === "Cash" ? amountPaid : finalTotal,
    change: paymentMethod === "Cash" ? Math.max(0, amountPaid - finalTotal) : 0,
    status: "Completed",
    notes: notes || "Successful transaction transaction done."
  };

  transactions.value = [newTransaction, ...transactions.value];
  clearCart();

  return { success: true, transaction: newTransaction };
};

export const voidTransaction = (id: string) => {
  const tx = transactions.value.find((t) => t.id === id);
  if (!tx || tx.status === "Cancelled") return;

  products.value = products.value.map((prod) => {
    const txItemRef = tx.items.filter((item) => item.product.id === prod.id);
    if (txItemRef.length === 0) return prod;

    const totalRestoredPcs = txItemRef.reduce((acc, item) => {
      return acc + (item.unitSelected === "carton" ? item.quantity * prod.cartonConversion : item.quantity);
    }, 0);

    return {
      ...prod,
      stock: prod.stock + totalRestoredPcs
    };
  });

  transactions.value = transactions.value.map((t) => (t.id === id ? { ...t, status: "Cancelled" as const } : t));
};

export const getDashboardStats = () => {
  const completedTxs = transactions.value.filter((t) => t.status === "Completed");

  const totalRevenue = completedTxs.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = completedTxs.length;
  const averageOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  let grossProfit = 0;
  completedTxs.forEach((tx) => {
    tx.items.forEach((item) => {
      const itemQtyInPcs = item.unitSelected === "carton"
        ? item.quantity * item.product.cartonConversion
        : item.quantity;
      const purchasePriceTotal = itemQtyInPcs * item.product.purchasePrice;
      grossProfit += (item.total - purchasePriceTotal);
    });
    grossProfit -= tx.discount;
  });

  const criticalProductAlerts = products.value.filter((p) => p.stock <= p.minStock);
  const lowStockCount = criticalProductAlerts.length;

  const categoryTotals: Record<string, number> = {};
  completedTxs.forEach((tx) => {
    tx.items.forEach((item) => {
      const cat = categories.value.find((c) => c.id === item.product.categoryId);
      const name = cat?.name || "Other";
      categoryTotals[name] = (categoryTotals[name] || 0) + item.total;
    });
  });

  const revenueByCategory = Object.keys(categoryTotals).map((catName) => ({
    categoryName: catName,
    value: categoryTotals[catName],
  }));

  const statuses: Record<string, number> = { Completed: 0, Cancelled: 0, Pending: 0 };
  transactions.value.forEach((t) => {
    statuses[t.status] = (statuses[t.status] || 0) + 1;
  });

  const transactionStatusCount = Object.keys(statuses).map((status) => ({
    status,
    count: statuses[status],
  }));

  return {
    totalRevenue,
    totalTransactions,
    averageOrderValue,
    grossProfit: Math.max(0, grossProfit),
    lowStockCount,
    recentTransactions: transactions.value.slice(0, 10),
    criticalProductAlerts,
    revenueByCategory,
    transactionStatusCount,
  };
};

export const useStore = () => {
  return {
    currentUser,
    users,
    products,
    categories,
    transactions,
    activeCart,
    cartDiscount,
    cartTaxRate,
    currentView,
    searchQuery,
    selectedCategory,
    transactionSearchQuery,
    transactionDateFilter,
    loginError,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addToCart,
    updateCartQty,
    toggleCartUnit,
    removeFromCart,
    updateCartDiscount,
    clearCart,
    checkout,
    voidTransaction,
    getDashboardStats,
  };
};
