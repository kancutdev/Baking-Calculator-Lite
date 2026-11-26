/**
 * Baking Calculator Lite - Web Analytics Module (Google Analytics 4)
 * Menangani pencatatan statistik pengunjung, aktivitas kalkulator, dan pelacakan klik affiliate Shopee.
 * 
 * PRINSIP PRIVASI & PERFORMA:
 * 1. Tanpa ID valid, skrip pihak ketiga TIDAK AKAN DIMUAT (zero overhead, 100% offline-ready).
 * 2. Data resep, nama bahan, harga modal, nilai HPP, dan keuntungan TIDAK PERNAH dikirim ke GA4.
 * 3. Pelacakan klik affiliate menggunakan mekanisme non-blocking (transport: beacon) sehingga
 *    navigasi ke Shopee tetap berjalan lancar meski analytics terblokir ad-blocker.
 */

const Analytics = (() => {
  let isInitialized = false;
  let isEnabled = false;
  let measurementId = '';

  /**
   * Cek apakah Measurement ID valid (format GA4: G-XXXXXXXXXX)
   * Menolak string kosong, null, atau placeholder contoh (seperti G-XXXXXXXXXX)
   */
  const isValidMeasurementId = (id) => {
    if (!id || typeof id !== 'string') return false;
    const clean = id.trim();
    if (!clean.startsWith('G-')) return false;
    if (/^G-[X]+$/i.test(clean)) return false; // Tolak placeholder
    return /^G-[A-Za-z0-9]{5,15}$/.test(clean);
  };

  /**
   * Cetak log debug jika debugMode aktif
   */
  const logDebug = (...args) => {
    if (typeof ANALYTICS_CONFIG !== 'undefined' && ANALYTICS_CONFIG.debugMode) {
      console.log('[Analytics GA4]', ...args);
    }
  };

  /**
   * Inisialisasi Google Analytics 4
   */
  const init = () => {
    if (isInitialized) return isEnabled;

    const rawId = (typeof ANALYTICS_CONFIG !== 'undefined' && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) || '';

    if (!isValidMeasurementId(rawId)) {
      logDebug('GA_MEASUREMENT_ID belum diisi atau masih placeholder. Pelacakan GA4 dinonaktifkan.');
      isInitialized = true;
      isEnabled = false;
      return false;
    }

    measurementId = rawId.trim();

    try {
      // 1. Setup dataLayer & gtag function
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        anonymize_ip: true,
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure'
      });

      // 2. Inject Google Tag script secara async jika belum ada
      const scriptId = 'ga-gtag-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onerror = () => {
          logDebug('Gagal memuat skrip gtag.js (kemungkinan offline atau ad-blocker aktif).');
        };
        document.head.appendChild(script);
      }

      isInitialized = true;
      isEnabled = true;
      logDebug('GA4 berhasil diinisialisasi dengan ID:', measurementId);
      return true;
    } catch (err) {
      logDebug('Error saat inisialisasi GA4:', err.message);
      isInitialized = true;
      isEnabled = false;
      return false;
    }
  };

  /**
   * Catat kunjungan halaman (Page View)
   */
  const trackPageView = (pageTitle, pagePath) => {
    if (!isEnabled || typeof window.gtag !== 'function') {
      logDebug('Page view dicatat (simulasi/nonaktif):', { pageTitle, pagePath });
      return;
    }

    try {
      window.gtag('event', 'page_view', {
        page_title: pageTitle || document.title,
        page_location: window.location.href,
        page_path: pagePath || window.location.pathname
      });
      logDebug('Event page_view terkirim');
    } catch (err) {
      logDebug('Gagal kirim page_view:', err.message);
    }
  };

  /**
   * Catat aktivitas kalkulator berhasil (calculator_used)
   * HANYA mengirimkan metadata umum. DILARANG KERAS mengirimkan:
   * nama resep, isi bahan, nominal modal, nilai HPP, harga jual, atau data sensitif.
   */
  const trackCalculatorUsed = (options = {}) => {
    // Whitelist parameter yang diizinkan saja
    const cleanType = String(options.calculator_type || 'hpp_standard').slice(0, 30);
    const cleanCat = options.product_category ? String(options.product_category).slice(0, 30) : 'umum';

    const eventParams = {
      calculator_type: cleanType,
      product_category: cleanCat
    };

    if (!isEnabled || typeof window.gtag !== 'function') {
      logDebug('Event calculator_used (simulasi/nonaktif):', eventParams);
      return;
    }

    try {
      window.gtag('event', 'calculator_used', eventParams);
      logDebug('Event calculator_used terkirim:', eventParams);
    } catch (err) {
      logDebug('Gagal kirim calculator_used:', err.message);
    }
  };

  /**
   * Catat klik affiliate Shopee (affiliate_click)
   * Setiap thumbnail/produk memiliki identitas tersendiri (item_id, item_name, placement)
   */
  const trackAffiliateClick = (options = {}) => {
    const {
      itemId,
      itemName,
      itemCategory = 'Peralatan Baking',
      placement = 'homepage_product_gallery',
      linkType = 'shopee'
    } = options;

    if (!itemId || !itemName) {
      logDebug('trackAffiliateClick dibatalkan: item_id atau item_name tidak valid.');
      return;
    }

    const eventParams = {
      item_id: String(itemId).trim(),
      item_name: String(itemName).trim(),
      item_category: String(itemCategory).trim(),
      placement: String(placement).trim(),
      link_type: String(linkType).trim(),
      transport: 'beacon'
    };

    if (!isEnabled || typeof window.gtag !== 'function') {
      logDebug('Event affiliate_click (simulasi/nonaktif):', eventParams);
      return;
    }

    try {
      window.gtag('event', 'affiliate_click', eventParams);
      logDebug('Event affiliate_click terkirim:', eventParams);
    } catch (err) {
      logDebug('Gagal kirim affiliate_click:', err.message);
    }
  };

  /**
   * Status konfigurasi
   */
  const isConfigured = () => isEnabled;
  const getMeasurementId = () => measurementId;

  // Auto-init saat DOM siap
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    init,
    isValidMeasurementId,
    trackPageView,
    trackCalculatorUsed,
    trackAffiliateClick,
    isConfigured,
    getMeasurementId
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
