<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { useStore } from "../store";
import { Product } from "../types";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Boxes 
} from "lucide-vue-next";

const store = useStore();
const products = store.products;
const categories = store.categories;

// Local query states
const mgmtSearch = ref("");
const mgmtCategory = ref("all");

// Modal control states
const isModalOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selectedProduct = ref<Product | null>(null);

// Form states
const sku = ref("");
const name = ref("");
const barcode = ref("");
const categoryId = ref("");
const purchasePrice = ref(0);
const sellingPrice = ref(0);
const stock = ref(0);
const unit = ref("pcs");
const minStock = ref(10);
const cartonConversion = ref(12);
const description = ref("");

const formatRupiah = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

// Filter products
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(mgmtSearch.value.toLowerCase()) ||
      p.sku.toLowerCase().includes(mgmtSearch.value.toLowerCase()) ||
      p.barcode.includes(mgmtSearch.value);
    const matchesCategory = mgmtCategory.value === "all" || p.categoryId === mgmtCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const resetForm = () => {
  sku.value = "";
  name.value = "";
  barcode.value = "";
  categoryId.value = categories.value[0]?.id || "";
  purchasePrice.value = 0;
  sellingPrice.value = 0;
  stock.value = 0;
  unit.value = "pcs";
  minStock.value = 10;
  cartonConversion.value = 12;
  description.value = "";
  selectedProduct.value = null;
};

const handleOpenAdd = () => {
  modalMode.value = "add";
  resetForm();
  isModalOpen.value = true;
};

const handleOpenEdit = (prod: Product) => {
  modalMode.value = "edit";
  selectedProduct.value = prod;
  sku.value = prod.sku;
  name.value = prod.name;
  barcode.value = prod.barcode;
  categoryId.value = prod.categoryId;
  purchasePrice.value = prod.purchasePrice;
  sellingPrice.value = prod.sellingPrice;
  stock.value = prod.stock;
  unit.value = prod.unit;
  minStock.value = prod.minStock;
  cartonConversion.value = prod.cartonConversion;
  description.value = prod.description || "";
  isModalOpen.value = true;
};

const handleDelete = (id: string, name: string) => {
  if (window.confirm(`Are you absolutely sure you want to delete '${name}' from catalog inventory?`)) {
    store.deleteProduct(id);
  }
};

const handleSaveProduct = () => {
  if (!name.value.trim() || !sku.value.trim() || !categoryId.value) return;

  const prodData = {
    sku: sku.value,
    name: name.value,
    barcode: barcode.value,
    categoryId: categoryId.value,
    purchasePrice: Number(purchasePrice.value),
    sellingPrice: Number(sellingPrice.value),
    stock: Number(stock.value),
    unit: unit.value,
    minStock: Number(minStock.value),
    cartonConversion: Number(cartonConversion.value),
    description: description.value,
  };

  if (modalMode.value === "add") {
    store.addProduct(prodData);
  } else if (modalMode.value === "edit" && selectedProduct.value) {
    store.updateProduct({
      ...prodData,
      id: selectedProduct.value.id,
    });
  }

  isModalOpen.value = false;
  resetForm();
};

const autofillBarcodeAndSKU = () => {
  if (!name.value) return;
  const cleanName = name.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  sku.value = `KAPI-${cleanName}-${randomSuffix}`;
  barcode.value = "899" + Math.floor(1000000000 + Math.random() * 9000000000);
};
</script>

<template>
  <div id="product-management-view" class="p-8 space-y-8 h-full overflow-y-auto">
    <!-- Title block -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 border border-[#e9ecef] rounded-[32px] shadow-sm">
      <div class="text-left">
        <h2 class="font-sans font-bold text-2xl text-[#1a1a1a] tracking-tight">
          Catalog & Stock Management
        </h2>
        <p class="text-xs text-[#868e96] font-semibold mt-1">
          Declare items, define purchase costs, consumer prices and set packaging box ratios.
        </p>
      </div>

      <button
        id="btn-add-product"
        @click="handleOpenAdd"
        class="bg-[#1a1a1a] text-white py-3 px-5 rounded-full font-bold text-xs hover:bg-black transition-all flex items-center space-x-1.5 mt-4 md:mt-0 shadow-md shadow-black/10 cursor-pointer border border-transparent"
      >
        <Plus class="w-4 h-4" />
        <span>New Product</span>
      </button>
    </div>

    <!-- Filter and search bar layout -->
    <div class="bg-white p-5 border border-[#e9ecef] rounded-[24px] flex flex-wrap gap-4 items-center justify-between shadow-xs">
      <div class="flex items-center space-x-3 w-full md:w-auto flex-grow max-w-md">
        <div class="relative w-full">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#adb5bd]">
            <Search class="w-4 h-4" />
          </span>
          <input
            id="mgmt-search-input"
            type="text"
            placeholder="Search product name, SKU or barcode..."
            v-model="mgmtSearch"
            class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl pl-10 pr-4 py-3 font-semibold text-[#1a1a1a] placeholder-[#adb5bd] border border-transparent focus:bg-white focus:border-[#1a1a1a]"
          />
        </div>
      </div>

      <div class="flex items-center space-x-3 w-full md:w-auto">
        <span class="text-xs font-bold text-[#868e96] uppercase tracking-widest">Group Category:</span>
        <select
          id="mgmt-category-select"
          v-model="mgmtCategory"
          class="bg-[#f1f3f5] border-transparent text-xs px-4 py-2.5 rounded-2xl outline-none font-bold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a] cursor-pointer"
        >
          <option value="all">Check All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Inventory Listings Table -->
    <div class="bg-white border border-[#e9ecef] rounded-[32px] overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#f8f9fa] border-b border-[#e9ecef]">
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">Product Info</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest">SKU / Barcode</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-right">Cost Price</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-right">Retail Price</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-center">Packaging conversion</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-center">Remaining Stock</th>
              <th class="p-4 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e9ecef]">
            <tr v-if="filteredProducts.length === 0">
              <td colSpan="7" class="p-8 text-center text-xs font-semibold text-[#868e96]">
                No inventory matches found. Refine your query or create a new product.
              </td>
            </tr>
            <tr v-else v-for="p in filteredProducts" :key="p.id" class="hover:bg-[#f8f9fa] transition-colors duration-150">
              <!-- Name info -->
              <td class="p-4 max-w-[240px]">
                <div class="font-sans font-bold text-sm text-[#1a1a1a] truncate">{{ p.name }}</div>
                <span class="text-[9px] text-[#adb5bd] uppercase tracking-wider font-bold">
                  {{ categories.find((c) => c.id === p.categoryId)?.name || "Uncategorized" }}
                </span>
              </td>

              <!-- Stock references -->
              <td class="p-4">
                <div class="font-mono text-xs text-[#228be6] font-bold">{{ p.sku }}</div>
                <span class="font-sans text-[10px] text-[#868e96] tracking-tight truncate block font-bold mt-0.5">
                  Barcode ID: {{ p.barcode || "N/A" }}
                </span>
              </td>

              <!-- Buy rate -->
              <td class="p-4 text-right font-mono text-xs text-[#868e96] font-bold">
                {{ formatRupiah(p.purchasePrice) }}
              </td>

              <!-- Sell rate -->
              <td class="p-4 text-right font-mono text-xs text-[#228be6] font-bold">
                {{ formatRupiah(p.sellingPrice) }}
              </td>

              <!-- Box conversions -->
              <td class="p-4 text-center">
                <div class="inline-flex items-center space-x-1 bg-[#fff9db] px-3 py-1 rounded-full text-[10px] font-bold text-[#f59f00]">
                  <Boxes class="w-3.5 h-3.5 text-[#f59f00]" />
                  <span>1 Box = {{ p.cartonConversion }} {{ p.unit }}</span>
                </div>
              </td>

              <!-- Quantitative stock count -->
              <td class="p-4">
                <div class="flex flex-col items-center">
                  <span 
                    :class="[
                      'font-mono text-xs font-black px-3 py-1 rounded-full border',
                      p.stock <= p.minStock 
                        ? 'bg-[#fff5f5] text-[#fa5252] border-[#ffe3e3]' 
                        : 'bg-[#ebfbee] text-[#40c057] border-[#d3f9d8]'
                    ]"
                  >
                    {{ p.stock }} {{ p.unit }}
                  </span>
                  <span v-if="p.stock <= p.minStock" class="text-[9px] text-[#fa5252] font-semibold mt-1 text-center flex items-center leading-tight">
                    <AlertTriangle class="w-3 h-3 mr-0.5 text-[#fa5252]" strokeWidth="2.5" /> RE-STOCK
                  </span>
                </div>
              </td>

              <!-- Table actions column -->
              <td class="p-4">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    :id="`btn-edit-prod-${p.id}`"
                    @click="handleOpenEdit(p)"
                    class="p-1.5 px-3 bg-white border border-[#dee2e6] hover:border-[#1a1a1a] text-xs font-bold rounded-full text-[#495057] hover:text-[#1a1a1a] flex items-center cursor-pointer transition-all"
                  >
                    <Edit2 class="w-3 h-3 mr-1" /> Edit
                  </button>
                  <button
                    :id="`btn-delete-prod-${p.id}`"
                    @click="handleDelete(p.id, p.name)"
                    class="p-1.5 px-3 bg-[#fff5f5] border border-[#ffe3e3] hover:border-[#fa5252] text-xs font-bold rounded-full text-[#fa5252] flex items-center cursor-pointer transition-all"
                  >
                    <Trash2 class="w-3 h-3 mr-1" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- COMPONENT MODAL - Add/Edit panel container -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
      <div class="bg-white border border-[#e9ecef] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        <!-- Modal header -->
        <div class="p-5 border-b border-[#e9ecef] bg-[#f8f9fa] flex items-center justify-between">
          <h3 class="font-sans font-bold text-base text-[#1a1a1a] tracking-tight text-left">
            {{ modalMode === "add" ? "Register New Catalog Item" : `Modify - ${selectedProduct?.name}` }}
          </h3>
          <button 
            @click="isModalOpen = false"
            class="text-[#868e96] hover:text-[#1a1a1a] cursor-pointer transition-colors w-7 h-7 rounded-full hover:bg-slate-200/50 flex justify-center items-center"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Scrollable Form -->
        <form @submit.prevent="handleSaveProduct" class="p-6 space-y-4 overflow-y-auto text-left">
          <div class="grid grid-cols-2 gap-4">
            
            <!-- Product Name -->
            <div class="col-span-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                v-model="name"
                placeholder="e.g. Cafe Caramel Blend"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- SKU Code generation helper -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                SKU Code *
              </label>
              <div class="flex space-x-1.5">
                <input
                  type="text"
                  required
                  v-model="sku"
                  placeholder="e.g. KAPI-COF-120"
                  class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
                />
                <button
                  type="button"
                  @click="autofillBarcodeAndSKU"
                  class="border border-[#dee2e6] hover:bg-[#f1f3f5] text-[#1a1a1a] font-bold text-[9px] px-3.5 rounded-2xl tracking-widest uppercase cursor-pointer transition-all shrink-0"
                >
                  Autogen
                </button>
              </div>
            </div>

            <!-- Barcode reference -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                EAN Barcode ID
              </label>
              <input
                type="text"
                v-model="barcode"
                placeholder="e.g. 899123456"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Category ID mapping -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Group Category *
              </label>
              <select
                v-model="categoryId"
                required
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a] cursor-pointer"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Unit description -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Primary Unit
              </label>
              <input
                type="text"
                v-model="unit"
                placeholder="pcs, cup, slice"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Purchase Cost -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Base Purchase price (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                v-model="purchasePrice"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Selling price -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Customer Retail Price (Rp) *
              </label>
              <input
                type="number"
                required
                min="1"
                v-model="sellingPrice"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Physical Stock limit -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Physical Stock Count *
              </label>
              <input
                type="number"
                required
                min="0"
                v-model="stock"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Warning threshold -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Min Stock alert *
              </label>
              <input
                type="number"
                required
                min="1"
                v-model="minStock"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a]"
              />
            </div>

            <!-- Box ratio conversion -->
            <div class="col-span-2 bg-[#fff9db]/40 p-4 rounded-2xl border border-[#ffe3e3]/40">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#f59f00] mb-2 font-sans">
                Carton Conversion Ratio
              </label>
              <div class="flex items-center space-x-3">
                <span class="text-xs text-[#1a1a1a] font-semibold">1 Box consisting of:</span>
                <input
                  type="number"
                  required
                  min="1"
                  v-model="cartonConversion"
                  class="w-24 bg-white border border-[#dee2e6] rounded-full px-3 py-1.5 text-xs text-center font-mono font-bold text-[#f59f00] focus:border-[#f59f00] outline-none"
                />
                <span class="text-xs text-[#868e96] font-bold">units of primary unit ({{ unit }})</span>
              </div>
              <p class="text-[10px] text-[#868e96] mt-2 leading-relaxed font-sans">
                This determines carton price automatically on checkouts (Box Price = Selling Price x Conversion Factor).
              </p>
            </div>

            <!-- Descr block -->
            <div class="col-span-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Item Description
              </label>
              <textarea
                rows="2"
                v-model="description"
                placeholder="Specify taste notes, storage instructions or serving specifications..."
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-2xl px-4 py-3 font-semibold text-[#1a1a1a] focus:bg-white focus:border-[#1a1a1a] resize-none"
              />
            </div>

          </div>

          <!-- Modal footer submit buttons -->
          <div class="pt-5 border-t border-[#e9ecef] flex items-center justify-end space-x-3">
            <button
              type="button"
              @click="isModalOpen = false"
              class="bg-white border border-[#dee2e6] text-xs font-bold px-6 py-3 rounded-full text-[#495057] hover:bg-[#f1f3f5] cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              id="btn-modal-save-product"
              type="submit"
              class="bg-[#1a1a1a] text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-black cursor-pointer transition-all shadow-md shadow-black/10"
            >
              {{ modalMode === "add" ? "Add to Catalog" : "Save Changes" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
