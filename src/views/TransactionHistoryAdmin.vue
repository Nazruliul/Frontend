<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Transaction } from "../types";
import { Search, Ban, History, Printer, QrCode, CreditCard, DollarSign, Eye, X } from "lucide-vue-next";

const store = useStore();
const transactions = store.transactions;
const search = store.transactionSearchQuery;
const dateFilter = store.transactionDateFilter;

const activeReceiptDetail = ref<Transaction | null>(null);

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Filter transactions
const filteredTxs = computed(() => {
  return transactions.value.filter((tx) => {
    const matchesSearch = 
      tx.invoiceNumber.toLowerCase().includes(search.value.toLowerCase()) ||
      tx.cashierName.toLowerCase().includes(search.value.toLowerCase()) ||
      tx.paymentMethod.toLowerCase().includes(search.value.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter.value !== "all") {
      const txDate = new Date(tx.date).toISOString().slice(0, 10); // yyyy-MM-dd
      const todayStr = new Date().toISOString().slice(0, 10);
      
      if (dateFilter.value === "today") {
        matchesDate = txDate === todayStr;
      } else if (dateFilter.value === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        matchesDate = txDate === yesterdayStr;
      }
    }

    return matchesSearch && matchesDate;
  });
});

const handleVoid = (id: string, inv: string) => {
  const confirmResult = window.confirm(`Are you absolutely sure you want to void transaction '${inv}'? This will completely cancel the invoice and restore physical items back to inventory stock.`);
  if (confirmResult) {
    store.voidTransaction(id);
    
    // Update modal display state if active
    if (activeReceiptDetail.value && activeReceiptDetail.value.id === id) {
      activeReceiptDetail.value = { ...activeReceiptDetail.value, status: "Cancelled" };
    }
  }
};

const triggerPrint = () => {
  window.print();
};
</script>

<template>
  <div id="transaction-history-admin-view" class="p-6 space-y-6 h-full overflow-y-auto">
    <!-- Header title -->
    <div class="bg-white p-5 border border-[#DCDFE4] rounded-lg">
      <h2 class="font-sans font-bold text-2xl text-[#041b3c]">
        Master Archive: All Transactions
      </h2>
      <p class="text-sm text-[#434654] mt-0.5">
        Audit shift records, investigate payment methods, print receipts, and issue stock voiding commands.
      </p>
    </div>

    <!-- Audit filter tools -->
    <div class="bg-white p-4 border border-[#DCDFE4] rounded-md flex flex-wrap gap-4 items-center justify-between">
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-[#737685]">
          <Search class="w-4 h-4" />
        </span>
        <input
          id="history-admin-search-input"
          type="text"
          placeholder="Type Invoice ID, cashier name..."
          v-model="search"
          class="w-full bg-white border border-[#DCDFE4] outline-none text-xs rounded pl-9 pr-4 py-2.5 focus:border-[#0052CC]"
        />
      </div>

      <div class="flex items-center space-x-3 w-full md:w-auto">
        <span class="text-xs font-bold text-[#737685] uppercase tracking-wider">Date bounds:</span>
        <select
          id="history-admin-date-select"
          v-model="dateFilter"
          class="bg-white border border-[#DCDFE4] text-xs px-3 py-2 rounded focus:border-[#0052CC] text-[#041b3c] font-medium cursor-pointer"
        >
          <option value="all">Check Entire History</option>
          <option value="today">Today Only</option>
          <option value="yesterday">Yesterday</option>
        </select>
      </div>
    </div>

    <!-- Main Transactions Log Table -->
    <div class="bg-white border border-[#DCDFE4] rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F4F5F7] border-b border-[#DCDFE4]">
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Invoice ID</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Cashier Name</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Date & Time</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-right">Items Purchased</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-right">Grand Total</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Payment System</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-center">Status</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-center">Auditing</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DCDFE4]">
            <tr v-if="filteredTxs.length === 0">
              <td colSpan="8" class="p-8 text-center text-sm text-[#737685]">
                No historical transaction record matches catalog filter terms.
              </td>
            </tr>
            <tr v-else v-for="tx in filteredTxs" :key="tx.id" class="hover:bg-[#F4F5F7] transition-colors">
              <td class="p-3 font-mono text-xs font-bold text-[#0052CC]">{{ tx.invoiceNumber }}</td>
              <td class="p-3 text-xs font-semibold text-[#041b3c]">{{ tx.cashierName }}</td>
              <td class="p-3 text-xs text-[#737685]">
                {{ new Date(tx.date).toLocaleDateString("id-ID") }} - {{ new Date(tx.date).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) }}
              </td>
              <td class="p-3 text-right font-mono text-xs text-[#041b3c] font-bold">
                {{ tx.items.reduce((sum, item) => sum + item.quantity, 0) }} units
              </td>
              <td class="p-3 text-right font-mono text-xs text-[#0052CC] font-extrabold">
                {{ formatRupiah(tx.total) }}
              </td>
              <td class="p-3">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#5c5f60] inline-flex items-center space-x-1">
                  <QrCode v-if="tx.paymentMethod === 'QRIS'" class="w-3 h-3 mr-1 text-[#228be6]" />
                  <CreditCard v-else-if="tx.paymentMethod === 'Debit'" class="w-3 h-3 mr-1 text-teal-600" />
                  <DollarSign v-else class="w-3 h-3 mr-1 text-emerald-600" />
                  <span>{{ tx.paymentMethod }}</span>
                </span>
              </td>
              <td class="p-3 text-center">
                <span :class="[
                  'text-[10px] font-bold px-2.5 py-1 rounded-sm leading-none border',
                  tx.status === 'Completed' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                ]">
                  {{ tx.status }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    @click="activeReceiptDetail = tx"
                    class="p-1 px-2 hover:bg-[#E6EFFF] rounded text-[#0052CC] border border-[#DCDFE4] text-[10px] font-semibold flex items-center cursor-pointer"
                  >
                    <Eye class="w-3 h-3 mr-1" /> Inspect
                  </button>
                  <button
                    v-if="tx.status === 'Completed'"
                    @click="handleVoid(tx.id, tx.invoiceNumber)"
                    class="p-1 px-2 hover:bg-[#ffdad6] rounded text-[#ba1a1a] border border-[#ffdad6] text-[10px] font-semibold flex items-center cursor-pointer"
                  >
                    <Ban class="w-3 h-3 mr-1" /> Void
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- INSPECT RECEIPT DETAIL DRAWER MODAL BLOCK -->
    <div v-if="activeReceiptDetail" class="fixed inset-0 bg-[#041b3c]/40 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div class="bg-white border-2 border-[#DCDFE4] w-full max-w-sm rounded-[24px] shadow-xl overflow-hidden">
        
        <!-- Modal header -->
        <div class="p-4 bg-[#F4F5F7] border-b border-[#DCDFE4] flex items-center justify-between">
          <span class="text-xs font-bold font-mono text-[#0052CC]">
            INSPECT LOG: {{ activeReceiptDetail.invoiceNumber }}
          </span>
          <button 
            @click="activeReceiptDetail = null"
            class="text-zinc-500 hover:text-black font-extrabold text-sm w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Receipt container content -->
        <div class="p-6 font-mono text-xs text-[#041b3c] max-h-[350px] overflow-y-auto">
          <div class="text-center font-bold text-sm mb-4">
            <h4>KAPI Coffee & Kitchen</h4>
            <p class="text-[10px] text-[#737685] font-normal mt-0.5">Store Invoice Log Receipt</p>
          </div>

          <div class="space-y-1 text-[10px] text-[#737685] border-b border-dashed border-[#DCDFE4] pb-2.5 mb-2.5 text-left">
            <div class="flex justify-between">
              <span>Author Cashier:</span>
              <span class="font-bold text-[#041b3c]">{{ activeReceiptDetail.cashierName }}</span>
            </div>
            <div class="flex justify-between">
              <span>Timestamp:</span>
              <span>{{ new Date(activeReceiptDetail.date).toLocaleString("id-ID") }}</span>
            </div>
            <div class="flex justify-between">
              <span>Audit Status:</span>
              <span :class="[
                'font-bold',
                activeReceiptDetail.status === 'Completed' ? 'text-emerald-600' : 'text-[#ba1a1a]'
              ]">
                {{ activeReceiptDetail.status.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Items -->
          <div class="space-y-2 border-b border-dashed border-[#DCDFE4] pb-2.5 mb-2.5 text-left">
            <div v-for="(item, idx) in activeReceiptDetail.items" :key="idx" class="space-y-0.5">
              <div class="flex justify-between font-bold">
                <span>{{ item.product.name }}</span>
                <span>{{ formatRupiah(item.total) }}</span>
              </div>
              <div class="flex justify-between text-[10px] text-[#737685]">
                <span>
                  {{ item.quantity }} x {{ formatRupiah(item.price) }} ({{ item.unitSelected === "carton" ? "Box" : "Pieces" }})
                </span>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="space-y-1.5 text-right border-b border-dashed border-zinc-200 pb-2 mb-2">
            <div class="flex justify-between">
              <span class="text-[#737685]">Subtotal:</span>
              <span>{{ formatRupiah(activeReceiptDetail.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#737685]">Tax (11% VAT):</span>
              <span>{{ formatRupiah(activeReceiptDetail.tax) }}</span>
            </div>
            <div v-if="activeReceiptDetail.discount > 0" class="flex justify-between text-[#ba1a1a] font-bold">
              <span>Discount Promo:</span>
              <span>-{{ formatRupiah(activeReceiptDetail.discount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-[#0052CC] pt-1">
              <span>Invoice Total:</span>
              <span>{{ formatRupiah(activeReceiptDetail.total) }}</span>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="space-y-1 text-[10px] text-[#737685] text-left">
            <div class="flex justify-between">
              <span>Method:</span>
              <span class="font-bold text-[#041b3c]">{{ activeReceiptDetail.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span>Paid:</span>
              <span>{{ formatRupiah(activeReceiptDetail.amountPaid) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Change:</span>
              <span>{{ formatRupiah(activeReceiptDetail.change) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal footer actions -->
        <div class="p-3 bg-[#F4F5F7] border-t border-[#DCDFE4] flex space-x-2">
          <button
            @click="triggerPrint"
            class="flex-grow bg-white border border-[#DCDFE4] text-xs font-semibold py-2 rounded-xl text-[#041b3c] hover:bg-slate-100 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Reprint paper</span>
          </button>
          
          <button
            v-if="activeReceiptDetail.status === 'Completed'"
            @click="handleVoid(activeReceiptDetail.id, activeReceiptDetail.invoiceNumber)"
            class="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#ffdad6]/80 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Ban class="w-3.5 h-3.5 mr-1" />
            <span>Void Audit</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
