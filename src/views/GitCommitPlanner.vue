<script setup lang="ts">
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, computed } from "vue";
import { 
  GitBranch, 
  GitCommit, 
  Github, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle, 
  Calendar, 
  Info, 
  Sparkles,
  Flame,
  UserCheck
} from "lucide-vue-next";

// Local state
const startDate = ref("2026-05-28"); // Default 2 weeks ago (from June 11)
const endDate = ref("2026-06-11");
const commitsPerDay = ref(2);
const skipWeekends = ref(true);
const studentStyle = ref(true); // Indonesian/Malay student commit messages
const activeTab = ref<"bash" | "powershell" | "tips">("bash");
const isCopied = ref(false);

interface SimulatedCommit {
  date: string;
  count: number;
  messages: string[];
}

// Preset messages optimized for their Cashier / KAPI POS app
const studentCommitPresets = [
  "init project vue 3 vite tailwind",
  "benerin folder structure sama setup linter",
  "bikin file types.ts sama model database",
  "bikin sidebar component sama navbar layout",
  "tambah store.ts buat state management lokal",
  "benerin bug di store pas load localstorage",
  "tambah file Login.vue draft awal",
  "layout login kelar, tambah validasi error",
  "slicing dashboard admin page gokil",
  "bikin chart rechart buat dashboard admin",
  "layouting product catalog, ganti warna dikit",
  "tambah fitur dialog quick inspect catalog",
  "bikin fungsi formatting rupiah biar ga pusing",
  "slicing halaman transaksi kasir pos",
  "tambah fungsi add to cart di pos biar lancar",
  "bikin switch satuan box vs pcs",
  "tambah diskon input di kasir",
  "bikin modal checkout beneran ada qrisnya",
  "bikin nota belanja modal popup print",
  "tambah stok adjustment pas checkout kelar",
  "slicing edit product management page",
  "tambah fitur autogen barcode sku",
  "bikin fitur delete & edit product update store",
  "bikin halaman history transaksi admin",
  "tambah fitur void biar balikin stok barang",
  "bikin history transaksi khusus cashiers",
  "benerin bug transisi route",
  "lutfi bantuin benerin css flexbox bocor",
  "benerin linter tsc noEmit aman sentosa",
  "siap demo besok bismillah",
];

const formalCommitPresets = [
  "Initial commit with scaffolded Vue 3, Vite and Tailwind CSS architecture",
  "Establish shared system guidelines, tsconfig configurations and linter setup",
  "Define core application data models and schemas in types.ts",
  "Build reusable Sidebar navigation and layout shell views",
  "Implement global reactive state engine inside store.ts",
  "Fix localstorage deserialization handlers inside store setup",
  "Create secure Login responsive form layouts",
  "Implement state guards and authorization redirects on login helper",
  "Develop high-fidelity Dashboard analytics workspace widgets",
  "Add lightweight key performance indicator graphs inside admin board",
  "Structure Product Catalog responsive layout components",
  "Incorporate detailed quick-inspection modals on catalog cards",
  "Define localized Indonesian currency utility formatter",
  "Create Point of Sale transaction terminal interface grid",
  "Implement dynamic interactive pricing rules and cart state",
  "Incorporate packing conversion rules (Loose pcs vs Carton box)",
  "Develop cart deduction mechanisms for applied discount promo codes",
  "Design QRIS, Debit and Cash multi-mode checkout systems",
  "Develop printable receipt drawer layout formats",
  "Enforce strict catalog inventory stock decrements upon successful checkout",
  "Build out full administrative inventory management tables",
  "Integrate randomized EAN barcode IDs and SKU code auto-generation features",
  "Implement fully responsive product add, edit and delete routines",
  "Create master Transaction Histories logs for audited trails",
  "Develop automated stock restoration actions for cancelled (voided) sales",
  "Incorporate contextual transaction list views filtered for staff cashier shifts",
  "Resolve routing transition flickering states across layout frames",
  "Refactor responsive flex containers and fix padding spills on mobile devices",
  "Audit codebase for strict TypeScript compilation compliance",
  "Final production builds verification and linter checks completed successfully"
];

// Active message pool
const currentPresets = computed(() => {
  return studentStyle.value ? studentCommitPresets : formalCommitPresets;
});

// Generate dynamic commits across dates
const simulatedHistory = computed<SimulatedCommit[]>(() => {
  const list: SimulatedCommit[] = [];
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const dateCursor = new Date(start);
  let presetIndex = 0;

  while (dateCursor <= end) {
    const dayOfWeek = dateCursor.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let count = 0;
    if (!(skipWeekends.value && isWeekend)) {
      // Randomize commit counts per day slightly around selected commitsPerDay
      const randomFactor = Math.random() < 0.2 ? -1 : (Math.random() > 0.7 ? 1 : 0);
      count = Math.max(0, commitsPerDay.value + randomFactor);
    }

    if (count > 0) {
      const messages: string[] = [];
      for (let i = 0; i < count; i++) {
        const msg = currentPresets.value[presetIndex % currentPresets.value.length];
        messages.push(msg);
        presetIndex++;
      }
      
      list.push({
        date: dateCursor.toISOString().slice(0, 10),
        count,
        messages
      });
    } else {
      list.push({
        date: dateCursor.toISOString().slice(0, 10),
        count: 0,
        messages: []
      });
    }

    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  return list;
});

// GitHub graph helper variables
const totalCommitsInPeriod = computed(() => {
  return simulatedHistory.value.reduce((sum, item) => sum + item.count, 0);
});

// Color based on commit quantity
const getContributionBg = (count: number) => {
  if (count === 0) return "bg-slate-100 border-slate-200/50";
  if (count <= 1) return "bg-[#d6f5d6] border-[#adebad] text-[#1e5a1e]";
  if (count <= 2) return "bg-[#8ce08c] border-[#5cd65c] text-[#143d14]";
  if (count <= 3) return "bg-[#3cd070] border-[#29a352] text-white";
  return "bg-[#196127] border-[#103e19] text-white";
};

// Generate BASH Script matching current settings
const generatedBashScript = computed(() => {
  let script = `#!/bin/bash
# =========================================================================
# GITHUB COMMIT SPREADER SCRIPT (GURU-PROOF)
# Deskripsi: Menulis ulang sejarah commit Git secara terpisah dalam rentang waktu
# agar tidak terlihat dikerjakan dalam semalam (AI Generated feel langsung hilang!).
# =========================================================================

echo "🔄 Memulai proses rekonstruksi riwayat commit Git..."
git init

# Pastikan nama branch defaultnya adalah 'main'
git checkout -b main 2>/dev/null || git checkout main

# File dummy/penanda yang akan diupdate agar commit terpicu alami
touch git-history.txt
echo "===================================" > git-history.txt
echo "Log KAPI POS System Development" >> git-history.txt
echo "===================================" >> git-history.txt
git add git-history.txt
`;

  simulatedHistory.value.forEach((day) => {
    if (day.count === 0) return;
    
    day.messages.forEach((msg, idx) => {
      // Add a random hour between 09:00 and 22:00
      const randomHour = String(Math.floor(9 + Math.random() * 12)).padStart(2, "0");
      const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const timeStr = `${randomHour}:${randomMinute}:${randomSecond}`;
      const isoDateTime = `${day.date}T${timeStr}`;

      script += `
# Commit: ${msg} pada ${day.date} ${timeStr}
echo "[${isoDateTime}] Updated file: ${msg}" >> git-history.txt
git add git-history.txt
export GIT_COMMITTER_DATE="${day.date} ${timeStr}"
export GIT_AUTHOR_DATE="${day.date} ${timeStr}"
git commit -m "${msg.replace(/"/g, '\\"')}" --date "${day.date} ${timeStr}"
`;
    });
  });

  script += `
# Selesai!
echo "✅ Berhasil menyebarkan ${totalCommitsInPeriod.value} commit ke rentang tanggal ${startDate.value} s/d ${endDate.value}!"
echo "💡 Opsional: Silahkan sambungkan ke repositori GitHub baru kamu dengan perintah:"
echo "   git remote add origin <URL_REPOSITORY_GITHU_LO>"
echo "   git push -u origin main"
`;

  return script;
});

// Generate POWERSHELL Script matching current settings
const generatedPowerShellScript = computed(() => {
  let script = `# =========================================================================
# GITHUB COMMIT SPREADER POWERSHELL SCRIPT (GURU-PROOF)
# Deskripsi: Versi PowerShell untuk pengguna OS Windows.
# =========================================================================

Write-Host "🔄 Memulai proses rekonstruksi riwayat commit Git..." -ForegroundColor Cyan
git init

# Pastikan branch default 'main'
git checkout -b main 2>$null; if ($LASTEXITCODE -ne 0) { git checkout main }

# Create baseline dummy file
New-Item -Path . -Name "git-history.txt" -ItemType "file" -Force | Out-Null
Set-Content -Path "git-history.txt" -Value "==================================="
Add-Content -Path "git-history.txt" -Value "Log KAPI POS System Development"
Add-Content -Path "git-history.txt" -Value "==================================="
git add git-history.txt
`;

  simulatedHistory.value.forEach((day) => {
    if (day.count === 0) return;
    
    day.messages.forEach((msg, idx) => {
      const randomHour = String(Math.floor(9 + Math.random() * 12)).padStart(2, "0");
      const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const timeStr = `${randomHour}:${randomMinute}:${randomSecond}`;
      const isoDateTime = `${day.date}T${timeStr}`;

      script += `
# Commit: ${msg}
Add-Content -Path "git-history.txt" -Value "[${isoDateTime}] Updated file: ${msg}"
git add git-history.txt
$env:GIT_COMMITTER_DATE="${day.date}T${timeStr}"
$env:GIT_AUTHOR_DATE="${day.date}T${timeStr}"
git commit -m "${msg.replace(/"/g, '`"')}" --date "${day.date}T${timeStr}"
`;
    });
  });

  script += `
# Hilangkan environment variable agar normal kembali
Remove-Item Env:\\GIT_COMMITTER_DATE
Remove-Item Env:\\GIT_AUTHOR_DATE

Write-Host "✅ Berhasil menyebarkan ${totalCommitsInPeriod.value} commit di Windows!" -ForegroundColor Green
Write-Host "💡 Ketik perintah ini untuk push ke repositori GitHub baru:" -ForegroundColor Yellow
Write-Host "   git remote add origin <URL_REPOSITORY_GITHUB_LO>"
Write-Host "   git push -u origin main" -ForegroundColor Yellow
`;

  return script;
});

const currentScriptText = computed(() => {
  if (activeTab.value === "bash") return generatedBashScript.value;
  return generatedPowerShellScript.value;
});

const copyScriptToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentScriptText.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error("Gagal menyalin script", err);
  }
};
</script>

<template>
  <div id="git-commit-planner-view" class="p-8 space-y-8 h-full overflow-y-auto bg-[#fafbfc]">
    
    <!-- Title Header Banner -->
    <div class="bg-slate-900 text-white px-8 py-6 rounded-[24px] border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
        <Github class="w-64 h-64" />
      </div>
      
      <div class="z-10 text-left">
        <div class="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50 w-fit text-emerald-400 font-sans font-bold text-[10px] tracking-wider uppercase mb-2">
          <Sparkles class="w-3 h-3 text-emerald-400" />
          <span>Evasion Tool & History Generator</span>
        </div>
        <h2 class="font-sans font-black text-2xl tracking-tight">
          Git Commit Spreader (Guru-Proof 🛡️)
        </h2>
        <p class="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
          Ubah sejarah pengerjaan proyek POS kamu agar didistribusikan secara alami selama beberapa minggu ke belakang. Menghindarkan kamu dari kecurigaan bahwa tugas sekolah/kuliah dicoding instan semalam atau diproduksi AI.
        </p>
      </div>

      <div class="z-10 flex items-center space-x-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
        <Flame class="w-5 h-5 text-amber-500" />
        <div>
          <span class="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Total Terencana</span>
          <span class="font-mono text-base font-black text-amber-400">{{ totalCommitsInPeriod }} Commits</span>
        </div>
      </div>
    </div>

    <!-- Main Grid Configuration Workfield -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left sidebar panel: Config params -->
      <div class="space-y-6">
        <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs text-left">
          <h3 class="font-sans font-extrabold text-sm text-[#1a1a1a] mb-5 border-b border-[#f1f3f5] pb-3 flex items-center space-x-2">
            <Calendar class="w-4 h-4 text-[#228be6]" />
            <span>Pengaturan Riwayat</span>
          </h3>

          <div class="space-y-4">
            <!-- Start Date parameter -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Tanggal Mulai (Backdate)
              </label>
              <input
                type="date"
                v-model="startDate"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-xl px-3.5 py-3 font-semibold text-[#1a1a1a]"
              />
              <span class="text-[9px] text-[#868e96] mt-1 block leading-tight">
                Kapan proyek seolah-olah mulai dikerjakan. (Saran: 2-3 minggu lalu).
              </span>
            </div>

            <!-- End Date parameter -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Tanggal Akhir (Penyelesaian)
              </label>
              <input
                type="date"
                v-model="endDate"
                class="w-full bg-[#f1f3f5] border-transparent outline-none text-xs rounded-xl px-3.5 py-3 font-semibold text-[#1a1a1a]"
              />
            </div>

            <!-- Intesity density daily commits -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-1.5">
                Frekuensi Komit Harian (Rata-rata)
              </label>
              <div class="flex items-center space-x-3 bg-[#f1f3f5] p-1.5 rounded-xl">
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  v-model.number="commitsPerDay"
                  class="flex-grow w-full accent-[#1a1a1a]"
                />
                <span class="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {{ commitsPerDay }} /hari
                </span>
              </div>
            </div>

            <!-- Skip weekends -->
            <div class="pt-2">
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="skipWeekends"
                  class="w-4.5 h-4.5 rounded text-[#228be6] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span class="text-xs font-bold text-slate-700 select-none">Beri Jeda Akhir Pekan (Weekend)</span>
              </label>
              <span class="text-[9px] text-[#868e96] mt-1.5 block leading-normal">
                Sangat disarankan diaktifkan agar riwayat terlihat seperti jam kerja normal/sekolah dan tidak mencurigakan.
              </span>
            </div>

            <!-- Tone of commit messages -->
            <div class="pt-2 border-t border-[#f1f3f5] mt-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-[#868e96] mb-2">
                Gaya Bahasa Komit (Commit Style)
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="studentStyle = true"
                  type="button"
                  :class="[
                    'p-2.5 rounded-xl border text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer',
                    studentStyle 
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white border-[#dee2e6] text-slate-600 hover:bg-slate-50'
                  ]"
                >
                  Indo Student Style
                </button>
                <button
                  @click="studentStyle = false"
                  type="button"
                  :class="[
                    'p-2.5 rounded-xl border text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer',
                    !studentStyle 
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white border-[#dee2e6] text-slate-600 hover:bg-slate-50'
                  ]"
                >
                  English Formal
                </button>
              </div>
              <span class="text-[9px] text-[#868e96] mt-1.5 block leading-normal">
                Saran: Gunakan <strong>Indo Student Style</strong> agar terlihat riil diketik sendiri dengan typo tipis-tipis khas pelajar (gurumu ga bakal curiga!).
              </span>
            </div>

          </div>
        </div>
      </div>

      <!-- Right detail workspace: Github graph heatmap & Terminal compiler codes -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Contribution block visualiser mock -->
        <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs text-left">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-sans font-extrabold text-xs text-slate-700 uppercase tracking-widest">
              Simulasi Kontribusi GitHub Kamu
            </h4>
            <span class="text-[10px] text-slate-500 font-mono">{{ startDate }} s/d {{ endDate }}</span>
          </div>

          <!-- Heatmap graph -->
          <div class="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl overflow-x-auto">
            <div class="flex flex-wrap gap-1.5 min-w-[500px]">
              <div
                v-for="day in simulatedHistory"
                :key="day.date"
                :class="[
                  'w-[30px] h-[30px] rounded-lg border flex items-center justify-center font-mono text-[9px] font-bold hover:scale-105 transition-all duration-100 group relative',
                  getContributionBg(day.count)
                ]"
              >
                {{ day.count > 0 ? day.count : '•' }}
                
                <!-- Hover description tooltip -->
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] rounded px-2 py-1 hidden group-hover:block z-30 whitespace-nowrap leading-relaxed shadow-lg">
                  <div class="font-bold">{{ day.date }}</div>
                  <div>{{ day.count }} commit(s)</div>
                  <div v-for="m in day.messages.slice(0, 2)" :key="m" class="text-slate-300 italic max-w-[150px] truncate">
                    - {{ m }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-bold px-1">
              <span>Kurang Aktif</span>
              <div class="flex items-center space-x-1">
                <div class="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></div>
                <div class="w-3.5 h-3.5 rounded bg-[#d6f5d6] border border-[#adebad]"></div>
                <div class="w-3.5 h-3.5 rounded bg-[#8ce08c] border border-[#5cd65c]"></div>
                <div class="w-3.5 h-3.5 rounded bg-[#3cd070] border border-[#29a352]"></div>
                <div class="w-3.5 h-3.5 rounded bg-[#196127] border border-[#103e19]"></div>
              </div>
              <span>Sangat Aktif</span>
            </div>
          </div>
        </div>

        <!-- Terminal script container tabs -->
        <div class="bg-[#1e1e24] text-slate-300 rounded-[24px] shadow-lg border border-slate-800 overflow-hidden text-left flex flex-col h-[400px]">
          
          <!-- Terminal control top bar -->
          <div class="bg-[#121216] px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center space-x-2">
              <Terminal class="w-4 h-4 text-emerald-400" />
              <span class="font-mono text-xs font-black text-slate-200 uppercase tracking-widest">
                AUTOMATED_COMMITS_SCRIPT
              </span>
            </div>

            <!-- Selector tabs -->
            <div class="flex bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/50">
              <button
                @click="activeTab = 'bash'"
                :class="[
                  'px-3 py-1.5 rounded-md text-[10px] font-mono font-bold tracking-wider cursor-pointer duration-150',
                  activeTab === 'bash' ? 'bg-slate-900 text-emerald-400 border border-slate-700/20' : 'text-slate-400 hover:text-white'
                ]"
              >
                macOS / Linux (.sh)
              </button>
              <button
                @click="activeTab = 'powershell'"
                :class="[
                  'px-3 py-1.5 rounded-md text-[10px] font-mono font-bold tracking-wider cursor-pointer duration-150',
                  activeTab === 'powershell' ? 'bg-slate-900 text-emerald-400 border border-slate-700/20' : 'text-slate-400 hover:text-white'
                ]"
              >
                Windows (PowerShell .ps1)
              </button>
              <button
                @click="activeTab = 'tips'"
                :class="[
                  'px-3 py-1.5 rounded-md text-[10px] font-sans font-bold tracking-wider cursor-pointer duration-150 flex items-center',
                  activeTab === 'tips' ? 'bg-indigo-650 text-white border border-indigo-500' : 'text-indigo-400 hover:text-indigo-300'
                ]"
              >
                <UserCheck class="w-3 h-3 mr-1" />
                <span>Tips Rahasia Guru 🤫</span>
              </button>
            </div>
          </div>

          <!-- Terminal display window -->
          <div class="p-5 flex-grow overflow-auto font-mono text-xs leading-relaxed text-emerald-400/90 relative">
            
            <template v-if="activeTab !== 'tips'">
              <!-- Copy button floating -->
              <button
                @click="copyScriptToClipboard"
                class="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5 hover:shadow-md hover:text-emerald-400"
              >
                <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span class="text-[10px] font-bold">{{ isCopied ? 'Copied!' : 'Copy Script' }}</span>
              </button>

              <pre class="whitespace-pre overflow-x-auto max-w-full text-[11px] text-slate-300">{{ currentScriptText }}</pre>
            </template>

            <!-- Guide and evasion safety tips in Indonesian -->
            <template v-else>
              <div class="text-slate-200 font-sans space-y-4 max-w-full overflow-hidden leading-relaxed pr-2">
                <div class="bg-indigo-950/40 border border-indigo-900/50 p-4 rounded-xl text-indigo-300 flex items-start">
                  <Info class="w-5 h-5 mr-3 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <h5 class="text-xs font-extrabold uppercase tracking-wide">Mengapa komit spread itu penting?</h5>
                    <p class="text-[11px] mt-1 text-slate-300 leading-normal">
                      Guru atau asisten dosen pembuat tugas sering memeriksa tab <strong>Insights > Network / Contributors</strong> di GitHub. Jika proyek luar biasa rapi tapi riwayat commit-nya cuma 1 commit atau terpusat dalam 1 jam kerja, gurumu akan curiga bahwa kamu mencontek atau memakai hasil jasa joki/AI secara instan.
                    </p>
                  </div>
                </div>

                <h4 class="text-white font-bold text-sm flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                  <span class="bg-indigo-600 w-2 h-2 rounded-full block"></span>
                  <span>🛡️ 5 Langkah Rahasia Agar Lolos Pemeriksaan Gurumu</span>
                </h4>

                <ol class="space-y-3.5 list-decimal list-inside text-[11px] text-slate-300 ml-1">
                  <li>
                    <strong class="text-emerald-400">Gunakan Akun GitHub & Git Config yang Sama:</strong><br />
                    <span class="text-slate-400">Pastikan setting Git local sebelum komit sudah sesuai akun GitHub pribadimu. Jalankan perintah di terminal laptopmu:</span>
                    <pre class="bg-slate-900 p-2 rounded-lg text-slate-300 mt-1 font-mono text-[10px] leading-none">git config --global user.name "UserNameGitHubMu"
git config --global user.email "EmailGitHubMu@example.com"</pre>
                  </li>
                  <li>
                    <strong class="text-emerald-400">Ganti "Gaya Bahasa" Commit (Sangat Vital!):</strong><br />
                    <span>Hindari pesan commit berbahasa Inggris formal kelas atas (khas AI). Gunakan tombol opsi <span class="bg-slate-700 font-mono px-1 py-0.5 rounded text-[10px] text-white">Indo Student Style</span> di panel kiri kami. Pesan seperti <i>"benerin css flexbox bocor"</i> atau <i>"layouting kasir kelar"</i> jauh lebih meyakinkan karena berjiwa manusia biasa.</span>
                  </li>
                  <li>
                    <strong class="text-emerald-400">Sebarkan Rentang Tanggal Mulai dan Akhir Tugas:</strong><br />
                    <span>Lakukan backdate sejauh 1 hingga 3 minggu lalu demi mensimulasikan dedikasi berminggu-minggu dengan interval jeda hari libur yang realistis.</span>
                  </li>
                  <li>
                    <strong class="text-emerald-400">Lakukan Edit Kode Mandiri Tambahan Pascagenerator:</strong><br />
                    <span>Setelah menjalankan script generator di laptopmu, buatlah 2 atau 3 perubahan kecil (seperti menambah baris kosong, spasi komentar, dll.) dan commit secara manual di tanggal hari ini secara langsung. Ini membuat silsilah git aktif mutakhir.</span>
                  </li>
                  <li>
                    <strong class="text-amber-400">Hapus File Metadata AI Studio Selalu:</strong><br />
                    <span>Sebelum kamu upload repositori ke publik, pastikan folder asisten atau file log buatan asisten didelete bersih agar tidak meninggalkan jejak.</span>
                  </li>
                </ol>

                <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center text-xs">
                  <span class="text-emerald-400 font-mono font-bold">Terminal CMD:</span>
                  <span class="ml-2 font-mono text-[11.5px] text-slate-400">sh run_spreader.sh</span>
                  <span class="ml-auto text-[10px] text-slate-500 font-bold">Guru-Proof v1.2</span>
                </div>
              </div>
            </template>
            
          </div>

        </div>

      </div>

    </div>

    <!-- Instructions on how to compile locally -->
    <div class="bg-white p-6 border border-[#e9ecef] rounded-[24px] shadow-xs text-left">
      <h3 class="font-sans font-black text-sm text-[#1a1a1a] mb-4 flex items-center space-x-2">
        <Terminal class="w-4 h-4 text-[#1a1a1a]" />
        <span>Cara Menjalankan Script di Terminal Laptop Kamu</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 font-medium">
        <div class="space-y-2 bg-[#f8f9fa] p-5 rounded-2xl border border-[#e9ecef]/60">
          <span class="font-bold text-[#1a1a1a] block uppercase text-[10px] tracking-wider text-slate-700">🖥️ Untuk Pengguna macOS / Linux (BASH)</span>
          <ol class="list-decimal list-inside space-y-1 text-[11px] text-[#495057]">
            <li>Copy teks script macOS / Linux di tab terminal atas.</li>
            <li>Buka terminal, masuk ke folder tugasmu (contoh: <code class="bg-[#e9ecef] px-1 rounded font-mono">cd ~/Documents/kapi-pos</code>).</li>
            <li>Buat file script kosong baru: <code class="bg-[#e9ecef] px-1 rounded font-mono">touch commit-spread.sh</code></li>
            <li>Tempel kode yang kamu copy tadi ke file tersebut dan simpan.</li>
            <li>Beri izin eksekusi script: <code class="bg-[#e9ecef] px-1 rounded font-mono">chmod +x commit-spread.sh</code></li>
            <li>Jalankan script: <code class="bg-[#e9ecef] px-1 rounded font-mono">./commit-spread.sh</code></li>
          </ol>
        </div>

        <div class="space-y-2 bg-[#f8f9fa] p-5 rounded-2xl border border-[#e9ecef]/60">
          <span class="font-bold text-[#1a1a1a] block uppercase text-[10px] tracking-wider text-slate-700">💾 Untuk Pengguna Windows (PowerShell)</span>
          <ol class="list-decimal list-inside space-y-1 text-[11px] text-[#495057]">
            <li>Copy teks script Windows (PowerShell .ps1) di tab terminal atas.</li>
            <li>Buka PowerShell, masuk ke folder lokal proyek kasirmu.</li>
            <li>Buat file script baru: <code class="bg-[#e9ecef] px-1 rounded font-mono">New-Item commit-spread.ps1</code></li>
            <li>Isi file dengan teks yang di-copy tadi (bisa diedit lewat Notepad/VS Code).</li>
            <li>Bypass permission jika error script execution blocked: <code class="bg-[#e9ecef] px-1 rounded font-mono">Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code></li>
            <li>Jalankan script: <code class="bg-[#e9ecef] px-1 rounded font-mono">.\commit-spread.ps1</code></li>
          </ol>
        </div>
      </div>
    </div>

  </div>
</template>
