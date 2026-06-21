<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Transaction } from "../types";
import { Search, Printer, ShieldAlert } from "lucide-vue-next";

const store = useStore();
const currentUser = store.currentUser;
const transactions = store.transactions;

const shiftSearch = ref("");
const activeReceiptDetail = ref<Transaction | null>(null);

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Filter only transactions completed by the current logged-in employee/staff
const myTxs = computed(() => {
  if (!currentUser.value) return [];
  return transactions.value.filter((tx) => {
    const isOwner = tx.cashierId === currentUser.value?.id;
    const matchesSearch = tx.invoiceNumber.toLowerCase().includes(shiftSearch.value.toLowerCase()) || 
                          tx.total.toString().includes(shiftSearch.value) ||
                          tx.paymentMethod.toLowerCase().includes(shiftSearch.value.toLowerCase());
    return isOwner && matchesSearch;
  });
});

const totalSalesThisShift = computed(() => {
  return myTxs.value
    .filter((tx) => tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.total, 0);
});

const triggerPrint = () => {
  window.print();
};
</script>

<template>
  <div v-if="currentUser" id="transaction-history-user-view" class="p-6 space-y-6 h-full overflow-y-auto">
    <!-- Shift status banner -->
    <div class="bg-white p-5 border border-[#DCDFE4] rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="font-sans font-bold text-2xl text-[#041b3c]">
          My Shift Transactions
        </h2>
        <p class="text-sm text-[#434654] mt-0.5">
          Logs of all orders completed under your profile. Reprint receipts or audit payments.
        </p>
      </div>

      <!-- Dynamic Shift totals info -->
      <div class="mt-4 md:mt-0 flex items-center space-x-3 bg-[#E6EFFF] border border-[#cadaff] p-3 rounded">
        <div>
          <span class="text-[9px] font-bold uppercase tracking-wider text-[#0052CC] block">My Shift revenue:</span>
          <span class="font-mono text-sm font-extrabold text-[#0052CC]">
            {{ formatRupiah(totalSalesThisShift) }}
          </span>
        </div>
        <div class="w-px h-8 bg-[#cadaff]" />
        <div>
          <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block">Status:</span>
          <span class="text-xs font-bold text-emerald-700">Open Shift</span>
        </div>
      </div>
    </div>

    <!-- Mini search filters for quick cashier access -->
    <div class="bg-white p-4 border border-[#DCDFE4] rounded-md flex flex-wrap gap-4 items-center justify-between">
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-[#737685]">
          <Search class="w-4 h-4" />
        </span>
        <input
          id="history-user-search-input"
          type="text"
          placeholder="Search my invoices (INV/xxxx)..."
          v-model="shiftSearch"
          class="w-full bg-white border border-[#DCDFE4] outline-none text-xs rounded pl-9 pr-4 py-2.5 focus:border-[#0052CC]"
        />
      </div>
      
      <span class="text-xs text-[#737685] font-semibold">
        Showing {{ myTxs.length }} of your completed checkout invoices
      </span>
    </div>

    <!-- Invoices table logs list -->
    <div class="bg-white border border-[#DCDFE4] rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F4F5F7] border-b border-[#DCDFE4]">
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Invoice ID</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Date & Time</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-right">Items</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-right">Invoice Total</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider">Payment Solution</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-center">Status</th>
              <th class="p-3 text-[10px] font-bold text-[#737685] uppercase tracking-wider text-center">Aesthetic Audit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DCDFE4]">
            <tr v-if="myTxs.length === 0">
              <td colSpan="7" class="p-8 text-center text-sm text-[#737685]">
                You haven't checked out any order items during this active shift session.
              </td>
            </tr>
            <tr v-else v-for="tx in myTxs" :key="tx.id" class="hover:bg-[#F4F5F7] transition-colors">
              <td class="p-3 font-mono text-xs font-bold text-[#0052CC]">{{ tx.invoiceNumber }}</td>
              <td class="p-3 text-xs text-[#737685]">
                {{ new Date(tx.date).toLocaleDateString("id-ID") }} - {{ new Date(tx.date).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) }}
              </td>
              <td class="p-3 text-right font-mono text-xs text-[#041b3c] font-bold">
                {{ tx.items.reduce((sum, i) => sum + i.quantity, 0) }} items
              </td>
              <td class="p-3 text-right font-mono text-xs text-[#0052CC] font-extrabold">
                {{ formatRupiah(tx.total) }}
              </td>
              <td class="p-3">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#5c5f60]">
                  {{ tx.paymentMethod }}
                </span>
              </td>
              <td class="p-3 text-center">
                <span :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded border',
                  tx.status === 'Completed' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                ]">
                  {{ tx.status }}
                </span>
              </td>
              <td class="p-3 text-center">
                <button
                  @click="activeReceiptDetail = tx"
                  class="p-1 px-2.5 bg-white border border-[#DCDFE4] rounded-xl text-[#041b3c] hover:bg-[#E6EFFF] hover:text-[#0052CC] hover:border-[#0052CC] text-[10px] font-bold flex items-center justify-center mx-auto cursor-pointer"
                >
                  <Printer class="w-3.5 h-3.5 mr-1" /> Reprint Receipt
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- COMPONENT MODAL - USER RECEIPT PRINT PREVIEW -->
    <div v-if="activeReceiptDetail" class="fixed inset-0 bg-[#041b3c]/40 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div class="bg-white border-2 border-[#DCDFE4] w-full max-w-sm rounded-[24px] shadow-xl overflow-hidden">
        
        <!-- Header -->
        <div class="p-4 bg-[#F4F5F7] border-b border-[#DCDFE4] flex items-center justify-between">
          <span class="font-mono text-xs font-bold text-[#0052CC]">
            PRINT DEMO: {{ activeReceiptDetail.invoiceNumber }}
          </span>
          <button 
            @click="activeReceiptDetail = null"
            class="text-slate-500 hover:text-black font-extrabold text-sm w-6 h-6 rounded-full hover:bg-slate-200/50 flex justify-center items-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Receipt body papers -->
        <div class="p-6 bg-white font-mono text-xs text-[#041b3c] max-h-[350px] overflow-y-auto">
          <!-- Receipt logo -->
          <div class="text-center space-y-1 mb-4">
            <h4 class="font-bold text-sm">KAPI COFFEE & KITCHEN</h4>
            <p class="text-[10px] text-[#737685]">Kapi Retail Hub, Bandung, West Java</p>
            <p class="text-[10px] text-[#737685]">Telp: 0812-3456-7890</p>
          </div>

          <!-- Cashier and invoice ref info -->
          <div class="border-b border-dashed border-[#DCDFE4] pb-2 mb-2 space-y-1 text-[10px] text-[#737685] text-left">
            <div class="flex justify-between">
              <span>Invoice:</span>
              <span class="font-bold text-[#041b3c]">{{ activeReceiptDetail.invoiceNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span>Cashier Account:</span>
              <span>{{ activeReceiptDetail.cashierName }}</span>
            </div>
            <div class="flex justify-between">
              <span>Checkout date:</span>
              <span>{{ new Date(activeReceiptDetail.date).toLocaleString("id-ID") }}</span>
            </div>
            <div class="flex justify-between">
              <span>Invoice Status:</span>
              <span :class="[
                'font-bold',
                activeReceiptDetail.status === 'Completed' ? 'text-emerald-600' : 'text-[#ba1a1a]'
              ]">
                {{ activeReceiptDetail.status.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Selected items -->
          <div class="border-b border-dashed border-[#DCDFE4] pb-2 mb-2 space-y-2 text-left">
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

          <!-- Breakdown -->
          <div class="space-y-1 text-right border-b border-dashed border-[#DCDFE4] pb-2 mb-2">
            <div class="flex justify-between">
              <span class="text-[#737685]">Subtotal:</span>
              <span>{{ formatRupiah(activeReceiptDetail.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#737685]">VAT (11% Tax):</span>
              <span>{{ formatRupiah(activeReceiptDetail.tax) }}</span>
            </div>
            <div v-if="activeReceiptDetail.discount > 0" class="flex justify-between text-[#ba1a1a] font-bold">
              <span>Discount Promo:</span>
              <span>-{{ formatRupiah(activeReceiptDetail.discount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-[#0052CC] pt-1">
              <span>Grand Total:</span>
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
              <span>Amount paid:</span>
              <span>{{ formatRupiah(activeReceiptDetail.amountPaid) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Change dispensed:</span>
              <span class="font-bold text-[#041b3c]">{{ formatRupiah(activeReceiptDetail.change) }}</span>
            </div>
          </div>

          <div class="text-center pt-5 text-[9px] text-[#737685] space-y-0.5">
            <p>--- Thank You for Dining with KAPI ---</p>
            <p>Reprint log receipt generated successfully.</p>
          </div>

          <div v-if="activeReceiptDetail.status === 'Cancelled'" class="mt-4 p-3 border-2 border-dashed border-[#ba1a1a] rounded text-center text-[#ba1a1a] bg-[#ffdad6]/20 font-bold flex flex-col items-center justify-center">
            <ShieldAlert class="w-5 h-5 mb-1 text-[#ba1a1a]" />
            <span>THIS INVOICE HAS BEEN VOIDED</span>
            <span class="text-[9px] font-normal mt-0.5">Stock has been returned in master catalog.</span>
          </div>
        </div>

        <!-- Modal action -->
        <div class="p-3 bg-[#F4F5F7] border-t border-[#DCDFE4] flex">
          <button
            @click="triggerPrint"
            class="w-full bg-[#0052CC] text-white hover:bg-[#003d9b] text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Trigger Print Command</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
