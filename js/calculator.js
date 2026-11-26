/**
 * Baking Calculator Lite - Calculator Module
 * Logika perhitungan HPP, margin keuntungan, pembulatan, dan konversi satuan
 */

const Calculator = (() => {
  'use strict';

  /**
   * Satuan default yang didukung
   */
  const DEFAULT_UNITS = [
    { label: 'Gram (g)', value: 'g', group: 'mass' },
    { label: 'Kilogram (kg)', value: 'kg', group: 'mass' },
    { label: 'Mililiter (ml)', value: 'ml', group: 'volume' },
    { label: 'Liter (L)', value: 'l', group: 'volume' },
    { label: 'Pcs', value: 'pcs', group: 'count' },
    { label: 'Butir', value: 'butir', group: 'count' },
    { label: 'Sachet', value: 'sachet', group: 'count' },
    { label: 'Pack', value: 'pack', group: 'count' },
    { label: 'Box', value: 'box', group: 'count' },
    { label: 'Loyang', value: 'loyang', group: 'count' }
  ];

  /**
   * Pilihan satuan hasil produksi
   */
  const YIELD_UNITS = [
    'Pcs', 'Slice', 'Box', 'Jar', 'Pack', 'Loyang', 'Custom'
  ];

  /**
   * Presets biaya tambahan operasional
   */
  const DEFAULT_ADDITIONAL_COSTS = [
    { name: 'Kemasan / Packaging', amount: 0, isDefault: true },
    { name: 'Gas / Listrik', amount: 0, isDefault: true },
    { name: 'Tenaga Kerja', amount: 0, isDefault: true },
    { name: 'Air & Sanitasi', amount: 0, isDefault: true },
    { name: 'Biaya Operasional Lain', amount: 0, isDefault: true }
  ];

  /**
   * Hitung biaya satu baris bahan baku
   * Rumus: Biaya = Harga Beli × (Jumlah Pakai / Jumlah Beli) × Rasio Konversi
   * @param {Object} ingredient 
   * @returns {{cost: number, error: string|null, warning: string|null}}
   */
  const calculateIngredientCost = (ingredient) => {
    if (!ingredient) {
      return { cost: 0, error: 'Data bahan kosong', warning: null };
    }

    const usageQty = Number(ingredient.usageQty) || 0;
    const purchaseQty = Number(ingredient.purchaseQty) || 0;
    const purchasePrice = Number(ingredient.purchasePrice) || 0;
    const usageUnit = String(ingredient.usageUnit || 'g').trim().toLowerCase();
    const purchaseUnit = String(ingredient.purchaseUnit || 'g').trim().toLowerCase();

    if (purchaseQty <= 0) {
      return {
        cost: 0,
        error: purchaseQty < 0 ? 'Jumlah beli tidak boleh negatif' : 'Jumlah beli harus > 0',
        warning: null
      };
    }

    if (purchasePrice < 0 || usageQty < 0) {
      return {
        cost: 0,
        error: 'Jumlah pakai atau harga beli tidak boleh negatif',
        warning: null
      };
    }

    // Hitung rasio konversi satuan
    let ratio = 1;
    let warning = null;

    if (typeof Utils !== 'undefined') {
      const conv = Utils.getConversionRatio(usageUnit, purchaseUnit);
      ratio = conv.ratio;
      if (!conv.compatible) {
        warning = conv.message;
      }
    }

    // Biaya = Harga Beli * (Pemakaian dalam basis beli / Pembelian)
    const cost = purchasePrice * ((usageQty * ratio) / purchaseQty);

    return {
      cost: isFinite(cost) && !isNaN(cost) ? Math.max(0, cost) : 0,
      error: null,
      warning
    };
  };

  /**
   * Pembulatan harga jual ke atas (Ceil)
   * Memastikan pembulatan tidak pernah menurunkan harga jual di bawah target margin!
   * @param {number} price 
   * @param {'none'|'100'|'500'|'1000'} roundMode 
   * @returns {number}
   */
  const roundSellingPrice = (price, roundMode = 'none') => {
    if (!isFinite(price) || isNaN(price) || price <= 0) return 0;

    switch (String(roundMode)) {
      case '100':
        return Math.ceil(price / 100) * 100;
      case '500':
        return Math.ceil(price / 500) * 500;
      case '1000':
        return Math.ceil(price / 1000) * 1000;
      case 'none':
      default:
        return Math.round(price);
    }
  };

  /**
   * Hitung keseluruhan HPP dan Harga Jual
   * @param {Object} params 
   * @returns {Object}
   */
  const calculateTotal = (params) => {
    const {
      productName = 'Produk Kue',
      yieldQty = 1,
      yieldUnit = 'Pcs',
      customYieldUnit = '',
      ingredients = [],
      additionalCosts = [],
      targetMargin = 40,
      roundMode = 'none',
      isManualPrice = false,
      manualPrice = 0
    } = params || {};

    const safeYieldQty = Math.max(1, Number(yieldQty) || 1);
    const resolvedYieldUnit = yieldUnit === 'Custom' && customYieldUnit ? customYieldUnit : yieldUnit;

    // 1. Total Biaya Bahan Baku
    let totalIngredientsCost = 0;
    const ingredientDetails = ingredients.map((ing, idx) => {
      const res = calculateIngredientCost(ing);
      totalIngredientsCost += res.cost;
      return {
        id: ing.id || `ing_${idx}`,
        name: ing.name || `Bahan ${idx + 1}`,
        usageQty: Number(ing.usageQty) || 0,
        usageUnit: ing.usageUnit || 'g',
        purchaseQty: Number(ing.purchaseQty) || 0,
        purchaseUnit: ing.purchaseUnit || 'g',
        purchasePrice: Number(ing.purchasePrice) || 0,
        cost: res.cost,
        error: res.error,
        warning: res.warning
      };
    });

    // 2. Total Biaya Tambahan Operasional
    let totalAdditionalCost = 0;
    const additionalCostDetails = additionalCosts.map((cost, idx) => {
      const amount = Math.max(0, Number(cost.amount) || 0);
      totalAdditionalCost += amount;
      return {
        id: cost.id || `cost_${idx}`,
        name: cost.name || `Biaya Tambahan ${idx + 1}`,
        amount
      };
    });

    // 3. Total HPP Produksi (Batch)
    const totalHppBatch = totalIngredientsCost + totalAdditionalCost;

    // 4. HPP per Unit
    const hppPerUnit = safeYieldQty > 0 ? (totalHppBatch / safeYieldQty) : 0;

    // 5. Perhitungan Harga Jual Berdasarkan Margin
    // PENTING: Menggunakan konsep MARGIN KEUNTUNGAN, bukan markup!
    // Rumus: Harga Jual = HPP / (1 - Target Margin)
    const safeTargetMargin = Number(targetMargin) || 0;
    let marginError = null;
    let rawRecommendedPrice = 0;

    if (safeTargetMargin < 0) {
      marginError = 'Target margin tidak boleh negatif';
    } else if (safeTargetMargin >= 100) {
      marginError = 'Target margin tidak boleh >= 100% (pembagi (1 - margin) bernilai <= 0)';
    } else {
      const marginDecimal = safeTargetMargin / 100;
      rawRecommendedPrice = (1 - marginDecimal > 0) ? (hppPerUnit / (1 - marginDecimal)) : 0;
    }

    // 6. Pembulatan Harga Jual Rekomendasi
    const recommendedPrice = roundSellingPrice(rawRecommendedPrice, roundMode);

    // 7. Estimasi Keuntungan Berdasarkan Harga Jual Rekomendasi
    const profitPerUnit = Math.max(0, recommendedPrice - hppPerUnit);
    const totalProfitBatch = profitPerUnit * safeYieldQty;
    const actualMarginPercent = recommendedPrice > 0 ? ((recommendedPrice - hppPerUnit) / recommendedPrice) * 100 : 0;

    // 8. Evaluasi Harga Jual Manual jika diaktifkan
    let manualEvaluation = null;
    if (isManualPrice) {
      const safeManualPrice = Math.max(0, Number(manualPrice) || 0);
      const manualProfitPerUnit = safeManualPrice - hppPerUnit;
      const manualProfitBatch = manualProfitPerUnit * safeYieldQty;
      const manualMarginPercent = safeManualPrice > 0 ? (manualProfitPerUnit / safeManualPrice) * 100 : 0;

      manualEvaluation = {
        actualSellingPrice: safeManualPrice,
        profitPerUnit: manualProfitPerUnit,
        totalProfitBatch: manualProfitBatch,
        actualMarginPercent: manualMarginPercent,
        isProfitable: manualProfitPerUnit > 0
      };
    }

    return {
      productName: String(productName).trim() || 'Produk Kue',
      yieldQty: safeYieldQty,
      yieldUnit: resolvedYieldUnit,
      totalIngredientsCost,
      totalAdditionalCost,
      totalHppBatch,
      hppPerUnit,
      targetMargin: safeTargetMargin,
      marginError,
      rawRecommendedPrice,
      recommendedPrice,
      profitPerUnit,
      totalProfitBatch,
      actualMarginPercent,
      roundMode,
      ingredientDetails,
      additionalCostDetails,
      isManualPrice,
      manualEvaluation,
      calculatedAt: Date.now()
    };
  };

  /**
   * Menghasilkan teks ringkasan untuk dicopy atau dibagikan
   * @param {Object} result 
   * @returns {string}
   */
  const generateShareText = (result) => {
    if (!result) return '';
    const u = typeof Utils !== 'undefined' ? Utils : null;
    const fRp = u ? u.formatRupiah : (n) => `Rp ${n}`;
    const fPct = u ? u.formatPercent : (n) => `${n}%`;

    const lines = [
      `🍰 HASIL KALKULASI HPP - ${result.productName.toUpperCase()}`,
      `Aplikasi: Baking Calculator Lite`,
      `---------------------------------`,
      `📦 Hasil Produksi: ${result.yieldQty} ${result.yieldUnit}`,
      `💰 Total HPP Batch: ${fRp(result.totalHppBatch)}`,
      `   • Biaya Bahan: ${fRp(result.totalIngredientsCost)}`,
      `   • Biaya Tambahan: ${fRp(result.totalAdditionalCost)}`,
      `🏷️ HPP per ${result.yieldUnit}: ${fRp(result.hppPerUnit)}`,
      `🎯 Target Margin: ${fPct(result.targetMargin)}`,
      `✨ Rekomendasi Harga Jual: ${fRp(result.recommendedPrice)} / ${result.yieldUnit}`,
      `📈 Estimasi Untung / ${result.yieldUnit}: ${fRp(result.profitPerUnit)}`,
      `💵 Total Estimasi Untung / Batch: ${fRp(result.totalProfitBatch)}`,
      `---------------------------------`,
      `Hitung HPP kuemu di Baking Calculator Lite!`
    ];

    if (result.isManualPrice && result.manualEvaluation) {
      lines.splice(8, 0,
        `📌 Harga Jual Manual: ${fRp(result.manualEvaluation.actualSellingPrice)}`,
        `   • Untung Aktual / ${result.yieldUnit}: ${fRp(result.manualEvaluation.profitPerUnit)}`,
        `   • Margin Aktual: ${fPct(result.manualEvaluation.actualMarginPercent)}`
      );
    }

    return lines.join('\n');
  };

  return {
    DEFAULT_UNITS,
    YIELD_UNITS,
    DEFAULT_ADDITIONAL_COSTS,
    calculateIngredientCost,
    roundSellingPrice,
    calculateTotal,
    generateShareText
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator;
}
