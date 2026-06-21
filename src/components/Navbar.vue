<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, onMounted, onUnmounted } from "vue";
import { useStore } from "../store";
import { Clock, Wifi, MapPin } from "lucide-vue-next";

const store = useStore();
const currentUser = store.currentUser;
const time = ref("");

let intervalId: any = null;

const updateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

onMounted(() => {
  updateTime();
  intervalId = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <header 
    v-if="currentUser"
    id="kapi-navbar"
    class="h-[84px] bg-white border-b border-[#e9ecef] flex items-center justify-between px-8 flex-shrink-0"
  >
    <div class="flex items-center space-x-6">
      <div class="flex items-center space-x-2 text-[#495057]">
        <MapPin class="w-4 h-4 text-[#228be6]" />
        <span class="text-sm font-bold text-[#1a1a1a]">Outlet Utama (Bandung)</span>
      </div>
      <div class="h-5 w-px bg-[#e9ecef]" />
      <div class="flex items-center space-x-1.5 text-xs font-bold text-[#40c057] bg-[#ebfbee] px-3 py-1 rounded-full border border-[#d3f9d8]">
        <Wifi class="w-3.5 h-3.5" />
        <span class="uppercase tracking-wider">SYSTEM CONNECTED</span>
      </div>
    </div>

    <div class="flex items-center space-x-6">
      <!-- Live Clock Digital Indicator -->
      <div class="flex items-center space-x-2 text-[#495057] font-mono text-xs bg-[#f1f3f5] px-4 py-2 rounded-2xl border border-transparent">
        <Clock class="w-4 h-4 text-[#868e96]" />
        <span class="font-bold text-[#1a1a1a]">{{ time }}</span>
        <span class="text-[10px] text-[#868e96] font-sans font-bold">WIB</span>
      </div>
    </div>
  </header>
</template>
