<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { computed } from "vue";
import { useStore } from "../store";
import { 
  TrendingUp, 
  ShoppingCart, 
  Coins, 
  Percent, 
  AlertTriangle, 
  ArrowRight,
  ChevronRight
} from "lucide-vue-next";

const store = useStore();

const stats = computed(() => {
  return store.getDashboardStats();
});

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

const navigateTo = (viewId: string) => {
  store.currentView.value = viewId;
};
</script>

<template>
  <div id="dashboard-admin-view" class="p-8 space-y-8 h-full overflow-y-auto">
    <!-- Upper header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 border border-[#e9ecef] rounded-[32px] shadow-sm">
      <div>
        <h2 class="font-sans font-bold text-2xl text-[#1a1a1a] tracking-tight">
          Sales Analytics Dashboard
        </h2>
        <p class="text-xs text-[#868e96] font-semibold mt-1">
          Realtime monitoring, catalog performance metrics and inventory replenishment triggers.
        </p>
      </div>
      
      <!-- Fast Action Shortcuts -->
      <div class="flex space-x-3 mt-4 md:mt-0">
        <button
          @click="navigateTo('pos')"
          class="bg-[#1a1a1a] text-white font-bold text-xs px-5 py-3 rounded-full hover:bg-black transition-all flex items-center space-x-2 shadow-md shadow-black/10 cursor-pointer"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>Open Cashier</span>
        </button>
        <button
          @click="navigateTo('product-management')"
          class="bg-white border border-[#dee2e6] hover:border-[#1a1a1a] text-[#1a1a1a] font-bold text-xs px-5 py-3 rounded-full transition-all flex items-center space-x-2 cursor-pointer"
        >
          <AlertTriangle class="w-4 h-4 text-[#fab005]" />
          <span>Manage Inventory</span>
        </button>
      </div>
    </div>

    <!-- Grid Cards KPI metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Metric 1 -->
      <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs group hover:shadow-md transition-all">
        <div class="flex items-center justify-between text-[#868e96] mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest block">
            Gross Revenue
          </span>
          <div class="w-9 h-9 rounded-2xl bg-[#e8f4fd] flex items-center justify-center text-[#228be6]">
            <Coins class="w-4 h-4" />
          </div>
        </div>
        <div class="font-sans font-black text-2xl text-[#1a1a1a] tracking-tight">
          {{ formatRupiah(stats.totalRevenue) }}
        </div>
        <div class="flex items-center space-x-1 text-xs text-[#40c057] font-bold mt-2.5">
          <TrendingUp class="w-3.5 h-3.5" />
          <span>+12.4% vs last week</span>
        </div>
      </div>

      <!-- Metric 2 -->
      <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs group hover:shadow-md transition-all">
        <div class="flex items-center justify-between text-[#868e96] mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest block">
            Core Transactions
          </span>
          <div class="w-9 h-9 rounded-2xl bg-[#f1f3f5] flex items-center justify-center text-[#1a1a1a]">
            <ShoppingCart class="w-4 h-4" />
          </div>
        </div>
        <div class="font-sans font-black text-2xl text-[#1a1a1a] tracking-tight">
          {{ stats.totalTransactions }} tx
        </div>
        <div class="text-xs text-[#868e96] font-semibold mt-3">
          Realtime invoice checkouts
        </div>
      </div>

      <!-- Metric 3 -->
      <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs group hover:shadow-md transition-all">
        <div class="flex items-center justify-between text-[#868e96] mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest block">
            Average Cart Value
          </span>
          <div class="w-9 h-9 rounded-2xl bg-[#ebfbee] flex items-center justify-center text-[#40c057]">
            <Percent class="w-4 h-4" />
          </div>
        </div>
        <div class="font-sans font-black text-2xl text-[#1a1a1a] tracking-tight">
          {{ formatRupiah(stats.averageOrderValue) }}
        </div>
        <div class="text-xs text-[#868e96] font-semibold mt-3">
          Average transaction basket
        </div>
      </div>

      <!-- Metric 4 -->
      <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs group hover:shadow-md transition-all">
        <div class="flex items-center justify-between text-[#868e96] mb-3">
          <span class="text-[10px] font-bold uppercase tracking-widest block">
            Net Profit Margins
          </span>
          <div class="w-9 h-9 rounded-2xl bg-[#fff9db] flex items-center justify-center text-[#fab005]">
            <TrendingUp class="w-4 h-4 animate-bounce" />
          </div>
        </div>
        <div class="font-sans font-black text-2xl text-[#fab005] tracking-tight">
          {{ formatRupiah(stats.grossProfit) }}
        </div>
        <div class="text-xs text-[#868e96] font-semibold mt-3">
          Excl. operational tax (11% VAT)
        </div>
      </div>
    </div>

    <!-- Mid Level Content: Charts and Alerts Split -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Sales by Category (Bar graph visualization) -->
      <div class="lg:col-span-2 bg-white p-6 border border-[#e9ecef] rounded-[32px] shadow-xs">
        <h3 class="font-sans font-bold text-base text-[#1a1a1a] mb-0.5 tracking-tight">
          Category Contribution Total
        </h3>
        <p class="text-xs text-[#868e96] mb-6 font-semibold">
          Gross sales value performance mapped by product categories.
        </p>

        <div class="space-y-4">
          <div v-if="stats.revenueByCategory.length === 0" class="py-12 text-center text-[#868e96] text-sm font-semibold">
            No contribution data recorded. Check out some products first!
          </div>
          <div v-else v-for="(cat, idx) in stats.revenueByCategory" :key="idx" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-[#1a1a1a]">{{ cat.categoryName }}</span>
              <span class="font-mono font-bold text-[#228be6]">
                {{ formatRupiah(cat.value) }}
              </span>
            </div>
            <div class="w-full bg-[#f1f3f5] h-3 rounded-full overflow-hidden">
              <div 
                class="bg-[#1a1a1a] h-full rounded-full transition-all duration-500" 
                :style="{ width: `${Math.max(...stats.revenueByCategory.map(c => c.value)) > 0 ? (cat.value / Math.max(...stats.revenueByCategory.map(c => c.value))) * 100 : 0}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock alarms box -->
      <div class="bg-white p-6 border border-[#e9ecef] rounded-[32px] shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-sans font-bold text-base text-[#1a1a1a] tracking-tight">
              Replenishment Board
            </h3>
            <span :class="[
              'text-[9px] uppercase font-bold px-2.5 py-1 rounded-full border',
              stats.lowStockCount > 0 
                ? 'bg-[#fff5f5] text-[#fa5252] border-[#ffe3e3]' 
                : 'bg-[#ebfbee] text-[#40c057] border-[#d3f9d8]'
            ]">
              {{ stats.lowStockCount }} alert{{ stats.lowStockCount !== 1 ? 's' : '' }}
            </span>
          </div>

          <div class="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            <div v-if="stats.criticalProductAlerts.length === 0" class="py-8 text-center text-[#40c057] text-xs font-bold bg-[#ebfbee]/50 rounded-2xl border border-dashed border-[#d3f9d8]">
              ✓ High stocks: All catalog items exceed minimum thresholds.
            </div>
            <div 
              v-else 
              v-for="prod in stats.criticalProductAlerts" 
              :key="prod.id" 
              class="p-3.5 bg-[#f8f9fa] border-l-4 border-[#fab005] rounded-2xl flex justify-between items-center"
            >
              <div>
                <h4 class="font-sans font-bold text-xs text-[#1a1a1a]">{{ prod.name }}</h4>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-[9px] font-bold font-mono bg-white px-2 py-0.5 rounded-full border border-[#e9ecef] text-[#868e96]">
                    {{ prod.sku }}
                  </span>
                  <span class="text-[10px] text-[#fab005] font-bold">
                    Min: {{ prod.minStock }} pcs
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-mono font-black text-[#fa5252]">
                  {{ prod.stock }} {{ prod.unit }}
                </div>
                <span class="text-[9px] font-bold text-[#adb5bd]">left in storage</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-[#e9ecef] mt-4">
          <button
            @click="navigateTo('product-management')"
            class="w-full flex items-center justify-between text-xs text-[#1a1a1a] font-bold hover:underline cursor-pointer text-left"
          >
            <span>Restock inventory items</span>
            <ArrowRight class="w-4 h-4 text-[#868e96]" />
          </button>
        </div>
      </div>

    </div>

    <!-- Down Level Content: Recent Transactions Table -->
    <div class="bg-white border border-[#e9ecef] rounded-[32px] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-[#e9ecef] flex items-center justify-between">
        <div>
          <h3 class="font-sans font-bold text-base text-[#1a1a1a] tracking-tight">
            Recent Client Orders
          </h3>
          <p class="text-xs text-[#868e96] mt-0.5 font-semibold">
            Instant activity logging of newly approved or voided POS receipts.
          </p>
        </div>
        <button
          @click="navigateTo('history-admin')"
          class="text-xs text-[#1a1a1a] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>See entire log</span>
          <ChevronRight class="w-4 h-4 text-[#868e96]" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#f8f9fa] border-b border-[#e9ecef]">
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">Invoice / ID</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">Cashier Account</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">Checkout Time</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-right">Cart Total</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">Method</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e9ecef]">
            <tr v-if="stats.recentTransactions.length === 0">
              <td colSpan="6" class="p-8 text-center text-xs font-semibold text-[#868e96]">
                No transactions recorded today. Proceed to Checkout POS to begin.
              </td>
            </tr>
            <tr 
              v-else 
              v-for="tx in stats.recentTransactions" 
              :key="tx.id" 
              class="hover:bg-[#f8f9fa] transition-colors duration-150"
            >
              <td class="p-4 font-mono text-xs font-bold text-[#228be6]">{{ tx.invoiceNumber }}</td>
              <td class="p-4 text-xs font-bold text-[#1a1a1a]">{{ tx.cashierName }}</td>
              <td class="p-4 text-xs text-[#868e96] font-semibold">
                {{ new Date(tx.date).toLocaleDateString("id-ID") }} • {{ new Date(tx.date).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) }}
              </td>
              <td class="p-4 text-xs font-mono font-bold text-[#1a1a1a] text-right">
                {{ formatRupiah(tx.total) }}
              </td>
              <td class="p-4">
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f1f3f5] text-[#495057] border border-[#e9ecef]">
                  {{ tx.paymentMethod }}
                </span>
              </td>
              <td class="p-4 text-center">
                <span :class="[
                  'text-[9px] font-bold px-2.5 py-0.5 rounded-full border',
                  tx.status === 'Completed' 
                    ? 'bg-[#ebfbee] text-[#40c057] border-[#d3f9d8]' 
                    : 'bg-[#fff5f5] text-[#fa5252] border-[#ffe3e3]'
                ]">
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
