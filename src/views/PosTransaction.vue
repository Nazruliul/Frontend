<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Product, Transaction } from "../types";
import { 
  Search, 
  Trash2, 
  Minus, 
  Plus, 
  Tag, 
  CreditCard, 
  DollarSign, 
  QrCode,
  CheckCircle2,
  X,
  AlertCircle,
  Boxes,
  Layers,
  ArrowRight
} from "lucide-vue-next";

const store = useStore();
const products = store.products;
const categories = store.categories;
const activeCart = store.activeCart;
const cartDiscount = store.cartDiscount;
const cartTaxRate = store.cartTaxRate;

// Search/Filters inside POS
const posSearch = ref("");
const posCategory = ref("all");

// Payment calculator modal
const isCheckoutModalOpen = ref(false);
const paymentMethod = ref<"Cash" | "Debit" | "QRIS">("Cash");
const cashGiven = ref("");
const checkoutError = ref<string | null>(null);

// Success summary receipt modal
const latestReceipt = ref<Transaction | null>(null);

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Cart math
const cartSubtotal = computed(() => {
  return activeCart.value.reduce((sum, item) => sum + item.total, 0);
});

const cartTax = computed(() => {
  return Math.round(cartSubtotal.value * cartTaxRate.value);
});

const cartTotal = computed(() => {
  return Math.max(0, cartSubtotal.value + cartTax.value - cartDiscount.value);
});

// Filter products for the catalog tap grid
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(posSearch.value.toLowerCase()) || 
      p.sku.toLowerCase().includes(posSearch.value.toLowerCase()) ||
      (p.barcode && p.barcode.includes(posSearch.value));
    const matchesCat = posCategory.value === "all" || p.categoryId === posCategory.value;
    return matchesSearch && matchesCat;
  });
});

// Calculate change helper
const changeDue = computed(() => {
  return Math.max(0, Number(cashGiven.value) - cartTotal.value);
});

const handleOpenCheckout = () => {
  if (activeCart.value.length === 0) return;
  checkoutError.value = null;
  cashGiven.value = "";
  paymentMethod.value = "Cash";
  isCheckoutModalOpen.value = true;
};

const handleCheckoutFormSubmit = () => {
  checkoutError.value = null;

  const paidNum = paymentMethod.value === "Cash" ? Number(cashGiven.value) : cartTotal.value;

  const res = store.checkout(paymentMethod.value, paidNum, "Direct payment checkout at Cashier POS");
  if (res.success && res.transaction) {
    latestReceipt.value = res.transaction;
    isCheckoutModalOpen.value = false;
  } else {
    checkoutError.value = res.error || "Payment transaction processing failed.";
  }
};

const populateCashFast = (amount: number) => {
  cashGiven.value = String(amount);
};

// Add / updates
const handleAddToCart = (product: Product, unitSelected: "pcs" | "carton" = "pcs") => {
  store.addToCart(product, unitSelected);
};

const handleUpdateCartQty = (productId: string, quantity: number, unitSelected: "pcs" | "carton") => {
  store.updateCartQty(productId, quantity, unitSelected);
};

const handleToggleCartUnit = (productId: string) => {
  store.toggleCartUnit(productId);
};

const handleRemoveFromCart = (productId: string, unitSelected: "pcs" | "carton") => {
  store.removeFromCart(productId, unitSelected);
};

const handleClearCart = () => {
  store.clearCart();
};

const handleUpdateDiscount = (val: number) => {
  store.updateCartDiscount(val);
};
</script>

<template>
  <div id="pos-transaction-view" class="flex h-full overflow-hidden">
    
    <!-- LEFT CONTENT AREA: Fluid items selection grid -->
    <div class="flex-grow flex flex-col h-full bg-[#f8f9fa]">
      
      <!-- Search header & categorization row -->
      <div class="p-6 bg-white border-b border-[#e9ecef] space-y-4 flex-shrink-0 shadow-xs">
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div class="relative w-full sm:w-80">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#adb5bd]">
              <Search class="w-4 h-4" />
            </span>
            <input
              id="pos-search-input"
              type="text"
              placeholder="Scan item barcode or search products..."
              v-model="posSearch"
              class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl pl-10 pr-4 py-3 font-semibold text-[#1a1a1a] placeholder-[#adb5bd] border border-transparent focus:bg-white focus:border-[#1a1a1a]"
            />
          </div>

          <div class="flex space-x-2 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">
            <span>Touch Grid Targets: 80px Limit</span>
          </div>
        </div>

        <!-- Categories Tab scrolling lists -->
        <div class="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
          <button
            @click="posCategory = 'all'"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border border-transparent',
              posCategory === 'all'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f1f3f5] text-[#5c5f60] hover:bg-[#e9ecef]'
            ]"
          >
            All Categories
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="posCategory = cat.id"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border border-transparent',
              posCategory === cat.id
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f1f3f5] text-[#5c5f60] hover:bg-[#e9ecef]'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Product items scrolling list (Adaptive Bento grid with 80px+ height tiles) -->
      <div class="p-6 overflow-y-auto flex-grow animate-fade-in">
        <div v-if="filteredProducts.length === 0" class="h-64 flex flex-col items-center justify-center bg-white border border-[#dee2e6] p-8 text-center rounded-[32px] shadow-xs animate-fade-in">
          <AlertCircle class="w-12 h-12 text-[#9b1c1c]/10 mb-3 animate-spin" />
          <h3 class="font-sans font-bold text-sm text-[#1a1a1a]">No Catalog Item Found</h3>
          <p class="text-xs text-[#868e96] mt-1 max-w-sm">
            Try searching other terms or make sure you have registered items inside the database inventory.
          </p>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            :id="`pos-add-item-btn-${p.id}`"
            :disabled="p.stock <= 0"
            @click="handleAddToCart(p, 'pcs')"
            :class="[
              'bg-white border border-[#e9ecef] rounded-[24px] p-4 text-left transition-all duration-150 flex flex-col justify-between h-[152px] shadow-xs select-none relative group',
              p.stock <= 0
                ? 'opacity-40 cursor-not-allowed bg-[#f1f3f5]'
                : 'hover:border-[#1a1a1a] hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
            ]"
          >
            <div>
              <!-- Product headers -->
              <div class="flex items-start justify-between w-full">
                <span class="text-[9px] font-mono font-bold text-[#868e96] leading-none">
                  {{ p.sku.split("-")[2] || p.sku }}
                </span>
                
                <!-- Interactive Carton-pack shortcut indicator -->
                <span 
                  @click.stop="handleAddToCart(p, 'carton')"
                  class="text-[8px] bg-[#fff9db] text-[#f59f00] font-extrabold border border-[#fff3bf]/40 rounded-full px-2.5 py-1 tracking-wider uppercase opacity-80 hover:opacity-100 transition-opacity cursor-pointer inline-block z-10"
                  title="Buy Box conversion (Box of p.cartonConversion)"
                >
                  + Carton
                </span>
              </div>

              <!-- Item Name -->
              <h4 class="font-sans font-extrabold text-sm text-[#1a1a1a] leading-tight line-clamp-2 mt-2">
                {{ p.name }}
              </h4>
            </div>

            <!-- Footer rates -->
            <div class="flex justify-between items-end border-t border-[#f1f3f5] pt-3 mt-3 w-full">
              <div class="font-mono text-sm text-[#228be6] font-black">
                {{ formatRupiah(p.sellingPrice) }}
              </div>

              <!-- Stock statuses indicator -->
              <div>
                <span v-if="p.stock <= 0" class="text-[8px] bg-[#fff5f5] text-[#fa5252] border border-[#ffe3e3] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">OUT</span>
                <span v-else-if="p.stock <= p.minStock" class="text-[8px] bg-[#fff9db] text-[#f59f00] border border-[#fff3bf] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">LOW: {{ p.stock }}</span>
                <span v-else class="text-[9px] text-[#868e96] font-bold">Qty: {{ p.stock }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDEBAR PANEL: 380px Fixed-width checkout cart -->
    <div 
      id="pos-cart-panel" 
      class="w-[380px] bg-white border-l border-[#e9ecef] flex flex-col justify-between h-full flex-shrink-0"
    >
      
      <!-- Cart Header -->
      <div class="p-5 border-b border-[#e9ecef] bg-[#f8f9fa] flex items-center justify-between flex-shrink-0">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-sm text-[#1a1a1a]">Current Shopping Cart</span>
          <span class="bg-[#1a1a1a] text-white text-[10px] font-sans font-black px-2.5 py-0.5 rounded-full">
            {{ activeCart.reduce((sum, i) => sum + i.quantity, 0) }}
          </span>
        </div>

        <button
          id="clear-cart-btn"
          @click="handleClearCart"
          :disabled="activeCart.length === 0"
          class="text-xs font-bold text-[#fa5252] hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <!-- Scrollable list items stack -->
      <div class="flex-grow overflow-y-auto p-5 space-y-4 bg-white">
        <div v-if="activeCart.length === 0" class="h-full flex flex-col items-center justify-center text-[#868e96] p-6 text-center">
          <Boxes class="w-12 h-12 text-[#dee2e6] mb-3" />
          <p class="text-xs font-bold text-[#1a1a1a]">Awaiting purchases...</p>
          <p class="text-[10px] text-[#adb5bd] mt-1.5 max-w-[200px] leading-relaxed">
            Tap product options on the grid to assemble customers checkout items.
          </p>
        </div>
        
        <div 
          v-else
          v-for="item in activeCart" 
          :key="item.id" 
          :id="`cart-item-${item.id}`"
          class="p-4 bg-white border border-[#e9ecef] hover:border-[#1a1a1a] rounded-[20px] flex flex-col justify-between relative transition-all shadow-xs"
        >
          <!-- Item top headers -->
          <div class="flex justify-between items-start">
            <div class="max-w-[80%]">
              <h5 class="font-sans font-bold text-xs text-[#1a1a1a] leading-tight line-clamp-2">
                {{ item.product.name }}
              </h5>
              
              <!-- Unit Sizing Interactive controller -->
              <button
                @click="handleToggleCartUnit(item.product.id)"
                :class="[
                  'text-[8px] font-black uppercase mt-2 px-2.5 py-1 rounded-full border inline-flex items-center space-x-1 duration-150 active:scale-95 cursor-pointer leading-none',
                  item.unitSelected === 'carton' 
                    ? 'bg-[#fff9db] text-[#f59f00] border-[#fff3bf]' 
                    : 'bg-[#eaf4ff] text-[#228be6] border-[#d0ebff]'
                ]"
                title="Toggles between pieces and boxes"
              >
                <template v-if="item.unitSelected === 'carton'">
                  <Boxes class="w-2.5 h-2.5 mr-1 text-[#f59f00]" />
                  <span>BOX (of {{ item.product.cartonConversion }})</span>
                </template>
                <template v-else>
                  <Layers class="w-2.5 h-2.5 mr-1 text-[#228be6]" />
                  <span>PIECES</span>
                </template>
              </button>
            </div>

            <button
              @click="handleRemoveFromCart(item.product.id, item.unitSelected)"
              class="text-[#adb5bd] hover:text-[#fa5252] cursor-pointer transition-colors"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Quantity adjustment & Subtotal row -->
          <div class="flex justify-between items-center mt-4 pt-3 border-t border-[#f1f3f5] w-full">
            
            <!-- - / + adjustments -->
            <div class="flex items-center space-x-2">
              <button
                :id="`btn-cart-dec-${item.id}`"
                @click="handleUpdateCartQty(item.product.id, item.quantity - 1, item.unitSelected)"
                class="w-8 h-8 bg-[#f1f3f5] hover:bg-[#e9ecef] border-transparent text-[#495057] rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                <Minus class="w-3.5 h-3.5" />
              </button>
              <span class="w-8 text-center font-mono text-sm font-bold text-[#1a1a1a]">
                {{ item.quantity }}
              </span>
              <button
                :id="`btn-cart-inc-${item.id}`"
                @click="handleUpdateCartQty(item.product.id, item.quantity + 1, item.unitSelected)"
                class="w-8 h-8 bg-[#f1f3f5] hover:bg-[#e9ecef] border-transparent text-[#495057] rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Calculated row subtotal -->
            <div class="font-mono text-xs font-bold text-[#1a1a1a]">
              {{ formatRupiah(item.total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Pinned Checkout Accounting calculations Totals -->
      <div class="p-6 bg-[#f8f9fa] border-t border-[#e9ecef] space-y-4 flex-shrink-0 font-sans">
        
        <!-- Subtotal -->
        <div class="flex justify-between items-center text-xs">
          <span class="text-[#868e96] font-bold">Cart Subtotal</span>
          <span class="font-mono font-bold text-[#1a1a1a]">
            {{ formatRupiah(cartSubtotal) }}
          </span>
        </div>

        <!-- Tax line -->
        <div class="flex justify-between items-center text-xs">
          <span class="text-[#868e96] font-bold">Government Tax (11% PB1)</span>
          <span class="font-mono text-[#868e96] font-bold">
            {{ formatRupiah(cartTax) }}
          </span>
        </div>

        <!-- Applied overall discount reduction field -->
        <div class="flex items-center justify-between gap-3 text-xs pt-1 border-b border-[#e9ecef] pb-3">
          <span class="text-[#868e96] font-bold flex-shrink-0">Discount Amount</span>
          
          <div class="flex items-center space-x-1 z-0 relative">
            <span class="absolute left-2.5 text-[#adb5bd]"><Tag class="w-3 h-3" /></span>
            <input
              id="pos-discount-input"
              type="number"
              min="0"
              step="5000"
              placeholder="Rp 0"
              :value="cartDiscount === 0 ? '' : cartDiscount"
              @input="handleUpdateDiscount(Number(($event.target as HTMLInputElement).value))"
              class="w-28 bg-[#f1f3f5] border-transparent text-right font-mono font-black text-[#fa5252] text-xs rounded-xl px-3 py-1.5 focus:bg-white focus:border-[#1a1a1a] outline-none"
            />
          </div>
        </div>

        <!-- Overall Invoice Total -->
        <div class="flex justify-between items-baseline py-1">
          <span class="text-sm font-black text-[#1a1a1a]">Net Due:</span>
          <span class="font-sans font-black text-2xl text-[#228be6]">
            {{ formatRupiah(cartTotal) }}
          </span>
        </div>

        <!-- Solid Black PAY ACTION BUTTON -->
        <button
          id="pos-pay-btn"
          @click="handleOpenCheckout"
          :disabled="activeCart.length === 0"
          class="w-full bg-[#1a1a1a] text-white py-4 px-5 rounded-full font-black text-xs tracking-widest shadow-lg hover:bg-black duration-150 transition-all active:scale-95 uppercase flex items-center justify-center space-x-2 disabled:bg-[#dee2e6] disabled:text-[#adb5bd] disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
        >
          <DollarSign class="w-4 h-4" />
          <span>Process POS Payment</span>
        </button>
      </div>

    </div>

    <!-- COMPONENT MODAL - Payment Calculator -->
    <div v-if="isCheckoutModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
      <div class="bg-white border border-[#e9ecef] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header -->
        <div class="p-5 bg-[#f8f9fa] border-b border-[#e9ecef] flex items-center justify-between">
          <h3 class="font-sans font-bold text-sm text-[#1a1a1a]">
            Select Payment Mode
          </h3>
          <button 
            @click="isCheckoutModalOpen = false"
            class="text-[#868e96] hover:text-[#1a1a1a] cursor-pointer w-7 h-7 rounded-full hover:bg-slate-200/50 flex justify-center items-center"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content Form -->
        <form @submit.prevent="handleCheckoutFormSubmit" class="p-6 space-y-5">
          
          <div v-if="checkoutError" class="bg-[#fff5f5] border border-[#ffe3e3] p-4 text-xs rounded-2xl text-[#fa5252] font-semibold flex items-center mb-4">
            <AlertCircle class="w-4 h-4 mr-2" />
            <span>{{ checkoutError }}</span>
          </div>

          <!-- Total indicator box -->
          <div class="bg-[#fff9db]/40 border border-[#fff3bf]/40 p-4 rounded-2xl text-center">
            <span class="text-[10px] tracking-widest uppercase font-bold text-[#868e96] block">
              Amount Due
            </span>
            <div class="font-sans font-black text-2xl text-[#228be6] mt-1">
              {{ formatRupiah(cartTotal) }}
            </div>
          </div>

          <!-- Selector buttons -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-3">
              Payment Gateway Method
            </label>
            <div class="grid grid-cols-3 gap-3">
              
              <!-- Cash -->
              <button
                type="button"
                @click="paymentMethod = 'Cash'"
                :class="[
                  'p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer',
                  paymentMethod === 'Cash'
                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm'
                    : 'border-[#e9ecef] text-[#495057] hover:bg-[#f8f9fa]'
                ]"
              >
                <DollarSign class="w-5 h-5" />
                <span class="text-[9px] tracking-widest font-black uppercase">CASH</span>
              </button>

              <!-- QRIS -->
              <button
                type="button"
                @click="paymentMethod = 'QRIS'"
                :class="[
                  'p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer',
                  paymentMethod === 'QRIS'
                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm'
                    : 'border-[#e9ecef] text-[#495057] hover:bg-[#f8f9fa]'
                ]"
              >
                <QrCode class="w-5 h-5" />
                <span class="text-[9px] tracking-widest font-black uppercase">QRIS</span>
              </button>

              <!-- Debit card -->
              <button
                type="button"
                @click="paymentMethod = 'Debit'"
                :class="[
                  'p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer',
                  paymentMethod === 'Debit'
                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm'
                    : 'border-[#e9ecef] text-[#495057] hover:bg-[#f8f9fa]'
                ]"
              >
                <CreditCard class="w-5 h-5" />
                <span class="text-[9px] tracking-widest font-black uppercase">DEBIT</span>
              </button>

            </div>
          </div>

          <!-- Cash given inputs conditional -->
          <div v-if="paymentMethod === 'Cash'" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-2">
                Cash Amount Received (Rp) *
              </label>
              <input
                id="pos-cash-received-input"
                required
                type="number"
                placeholder="e.g. 100000"
                :min="cartTotal"
                v-model="cashGiven"
                class="w-full bg-[#f1f3f5] border-transparent rounded-2xl px-4 py-3 text-base text-center font-mono font-black text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a] outline-none"
              />
            </div>

            <!-- Fast denomination assistance -->
            <div class="flex flex-wrap gap-2 items-center justify-center">
              <template v-for="num in [cartTotal, 10000, 20000, 50000, 100000]">
                <button
                  v-if="(num === cartTotal ? Math.ceil(cartTotal / 1000) * 1000 : num) >= cartTotal"
                  :key="num"
                  type="button"
                  @click="populateCashFast(num === cartTotal ? Math.ceil(cartTotal / 1000) * 1000 : num)"
                  class="bg-[#f1f3f5] hover:bg-[#e9ecef] border-transparent text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg text-[#495057] transition-all cursor-pointer"
                >
                  {{ formatRupiah(num === cartTotal ? Math.ceil(cartTotal / 1000) * 1000 : num) }}
                </button>
              </template>
            </div>

            <!-- Cash Change Due indicator -->
            <div class="bg-[#ebfbee] border border-[#d3f9d8] p-4 rounded-2xl flex justify-between items-center text-left">
              <span class="text-xs font-bold text-[#2b8a3e]">Cash Change Due:</span>
              <span class="font-mono text-base font-black text-[#2b8a3e]">
                {{ formatRupiah(changeDue) }}
              </span>
            </div>
          </div>

          <div v-else-if="paymentMethod === 'QRIS'" class="p-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-3xl text-center gap-3 flex flex-col items-center">
            <!-- High fidelity QR mock scan -->
            <div class="w-36 h-36 bg-white p-3 border border-[#dee2e6] flex items-center justify-center rounded-2xl shadow-xs relative">
              <div class="w-32 h-32 bg-[#1a1a1a] opacity-90 flex flex-wrap gap-1 p-1">
                <!-- Fake stylized QR array dots -->
                <div 
                  v-for="(_, i) in 49"
                  :key="i"
                  :class="[
                    'w-[14px] h-[14px] rounded-xs',
                    (i % 3 === 0 || i % 7 === 0 || i < 8 || i > 40) ? 'bg-[#1a1a1a]' : 'bg-white'
                  ]" 
                />
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="bg-white px-2 py-1 text-[8px] font-black tracking-wider text-[#1a1a1a] border border-[#1a1a1a] uppercase shadow-sm">
                  KAPI QR
                </span>
              </div>
            </div>
            <span class="text-[10px] text-[#868e96] font-bold max-w-[240px] leading-relaxed">
              Present this dynamic QRIS barcode to the customer. Scan to approve.
            </span>
          </div>

          <div v-else class="p-5 bg-[#f8f9fa] border border-[#e9ecef] rounded-3xl text-center">
            <CreditCard class="w-10 h-10 text-[#868e96] mx-auto mb-2" />
            <span class="text-xs text-[#1a1a1a] font-bold block">
              Please prompt customer swipe or dip chip card into EDC terminal reader.
            </span>
            <span class="text-[10px] text-[#adb5bd] block mt-1.5 leading-relaxed">
              Awaiting EDC terminal authentication response loop...
            </span>
          </div>

          <!-- Checkout modal actions -->
          <div class="pt-5 border-t border-[#e9ecef] flex items-center justify-end space-x-3">
            <button
              type="button"
              @click="isCheckoutModalOpen = false"
              class="bg-white border border-[#dee2e6] text-xs font-bold px-5 py-3 rounded-full text-[#495057] hover:bg-[#f8f9fa] cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              class="bg-[#1a1a1a] text-white text-xs font-black px-6 py-3 rounded-full hover:bg-black cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
            >
              Approve & Print Receipt
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- COMPONENT MODAL - PRINT RECEIPT SUCCESS PANEL -->
    <div v-if="latestReceipt" class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white border border-[#e9ecef] w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Header Success info -->
        <div class="p-6 bg-[#2b8a3e] text-white text-center">
          <CheckCircle2 class="w-10 h-10 mx-auto mb-2 text-white animate-bounce" />
          <h3 class="font-sans font-bold text-md uppercase tracking-wider">
            Payment Completed!
          </h3>
          <p class="text-xs opacity-90 mt-1">
            The transaction has been safely logged in store history.
          </p>
        </div>

        <!-- Printable Mock paper receipt container. Highly professional wireframe style -->
        <div class="p-6 bg-white font-mono text-xs text-[#1a1a1a] border-b border-[#e9ecef] max-h-[350px] overflow-y-auto text-left">
          <!-- Receipt logo -->
          <div class="text-center space-y-1 mb-4">
            <h4 class="font-bold text-sm tracking-wide">KAPI COFFEE & KITCHEN</h4>
            <p class="text-[10px] text-[#868e96]">Kapi Retail Hub, Bandung, West Java</p>
            <p class="text-[10px] text-[#868e96]">Telp: 0812-3456-7890</p>
          </div>

          <div class="border-b border-dashed border-[#e9ecef] pb-2 mb-2 space-y-1 text-[10px] text-[#868e96]">
            <div class="flex justify-between">
              <span>Receipt ID:</span>
              <span class="font-bold text-[#1a1a1a]">{{ latestReceipt.invoiceNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span>Cashier Account:</span>
              <span>{{ latestReceipt.cashierName }}</span>
            </div>
            <div class="flex justify-between">
              <span>Order Time:</span>
              <span>{{ new Date(latestReceipt.date).toLocaleString("id-ID") }}</span>
            </div>
          </div>

          <!-- Items row -->
          <div class="border-b border-dashed border-[#e9ecef] pb-2 mb-2 space-y-2">
            <div v-for="(item, index) in latestReceipt.items" :key="index" class="space-y-0.5">
              <div class="flex justify-between font-bold text-[#1a1a1a]">
                <span>{{ item.product.name }}</span>
                <span>{{ formatRupiah(item.total) }}</span>
              </div>
              <div class="flex justify-between text-[10px] text-[#868e96]">
                <span>
                  {{ item.quantity }} x {{ formatRupiah(item.price) }} ({{ item.unitSelected === 'carton' ? `${item.product.cartonConversion} pcs Box` : "Pcs Loose" }})
                </span>
              </div>
            </div>
          </div>

          <!-- Math totals breakdown -->
          <div class="space-y-1 text-right border-b border-dashed border-[#e9ecef] pb-2 mb-2">
            <div class="flex justify-between">
              <span class="text-[#868e96]">Subtotal:</span>
              <span>{{ formatRupiah(latestReceipt.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#868e96]">VAT (11% PB1):</span>
              <span>{{ formatRupiah(latestReceipt.tax) }}</span>
            </div>
            <div v-if="latestReceipt.discount > 0" class="flex justify-between text-[#fa5252] font-bold">
              <span>Discount Coupon:</span>
              <span>-{{ formatRupiah(latestReceipt.discount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-[#228be6] pt-1">
              <span>Invoice Grand Total:</span>
              <span>{{ formatRupiah(latestReceipt.total) }}</span>
            </div>
          </div>

          <!-- Method and Change calculator details -->
          <div class="space-y-1 text-[10px] text-[#868e96]">
            <div class="flex justify-between">
              <span>Payment Gateway Path:</span>
              <span class="font-bold text-[#1a1a1a]">{{ latestReceipt.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span>Guest Handed Cash:</span>
              <span>{{ formatRupiah(latestReceipt.amountPaid) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Change Dispensed:</span>
              <span class="font-bold text-[#1a1a1a]">{{ formatRupiah(latestReceipt.change) }}</span>
            </div>
          </div>

          <div class="text-center pt-5 text-[9px] text-[#868e96] space-y-0.5">
            <p>--- Thank You for Dining with KAPI ---</p>
            <p>Reprint or check log details inside Transaction History.</p>
          </div>

        </div>

        <!-- Receipt Modal actions -->
        <div class="p-5 bg-[#f8f9fa] border-t border-[#e9ecef] flex">
          <button
            id="btn-pos-new-sale"
            @click="latestReceipt = null"
            class="w-full bg-[#1a1a1a] text-white font-bold text-xs py-4 rounded-full hover:bg-black transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer border border-transparent"
          >
            <span>Initiate New Sale</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
