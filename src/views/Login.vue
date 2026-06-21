<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref } from "vue";
import { useStore } from "../store";
import { Lock, LogIn, UserCheck, ShieldAlert, ShoppingBag } from "lucide-vue-next";

const store = useStore();
const loginError = store.loginError;

const username = ref("");
const isLoggingIn = ref(false);

const handleSubmit = () => {
  if (!username.value.trim()) return;

  isLoggingIn.value = true;
  // Simulate slight loading latency for native full-stack POS feel
  setTimeout(() => {
    store.login(username.value);
    isLoggingIn.value = false;
  }, 600);
};

const handleQuickLogin = (role: "admin" | "staff" | "customer") => {
  isLoggingIn.value = true;
  setTimeout(() => {
    store.login(role);
    isLoggingIn.value = false;
  }, 450);
};
</script>

<template>
  <div 
    id="login-view"
    class="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative"
  >
    <!-- Background design elements -->
    <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
    
    <div class="w-full max-w-md bg-white border border-[#e9ecef] rounded-[32px] p-8 md:p-10 relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      
      <!-- Brand identity -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-[#1a1a1a] mx-auto flex items-center justify-center text-white font-sans font-bold text-2xl mb-4 shadow-lg shadow-black/10">
          K
        </div>
        <h2 class="font-sans font-bold text-2xl text-[#1a1a1a] tracking-tight">
          KAPI POS Portal
        </h2>
        <p class="text-xs text-[#868e96] font-semibold uppercase tracking-wider mt-1.5">
          Kasir Pintar - Point of Sale & Smart Catalog
        </p>
      </div>

      <!-- Dynamic Alerts -->
      <div v-if="loginError" class="mb-5 bg-[#fff5f5] text-[#fa5252] p-3.5 rounded-2xl border border-[#ffe3e3] text-xs font-bold flex items-center">
        <ShieldAlert class="w-4 h-4 mr-2" />
        {{ loginError }}
      </div>

      <!-- Input Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-[#adb5bd] mb-1">
            Username/Role Bypass
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-[#adb5bd]">
              <Lock class="w-4 h-4" />
            </span>
            <input
              id="login-input-username"
              type="text"
              v-model="username"
              placeholder="Type 'admin', 'staff' or 'customer'"
              class="w-full bg-[#f1f3f5] border-transparent rounded-2xl pl-10 pr-4 py-3 text-sm outline-none text-[#1a1a1a] font-bold placeholder-[#adb5bd] focus:bg-white focus:ring-1 focus:ring-[#1a1a1a] transition-all"
              :disabled="isLoggingIn"
            />
          </div>
        </div>

        <button
          id="btn-login-submit"
          type="submit"
          :disabled="isLoggingIn || !username.trim()"
          class="w-full bg-[#1a1a1a] text-white py-3 px-4 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:bg-slate-200 disabled:text-[#868e96] disabled:cursor-not-allowed cursor-pointer"
        >
          <LogIn class="w-4 h-4" />
          <span>{{ isLoggingIn ? "Authorizing..." : "Log In to Terminal" }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-[#e9ecef]"></div>
        <span class="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#adb5bd]">
          Quick Access Demo
        </span>
        <div class="flex-grow border-t border-[#e9ecef]"></div>
      </div>

      <!-- Fast Credentials Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          id="btn-quick-login-admin"
          type="button"
          @click="handleQuickLogin('admin')"
          class="flex flex-col items-center justify-center p-3 bg-[#f8f9fa] border border-transparent hover:bg-white hover:border-[#1a1a1a] duration-200 transition-all rounded-[24px] text-center group cursor-pointer"
        >
          <ShieldAlert class="w-5 h-5 text-[#fa5252] group-hover:text-[#1a1a1a] mb-1.5" />
          <span class="font-sans font-bold text-[10px] text-[#1a1a1a]">ADMINISTRATOR</span>
          <span class="text-[8px] text-[#868e96] mt-0.5">Control Stock & view Profit</span>
        </button>

        <button
          id="btn-quick-login-staff"
          type="button"
          @click="handleQuickLogin('staff')"
          class="flex flex-col items-center justify-center p-3 bg-[#f8f9fa] border border-transparent hover:bg-white hover:border-[#1a1a1a] duration-200 transition-all rounded-[24px] text-center group cursor-pointer"
        >
          <UserCheck class="w-5 h-5 text-[#40c057] group-hover:text-[#1a1a1a] mb-1.5" />
          <span class="font-sans font-bold text-[10px] text-[#1a1a1a]">CASHIER STAFF</span>
          <span class="text-[8px] text-[#868e96] mt-0.5">Fast POS Checkouts</span>
        </button>

        <button
          id="btn-quick-login-customer"
          type="button"
          @click="handleQuickLogin('customer')"
          class="flex flex-col items-center justify-center p-3 bg-[#f8f9fa] border border-transparent hover:bg-white hover:border-[#1a1a1a] duration-200 transition-all rounded-[24px] text-center group cursor-pointer"
        >
          <ShoppingBag class="w-5 h-5 text-[#228be6] group-hover:text-[#1a1a1a] mb-1.5" />
          <span class="font-sans font-bold text-[10px] text-[#1a1a1a]">CONSUMER / GUEST</span>
          <span class="text-[8px] text-[#868e96] mt-0.5">Self-Ordering Kiosk</span>
        </button>
      </div>

      <!-- Footer instructions -->
      <p class="text-[11px] text-center text-[#868e96] mt-6 leading-relaxed font-bold uppercase tracking-wider">
        Demo Engine • Safe Local Storage persistence
      </p>
    </div>
  </div>
</template>
