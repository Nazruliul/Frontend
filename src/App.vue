<script setup lang="ts">


import { useStore } from "./store";
import Sidebar from "./components/Sidebar.vue";
import Navbar from "./components/Navbar.vue";
import Login from "./views/Login.vue";
import DashboardAdmin from "./views/DashboardAdmin.vue";
import DashboardUser from "./views/DashboardUser.vue";
import ProductManagement from "./views/ProductManagement.vue";
import ProductCatalog from "./views/ProductCatalog.vue";
import PosTransaction from "./views/PosTransaction.vue";
import TransactionHistoryAdmin from "./views/TransactionHistoryAdmin.vue";
import TransactionHistoryUser from "./views/TransactionHistoryUser.vue";
import CustomerPortal from "./views/CustomerPortal.vue";
import GitCommitPlanner from "./views/GitCommitPlanner.vue";

const { currentUser, currentView } = useStore();
</script>

<template>
  <!-- If no user is authenticated, force render login view -->
  <Login v-if="!currentUser" />

  <div 
    v-else
    id="kapi-app-container"
    class="flex h-screen w-screen overflow-hidden bg-[#F4F5F7] text-[#041b3c]"
  >
    <!-- Sidebar persists on the left (240px width) -->
    <Sidebar />

    <!-- Main workspace layout -->
    <div class="flex-grow flex flex-col h-full overflow-hidden">
      <!-- Top Navbar Header -->
      <Navbar />

      <!-- Dynamic nested body -->
      <main 
        id="kapi-main-viewport"
        class="flex-grow overflow-hidden relative"
      >
        <!-- Subtle fade visual container -->
        <div class="w-full h-full transition-opacity duration-200 ease-in-out">
          <DashboardAdmin v-if="currentView === 'dashboard-admin'" />
          <DashboardUser v-else-if="currentView === 'dashboard-user'" />
          <ProductManagement v-else-if="currentView === 'product-management'" />
          <ProductCatalog v-else-if="currentView === 'catalog-user'" />
          <PosTransaction v-else-if="currentView === 'pos'" />
          <TransactionHistoryAdmin v-else-if="currentView === 'history-admin'" />
          <TransactionHistoryUser v-else-if="currentView === 'history-user'" />
          <CustomerPortal v-else-if="currentView === 'customer-portal'" />
          <GitCommitPlanner v-else-if="currentView === 'git-commit-planner'" />
          <div v-else class="flex items-center justify-center h-full text-sm text-slate-500 font-semibold p-8 text-center bg-white border border-[#DCDFE4] rounded m-6">
            Module under active development. Select alternative navigation option.
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
