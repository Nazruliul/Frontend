<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { computed } from "vue";
import { useStore } from "../store";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  History, 
  ShoppingCart, 
  LogOut,
  GitCommit
} from "lucide-vue-next";

const store = useStore();
const currentUser = store.currentUser;
const currentView = store.currentView;

// Build navigation items based on role
const menuItems = computed(() => {
  if (!currentUser.value) return [];
  
  if (currentUser.value.role === "admin") {
    return [
      { id: "dashboard-admin", label: "Dashboard", icon: LayoutDashboard },
      { id: "pos", label: "POS Cashier", icon: ShoppingCart },
      { id: "catalog-user", label: "Product Catalog", icon: ShoppingBag },
      { id: "product-management", label: "Inventory Stock", icon: Settings },
      { id: "history-admin", label: "All Transactions", icon: History },
      { id: "git-commit-planner", label: "Commit Helper 🛡️", icon: GitCommit },
    ];
  } else if (currentUser.value.role === "customer") {
    return [
      { id: "customer-portal", label: "Pesan Saji Menu", icon: ShoppingCart },
      { id: "catalog-user", label: "Katalog Produk", icon: ShoppingBag },
      { id: "history-user", label: "Daftar Transaksi", icon: History },
    ];
  } else {
    return [
      { id: "dashboard-user", label: "Dashboard Staff", icon: LayoutDashboard },
      { id: "pos", label: "Cashier POS", icon: ShoppingCart },
      { id: "catalog-user", label: "Product Catalog", icon: ShoppingBag },
      { id: "history-user", label: "My Transactions", icon: History },
      { id: "git-commit-planner", label: "Commit Helper 🛡️", icon: GitCommit },
    ];
  }
});

const handleNavigate = (viewId: string) => {
  currentView.value = viewId;
};

const handleLogout = () => {
  store.logout();
};
</script>

<template>
  <div 
    v-if="currentUser"
    id="kapi-sidebar"
    class="w-[240px] bg-white border-r border-[#e9ecef] flex flex-col justify-between h-full flex-shrink-0"
  >
    <!-- Brand Header -->
    <div>
      <div class="p-6 border-b border-[#e9ecef] flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-white font-sans font-bold text-base shadow-xs shadow-black/10">
          K
        </div>
        <div>
          <h1 class="font-sans font-bold text-sm tracking-tight text-[#1a1a1a] leading-tight">
            KAPI POS
          </h1>
          <span class="text-[10px] uppercase font-bold tracking-widest text-[#868e96] block">
            Kasir Pintar
          </span>
        </div>
      </div>

      <!-- Navigation List -->
      <nav class="p-4 space-y-1.5">
        <div class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#adb5bd]">
          Navigation Menu
        </div>
        <button
          v-for="item in menuItems"
          :key="item.id"
          :id="`sidebar-nav-${item.id}`"
          @click="handleNavigate(item.id)"
          :class="[
            'w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all text-left relative',
            currentView === item.id 
              ? 'bg-[#f1f3f5] text-[#1a1a1a] font-bold' 
              : 'text-[#868e96] hover:bg-[#f8f9fa] hover:text-[#1a1a1a]'
          ]"
        >
          <component 
            :is="item.icon" 
            :class="[
              'w-[18px] h-[18px] flex-shrink-0', 
              currentView === item.id ? 'text-[#1a1a1a]' : 'text-[#adb5bd]'
            ]" 
          />
          <span class="font-sans text-xs tracking-wide">{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <!-- User Session profile container -->
    <div class="p-5 border-t border-[#e9ecef] bg-[#f8f9fa]">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {{ currentUser.name.charAt(0).toUpperCase() }}
        </div>
        <div class="overflow-hidden">
          <h4 class="font-sans font-bold text-xs text-[#1a1a1a] truncate">
            {{ currentUser.name }}
          </h4>
          <div class="flex items-center space-x-1.5 mt-0.5">
            <span v-if="currentUser.role === 'admin'" class="bg-[#fff5f5] text-[#fa5252] text-[9px] font-bold px-2 py-0.5 rounded-full leading-none flex items-center border border-[#ffe3e3]">
              ADMIN
            </span>
            <span v-else-if="currentUser.role === 'customer'" class="bg-blue-50 text-[#228be6] text-[9px] font-bold px-2 py-0.5 rounded-full leading-none flex items-center border border-blue-100">
              KONSUMEN
            </span>
            <span v-else class="bg-[#f1f3f5] text-[#495057] text-[9px] font-bold px-2 py-0.5 rounded-full leading-none border border-[#e9ecef]">
              STAFF
            </span>
          </div>
        </div>
      </div>

      <!-- Action button -->
      <button
        id="btn-sidebar-logout"
        @click="handleLogout"
        class="w-full flex items-center justify-center space-x-2 py-2.5 px-3 bg-white border border-[#dee2e6] hover:bg-[#fff5f5] hover:text-[#fa5252] hover:border-[#ffe3e3] rounded-2xl text-xs text-[#495057] font-semibold transition-all duration-200 cursor-pointer"
      >
        <LogOut class="w-3.5 h-3.5" />
        <span>Exit Account</span>
      </button>
    </div>
  </div>
</template>
