/**
 * Baking Calculator Lite - Storage Module
 * Menyimpan draft perhitungan, riwayat lokal (maksimal 10), dan cache affiliate
 */

const Storage = (() => {
  'use strict';

  const KEYS = {
    DRAFT: 'bcl_draft_calculation',
    HISTORY: 'bcl_history_calculations',
    AFFILIATE_CACHE: 'bcl_affiliate_cache',
    AFFILIATE_CACHE_TIME: 'bcl_affiliate_cache_time'
  };

  // Fallback memory jika LocalStorage diblokir di browser (private mode tertentu)
  const memoryStore = {};

  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__bcl_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  };

  const hasStorage = isLocalStorageAvailable();

  // Bersihkan cache produk affiliate lama dari LocalStorage jika ada (Katalog affiliate kini 100% realtime tanpa cache)
  try {
    if (hasStorage) {
      localStorage.removeItem('bcl_affiliate_cache');
      localStorage.removeItem('bcl_affiliate_cache_time');
    }
  } catch {}

  const getItem = (key) => {
    try {
      if (hasStorage) {
        return localStorage.getItem(key);
      }
      return memoryStore[key] || null;
    } catch (e) {
      console.warn('Gagal membaca storage:', e);
      return memoryStore[key] || null;
    }
  };

  const setItem = (key, value) => {
    try {
      if (hasStorage) {
        localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
      return true;
    } catch (e) {
      console.warn('Gagal menulis storage:', e);
      memoryStore[key] = value;
      return false;
    }
  };

  const removeItem = (key) => {
    try {
      if (hasStorage) {
        localStorage.removeItem(key);
      } else {
        delete memoryStore[key];
      }
      return true;
    } catch (e) {
      console.warn('Gagal menghapus dari storage:', e);
      delete memoryStore[key];
      return false;
    }
  };

  // --- DRAFT METHODS ---
  const saveDraft = (data) => {
    try {
      const payload = JSON.stringify({
        updatedAt: Date.now(),
        data
      });
      return setItem(KEYS.DRAFT, payload);
    } catch {
      return false;
    }
  };

  const loadDraft = () => {
    try {
      const raw = getItem(KEYS.DRAFT);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    return removeItem(KEYS.DRAFT);
  };

  // --- HISTORY METHODS (Maksimal 10 riwayat) ---
  const getHistory = () => {
    try {
      const raw = getItem(KEYS.HISTORY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveToHistory = (calcResult) => {
    try {
      if (!calcResult) return false;
      const history = getHistory();

      // Tambahkan ID unik dan timestamp jika belum ada
      const entry = {
        id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        savedAt: Date.now(),
        ...calcResult
      };

      // Simpan di baris paling depan (terbaru)
      history.unshift(entry);

      // Batasi maksimal 10 riwayat
      const trimmed = history.slice(0, 10);
      return setItem(KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Gagal menyimpan riwayat:', e);
      return false;
    }
  };

  const deleteHistoryItem = (id) => {
    try {
      const history = getHistory();
      const filtered = history.filter(item => item.id !== id);
      return setItem(KEYS.HISTORY, JSON.stringify(filtered));
    } catch {
      return false;
    }
  };

  const clearHistory = () => {
    return removeItem(KEYS.HISTORY);
  };

  // --- AFFILIATE CACHE METHODS (DINONAKTIFKAN: 100% REALTIME DARI SERVER) ---
  const getAffiliateCache = () => null;
  const setAffiliateCache = () => false;

  return {
    isAvailable: hasStorage,
    saveDraft,
    loadDraft,
    clearDraft,
    getHistory,
    saveToHistory,
    deleteHistoryItem,
    clearHistory,
    getAffiliateCache,
    setAffiliateCache
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
