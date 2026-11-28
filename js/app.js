/**
 * Baking Calculator Lite - App Controller
 * Mengintegrasikan kalkulator, manajemen baris bahan, biaya operasional,
 * riwayat perhitungan, rekomendasi affiliate, dan status offline PWA.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- STATE APLIKASI ---
  let currentIngredients = [];
  let currentAdditionalCosts = [];
  let lastCalculationResult = null;

  // Resep sampel dan preset contoh simulasi
  const PRESETS = {
    brownies: {
      productName: 'Fudgy Brownies Shiny Crust',
      yieldQty: 16,
      yieldUnit: 'Slice',
      customYieldUnit: '',
      targetMargin: 40,
      roundMode: '500',
      isManualPrice: false,
      manualPrice: 0,
      ingredients: [
        { id: 'ing_1', name: 'Dark Cooking Chocolate (DCC)', usageQty: 150, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 75000 },
        { id: 'ing_2', name: 'Mentega / Butter', usageQty: 50, usageUnit: 'g', purchaseQty: 200, purchaseUnit: 'g', purchasePrice: 22000 },
        { id: 'ing_3', name: 'Minyak Goreng', usageQty: 40, usageUnit: 'ml', purchaseQty: 1, purchaseUnit: 'l', purchasePrice: 18000 },
        { id: 'ing_4', name: 'Telur Ayam', usageQty: 2, usageUnit: 'butir', purchaseQty: 16, purchaseUnit: 'butir', purchasePrice: 32000 },
        { id: 'ing_5', name: 'Gula Halus / Pasir', usageQty: 150, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 17500 },
        { id: 'ing_6', name: 'Tepung Terigu Protein Sedang', usageQty: 100, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 13000 },
        { id: 'ing_7', name: 'Cokelat Bubuk Murni', usageQty: 35, usageUnit: 'g', purchaseQty: 100, purchaseUnit: 'g', purchasePrice: 18000 }
      ],
      additionalCosts: [
        { id: 'cost_1', name: 'Dus Box Brownies + Kertas Roti', amount: 4500 },
        { id: 'cost_2', name: 'Listrik & Gas Oven', amount: 5000 },
        { id: 'cost_3', name: 'Alat & Tenaga Kerja Pembuatan', amount: 10000 }
      ]
    },
    donat: {
      productName: 'Donat Kentang Lembut Menul',
      yieldQty: 12,
      yieldUnit: 'Pcs',
      customYieldUnit: '',
      targetMargin: 45,
      roundMode: '500',
      isManualPrice: false,
      manualPrice: 0,
      ingredients: [
        { id: 'ing_d1', name: 'Tepung Terigu Protein Tinggi (Cakra)', usageQty: 250, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 14500 },
        { id: 'ing_d2', name: 'Kentang Kukus Halus', usageQty: 100, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 18000 },
        { id: 'ing_d3', name: 'Gula Pasir', usageQty: 40, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 17500 },
        { id: 'ing_d4', name: 'Ragi Instan (Fermipan)', usageQty: 5, usageUnit: 'g', purchaseQty: 11, purchaseUnit: 'g', purchasePrice: 6000 },
        { id: 'ing_d5', name: 'Susu Bubuk Full Cream', usageQty: 20, usageUnit: 'g', purchaseQty: 200, purchaseUnit: 'g', purchasePrice: 16000 },
        { id: 'ing_d6', name: 'Kuning Telur Ayam', usageQty: 2, usageUnit: 'butir', purchaseQty: 16, purchaseUnit: 'butir', purchasePrice: 32000 },
        { id: 'ing_d7', name: 'Margarin / Butter', usageQty: 40, usageUnit: 'g', purchaseQty: 200, purchaseUnit: 'g', purchasePrice: 12000 },
        { id: 'ing_d8', name: 'Minyak Padat Khusus Menggoreng', usageQty: 250, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 26000 }
      ],
      additionalCosts: [
        { id: 'cost_d1', name: 'Dus Box Donat Isi 6 (2 pcs)', amount: 4000 },
        { id: 'cost_d2', name: 'Kertas Roti / Baking Paper', amount: 1000 },
        { id: 'cost_d3', name: 'Gas Penggorengan', amount: 3000 },
        { id: 'cost_d4', name: 'Tenaga Kerja Pembuatan', amount: 8000 }
      ]
    },
    cookies: {
      productName: 'Classic Choco Chip Cookies',
      yieldQty: 24,
      yieldUnit: 'Pcs',
      customYieldUnit: '',
      targetMargin: 40,
      roundMode: '500',
      isManualPrice: false,
      manualPrice: 0,
      ingredients: [
        { id: 'ing_c1', name: 'Tepung Terigu Protein Sedang', usageQty: 200, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 13000 },
        { id: 'ing_c2', name: 'Unsalted Butter / Margarin', usageQty: 120, usageUnit: 'g', purchaseQty: 200, purchaseUnit: 'g', purchasePrice: 24000 },
        { id: 'ing_c3', name: 'Brown Sugar / Gula Semut', usageQty: 100, usageUnit: 'g', purchaseQty: 500, purchaseUnit: 'g', purchasePrice: 18000 },
        { id: 'ing_c4', name: 'Gula Pasir Halus', usageQty: 50, usageUnit: 'g', purchaseQty: 1, purchaseUnit: 'kg', purchasePrice: 17500 },
        { id: 'ing_c5', name: 'Choco Chips Kualitas Premium', usageQty: 120, usageUnit: 'g', purchaseQty: 250, purchaseUnit: 'g', purchasePrice: 22000 },
        { id: 'ing_c6', name: 'Telur Ayam', usageQty: 1, usageUnit: 'butir', purchaseQty: 16, purchaseUnit: 'butir', purchasePrice: 32000 },
        { id: 'ing_c7', name: 'Baking Soda', usageQty: 2, usageUnit: 'g', purchaseQty: 45, purchaseUnit: 'g', purchasePrice: 7500 },
        { id: 'ing_c8', name: 'Ekstrak Vanilla', usageQty: 3, usageUnit: 'ml', purchaseQty: 30, purchaseUnit: 'ml', purchasePrice: 12000 }
      ],
      additionalCosts: [
        { id: 'cost_c1', name: 'Toples Mika / Standing Pouch (2 pcs)', amount: 6000 },
        { id: 'cost_c2', name: 'Listrik Oven Pemanggang', amount: 4500 },
        { id: 'cost_c3', name: 'Tenaga Kerja Pembuatan', amount: 7500 }
      ]
    }
  };

  const SAMPLE_RECIPE = PRESETS.brownies;

  // --- DOM ELEMENTS SELECTOR ---
  const el = {
    // Form Inputs
    productName: document.getElementById('input-product-name'),
    yieldQty: document.getElementById('input-yield-qty'),
    yieldUnit: document.getElementById('select-yield-unit'),
    customYieldUnit: document.getElementById('input-custom-yield-unit'),
    customYieldGroup: document.getElementById('group-custom-yield'),
    targetMargin: document.getElementById('input-target-margin'),
    marginSlider: document.getElementById('slider-target-margin'),
    roundMode: document.getElementById('select-round-mode'),
    toggleManualPrice: document.getElementById('toggle-manual-price'),
    manualPriceGroup: document.getElementById('group-manual-price'),
    inputManualPrice: document.getElementById('input-manual-price'),

    // Containers
    ingredientsContainer: document.getElementById('ingredients-list'),
    additionalCostsContainer: document.getElementById('additional-costs-list'),
    btnAddIngredient: document.getElementById('btn-add-ingredient'),
    btnAddCost: document.getElementById('btn-add-cost'),

    // Buttons
    btnCalculate: document.getElementById('btn-calculate'),
    btnReset: document.getElementById('btn-reset'),
    btnSave: document.getElementById('btn-save-calc'),
    btnCopy: document.getElementById('btn-copy-calc'),
    btnShare: document.getElementById('btn-share-calc'),
    btnPrint: document.getElementById('btn-print-calc'),

    // Result Elements
    resultSection: document.getElementById('section-result'),
    resProductName: document.getElementById('res-product-name'),
    resHppTotal: document.getElementById('res-hpp-total'),
    resHppPerUnit: document.getElementById('res-hpp-per-unit'),
    resRecommendedPrice: document.getElementById('res-recommended-price'),
    resProfitPerUnit: document.getElementById('res-profit-per-unit'),
    resTotalProfit: document.getElementById('res-total-profit'),
    resMarginPct: document.getElementById('res-margin-pct'),
    resIngredientsTotal: document.getElementById('res-ingredients-total'),
    resAdditionalTotal: document.getElementById('res-additional-total'),
    resUnitLabel: document.getElementById('res-unit-label'),
    resUnitLabel2: document.getElementById('res-unit-label-2'),
    resUnitLabel3: document.getElementById('res-unit-label-3'),
    resMarginWarning: document.getElementById('res-margin-warning'),
    manualResultBox: document.getElementById('res-manual-box'),
    resManualPrice: document.getElementById('res-manual-price'),
    resManualProfit: document.getElementById('res-manual-profit'),
    resManualMargin: document.getElementById('res-manual-margin'),

    // Contextual Affiliate / Product Gallery
    contextualAffiliateSection: document.getElementById('section-affiliate-gallery') || document.getElementById('section-contextual-affiliate'),
    contextualProductsGrid: document.getElementById('affiliate-gallery-container') || document.getElementById('contextual-products-grid'),
    affiliateGalleryContainer: document.getElementById('affiliate-gallery-container') || document.getElementById('contextual-products-grid'),

    // History
    historyList: document.getElementById('history-list'),
    btnToggleHistory: document.getElementById('btn-toggle-history'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    historyContainer: document.getElementById('history-container'),

    // Online/Offline status
    networkStatus: document.getElementById('network-status'),

    // Pro promotion
    btnProApp: document.getElementById('btn-pro-app')
  };

  // --- INIT APPLICATION ---
  const init = async () => {
    // 1. Setup online/offline listener
    setupNetworkStatus();

    // 2. Setup Pro Link
    setupProLink();

    // 3. Load Draft atau Default Sample Recipe
    const savedDraft = Storage.loadDraft();
    if (savedDraft && savedDraft.ingredients && savedDraft.ingredients.length > 0) {
      applyRecipeToState(savedDraft);
    } else {
      applyRecipeToState(SAMPLE_RECIPE);
    }

    // 4. Render Form
    renderFormFromState();

    // 5. Setup Event Listeners
    setupEventListeners();

    // 6. Jalankan kalkulasi pertama
    doCalculate();

    // 7. Muat produk affiliate Shopee secara asynchronous & aktifkan polling realtime tanpa reload
    loadAffiliateRecommendations();
    if (typeof AffiliateManager !== 'undefined') {
      AffiliateManager.subscribe(() => {
        loadAffiliateRecommendations();
      });
      AffiliateManager.startPolling();
    }

    // 8. Muat daftar riwayat
    renderHistory();
  };

  // --- NETWORK STATUS ---
  const setupNetworkStatus = () => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      if (el.networkStatus) {
        el.networkStatus.className = `status-pill ${isOnline ? 'online' : 'offline'}`;
        el.networkStatus.textContent = isOnline ? 'Online' : 'Offline (Mode Tersimpan)';
      }
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  };

  // --- PRO LINK SETUP ---
  const setupProLink = () => {
    if (!el.btnProApp) return;
    const proUrl = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.proAppUrl) ? AFFILIATE_CONFIG.proAppUrl : '';
    if (proUrl) {
      el.btnProApp.href = proUrl;
      el.btnProApp.target = '_blank';
      el.btnProApp.rel = 'noopener noreferrer';
    } else {
      // Jika URL belum disiapkan, buat tautan halus
      el.btnProApp.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.showToast('Baking Calculator Pro segera hadir dengan fitur manajemen resep & inventori lanjutan!', 'info', 4000);
      });
    }
  };

  // --- STATE TO RECIPE CONVERSION ---
  const applyRecipeToState = (recipe) => {
    if (!recipe) return;
    if (el.productName) el.productName.value = recipe.productName || '';
    if (el.yieldQty) el.yieldQty.value = recipe.yieldQty || 1;
    if (el.yieldUnit) el.yieldUnit.value = recipe.yieldUnit || 'Pcs';
    if (el.customYieldUnit) el.customYieldUnit.value = recipe.customYieldUnit || '';
    if (el.targetMargin) el.targetMargin.value = recipe.targetMargin || 40;
    if (el.marginSlider) el.marginSlider.value = recipe.targetMargin || 40;
    if (el.roundMode) el.roundMode.value = recipe.roundMode || 'none';

    if (el.toggleManualPrice) {
      el.toggleManualPrice.checked = Boolean(recipe.isManualPrice);
      if (el.manualPriceGroup) {
        el.manualPriceGroup.style.display = recipe.isManualPrice ? 'block' : 'none';
      }
    }
    if (el.inputManualPrice) {
      el.inputManualPrice.value = recipe.manualPrice || '';
    }

    if (el.customYieldGroup) {
      el.customYieldGroup.style.display = recipe.yieldUnit === 'Custom' ? 'block' : 'none';
    }

    currentIngredients = Array.isArray(recipe.ingredients) ? JSON.parse(JSON.stringify(recipe.ingredients)) : [];
    currentAdditionalCosts = Array.isArray(recipe.additionalCosts) ? JSON.parse(JSON.stringify(recipe.additionalCosts)) : [];
  };

  const getFormState = () => {
    const isManual = el.toggleManualPrice ? el.toggleManualPrice.checked : false;
    return {
      productName: el.productName ? el.productName.value.trim() : '',
      yieldQty: el.yieldQty ? Math.max(1, Number(el.yieldQty.value) || 1) : 1,
      yieldUnit: el.yieldUnit ? el.yieldUnit.value : 'Pcs',
      customYieldUnit: el.customYieldUnit ? el.customYieldUnit.value.trim() : '',
      targetMargin: el.targetMargin ? Number(el.targetMargin.value) || 0 : 40,
      roundMode: el.roundMode ? el.roundMode.value : 'none',
      isManualPrice: isManual,
      manualPrice: isManual && el.inputManualPrice ? Number(el.inputManualPrice.value) || 0 : 0,
      ingredients: currentIngredients,
      additionalCosts: currentAdditionalCosts
    };
  };

  // --- RENDER FORM ROWS ---
  const renderFormFromState = () => {
    renderIngredientsTable();
    renderAdditionalCostsTable();
  };

  /**
   * Render tabel daftar bahan baku
   */
  const renderIngredientsTable = () => {
    if (!el.ingredientsContainer) return;
    el.ingredientsContainer.innerHTML = '';

    if (currentIngredients.length === 0) {
      el.ingredientsContainer.innerHTML = `
        <div class="empty-rows-message">
          <p>Belum ada bahan baku. Klik <strong>+ Tambah Bahan</strong> di bawah untuk memasukkan bahan adonan.</p>
        </div>
      `;
      return;
    }

    currentIngredients.forEach((ing, index) => {
      const row = document.createElement('div');
      row.className = 'ingredient-row card-subtle';
      row.setAttribute('data-id', ing.id);

      // Hitung biaya baris ini
      const costInfo = Calculator.calculateIngredientCost(ing);

      row.innerHTML = `
        <div class="row-header">
          <span class="row-index">#${index + 1}</span>
          <div class="row-actions">
            <button type="button" class="btn-action-icon btn-duplicate" title="Gandakan Bahan" data-index="${index}" aria-label="Gandakan Bahan">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
            <button type="button" class="btn-action-icon btn-delete" title="Hapus Bahan" data-index="${index}" aria-label="Hapus Bahan">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>

        <div class="row-grid">
          <!-- Nama Bahan -->
          <div class="form-group span-full">
            <label class="form-label-small">Nama Bahan Baku</label>
            <input type="text" class="input-text input-ing-name" value="${Utils.escapeHTML(ing.name)}" placeholder="Contoh: Tepung Terigu Protein Sedang" data-index="${index}">
          </div>

          <!-- Pemakaian -->
          <div class="form-group span-half">
            <label class="form-label-small">Jumlah Pakai</label>
            <div class="input-group">
              <input type="number" step="any" min="0" class="input-text input-ing-usage-qty" value="${ing.usageQty || ''}" placeholder="0" data-index="${index}">
              <select class="select-unit select-ing-usage-unit" data-index="${index}">
                ${renderUnitOptions(ing.usageUnit)}
              </select>
            </div>
          </div>

          <!-- Pembelian -->
          <div class="form-group span-half">
            <label class="form-label-small">Jumlah Beli Saat Belanja</label>
            <div class="input-group">
              <input type="number" step="any" min="0" class="input-text input-ing-purchase-qty" value="${ing.purchaseQty || ''}" placeholder="0" data-index="${index}">
              <select class="select-unit select-ing-purchase-unit" data-index="${index}">
                ${renderUnitOptions(ing.purchaseUnit)}
              </select>
            </div>
          </div>

          <!-- Harga Beli -->
          <div class="form-group span-half">
            <label class="form-label-small">Harga Beli Kemasan (Rp)</label>
            <div class="input-prefix-wrapper">
              <span class="input-prefix">Rp</span>
              <input type="number" min="0" step="100" class="input-text input-ing-price" value="${ing.purchasePrice || ''}" placeholder="0" data-index="${index}">
            </div>
          </div>

          <!-- Biaya Terpakai -->
          <div class="form-group span-half row-cost-preview">
            <label class="form-label-small">Biaya Yang Dipakai</label>
            <div class="cost-badge ${costInfo.error ? 'cost-badge-error' : ''}">
              <span class="cost-amount">${costInfo.error ? 'Cek Input' : Utils.formatRupiah(costInfo.cost)}</span>
            </div>
          </div>
        </div>

        ${costInfo.warning ? `
          <div class="row-warning">
            <span class="warning-icon">⚠</span>
            <span>${Utils.escapeHTML(costInfo.warning)}</span>
          </div>
        ` : ''}

        ${costInfo.error ? `
          <div class="row-error">
            <span>${Utils.escapeHTML(costInfo.error)}</span>
          </div>
        ` : ''}
      `;

      el.ingredientsContainer.appendChild(row);
    });

    bindIngredientEvents();
  };

  /**
   * Render opsi satuan
   */
  const renderUnitOptions = (selectedUnit = 'g') => {
    const clean = String(selectedUnit).toLowerCase();
    return Calculator.DEFAULT_UNITS.map(u => {
      const isSelected = u.value === clean ? 'selected' : '';
      return `<option value="${u.value}" ${isSelected}>${u.label}</option>`;
    }).join('');
  };

  /**
   * Render tabel biaya operasional tambahan
   */
  const renderAdditionalCostsTable = () => {
    if (!el.additionalCostsContainer) return;
    el.additionalCostsContainer.innerHTML = '';

    if (currentAdditionalCosts.length === 0) {
      el.additionalCostsContainer.innerHTML = `
        <div class="empty-rows-message">
          <p>Belum ada biaya operasional. Anda dapat menambahkan biaya kemasan, gas, listrik, atau tenaga kerja di bawah.</p>
        </div>
      `;
      return;
    }

    currentAdditionalCosts.forEach((cost, index) => {
      const row = document.createElement('div');
      row.className = 'cost-row card-subtle';
      row.setAttribute('data-id', cost.id);

      row.innerHTML = `
        <div class="cost-row-grid">
          <div class="form-group flex-2">
            <label class="form-label-small">Nama Biaya Operasional / Kemasan</label>
            <input type="text" class="input-text input-cost-name" value="${Utils.escapeHTML(cost.name)}" placeholder="Contoh: Kemasan Box & Pita" data-index="${index}">
          </div>

          <div class="form-group flex-1">
            <label class="form-label-small">Nominal Biaya (Rp)</label>
            <div class="input-prefix-wrapper">
              <span class="input-prefix">Rp</span>
              <input type="number" min="0" step="500" class="input-text input-cost-amount" value="${cost.amount || ''}" placeholder="0" data-index="${index}">
            </div>
          </div>

          <div class="cost-delete-wrapper">
            <button type="button" class="btn-action-icon btn-delete-cost" title="Hapus Biaya" data-index="${index}" aria-label="Hapus Biaya">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      `;

      el.additionalCostsContainer.appendChild(row);
    });

    bindCostEvents();
  };

  // --- EVENT BINDING UNTUK ROW INPUT ---
  const bindIngredientEvents = () => {
    const container = el.ingredientsContainer;
    if (!container) return;

    // Input changes
    container.querySelectorAll('input, select').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-index'));
        if (isNaN(idx) || !currentIngredients[idx]) return;

        if (e.target.classList.contains('input-ing-name')) {
          currentIngredients[idx].name = e.target.value;
        } else if (e.target.classList.contains('input-ing-usage-qty')) {
          currentIngredients[idx].usageQty = Number(e.target.value);
        } else if (e.target.classList.contains('select-ing-usage-unit')) {
          currentIngredients[idx].usageUnit = e.target.value;
        } else if (e.target.classList.contains('input-ing-purchase-qty')) {
          currentIngredients[idx].purchaseQty = Number(e.target.value);
        } else if (e.target.classList.contains('select-ing-purchase-unit')) {
          currentIngredients[idx].purchaseUnit = e.target.value;
        } else if (e.target.classList.contains('input-ing-price')) {
          currentIngredients[idx].purchasePrice = Number(e.target.value);
        }

        debouncedRecalculate();
      });
    });

    // Duplicate button
    container.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-duplicate');
        const idx = Number(targetBtn.getAttribute('data-index'));
        if (!isNaN(idx) && currentIngredients[idx]) {
          const clone = JSON.parse(JSON.stringify(currentIngredients[idx]));
          clone.id = 'ing_' + Date.now();
          clone.name = `${clone.name} (Salinan)`;
          currentIngredients.splice(idx + 1, 0, clone);
          renderIngredientsTable();
          doCalculate();
          Utils.showToast('Bahan berhasil digandakan', 'info', 1500);
        }
      });
    });

    // Delete button
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-delete');
        const idx = Number(targetBtn.getAttribute('data-index'));
        if (!isNaN(idx) && currentIngredients[idx]) {
          currentIngredients.splice(idx, 1);
          renderIngredientsTable();
          doCalculate();
        }
      });
    });
  };

  const bindCostEvents = () => {
    const container = el.additionalCostsContainer;
    if (!container) return;

    container.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-index'));
        if (isNaN(idx) || !currentAdditionalCosts[idx]) return;

        if (e.target.classList.contains('input-cost-name')) {
          currentAdditionalCosts[idx].name = e.target.value;
        } else if (e.target.classList.contains('input-cost-amount')) {
          currentAdditionalCosts[idx].amount = Math.max(0, Number(e.target.value) || 0);
        }

        debouncedRecalculate();
      });
    });

    container.querySelectorAll('.btn-delete-cost').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-delete-cost');
        const idx = Number(targetBtn.getAttribute('data-index'));
        if (!isNaN(idx) && currentAdditionalCosts[idx]) {
          currentAdditionalCosts.splice(idx, 1);
          renderAdditionalCostsTable();
          doCalculate();
        }
      });
    });
  };

  // --- KALKULASI & HASIL ---
  const doCalculate = () => {
    const state = getFormState();
    const result = Calculator.calculateTotal(state);
    lastCalculationResult = result;

    // Simpan draft
    Storage.saveDraft(state);

    // Tampilkan hasil di UI
    renderCalculationResult(result);

    // Debounced GA4 tracking ketika kalkulasi valid berhasil dilakukan
    if (result && result.totalHppBatch > 0 && result.isValid) {
      debouncedTrackCalculatorUsed(result);
    }
  };

  const debouncedTrackCalculatorUsed = Utils.debounce((result) => {
    if (typeof Analytics !== 'undefined') {
      Analytics.trackCalculatorUsed({
        calculator_type: 'hpp_standard',
        product_category: result.yieldUnit || 'pcs'
      });
    }
  }, 2500);

  const debouncedRecalculate = Utils.debounce(() => {
    doCalculate();
  }, 250);

  /**
   * Render kartu hasil kalkulasi
   */
  const renderCalculationResult = (res) => {
    if (!res) return;

    // Header Produk
    if (el.resProductName) {
      el.resProductName.textContent = res.productName || 'Produk Kue';
    }

    // Satuan Unit di label
    const unitText = res.yieldUnit || 'Pcs';
    if (el.resUnitLabel) el.resUnitLabel.textContent = `/ ${unitText}`;
    if (el.resUnitLabel2) el.resUnitLabel2.textContent = `/ ${unitText}`;
    if (el.resUnitLabel3) el.resUnitLabel3.textContent = `/ ${unitText}`;

    // Nominal Utama
    if (el.resHppTotal) el.resHppTotal.textContent = Utils.formatRupiah(res.totalHppBatch);
    if (el.resHppPerUnit) el.resHppPerUnit.textContent = Utils.formatRupiah(res.hppPerUnit);
    if (el.resRecommendedPrice) el.resRecommendedPrice.textContent = Utils.formatRupiah(res.recommendedPrice);
    if (el.resProfitPerUnit) el.resProfitPerUnit.textContent = Utils.formatRupiah(res.profitPerUnit);
    if (el.resTotalProfit) el.resTotalProfit.textContent = Utils.formatRupiah(res.totalProfitBatch);

    // Rincian Tambahan
    if (el.resIngredientsTotal) el.resIngredientsTotal.textContent = Utils.formatRupiah(res.totalIngredientsCost);
    if (el.resAdditionalTotal) el.resAdditionalTotal.textContent = Utils.formatRupiah(res.totalAdditionalCost);
    if (el.resMarginPct) el.resMarginPct.textContent = Utils.formatPercent(res.targetMargin);

    // Margin Error / Warning
    if (el.resMarginWarning) {
      if (res.marginError) {
        el.resMarginWarning.textContent = res.marginError;
        el.resMarginWarning.style.display = 'block';
      } else {
        el.resMarginWarning.style.display = 'none';
      }
    }

    // Evaluasi Harga Manual
    if (el.manualResultBox) {
      if (res.isManualPrice && res.manualEvaluation) {
        el.manualResultBox.style.display = 'block';
        if (el.resManualPrice) el.resManualPrice.textContent = Utils.formatRupiah(res.manualEvaluation.actualSellingPrice);
        if (el.resManualProfit) {
          el.resManualProfit.textContent = Utils.formatRupiah(res.manualEvaluation.profitPerUnit);
          el.resManualProfit.className = `stat-value ${res.manualEvaluation.profitPerUnit >= 0 ? 'text-success' : 'text-danger'}`;
        }
        if (el.resManualMargin) {
          el.resManualMargin.textContent = Utils.formatPercent(res.manualEvaluation.actualMarginPercent);
          el.resManualMargin.className = `stat-value ${res.manualEvaluation.actualMarginPercent >= 0 ? 'text-success' : 'text-danger'}`;
        }
      } else {
        el.manualResultBox.style.display = 'none';
      }
    }
  };

  // --- RIWAYAT PERHITUNGAN (LOCAL STORAGE) ---
  const renderHistory = () => {
    if (!el.historyList) return;
    const history = Storage.getHistory();
    el.historyList.innerHTML = '';

    if (history.length === 0) {
      el.historyList.innerHTML = `
        <div class="empty-history-message">
          <p>Belum ada riwayat perhitungan yang disimpan. Klik tombol <strong>Simpan Perhitungan</strong> di atas untuk mengabadikan perhitungan resep Anda.</p>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item card-subtle';
      card.setAttribute('data-id', item.id);

      card.innerHTML = `
        <div class="history-item-header">
          <h4 class="history-item-title">${Utils.escapeHTML(item.productName)}</h4>
          <span class="history-item-date">${Utils.formatDateIndo(item.savedAt)}</span>
        </div>
        <div class="history-item-stats">
          <div class="h-stat">
            <span class="h-stat-label">HPP / ${item.yieldUnit}:</span>
            <span class="h-stat-val">${Utils.formatRupiah(item.hppPerUnit)}</span>
          </div>
          <div class="h-stat">
            <span class="h-stat-label">Rekomendasi Jual:</span>
            <span class="h-stat-val text-caramel">${Utils.formatRupiah(item.recommendedPrice)}</span>
          </div>
          <div class="h-stat">
            <span class="h-stat-label">Margin:</span>
            <span class="h-stat-val">${Utils.formatPercent(item.targetMargin)}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn btn-sm btn-secondary btn-load-history" data-id="${item.id}">
            Buka Kembali
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-history" data-id="${item.id}" title="Hapus Riwayat">
            Hapus
          </button>
        </div>
      `;

      el.historyList.appendChild(card);
    });

    // Event listener untuk tombol buka riwayat
    el.historyList.querySelectorAll('.btn-load-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const history = Storage.getHistory();
        const selected = history.find(h => h.id === id);
        if (selected) {
          applyRecipeToState(selected);
          renderFormFromState();
          doCalculate();
          Utils.showToast(`Resep '${selected.productName}' berhasil dimuat`, 'success', 2500);

          // Scroll ke form
          window.scrollTo({ top: document.getElementById('section-calculator').offsetTop - 60, behavior: 'smooth' });
        }
      });
    });

    // Event listener untuk tombol hapus riwayat
    el.historyList.querySelectorAll('.btn-delete-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Hapus riwayat perhitungan ini?')) {
          Storage.deleteHistoryItem(id);
          renderHistory();
          Utils.showToast('Riwayat berhasil dihapus', 'info', 1500);
        }
      });
    });
  };

  // --- REKOMENDASI AFFILIATE / PERLENGKAPAN BAKING PILIHAN ---
  const loadAffiliateRecommendations = async () => {
    const container = el.affiliateGalleryContainer || el.contextualProductsGrid;
    if (!container) return;

    try {
      const res = await AffiliateManager.loadProducts(false);

      // Konteks resep aktif untuk rekomendasi yang relevan
      const context = {
        hasSmallIngredients: currentIngredients.some(ing => {
          const q = Number(ing.usageQty) || 0;
          const u = String(ing.usageUnit || '').toLowerCase();
          return (q > 0 && q <= 10 && u === 'g') || u === 'sachet';
        }),
        isBakingPan: (el.yieldUnit && (el.yieldUnit.value === 'Slice' || el.yieldUnit.value === 'Loyang')) ||
          (el.productName && /brownies|bolu|cake|pie|loyang/i.test(el.productName.value)),
        isLargeBatch: (Number(el.yieldQty ? el.yieldQty.value : 1) >= 24)
      };

      // Ambil hingga 10 produk untuk gallery dalam satu baris horizontal scroll
      const recommendations = AffiliateManager.getContextualRecommendations(10, context);

      container.innerHTML = '';

      if (recommendations.length === 0) {
        // Tampilkan placeholder yang elegan & natural jika belum ada produk aktif
        container.innerHTML = `
          <div class="gallery-empty-fallback">
            <div class="gallery-empty-icon">🍰</div>
            <div class="gallery-empty-info">
              <h4 class="gallery-empty-title">Perlengkapan Baking Sedang Dikurasi</h4>
              <p class="gallery-empty-desc">Rekomendasi peralatan pilihan sedang disiapkan. Anda juga dapat menjelajahi etalase perlengkapan kami.</p>
            </div>
            <a href="products.html" class="btn btn-sm btn-secondary gallery-empty-btn">
              <span>Buka Katalog Lengkap &rarr;</span>
            </a>
          </div>
        `;
        return;
      }

      recommendations.forEach(product => {
        const thumb = AffiliateManager.createGalleryThumbnail(product, 'homepage_top_gallery');
        container.appendChild(thumb);
      });
    } catch (err) {
      console.warn('Gagal memuat rekomendasi affiliate:', err);
    }
  };

  // --- SETUP SEMUA EVENT LISTENERS UTAMA ---
  const setupEventListeners = () => {
    // 1. Perubahan Input Produk & Yield
    if (el.productName) el.productName.addEventListener('input', debouncedRecalculate);
    if (el.yieldQty) el.yieldQty.addEventListener('input', debouncedRecalculate);

    if (el.yieldUnit) {
      el.yieldUnit.addEventListener('change', () => {
        if (el.customYieldGroup) {
          el.customYieldGroup.style.display = el.yieldUnit.value === 'Custom' ? 'block' : 'none';
        }
        doCalculate();
      });
    }

    if (el.customYieldUnit) el.customYieldUnit.addEventListener('input', debouncedRecalculate);

    // 2. Margin & Slider sinkronisasi
    if (el.targetMargin && el.marginSlider) {
      el.targetMargin.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        el.marginSlider.value = Math.min(99, Math.max(0, val));
        debouncedRecalculate();
      });

      el.marginSlider.addEventListener('input', (e) => {
        el.targetMargin.value = e.target.value;
        debouncedRecalculate();
      });
    }

    // 3. Pembulatan
    if (el.roundMode) {
      el.roundMode.addEventListener('change', doCalculate);
    }

    // 4. Toggle Harga Jual Manual
    if (el.toggleManualPrice) {
      el.toggleManualPrice.addEventListener('change', (e) => {
        if (el.manualPriceGroup) {
          el.manualPriceGroup.style.display = e.target.checked ? 'block' : 'none';
        }
        doCalculate();
      });
    }

    if (el.inputManualPrice) {
      el.inputManualPrice.addEventListener('input', debouncedRecalculate);
    }

    // 5. Tambah Baris Bahan
    if (el.btnAddIngredient) {
      el.btnAddIngredient.addEventListener('click', () => {
        currentIngredients.push({
          id: 'ing_' + Date.now(),
          name: '',
          usageQty: 0,
          usageUnit: 'g',
          purchaseQty: 1000,
          purchaseUnit: 'g',
          purchasePrice: 0
        });
        renderIngredientsTable();
        doCalculate();

        // Focus input nama bahan terakhir
        const allNameInputs = el.ingredientsContainer.querySelectorAll('.input-ing-name');
        if (allNameInputs.length > 0) {
          allNameInputs[allNameInputs.length - 1].focus();
        }
      });
    }

    // 6. Tambah Baris Biaya Operasional
    if (el.btnAddCost) {
      el.btnAddCost.addEventListener('click', () => {
        currentAdditionalCosts.push({
          id: 'cost_' + Date.now(),
          name: '',
          amount: 0
        });
        renderAdditionalCostsTable();
        doCalculate();

        const allCostInputs = el.additionalCostsContainer.querySelectorAll('.input-cost-name');
        if (allCostInputs.length > 0) {
          allCostInputs[allCostInputs.length - 1].focus();
        }
      });
    }

    // 7. Tombol Hitung HPP
    if (el.btnCalculate) {
      el.btnCalculate.addEventListener('click', () => {
        doCalculate();
        Utils.showToast('Perhitungan HPP berhasil diperbarui!', 'success', 2000);
      });
    }

    // 8. Tombol Reset
    if (el.btnReset) {
      el.btnReset.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengatur ulang kalkulator ke contoh resep awal?')) {
          Storage.clearDraft();
          applyRecipeToState(SAMPLE_RECIPE);
          renderFormFromState();
          doCalculate();
          Utils.showToast('Kalkulator berhasil direset ke resep sampel', 'info', 2000);
        }
      });
    }

    // 9. Tombol Simpan Perhitungan ke Riwayat
    if (el.btnSave) {
      el.btnSave.addEventListener('click', () => {
        if (!lastCalculationResult) doCalculate();
        const success = Storage.saveToHistory(lastCalculationResult);
        if (success) {
          renderHistory();
          Utils.showToast(`Kalkulasi '${lastCalculationResult.productName}' tersimpan ke riwayat perangkat!`, 'success', 3000);
          if (typeof Analytics !== 'undefined') {
            Analytics.trackCalculatorUsed({
              calculator_type: 'hpp_standard',
              product_category: lastCalculationResult?.yieldUnit || 'pcs'
            });
          }
        } else {
          Utils.showToast('Gagal menyimpan riwayat', 'error', 2500);
        }
      });
    }

    // 10. Tombol Salin Hasil
    if (el.btnCopy) {
      el.btnCopy.addEventListener('click', async () => {
        if (!lastCalculationResult) doCalculate();
        const text = Calculator.generateShareText(lastCalculationResult);
        const copied = await Utils.copyToClipboard(text);
        if (copied) {
          Utils.showToast('Rincian HPP berhasil disalin ke clipboard!', 'success', 2500);
        } else {
          Utils.showToast('Gagal menyalin hasil kalkulasi', 'error', 2500);
        }
      });
    }

    // 11. Tombol Bagikan Hasil
    if (el.btnShare) {
      el.btnShare.addEventListener('click', async () => {
        if (!lastCalculationResult) doCalculate();
        const text = Calculator.generateShareText(lastCalculationResult);
        const shareResult = await Utils.shareContent({
          title: `Kalkulasi HPP ${lastCalculationResult.productName}`,
          text: text,
          url: window.location.href
        });

        if (shareResult.method === 'copied') {
          Utils.showToast('Hasil kalkulasi disalin ke clipboard untuk dibagikan!', 'success', 3000);
        } else if (shareResult.shared) {
          Utils.showToast('Berhasil membuka menu bagikan', 'success', 2000);
        }
      });
    }

    // 12. Tombol Cetak / PDF
    if (el.btnPrint) {
      el.btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // 13. Hapus Semua Riwayat
    if (el.btnClearHistory) {
      el.btnClearHistory.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat perhitungan dari perangkat ini?')) {
          Storage.clearHistory();
          renderHistory();
          Utils.showToast('Seluruh riwayat berhasil dibersihkan', 'info', 2000);
        }
      });
    }

    // 14. Smooth scroll navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId.length > 1) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // 15. Preset resep simulasi contoh
    document.querySelectorAll('.btn-preset-recipe').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-preset');
        const selectedPreset = PRESETS[key];
        if (!selectedPreset) return;

        if (confirm(`Terapkan contoh simulasi resep '${selectedPreset.productName}'?\n\nCatatan: Data pengerjaan kalkulator saat ini akan diganti dengan contoh resep simulasi ini.`)) {
          applyRecipeToState(selectedPreset);
          renderFormFromState();
          doCalculate();
          loadAffiliateRecommendations();
          Utils.showToast(`Preset '${selectedPreset.productName}' berhasil dimuat!`, 'success', 2500);

          document.querySelectorAll('.btn-preset-recipe').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        }
      });
    });

    // 16. Tooltip / Popover Edukasi Margin
    const btnInfoMargin = document.getElementById('btn-info-margin');
    const popoverMargin = document.getElementById('popover-margin-info');
    const btnCloseMargin = document.getElementById('btn-close-margin-info');

    if (btnInfoMargin && popoverMargin) {
      btnInfoMargin.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = popoverMargin.style.display === 'block';
        popoverMargin.style.display = isVisible ? 'none' : 'block';
      });
    }

    if (btnCloseMargin && popoverMargin) {
      btnCloseMargin.addEventListener('click', (e) => {
        e.stopPropagation();
        popoverMargin.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      if (popoverMargin && popoverMargin.style.display === 'block' && !popoverMargin.contains(e.target) && e.target !== btnInfoMargin) {
        popoverMargin.style.display = 'none';
      }
    });

    // 17. Navigasi Scroll Horizontal & Drag untuk Galeri Produk
    const galleryScroll = document.getElementById('affiliate-gallery-container');
    const btnGalleryPrev = document.getElementById('gallery-nav-prev');
    const btnGalleryNext = document.getElementById('gallery-nav-next');

    if (btnGalleryPrev && galleryScroll) {
      btnGalleryPrev.addEventListener('click', () => {
        galleryScroll.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }

    if (btnGalleryNext && galleryScroll) {
      btnGalleryNext.addEventListener('click', () => {
        galleryScroll.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    // Mouse drag scroll support on desktop
    if (galleryScroll) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let hasDragged = false;

      galleryScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        hasDragged = false;
        startX = e.pageX - galleryScroll.offsetLeft;
        scrollLeft = galleryScroll.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        isDown = false;
        setTimeout(() => { hasDragged = false; }, 50);
      });

      galleryScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - galleryScroll.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 5) hasDragged = true;
        galleryScroll.scrollLeft = scrollLeft - walk;
      });

      // Prevent accidental click during drag
      galleryScroll.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }
  };

  // Jalankan inisialisasi
  init();
});
