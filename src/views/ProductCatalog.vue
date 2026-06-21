<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Product } from "../types";
import { Search, ShoppingBag, AlertTriangle, Eye } from "lucide-vue-next";

const store = useStore();
const products = store.products;
const categories = store.categories;

const selectedSubCat = ref("all");
const catSearch = ref("");
const activeDetailProd = ref<Product | null>(null);

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Filter logic
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

const selectCategory = (catId: string) => {
  selectedSubCat.value = catId;
};

const showDetail = (p: Product) => {
  activeDetailProd.value = p;
};

const closeDetail = () => {
  activeDetailProd.value = null;
};
</script>

<template>
  <div id="product-catalog-view" class="p-8 space-y-8 h-full overflow-y-auto bg-slate-50/40">
    <!-- Title -->
    <div class="bg-white px-8 py-6 rounded-[24px] border border-[#e9ecef] shadow-xs">
      <h2 class="font-sans font-black text-2xl text-[#1a1a1a] tracking-tight">
        Store Product Catalog
      </h2>
      <p class="text-xs text-[#868e96] mt-1 tracking-wide leading-relaxed">
        Browse items. Standard piece rates are integrated with carton pack quantities to aid instant validation.
      </p>
    </div>

    <!-- Control Filters -->
    <div class="bg-white p-5 border border-[#e9ecef] rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#868e96]">
          <Search class="w-4 h-4" />
        </span>
        <input
          id="catalog-search-input"
          type="text"
          placeholder="Type drink, pastry, SKU number..."
          v-model="catSearch"
          class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-xl pl-9 pr-4 py-3 placeholder-[#adb5bd] text-[#1a1a1a] font-medium focus:bg-white focus:border-[#1a1a1a] transition-all"
        />
      </div>

      <!-- Category custom tabs -->
      <div class="flex bg-[#f1f3f5] p-1.5 rounded-xl border border-[#e9ecef] overflow-x-auto max-w-full">
        <button
          @click="selectCategory('all')"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer',
            selectedSubCat === 'all'
              ? 'bg-[#1a1a1a] text-white shadow-xs'
              : 'text-[#495057] hover:text-[#1a1a1a]'
          ]"
        >
          Show All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer',
            selectedSubCat === cat.id
              ? 'bg-[#1a1a1a] text-white shadow-xs'
              : 'text-[#495057] hover:text-[#1a1a1a]'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Display product items grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
      <div v-if="filteredProducts.length === 0" class="col-span-full py-16 text-center text-[#868e96] bg-white border border-[#e9ecef] rounded-3xl shadow-xs font-bold text-xs">
        No listing items matched your search query in this category tab.
      </div>
      <div
        v-else
        v-for="p in filteredProducts"
        :key="p.id"
        :id="`catalog-product-card-${p.id}`"
        class="bg-white border border-[#e9ecef] hover:border-[#1a1a1a] transition-all rounded-[24px] flex flex-col justify-between overflow-hidden relative group shadow-xs"
      >
        <!-- Upper graphic image block. Design has 80px touch target specs for card tiles. -->
        <div class="h-32 bg-[#f8f9fa] flex items-center justify-center border-b border-[#e9ecef] relative">
          <ShoppingBag class="w-12 h-12 text-[#adb5bd]/30" />
          
          <!-- Category overlay -->
          <span class="absolute top-3 left-3 text-[8px] font-black tracking-widest uppercase bg-white text-[#1a1a1a] px-2.5 py-1 rounded-lg border border-[#e9ecef] shadow-xs">
            {{ categories.find((c) => c.id === p.categoryId)?.name || "Other" }}
          </span>

          <!-- Stock tag -->
          <span :class="[
            'absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border',
            p.stock <= p.minStock 
              ? 'bg-[#fff0f0] text-[#fa5252] border-[#ffe3e3]' 
              : 'bg-[#ebfbee] text-[#2b8a3e] border-[#d3f9d8]'
          ]">
            Stock: {{ p.stock }}
          </span>
        </div>

        <!-- Listing description -->
        <div class="p-5 flex-grow flex flex-col justify-between">
          <div>
            <span class="text-[9px] font-mono font-bold text-[#adb5bd] tracking-wide block uppercase">SKU {{ p.sku }}</span>
            <h4 class="font-sans font-extrabold text-sm text-[#1a1a1a] line-clamp-1 mt-1 tracking-tight">
              {{ p.name }}
            </h4>
            <p v-if="p.description" class="text-[11px] text-[#868e96] line-clamp-2 mt-1.5 leading-relaxed font-medium">
              {{ p.description }}
            </p>
          </div>

          <!-- Pricing and Carton breakdowns -->
          <div class="mt-4 pt-3.5 border-t border-[#f1f3f5]">
            <div class="flex justify-between items-baseline">
              <span class="text-[9px] font-bold text-[#868e96] uppercase tracking-widest font-sans">PCS Rate</span>
              <span class="font-mono text-sm font-black text-[#228be6]">
                {{ formatRupiah(p.sellingPrice) }}
              </span>
            </div>

            <div class="flex justify-between items-baseline mt-1.5">
              <span class="text-[9px] font-bold text-[#868e96] uppercase tracking-widest font-sans flex items-center gap-1">
                Box ({p.cartonConversion} pcs)
              </span>
              <span class="font-mono text-xs font-bold text-[#f76707]">
                {{ formatRupiah(p.sellingPrice * p.cartonConversion) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inspect Action Layer -->
        <div class="p-3 bg-[#f8f9fa] border-t border-[#e9ecef] flex justify-end">
          <button
            @click="showDetail(p)"
            class="w-full bg-white text-xs font-bold py-2 border border-[#dee2e6] text-[#495057] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>Quick Inspect</span>
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK INSPECT DIALOG DIAL / MODAL BOX  -->
    <div v-if="activeDetailProd" class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white border border-[#e9ecef] w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden">
        <div class="p-5 bg-white border-b border-[#e9ecef] flex items-center justify-between">
          <span class="text-xs font-black text-[#228be6] font-mono tracking-wider">
            SKU {{ activeDetailProd.sku }}
          </span>
          <button 
            @click="closeDetail"
            class="text-[#adb5bd] hover:text-[#1a1a1a] font-bold text-sm w-8 h-8 rounded-full hover:bg-[#f1f3f5] flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div class="text-center pb-4 border-b border-[#e9ecef] gap-2.5 flex flex-col items-center">
            <ShoppingBag class="w-12 h-12 text-[#1a1a1a] mb-1" />
            <h3 class="font-sans font-black text-lg text-[#1a1a1a]">
              {{ activeDetailProd.name }}
            </h3>
            <span class="text-[10px] bg-[#f8f9fa] px-3.5 py-1 rounded-full text-[#495057] uppercase font-bold tracking-widest border border-[#dee2e6]">
              {{ categories.find(c => c.id === activeDetailProd?.categoryId)?.name || "Drink Product" }}
            </span>
          </div>

          <div v-if="activeDetailProd.description">
            <h5 class="text-[10px] uppercase font-black tracking-widest text-[#868e96] mb-2 font-sans">Product Description</h5>
            <p class="text-xs text-[#495057] leading-relaxed bg-[#f8f9fa] p-4 rounded-2xl border border-[#e9ecef]/60 font-medium">
              {{ activeDetailProd.description }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="bg-[#f3f0ff]/50 p-3 rounded-2xl border border-[#e5dbff]/50">
              <span class="text-[8px] uppercase tracking-wider font-bold text-[#7048e8] block font-sans">PCS Selling Rate</span>
              <div class="font-mono text-xs font-black text-[#7048e8] mt-1">
                {{ formatRupiah(activeDetailProd.sellingPrice) }}
              </div>
            </div>

            <div class="bg-[#fff4e6]/50 p-3 rounded-2xl border border-[#ffe8cc]/50">
              <span class="text-[8px] uppercase tracking-wider font-bold text-[#f76707] block font-sans">Carton (Box of {{ activeDetailProd.cartonConversion }})</span>
              <div class="font-mono text-xs font-black text-[#f76707] mt-1">
                {{ formatRupiah(activeDetailProd.sellingPrice * activeDetailProd.cartonConversion) }}
              </div>
            </div>

            <div class="bg-[#f8f9fa] p-3 rounded-2xl border border-[#e9ecef]">
              <span class="text-[8px] uppercase tracking-wider font-bold text-[#495057] block font-sans">EAN Barcode</span>
              <div class="font-mono text-[10px] font-bold text-[#1a1a1a] mt-1">
                {{ activeDetailProd.barcode || "—" }}
              </div>
            </div>

            <div class="bg-[#ebfbee]/50 p-3 rounded-2xl border border-[#d3f9d8]/50">
              <span class="text-[8px] uppercase tracking-wider font-bold text-[#2b8a3e] block font-sans">Physical stock</span>
              <div class="font-mono text-xs font-black text-[#2b8a3e] mt-1">
                {{ activeDetailProd.stock }} / {{ activeDetailProd.minStock }} min
              </div>
            </div>
          </div>

          <div v-if="activeDetailProd.stock <= activeDetailProd.minStock" class="bg-[#fff0f0] border border-[#ffe3e3] p-3.5 rounded-2xl text-xs text-[#fa5252] font-semibold flex items-center">
            <AlertTriangle class="w-4 h-4 mr-2 shrink-0 text-[#fa5252]" />
            <span>Physical storage matches minimum alerts trigger limit.</span>
          </div>
        </div>

        <div class="p-5 bg-[#f8f9fa] border-t border-[#e9ecef] flex">
          <button
            @click="closeDetail"
            class="w-full bg-[#1a1a1a] hover:bg-black text-white font-bold text-xs py-4 rounded-full transition-all active:scale-95 uppercase tracking-wider cursor-pointer text-center"
          >
            Close Inspect Window
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
