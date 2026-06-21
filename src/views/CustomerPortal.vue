<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Product } from "../types";
import { 
  Search, 
  ShoppingBag, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Coffee, 
  Sparkles,
  Info,
  Utensils
} from "lucide-vue-next";

const store = useStore();
const products = store.products;
const categories = store.categories;
const activeCart = store.activeCart;
const cartDiscount = store.cartDiscount;
const cartTaxRate = store.cartTaxRate;

// Component states
const catSearch = ref("");
const selectedSubCat = ref("all");
const tableNumber = ref("Table 5");
const paymentMethod = ref<"Cash" | "Debit" | "QRIS">("QRIS");
const dineInOption = ref<"dine-in" | "takeaway">("dine-in");
const customerName = ref("");
const isCheckingOut = ref(false);
const errorMsg = ref<string | null>(null);

// Receipt modal state
const receiptTx = ref<any | null>(null);

// Helper
const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Filter products based on search query and category
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(catSearch.value.toLowerCase()) ||
      p.sku.toLowerCase().includes(catSearch.value.toLowerCase()) ||
      (p.barcode && p.barcode.includes(catSearch.value));
    const matchesCat = selectedSubCat.value === "all" || p.categoryId === selectedSubCat.value;
    return matchesSearch && matchesCat;
  });
});

// Calculate cart summary
const subtotal = computed(() => {
  return activeCart.value.reduce((acc, item) => acc + item.total, 0);
});

const tax = computed(() => {
  return Math.round(subtotal.value * cartTaxRate.value);
});

const netTotal = computed(() => {
  return Math.max(0, subtotal.value + tax.value - cartDiscount.value);
});

// Calculate the item quantity in cart per product ID
const getProductCartCount = (prodId: string) => {
  const pcsItem = activeCart.value.find(item => item.product.id === prodId && item.unitSelected === "pcs");
  const cartonItem = activeCart.value.find(item => item.product.id === prodId && item.unitSelected === "carton");
  
  const p = products.value.find(prod => prod.id === prodId);
  const conv = p ? p.cartonConversion : 12;

  let totalNum = 0;
  if (pcsItem) totalNum += pcsItem.quantity;
  if (cartonItem) totalNum += cartonItem.quantity * conv;

  return totalNum;
};

// Actions
const handleAddToCart = (product: Product) => {
  store.addToCart(product, "pcs");
};

const handleUpdateQty = (productId: string, quantity: number, unitSelected: "pcs" | "carton") => {
  store.updateCartQty(productId, quantity, unitSelected);
};

const handleRemove = (productId: string, unitSelected: "pcs" | "carton") => {
  store.removeFromCart(productId, unitSelected);
};

const handleToggleUnit = (productId: string) => {
  store.toggleCartUnit(productId);
};

const handlePlaceOrder = () => {
  if (activeCart.value.length === 0) {
    errorMsg.value = "Tray keranjang belanja Anda masih kosong!";
    return;
  }
  errorMsg.value = null;
  isCheckingOut.value = true;

  setTimeout(() => {
    const notesStr = `${dineInOption.value === "dine-in" ? `Dine-in: ${tableNumber.value}` : "Takeaway"} • Nama: ${customerName.value || "Pelanggan Umum"}`;
    const res = store.checkout(paymentMethod.value, netTotal.value, notesStr);

    isCheckingOut.value = false;
    if (res.success && res.transaction) {
      receiptTx.value = res.transaction;
    } else {
      errorMsg.value = res.error || "Gagal memproses pesanan. Silakan periksa kembali.";
    }
  }, 750);
};

const handleStartNewOrder = () => {
  receiptTx.value = null;
  customerName.value = "";
};
</script>

<template>
  <div id="customer-portal-view" class="flex flex-col lg:flex-row h-full overflow-hidden bg-[#f8f9fa]">
    
    <!-- 1. Left Catalog Area (grows) -->
    <div class="flex-grow flex flex-col h-full overflow-hidden p-6 lg:p-8 space-y-6">
      
      <!-- Banner Welcome -->
      <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2c2c2c] p-6 lg:p-8 rounded-[32px] text-white relative overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div class="relative z-10 space-y-1">
          <div class="flex items-center space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <Sparkles class="w-3.5 h-3.5 text-yellow-300" />
            <span>Self-Service Kiosk</span>
          </div>
          <h2 class="font-sans font-black text-2xl tracking-tight">
            Selamat Datang di KAPI Coffee
          </h2>
          <p class="text-xs text-slate-300 font-medium">
            Pilih menu lezat kami, isi nampan, dan buat pesanan instan dari meja Anda!
          </p>
        </div>

        <div class="relative z-10 flex flex-wrap gap-2.5">
          <!-- Dine-In Switchers -->
          <button
            @click="dineInOption = 'dine-in'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer',
              dineInOption === 'dine-in' 
                ? 'bg-white text-[#1a1a1a] shadow-xs' 
                : 'bg-white/10 text-white hover:bg-white/20'
            ]"
          >
            <Utensils class="w-3.5 h-3.5" />
            <span>Makan di Sini</span>
          </button>
          <button
            @click="dineInOption = 'takeaway'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer',
              dineInOption === 'takeaway' 
                ? 'bg-white text-[#1a1a1a] shadow-xs' 
                : 'bg-white/10 text-white hover:bg-white/20'
            ]"
          >
            <ShoppingBag class="w-3.5 h-3.5" />
            <span>Bawa Pulang</span>
          </button>
        </div>
      </div>

      <!-- Filters and Search toolbar -->
      <div class="bg-white p-4 lg:p-5 border border-[#e9ecef] rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <!-- Search bar -->
        <div class="relative w-full md:w-80">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#adb5bd]">
            <Search class="w-4 h-4" />
          </span>
          <input
            id="customer-catalog-search"
            type="text"
            placeholder="Cari kopi, pastry, snack..."
            v-model="catSearch"
            class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-xl pl-9 pr-4 py-3 placeholder-[#adb5bd] text-[#1a1a1a] font-bold focus:bg-white focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-all"
          />
        </div>

        <!-- Sub-categories Selector inside filter container -->
        <div class="flex bg-[#f1f3f5] p-1.5 rounded-xl border border-[#e9ecef] overflow-x-auto max-w-full gap-1">
          <button
            @click="selectedSubCat = 'all'"
            :class="[
              'px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex-shrink-0',
              selectedSubCat === 'all'
                ? 'bg-white text-[#1a1a1a] shadow-xs'
                : 'text-[#868e96] hover:text-[#1a1a1a]'
            ]"
          >
            Semua Menu
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedSubCat = cat.id"
            :class="[
              'px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex-shrink-0',
              selectedSubCat === cat.id
                ? 'bg-white text-[#1a1a1a] shadow-xs'
                : 'text-[#868e96] hover:text-[#1a1a1a]'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Product Items scrolling viewport -->
      <div class="flex-grow overflow-y-auto pr-1">
        <div v-if="filteredProducts.length === 0" class="col-span-full py-16 text-center text-[#868e96] bg-white border border-[#e9ecef] rounded-3xl font-bold text-xs">
          Tidak ada menu yang sesuai dengan kata pencarian Anda.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 animate-fade-in">
          <div
            v-for="p in filteredProducts"
            :key="p.id"
            class="bg-white border border-[#e9ecef] hover:border-[#1a1a1a] transition-all rounded-[24px] flex flex-col justify-between overflow-hidden relative group shadow-xs"
          >
            <!-- Visual image placeholder area -->
            <div class="h-32 bg-[#f8f9fa] flex items-center justify-center border-b border-[#e9ecef] relative">
              <Coffee class="w-12 h-12 text-[#adb5bd]/30 transition-transform group-hover:scale-110 duration-200" />
              
              <!-- Left Badge -->
              <span class="absolute top-3 left-3 text-[8px] font-black tracking-widest uppercase bg-white text-[#1a1a1a] px-2.5 py-1 rounded-lg border border-[#e9ecef] shadow-xs">
                {{ categories.find((c) => c.id === p.categoryId)?.name || 'Drink Product' }}
              </span>

              <!-- Stock badge -->
              <span :class="[
                'absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border',
                p.stock <= 0
                  ? 'bg-red-50 text-red-500 border-red-100'
                  : p.stock <= p.minStock 
                  ? 'bg-[#fff0f0] text-[#fa5252] border-[#ffe3e3]' 
                  : 'bg-[#ebfbee] text-[#2b8a3e] border-[#d3f9d8]'
              ]">
                {{ p.stock <= 0 ? "Habis" : `Stok: ${p.stock}` }}
              </span>

              <!-- Cart indicator badge -->
              <div v-if="getProductCartCount(p.id) > 0" class="absolute -bottom-2 right-4 bg-[#228be6] text-white text-[10px] font-black rounded-lg px-2.5 py-1 shadow-sm border border-white">
                Pilihan: {{ getProductCartCount(p.id) }} pcs
              </div>
            </div>

            <!-- Listing text -->
            <div class="p-4 flex-grow flex flex-col justify-between">
              <div class="space-y-1">
                <span class="text-[9px] font-mono font-bold text-[#adb5bd] tracking-wide block uppercase">SKU {{ p.sku }}</span>
                <h4 class="font-sans font-extrabold text-[#1a1a1a] text-xs line-clamp-1 mt-1 tracking-tight">
                  {{ p.name }}
                </h4>
                <p v-if="p.description" class="text-[11px] text-[#868e96] line-clamp-2 leading-snug font-medium">
                  {{ p.description }}
                </p>
              </div>

              <!-- Pricing block -->
              <div class="mt-4 pt-3.5 border-t border-[#f1f3f5] flex flex-col justify-end">
                <div class="flex justify-between items-baseline mb-3">
                  <span class="text-[9px] font-bold text-[#868e96] uppercase tracking-widest font-sans">Harga Satuan</span>
                  <span class="font-mono text-sm font-black text-[#2a2a2a]">
                    {{ formatRupiah(p.sellingPrice) }}
                  </span>
                </div>

                <!-- Order button -->
                <button
                  :disabled="p.stock <= 0"
                  @click="handleAddToCart(p)"
                  :class="[
                    'w-full text-xs font-bold py-2.5 border rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95',
                    p.stock <= 0
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-[#1a1a1a] text-white hover:bg-black border-[#1a1a1a] shadow-xs'
                  ]"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>{{ p.stock <= 0 ? "Habis" : "Tambah ke Nampan" }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Right Cart Kiosk Panel -->
    <div class="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-[#e9ecef] flex flex-col h-full overflow-hidden flex-shrink-0">
      
      <!-- Cart Header -->
      <div class="p-5 border-b border-[#e9ecef] flex items-center justify-between bg-white text-[#1a1a1a]">
        <div class="flex items-center space-x-2.5">
          <div class="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e9ecef]">
            <ShoppingCart class="w-5 h-5 text-[#1a1a1a]" />
          </div>
          <div>
            <h3 class="font-sans font-black text-sm tracking-tight text-[#1a1a1a]">
              Nampan Belanja Anda
            </h3>
            <p class="text-[10px] text-[#868e96] font-bold uppercase tracking-wider">
              {{ activeCart.length }} Jenis Menu Terpilih
            </p>
          </div>
        </div>
        <span class="text-xs bg-[#f1f3f5] text-[#1a1a1a] font-extrabold px-3 py-1 rounded-xl border border-[#e9ecef]">
          {{ dineInOption === "dine-in" ? tableNumber : "Takeaway" }}
        </span>
      </div>

      <!-- Customer Custom Settings (name block) -->
      <div class="p-4 border-b border-[#e9ecef] bg-[#f8f9fa] space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[8px] font-black uppercase tracking-wider text-[#868e96] mb-1">
              Atas Nama (Opsional)
            </label>
            <input
              type="text"
              placeholder="Rian, Bella, dsb..."
              v-model="customerName"
              class="w-full bg-white border border-[#dee2e6] rounded-lg px-2.5 py-1.5 text-xs outline-none text-[#1a1a1a] font-bold placeholder-[#adb5bd] focus:border-[#1a1a1a] transition-all"
            />
          </div>

          <div>
            <label class="block text-[8px] font-black uppercase tracking-wider text-[#868e96] mb-1">
              {{ dineInOption === "dine-in" ? "Nomor Meja" : "Pesanan" }}
            </label>
            <select
              v-if="dineInOption === 'dine-in'"
              v-model="tableNumber"
              class="w-full bg-white border border-[#dee2e6] rounded-lg px-2.5 py-1.5 text-xs outline-none text-[#1a1a1a] font-bold cursor-pointer focus:border-[#1a1a1a]"
            >
              <option v-for="i in 15" :key="i" :value="`Table ${i}`">Table {{ i }}</option>
            </select>
            <div v-else class="bg-[#e9ecef] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#495057] text-center border border-[#dee2e6]">
              Takeaway Box
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Items Scroll View -->
      <div class="flex-grow overflow-y-auto p-4 space-y-3.5 bg-[#fcfdfe]">
        <div v-if="activeCart.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 text-[#adb5bd] space-y-3">
          <ShoppingBag class="w-12 h-12 stroke-[1.5] text-[#adb5bd]/40" />
          <div class="space-y-1">
            <p class="text-xs font-black text-[#868e96]">Nampan Anda kosong</p>
            <p class="text-[11px] text-slate-400 font-medium">Buka menu di sebelah kiri untuk memilih sajian terbaik kami.</p>
          </div>
        </div>
        
        <div
          v-else
          v-for="item in activeCart"
          :key="item.id"
          class="bg-white border border-[#e9ecef] hover:border-[#dee2e6] p-3 rounded-2xl flex flex-col justify-between transition-all shadow-2xs"
        >
          <div class="flex justify-between items-start space-x-2">
            <div class="min-w-0">
              <span class="text-[8px] font-mono font-bold text-[#adb5bd] tracking-wide block uppercase">SKU {{ item.product.sku }}</span>
              <h4 class="font-sans font-black text-xs text-[#1a1a1a] truncate mt-0.5">
                {{ item.product.name }}
              </h4>
              <div class="flex items-center space-x-2 mt-1">
                <span class="font-mono text-[10px] font-extrabold text-[#228be6]">
                  {{ formatRupiah(item.price) }}
                </span>
                <span class="text-[9px] text-[#868e96] font-semibold">
                  x {{ item.quantity }} {{ item.unitSelected === "carton" ? `Box (${item.product.cartonConversion} pcs)` : "pcs" }}
                </span>
              </div>
            </div>

            <!-- Trash Delete button -->
            <button
              @click="handleRemove(item.product.id, item.unitSelected)"
              class="text-[#adb5bd] hover:text-[#fa5252] p-1 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Qty action modifiers and bulk units bundle -->
          <div class="mt-3 pt-2.5 border-t border-[#f8f9fa] flex items-center justify-between">
            <!-- Unit toggle toggle button -->
            <button
              @click="handleToggleUnit(item.product.id)"
              :class="[
                'text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-md border transition-all cursor-pointer',
                item.unitSelected === 'carton'
                  ? 'bg-[#fff4e6] text-[#f76707] border-[#ffe8cc]'
                  : 'bg-[#f1f3f5] text-[#495057] border-[#dee2e6]'
              ]"
            >
              Mode: {{ item.unitSelected === 'carton' ? `Grosir (${item.product.cartonConversion} pcs)` : "Satuan / Pcs" }}
            </button>

            <!-- Quantity Adjustment Buttons -->
            <div class="flex items-center space-x-1.5 bg-[#f1f3f5] p-1 rounded-lg">
              <button
                @click="handleUpdateQty(item.product.id, item.quantity - 1, item.unitSelected)"
                class="w-5 h-5 rounded-md bg-white hover:bg-[#e9ecef] flex items-center justify-center text-[#495057] font-semibold text-xs cursor-pointer"
              >
                <Minus class="w-2.5 h-2.5" />
              </button>
              <span class="font-mono text-xs font-extrabold px-1.5 text-[#1a1a1a] min-w-[12px] text-center">
                {{ item.quantity }}
              </span>
              <button
                @click="handleUpdateQty(item.product.id, item.quantity + 1, item.unitSelected)"
                class="w-5 h-5 rounded-md bg-white hover:bg-[#e9ecef] flex items-center justify-center text-[#495057] font-semibold text-xs cursor-pointer"
              >
                <Plus class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Payment Block -->
      <div class="p-4 border-t border-[#e9ecef] bg-white space-y-4">
        
        <!-- Payment Method Selector -->
        <div>
          <label class="block text-[8px] font-black uppercase tracking-wider text-[#868e96] mb-1.5 font-sans">
            Metode Pembayaran Mandiri
          </label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="method in (['QRIS', 'Debit', 'Cash'] as const)"
              :key="method"
              @click="paymentMethod = method"
              :class="[
                'py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center block',
                paymentMethod === method 
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-2xs font-extrabold' 
                  : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
              ]"
            >
              <span v-if="method === 'QRIS'">⚡️ </span> {{ method }}
            </button>
          </div>
        </div>

        <!-- Pricing detailed list breakdown -->
        <div class="space-y-1.5 p-3.5 bg-[#f8f9fa] rounded-2xl border border-[#e9ecef]">
          <div class="flex justify-between items-center text-[10px] font-medium text-[#868e96]">
            <span>Subtotal Item</span>
            <span class="font-mono text-slate-800 font-semibold">{{ formatRupiah(subtotal) }}</span>
          </div>
          
          <div class="flex justify-between items-center text-[10px] font-medium text-[#868e96]">
            <span>Pajak Resto (11% PB1)</span>
            <span class="font-mono text-slate-800 font-semibold">{{ formatRupiah(tax) }}</span>
          </div>

          <div v-if="cartDiscount > 0" class="flex justify-between items-center text-[10px] font-bold text-emerald-600">
            <span>Diskon Promo</span>
            <span class="font-mono">-{{ formatRupiah(cartDiscount) }}</span>
          </div>

          <div class="border-t border-[#e9ecef] pt-1.5 mt-1 flex justify-between items-center text-[#1a1a1a]">
            <span class="text-[10px] font-black uppercase tracking-wider font-sans">Total Bayar</span>
            <span class="font-mono text-sm font-black text-[#228be6]">
              {{ formatRupiah(netTotal) }}
            </span>
          </div>
        </div>

        <!-- Alert Error Box -->
        <div v-if="errorMsg" class="bg-[#fff0f0] border border-[#ffe3e3] p-3 rounded-xl text-[10px] text-[#fa5252] font-semibold flex items-center space-x-2">
          <Info class="w-3.5 h-3.5 flex-shrink-0" />
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Action Trigger places the order -->
        <button
          :disabled="activeCart.length === 0 || isCheckingOut"
          @click="handlePlaceOrder"
          class="w-full bg-[#1a1a1a] hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed hover:shadow-md transition-all text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center space-x-2 uppercase tracking-widest cursor-pointer"
        >
          <span>{{ isCheckingOut ? "Memproses..." : "Bayar & Ambil Struk Sekarang" }}</span>
        </button>
      </div>
    </div>

    <!-- 3. RECEIPT DIALOG MODAL TICKETS BOX -->
    <div v-if="receiptTx" class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white border border-[#e9ecef] w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-scale-up">
        
        <!-- Upper Checkmark -->
        <div class="p-6 text-center bg-emerald-50 border-b border-emerald-100 flex flex-col items-center">
          <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-md shadow-emerald-500/20">
            <CheckCircle class="w-7 h-7" />
          </div>
          <h3 class="font-sans font-black text-lg text-emerald-800">
            Pembayaran Berhasil!
          </h3>
          <p class="text-xs text-emerald-600 font-medium mt-1">
            Selesai • Silakan ambil struk kasir Anda di bawah ini
          </p>
        </div>

        <!-- Digital thermal receipt paper body -->
        <div class="p-6 space-y-4 max-h-[350px] overflow-y-auto">
          <div class="border bg-slate-50 border-[#dee2e6] border-dashed p-4 rounded-xl space-y-3 font-mono text-center">
            <span class="text-[10px] text-slate-400 tracking-widest">--- STRUK DIGITAL KASIR ---</span>
            
            <div class="space-y-0.5 text-xs text-slate-800">
              <p class="font-extrabold text-slate-900">KAPI Coffee & Kitchen</p>
              <p class="text-[9px] text-slate-500">KBY BARU, JAKARTA SELATAN</p>
              <p class="text-[9px] text-slate-500">{{ new Date(receiptTx.date).toLocaleString("id-ID") }}</p>
            </div>

            <div class="border-t border-[#dee2e6] border-dashed pt-2 text-[10px] text-left text-slate-600 space-y-1">
              <div class="flex justify-between">
                <span>Invoice:</span>
                <span class="font-bold text-slate-900">{{ receiptTx.invoiceNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span>Layanan:</span>
                <span class="font-bold text-slate-900">{{ dineInOption === "dine-in" ? "Dine-In" : "Takeaway" }}</span>
              </div>
              <div v-if="dineInOption === 'dine-in'" class="flex justify-between">
                <span>Meja:</span>
                <span class="font-bold text-slate-900">{{ tableNumber }}</span>
              </div>
              <div v-if="customerName" class="flex justify-between">
                <span>Pelanggan:</span>
                <span class="font-bold text-slate-900">{{ customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span>Kasir:</span>
                <span class="font-bold text-slate-900">Self Order Kiosk</span>
              </div>
            </div>

            <!-- Items Listing -->
            <div class="border-t border-[#dee2e6] border-dashed pt-2 text-left text-[10px] text-slate-700 space-y-1">
              <div v-for="(item, idx) in receiptTx.items" :key="idx" class="flex justify-between">
                <span class="truncate pr-1">
                  {{ item.quantity }}x {{ item.product.name }} {{ item.unitSelected === "carton" ? "(Box)" : "" }}
                </span>
                <span class="font-semibold text-slate-900 shrink-0">
                  {{ formatRupiah(item.total) }}
                </span>
              </div>
            </div>

            <!-- Totals listing -->
            <div class="border-t border-[#dee2e6] border-dashed pt-2 text-left text-[10px] text-slate-700 space-y-1">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{{ formatRupiah(receiptTx.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Resto Tax 11%:</span>
                <span>{{ formatRupiah(receiptTx.tax) }}</span>
              </div>
              <div v-if="receiptTx.discount > 0" class="flex justify-between text-emerald-600 font-bold">
                <span>Discount Promo:</span>
                <span>-{{ formatRupiah(receiptTx.discount) }}</span>
              </div>
              <div class="flex justify-between text-slate-900 font-extrabold text-xs border-t border-slate-300 pt-1.5 mt-0.5">
                <span>Total Net:</span>
                <span>{{ formatRupiah(receiptTx.total) }}</span>
              </div>
              <div class="flex justify-between text-[#228be6] text-[9px] font-bold">
                <span>Metode Bayar:</span>
                <span>⭐ {{ receiptTx.paymentMethod }}</span>
              </div>
            </div>

            <div class="pt-2 text-[9px] text-slate-400 font-bold tracking-wider">
              TERIMA KASIH ATAS KUNJUNGAN ANDA
            </div>
          </div>
        </div>

        <!-- Action close button -->
        <div class="p-5 bg-[#f8f9fa] border-t border-[#e9ecef] flex">
          <button
            @click="handleStartNewOrder"
            class="w-full bg-[#1a1a1a] hover:bg-black text-white font-extrabold text-xs py-3.5 rounded-full transition-all active:scale-95 uppercase tracking-wider cursor-pointer text-center shadow-xs"
          >
            Pesan Menu Lainnya / Reset
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
