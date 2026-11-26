/**
 * Baking Calculator Lite - Validation Module
 * Validasi input kalkulator, sanitasi nilai, dan validasi data affiliate
 */

const Validation = (() => {
  'use strict';

  /**
   * Validasi data produk utama
   * @param {Object} product 
   * @returns {{isValid: boolean, errors: string[]}}
   */
  const validateProductInfo = (product) => {
    const errors = [];
    if (!product) {
      return { isValid: false, errors: ['Data produk tidak ditemukan'] };
    }

    const name = String(product.name || '').trim();
    if (!name) {
      errors.push('Nama produk kue wajib diisi');
    }

    const yieldQty = Number(product.yieldQty);
    if (isNaN(yieldQty) || yieldQty <= 0) {
      errors.push('Jumlah hasil produksi per batch harus lebih dari 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Validasi satu baris bahan baku
   * @param {Object} item 
   * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
   */
  const validateIngredient = (item) => {
    const errors = [];
    const warnings = [];

    if (!item) {
      return { isValid: false, errors: ['Baris bahan kosong'], warnings: [] };
    }

    const name = String(item.name || '').trim();
    if (!name) {
      errors.push('Nama bahan tidak boleh kosong');
    }

    const usageQty = Number(item.usageQty);
    if (isNaN(usageQty) || usageQty < 0) {
      errors.push('Jumlah pemakaian bahan tidak boleh negatif');
    }

    const purchaseQty = Number(item.purchaseQty);
    if (isNaN(purchaseQty) || purchaseQty <= 0) {
      errors.push('Jumlah pembelian bahan harus lebih besar dari 0 (mencegah pembagian nol)');
    }

    const purchasePrice = Number(item.purchasePrice);
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      errors.push('Harga pembelian bahan tidak boleh negatif');
    }

    // Periksa kompatibilitas satuan
    if (typeof Utils !== 'undefined' && item.usageUnit && item.purchaseUnit) {
      const conv = Utils.getConversionRatio(item.usageUnit, item.purchaseUnit);
      if (!conv.compatible) {
        warnings.push(conv.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  /**
   * Validasi target margin keuntungan
   * @param {number|string} marginPercent 
   * @returns {{isValid: boolean, error: string|null}}
   */
  const validateMargin = (marginPercent) => {
    const num = Number(marginPercent);
    if (isNaN(num)) {
      return { isValid: false, error: 'Target margin harus berupa angka' };
    }
    if (num < 0) {
      return { isValid: false, error: 'Target margin tidak boleh bernilai negatif' };
    }
    if (num >= 100) {
      return {
        isValid: false,
        error: 'Target margin tidak boleh mencapai atau melebihi 100%. (Dalam konsep margin: Harga Jual = HPP / (1 - Margin), jika margin 100% maka pembagi bernilai 0)'
      };
    }
    return { isValid: true, error: null };
  };

  /**
   * Validasi URL Shopee
   * Hanya menerima protokol HTTPS dan domain resmi Shopee
   * @param {string} url 
   * @returns {boolean}
   */
  const isValidShopeeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim();

    try {
      const parsed = new URL(cleanUrl);
      if (parsed.protocol !== 'https:') return false;

      const validHostPatterns = [
        /(^|\.)shopee\.co\.id$/i,
        /(^|\.)shope\.ee$/i,
        /(^|\.)shopee\.com$/i,
        /(^|\.)shp\.ee$/i
      ];

      return validHostPatterns.some(pattern => pattern.test(parsed.hostname));
    } catch {
      return false;
    }
  };

  /**
   * Validasi URL gambar produk
   * Menerima HTTPS atau relative path aman
   * @param {string} url 
   * @returns {boolean}
   */
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    if (clean === '') return false;

    // Relative path lokal aman
    if (clean.startsWith('assets/') || clean.startsWith('./assets/')) return true;

    // External URL wajib HTTPS
    try {
      const parsed = new URL(clean);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  /**
   * Validasi entitas produk affiliate dari JSON
   * @param {Object} product 
   * @returns {{isValid: boolean, reason?: string}}
   */
  const validateAffiliateProduct = (product) => {
    if (!product || typeof product !== 'object') {
      return { isValid: false, reason: 'Bukan objek produk yang valid' };
    }

    // Status aktif wajib true
    if (product.active !== true) {
      return { isValid: false, reason: 'Produk tidak aktif (active=false)' };
    }

    // Nama produk wajib ada
    if (!product.name || typeof product.name !== 'string' || !product.name.trim()) {
      return { isValid: false, reason: 'Nama produk kosong' };
    }

    // Tautan Shopee wajib valid
    if (!isValidShopeeUrl(product.shopee_url)) {
      return { isValid: false, reason: 'Tautan Shopee tidak valid atau tidak menggunakan HTTPS' };
    }

    return { isValid: true };
  };

  return {
    validateProductInfo,
    validateIngredient,
    validateMargin,
    isValidShopeeUrl,
    isValidImageUrl,
    validateAffiliateProduct
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}
