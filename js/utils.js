/**
 * Baking Calculator Lite - Utilities Module
 * Format mata uang Rupiah, konversi satuan, notifikasi toast, copy/share helper
 */

const Utils = (() => {
  'use strict';

  /**
   * Format angka ke format Rupiah Indonesia yang bersih dan rapi
   * Contoh: 125000 -> "Rp 125.000"
   * @param {number|string} amount 
   * @param {boolean} showZero 
   * @returns {string}
   */
  const formatRupiah = (amount, showZero = true) => {
    const num = Number(amount);
    if (isNaN(num)) return showZero ? 'Rp 0' : '-';
    if (num === 0 && !showZero) return '-';

    const isNegative = num < 0;
    const absVal = Math.abs(Math.round(num));
    const parts = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${isNegative ? '-Rp ' : 'Rp '}${parts}`;
  };

  /**
   * Parse angka dari string (termasuk format Rupiah atau pemisah titik/koma)
   * @param {string|number} str 
   * @returns {number}
   */
  const parseNumber = (str) => {
    if (typeof str === 'number') return isNaN(str) ? 0 : str;
    if (!str) return 0;
    // Hapus karakter non-angka kecuali minus, titik dan koma
    let clean = String(str).replace(/[^\d.,-]/g, '').trim();
    if (!clean) return 0;

    // Jika format Indonesia 125.000,50 -> ubah titik ke kosong dan koma ke titik
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes('.') && !clean.includes(',')) {
      // Periksa apakah titik adalah pemisah ribuan (misal: 10.000)
      const parts = clean.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        clean = clean.replace(/\./g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }

    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  /**
   * Format persentase
   * @param {number} value 
   * @param {number} decimals 
   * @returns {string}
   */
  const formatPercent = (value, decimals = 1) => {
    const num = Number(value);
    if (isNaN(num)) return '0%';
    return `${num.toFixed(decimals).replace(/\.0$/, '')}%`;
  };

  /**
   * Definisi grup satuan dan faktor konversi ke basis grup
   */
  const UNIT_GROUPS = {
    MASS: {
      id: 'mass',
      base: 'g',
      units: {
        'g': 1,
        'gram': 1,
        'kg': 1000,
        'kilogram': 1000
      }
    },
    VOLUME: {
      id: 'volume',
      base: 'ml',
      units: {
        'ml': 1,
        'mililiter': 1,
        'l': 1000,
        'liter': 1000
      }
    },
    COUNT: {
      id: 'count',
      base: 'unit',
      units: {
        'pcs': 1,
        'butir': 1,
        'sachet': 1,
        'pack': 1,
        'box': 1,
        'loyang': 1,
        'slice': 1,
        'jar': 1
      }
    }
  };

  /**
   * Mencari grup satuan dari nama satuan
   * @param {string} unit 
   * @returns {{group: string, factor: number}|null}
   */
  const getUnitInfo = (unit) => {
    if (!unit) return null;
    const cleanUnit = String(unit).trim().toLowerCase();

    for (const key in UNIT_GROUPS) {
      const g = UNIT_GROUPS[key];
      if (g.units[cleanUnit] !== undefined) {
        return {
          group: g.id,
          factor: g.units[cleanUnit],
          name: cleanUnit
        };
      }
    }
    return {
      group: 'custom_' + cleanUnit,
      factor: 1,
      name: cleanUnit
    };
  };

  /**
   * Memeriksa apakah dua satuan kompatibel dan mengembalikan rasio konversinya
   * (Faktor penggunaan / Faktor pembelian)
   * @param {string} usageUnit 
   * @param {string} purchaseUnit 
   * @returns {{compatible: boolean, ratio: number, message: string}}
   */
  const getConversionRatio = (usageUnit, purchaseUnit) => {
    const u1 = getUnitInfo(usageUnit);
    const u2 = getUnitInfo(purchaseUnit);

    if (!u1 || !u2) {
      return { compatible: false, ratio: 1, message: 'Satuan tidak valid' };
    }

    // Satuan sama persis
    if (u1.name === u2.name) {
      return { compatible: true, ratio: 1, message: 'Satuan identik' };
    }

    // Sama-sama grup massa (g <-> kg)
    if (u1.group === 'mass' && u2.group === 'mass') {
      const ratio = u1.factor / u2.factor;
      return {
        compatible: true,
        ratio: ratio,
        message: `Konversi otomatis ${u1.name} ke ${u2.name}`
      };
    }

    // Sama-sama grup volume (ml <-> l)
    if (u1.group === 'volume' && u2.group === 'volume') {
      const ratio = u1.factor / u2.factor;
      return {
        compatible: true,
        ratio: ratio,
        message: `Konversi otomatis ${u1.name} ke ${u2.name}`
      };
    }

    // Beda grup (misal: gram ke ml, atau butir ke kg)
    return {
      compatible: false,
      ratio: 1,
      message: `Satuan '${usageUnit}' dan '${purchaseUnit}' berbeda jenis (massa/volume/hitungan). Konversi langsung tidak akurat tanpa densitas bahan.`
    };
  };

  /**
   * Sanitasi teks untuk mencegah XSS
   * @param {string} str 
   * @returns {string}
   */
  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  /**
   * Menampilkan pesan Toast notification di UI
   * @param {string} message 
   * @param {'success'|'error'|'info'|'warning'} type 
   * @param {number} duration 
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
      <span class="toast-message">${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    // Animasi tampil
    requestAnimationFrame(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-active');
    });

    // Otomatis hilang
    setTimeout(() => {
      toast.classList.remove('toast-active');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  };

  /**
   * Salin teks ke Clipboard dengan fallback aman
   * @param {string} text 
   * @returns {Promise<boolean>}
   */
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (err) {
      console.warn('Gagal menyalin:', err);
      return false;
    }
  };

  /**
   * Bagikan via Web Share API atau fallback salin
   * @param {{title: string, text: string, url?: string}} shareData 
   * @returns {Promise<{shared: boolean, method: 'native'|'copied'|'failed'}>}
   */
  const shareContent = async (shareData) => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return { shared: true, method: 'native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { shared: false, method: 'cancelled' };
        }
      }
    }

    // Fallback: Salin teks ke clipboard
    const fullText = `${shareData.title}\n\n${shareData.text}${shareData.url ? '\n\n' + shareData.url : ''}`;
    const copied = await copyToClipboard(fullText);
    return {
      shared: copied,
      method: copied ? 'copied' : 'failed'
    };
  };

  /**
   * Format tanggal Indonesia
   * @param {string|Date|number} timestamp 
   * @returns {string}
   */
  const formatDateIndo = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';

    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const d = date.getDate();
    const m = bulan[date.getMonth()];
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${d} ${m} ${y}, ${h}:${min} WIB`;
  };

  /**
   * Debounce helper
   */
  const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  return {
    formatRupiah,
    parseNumber,
    formatPercent,
    UNIT_GROUPS,
    getUnitInfo,
    getConversionRatio,
    escapeHTML,
    showToast,
    copyToClipboard,
    shareContent,
    formatDateIndo,
    debounce
  };
})();

// Ekspor untuk environment modular maupun browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
