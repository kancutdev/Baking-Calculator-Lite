/**
 * Baking Calculator Lite - Google Analytics 4 (GA4) Configuration
 * File konfigurasi terpusat untuk integrasi statistik pengunjung, aktivitas kalkulator, dan klik affiliate.
 * 
 * PANDUAN PENGISIAN GA_MEASUREMENT_ID:
 * 1. Buka akun Google Analytics Anda di https://analytics.google.com/
 * 2. Masuk ke Admin (ikon gerigi di kiri bawah) -> Data Streams (Aliran Data) -> Web.
 * 3. Salin kode 'Measurement ID' Anda (format: G-XXXXXXXXXX).
 * 4. Masukkan kode tersebut ke dalam variabel GA_MEASUREMENT_ID di bawah ini.
 * 
 * CATATAN PENTING KEAMANAN & PRIVASI:
 * - Jangan gunakan ID palsu. Jika Anda belum memiliki Measurement ID, biarkan string kosong ('').
 * - Selama GA_MEASUREMENT_ID kosong, pengiriman event dan skrip eksternal GA4 TIDAK AKAN AKTIF.
 * - Seluruh kalkulator HPP dan navigasi aplikasi tetap berfungsi 100% normal tanpa error.
 * - Aplikasi ini TIDAK PERNAH mengirimkan data resep, isi bahan baku, harga modal, HPP, atau keuntungan pengguna ke Analytics.
 */

const ANALYTICS_CONFIG = {
  // Masukkan GA4 Measurement ID Anda di sini (contoh: 'G-ABC123XYZ0').
  // Biarkan kosong ('') jika belum dikonfigurasi.
  GA_MEASUREMENT_ID: '',

  // Aktifkan mode debug (mencetak log aktivitas analytics di konsol browser untuk pengujian)
  debugMode: false,

  // Nama aplikasi
  appName: 'Baking Calculator Lite'
};

// Freeze agar konfigurasi tidak dapat dimutasi secara tidak sengaja di runtime
if (typeof Object.freeze === 'function') {
  Object.freeze(ANALYTICS_CONFIG);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANALYTICS_CONFIG;
}
