<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { computed } from "vue";
import { useStore } from "../store";
import { 
  ShoppingCart, 
  ShoppingBag, 
  History, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  HelpCircle
} from "lucide-vue-next";

const store = useStore();
const currentUser = store.currentUser;

// Filter transactions checked out by this specific logged-in cashier
const myTransactions = computed(() => {
  if (!currentUser.value) return [];
  return store.transactions.value.filter(
    (tx) => tx.cashierId === currentUser.value?.id && tx.status === "Completed"
  );
});

const myVoidedTransactions = computed(() => {
  if (!currentUser.value) return [];
  return store.transactions.value.filter(
    (tx) => tx.cashierId === currentUser.value?.id && tx.status === "Cancelled"
  );
});

const totalMySales = computed(() => {
  return myTransactions.value.reduce((sum, tx) => sum + tx.total, 0);
});

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

const navigateTo = (viewId: string) => {
  store.currentView.value = viewId;
};
</script>

<template>
  <div v-if="currentUser" id="dashboard-user-view" class="p-6 space-y-6 h-full overflow-y-auto">
    <!-- Shift header -->
    <div class="bg-white p-6 border border-[#DCDFE4] rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] bg-[#E6EFFF] px-2.5 py-1 rounded inline-block mb-2">
          Active Shift Session
        </span>
        <h2 class="font-sans font-bold text-2xl text-[#041b3c]">
          Selamat Bekerja, {{ currentUser.name }}!
        </h2>
        <p class="text-sm text-[#434654] mt-0.5">
          Your terminal is authorized and connected. Process guest purchases smoothly.
        </p>
      </div>
      
      <div class="mt-4 md:mt-0 flex items-center space-x-2 text-[#434654] font-mono text-xs bg-[#F4F5F7] p-3 rounded border border-[#DCDFE4]">
        <Clock class="w-4 h-4 text-[#737685]" />
        <span>Authorize Time: {{ currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleTimeString("id-ID") : "-" }}</span>
      </div>
    </div>

    <!-- Staff stats banner matrices -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Stat 1 -->
      <div class="bg-white p-5 border border-[#DCDFE4] rounded-md">
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#737685] block mb-1">
          My Sales volume
        </span>
        <div class="font-sans font-bold text-2xl text-[#0052CC] tracking-tight">
          {{ formatRupiah(totalMySales) }}
        </div>
        <span class="text-[11px] text-[#737685] mt-1.5 block">
          Accumulated order items total
        </span>
      </div>

      <!-- Stat 2 -->
      <div class="bg-white p-5 border border-[#DCDFE4] rounded-md">
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#737685] block mb-1">
          Registered Checkouts
        </span>
        <div class="font-sans font-bold text-2xl text-[#041b3c] tracking-tight">
          {{ myTransactions.length }} receipts
        </div>
        <div class="flex items-center space-x-1 mt-1">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          <span class="text-[11px] text-emerald-600 font-semibold">Active processing ok</span>
        </div>
      </div>

      <!-- Stat 3 -->
      <div class="bg-white p-5 border border-[#DCDFE4] rounded-md">
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#737685] block mb-1">
          Voids Under My Name
        </span>
        <div class="font-sans font-bold text-2xl text-[#ba1a1a] tracking-tight">
          {{ myVoidedTransactions.length }} invoices
        </div>
        <div class="flex items-center space-x-1 mt-1">
          <ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
          <span class="text-[11px] text-[#737685]">Require manager sign-off</span>
        </div>
      </div>
    </div>

    <!-- Grid of Launcher widgets -->
    <div class="space-y-4">
      <h3 class="font-sans font-bold text-md text-[#041b3c]">
        Terminal POS Shortcuts
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Tile 1: POS cashiers -->
        <button
          @click="navigateTo('pos')"
          class="p-6 bg-white border border-[#DCDFE4] hover:border-[#0052CC] hover:bg-[#E6EFFF]/10 duration-200 text-left rounded-lg transition-all group cursor-pointer"
        >
          <div class="w-12 h-12 bg-[#E6EFFF] text-[#0052CC] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShoppingCart class="w-6 h-6" />
          </div>
          <h4 class="font-sans font-bold text-base text-[#041b3c] group-hover:text-[#0052CC]">
            Go to POS Cashier Screen →
          </h4>
          <p class="text-xs text-[#737685] mt-1.5 leading-relaxed">
            Open the interactive cart register. Tap products, select carton/pcs sizing, and approve payments instantly.
          </p>
        </button>

        <!-- Tile 2: Product catalogs -->
        <button
          @click="navigateTo('catalog-user')"
          class="p-6 bg-white border border-[#DCDFE4] hover:border-[#0052CC] hover:bg-[#E6EFFF]/10 duration-200 text-left rounded-lg transition-all group cursor-pointer"
        >
          <div class="w-12 h-12 bg-slate-100 text-[#5c5f60] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <h4 class="font-sans font-bold text-base text-[#041b3c] group-hover:text-[#0052CC]">
            Open Product Catalog →
          </h4>
          <p class="text-xs text-[#737685] mt-1.5 leading-relaxed">
            Browse drink ingredients, pastry details, box pricing structural conversions, and check active stock items.
          </p>
        </button>

        <!-- Tile 3: My logs -->
        <button
          @click="navigateTo('history-user')"
          class="p-6 bg-white border border-[#DCDFE4] hover:border-[#0052CC] hover:bg-[#E6EFFF]/10 duration-200 text-left rounded-lg transition-all group cursor-pointer"
        >
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <History class="w-6 h-6" />
          </div>
          <h4 class="font-sans font-bold text-base text-[#041b3c] group-hover:text-[#0052CC]">
            Check Receipt Log History →
          </h4>
          <p class="text-xs text-[#737685] mt-1.5 leading-relaxed">
            Track invoices, process reprint commands, review guest payment methods, and check total shift summaries.
          </p>
        </button>
      </div>
    </div>

    <!-- Helpful Hint banner -->
    <div class="bg-[#E6EFFF] border border-[#cadaff] p-4 rounded-md flex items-start space-x-3">
      <HelpCircle class="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
      <div class="text-xs text-[#041b3c] leading-relaxed">
        <strong class="font-bold">Need assistance?</strong> If you scan a barcode or tap a product that registers "Insufficient Stock" errors, please contact the administrator immediately to log physical warehouse stock inventory levels inside the <strong class="font-semibold">Inventory Stock Panel</strong>.
      </div>
    </div>
  </div>
</template>
