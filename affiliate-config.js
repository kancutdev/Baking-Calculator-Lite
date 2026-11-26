/**
 * Baking Calculator Lite - Affiliate Configuration
 * Konfigurasi terpusat untuk data affiliate Shopee, tautan Pro, dan sosial media.
 * 
 * PANDUAN PENGATURAN:
 * 1. localJsonUrl: Path file JSON lokal di dalam repository.
 * 2. remoteJsonUrl: Jika Anda ingin memisahkan data produk agar bisa diupdate
 *    tanpa deploy kode, Anda bisa memasukkan URL raw GitHub dari file JSON Anda, contoh:
 *    'https://raw.githubusercontent.com/USERNAME/baking-calculator-lite/main/data/affiliate-products.json'
 * 3. proAppUrl: Masukkan URL Baking Calculator Pro jika sudah siap dipromosikan.
 * 4. tiktokUrl: Akun TikTok resmi.
 */

const AFFILIATE_CONFIG = {
  // Path file JSON lokal (relatif agar aman di subfolder GitHub Pages)
  localJsonUrl: 'data/affiliate-products.json',

  // URL remote opsional (kosongkan jika menggunakan file lokal)
  remoteJsonUrl: '',

  // URL promosi Baking Calculator Pro (opsional, jika kosong tombol akan disembunyikan di mode produksi)
  proAppUrl: '',

  // Tautan resmi media sosial
  tiktokUrl: 'https://www.tiktok.com/@bang_doned',

  // Nama aplikasi & branding
  appName: 'Baking Calculator Lite',
  tagline: 'Hitung Modal. Tentukan Harga. Maksimalkan Profit.',

  // Timeout fetch dalam milidetik
  fetchTimeoutMs: 8000,

  // Durasi cache lokal (30 menit)
  cacheDurationMs: 1000 * 60 * 30
};

// Freeze agar tidak dapat dimutasi secara tidak sengaja di runtime
if (typeof Object.freeze === 'function') {
  Object.freeze(AFFILIATE_CONFIG);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AFFILIATE_CONFIG;
}
