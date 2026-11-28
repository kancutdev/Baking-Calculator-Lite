/**
 * Baking Calculator Lite - Affiliate Manager Module
 * Mengelola pemuatan data affiliate Shopee, sistem cache, filter kategori,
 * pencarian produk, dan rendering kartu produk yang aman (anti-XSS).
 */

const AffiliateManager = (() => {
  'use strict';

  // State internal
  let cachedProducts = [];
  let availableCategories = ['Semua'];
  let lastUpdatedTime = null;
  let lastFingerprint = '';
  let isFetching = false;
  let pollIntervalId = null;
  let isPollingActive = false;
  const subscribers = new Set();

  /**
   * Menghitung fingerprint unik data produk untuk deteksi perubahan realtime
   */
  const computeFingerprint = (products) => {
    if (!Array.isArray(products)) return '';
    return products.map(p => `${p.id}:${p.name}:${p.active}:${p.price}:${p.shopee_url}:${p.label}:${p.featured}:${p.image}`).join('|');
  };

  /**
   * Mengambil URL endpoint yang aktif dengan cache-busting timestamp otomatis
   */
  const getActiveJsonUrl = (forceRefresh = false) => {
    let url = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.remoteJsonUrl) 
      ? AFFILIATE_CONFIG.remoteJsonUrl 
      : (typeof AFFILIATE_CONFIG !== 'undefined' ? AFFILIATE_CONFIG.localJsonUrl : 'data/affiliate-products.json');

    // Selalu sertakan cache-buster timestamp unik agar browser & CDN tidak menyajikan file statis lama
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}_t=${Date.now()}`;
    return url;
  };

  /**
   * Notifikasi seluruh subscriber (komponen UI) ketika data produk mengalami perubahan
   */
  const notifySubscribers = () => {
    subscribers.forEach(callback => {
      try {
        callback(cachedProducts);
      } catch (err) {
        console.warn('Error in affiliate subscriber callback:', err);
      }
    });
  };

  /**
   * Berlangganan perubahan data produk realtime
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  const subscribe = (callback) => {
    if (typeof callback === 'function') {
      subscribers.add(callback);
    }
    return () => unsubscribe(callback);
  };

  /**
   * Batalkan langganan perubahan data
   * @param {Function} callback 
   */
  const unsubscribe = (callback) => {
    subscribers.delete(callback);
  };

  /**
   * Validasi dan sanitasi array produk
   */
  const sanitizeProductList = (rawProducts) => {
    if (!Array.isArray(rawProducts)) return [];

    return rawProducts.filter(item => {
      // Wajib active === true
      if (item.active !== true) return false;

      // Nama wajib ada
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) return false;

      // URL Shopee wajib ada dan valid
      if (typeof Validation !== 'undefined') {
        if (!Validation.isValidShopeeUrl(item.shopee_url)) return false;
      } else {
        if (!item.shopee_url || typeof item.shopee_url !== 'string') return false;
        try {
          const u = new URL(item.shopee_url.trim());
          if (u.protocol !== 'https:') return false;
          const host = u.hostname.toLowerCase();
          const allowed = ['shopee.co.id', 'shopee.ee', 'shope.ee', 'shp.ee', 'shopee.com'];
          if (!allowed.some(base => host === base || host.endsWith('.' + base))) return false;
        } catch {
          return false;
        }
      }

      return true;
    }).map(item => ({
      id: String(item.id || 'p_' + Math.random().toString(36).substr(2, 6)),
      name: String(item.name).trim(),
      description: String(item.description || '').trim(),
      category: String(item.category || 'Baking tools').trim(),
      image: (item.image && typeof item.image === 'string' && item.image.trim()) 
        ? item.image.trim() 
        : 'assets/images/placeholder-product.svg',
      price: (typeof item.price === 'number' && item.price >= 0) ? item.price : null,
      shopee_url: item.shopee_url.trim(),
      label: item.label ? String(item.label).trim() : null,
      featured: Boolean(item.featured),
      active: true
    }));
  };

  /**
   * Fetch produk dari JSON terpusat secara realtime TANPA CACHE (Murni Network-Only / no-store)
   * Menggunakan fingerprint untuk mendeteksi perubahan data.
   * @param {boolean} forceRefresh 
   * @returns {Promise<{success: boolean, products: Array, changed: boolean, source: 'network'|'memory'|'empty', message: string}>}
   */
  const loadProducts = async (forceRefresh = false) => {
    if (isFetching) {
      return {
        success: true,
        products: cachedProducts,
        changed: false,
        source: 'memory',
        message: 'Sedang memuat data terbaru...'
      };
    }

    isFetching = true;
    const url = getActiveJsonUrl(forceRefresh);

    try {
      const timeoutMs = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.fetchTimeoutMs) || 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const validProducts = sanitizeProductList(json.products);

      if (Array.isArray(json.categories)) {
        availableCategories = json.categories;
      }

      const newFingerprint = computeFingerprint(validProducts);
      const hasChanged = (newFingerprint !== lastFingerprint);

      cachedProducts = validProducts;
      lastUpdatedTime = Date.now();
      lastFingerprint = newFingerprint;
      isFetching = false;

      // Jika data berubah (atau baru pertama kali dimuat), beri tahu semua subscriber
      if (hasChanged) {
        notifySubscribers();
      }

      return {
        success: true,
        products: validProducts,
        changed: hasChanged,
        source: 'network',
        message: 'Data produk berhasil disinkronkan secara realtime'
      };
    } catch (err) {
      console.warn('Sinkronisasi affiliate JSON gagal:', err.message);
      isFetching = false;

      // Pertahankan produk yang sudah ada di memori aktif, jangan kosongkan DOM
      if (cachedProducts && cachedProducts.length > 0) {
        return {
          success: true,
          products: cachedProducts,
          changed: false,
          source: 'memory',
          message: 'Menggunakan data produk aktif di memori'
        };
      }

      return {
        success: false,
        products: [],
        changed: false,
        source: 'empty',
        message: 'Tidak dapat memuat data produk Shopee saat ini.'
      };
    }
  };

  /**
   * Menjalankan siklus polling otomatis setiap 30 detik
   * Menjaga DOM tetap update secara seamless tanpa reload halaman
   */
  const startPolling = () => {
    if (isPollingActive) return;
    isPollingActive = true;

    const intervalMs = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.pollIntervalMs) 
      ? AFFILIATE_CONFIG.pollIntervalMs 
      : 30000;

    const runPoll = async () => {
      // Jangan fetch jika tab sedang diminimize / di latar belakang
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      await loadProducts(false);
    };

    if (pollIntervalId) clearInterval(pollIntervalId);
    pollIntervalId = setInterval(runPoll, intervalMs);

    // Visibility change handler: pause saat tab tidak aktif, resume saat tab aktif
    if (typeof document !== 'undefined' && !document._affiliateVisibilityBound) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isPollingActive) {
          // Tab kembali terlihat, segera cek pembaharuan
          runPoll();
        }
      });
      document._affiliateVisibilityBound = true;
    }
  };

  /**
   * Menghentikan siklus polling
   */
  const stopPolling = () => {
    isPollingActive = false;
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  };

  /**
   * Filter dan pencarian produk
   * @param {Object} options 
   * @returns {Array}
   */
  const filterProducts = (options = {}) => {
    const { category = 'Semua', query = '', featuredOnly = false } = options;
    const cleanQuery = query.toLowerCase().trim();

    return cachedProducts.filter(item => {
      // Filter kategori
      if (category && category !== 'Semua' && item.category !== category) {
        return false;
      }

      // Filter featured
      if (featuredOnly && !item.featured) {
        return false;
      }

      // Filter search
      if (cleanQuery) {
        const matchName = item.name.toLowerCase().includes(cleanQuery);
        const matchDesc = item.description.toLowerCase().includes(cleanQuery);
        const matchCat = item.category.toLowerCase().includes(cleanQuery);
        if (!matchName && !matchDesc && !matchCat) {
          return false;
        }
      }

      return true;
    });
  };

  /**
   * Menentukan label CTA dinamis berdasarkan kategori produk
   * Sesuai ketentuan etika tanpa klaim fiktif
   */
  const getCtaLabel = (category) => {
    const cat = String(category || '').toLowerCase();
    if (cat.includes('mixer') || cat.includes('oven') || cat.includes('peralatan usaha')) {
      return 'Lihat Penawaran di Shopee';
    }
    if (cat.includes('bahan') || cat.includes('packaging')) {
      return 'Beli di Shopee';
    }
    // Kategori alat kecil (spatula, timbangan digital, alat ukur, loyang, dekorasi kue)
    return 'Cek Harga di Shopee';
  };

  /**
   * Ambil rekomendasi kontekstual untuk halaman HPP (maksimal 3 produk)
   * Mengutamakan produk relevan berdasarkan takaran resep dan ukuran batch
   */
  const getContextualRecommendations = (limit = 3, context = {}) => {
    if (!cachedProducts || cachedProducts.length === 0) return [];

    const { hasSmallIngredients = false, isBakingPan = false, isLargeBatch = false } = context;

    const contextualMatches = [];

    if (hasSmallIngredients) {
      // Prioritaskan timbangan digital
      const scales = cachedProducts.filter(p => p.category.toLowerCase().includes('timbangan'));
      contextualMatches.push(...scales);
    }

    if (isBakingPan) {
      // Prioritaskan loyang atau baking tools
      const pans = cachedProducts.filter(p => 
        p.category.toLowerCase().includes('loyang') || 
        p.category.toLowerCase().includes('baking tools')
      );
      contextualMatches.push(...pans);
    }

    if (isLargeBatch) {
      // Prioritaskan mixer / oven / peralatan usaha
      const heavyTools = cachedProducts.filter(p => 
        p.category.toLowerCase().includes('mixer') || 
        p.category.toLowerCase().includes('oven') || 
        p.category.toLowerCase().includes('peralatan usaha')
      );
      contextualMatches.push(...heavyTools);
    }

    // Dedup dan rangking produk
    const seenIds = new Set();
    const ranked = [];

    contextualMatches.forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        ranked.push(p);
      }
    });

    // Tambahkan produk featured
    cachedProducts.filter(p => p.featured).forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        ranked.push(p);
      }
    });

    // Tambahkan sisa produk aktif
    cachedProducts.forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        ranked.push(p);
      }
    });

    return ranked.slice(0, limit);
  };

  /**
   * Render kartu produk individual secara aman (anti XSS, DOM standard)
   * @param {Object} product 
   * @returns {HTMLElement}
   */
  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-id', product.id);

    // 1. Gambar Container
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-img-wrapper';

    const img = document.createElement('img');
    img.className = 'product-img';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    img.onerror = () => {
      img.onerror = null;
      img.src = 'assets/images/placeholder-product.svg';
    };
    imgWrapper.appendChild(img);

    // Label Badge jika ada
    if (product.label) {
      const badge = document.createElement('span');
      badge.className = 'product-badge';
      badge.textContent = product.label;
      imgWrapper.appendChild(badge);
    }

    // Kategori Pill
    const catPill = document.createElement('span');
    catPill.className = 'product-category-pill';
    catPill.textContent = product.category;
    imgWrapper.appendChild(catPill);

    card.appendChild(imgWrapper);

    // 2. Info Container
    const body = document.createElement('div');
    body.className = 'product-body';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name;
    body.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = product.description;
    body.appendChild(desc);

    // Baris Harga & CTA
    const footer = document.createElement('div');
    footer.className = 'product-footer';

    const priceRow = document.createElement('div');
    priceRow.className = 'product-footer-price-row';

    if (product.price !== null && typeof Utils !== 'undefined') {
      const priceTag = document.createElement('div');
      priceTag.className = 'product-price';
      priceTag.textContent = Utils.formatRupiah(product.price);
      priceRow.appendChild(priceTag);
    } else {
      const pricePlaceholder = document.createElement('div');
      pricePlaceholder.className = 'product-price-free';
      pricePlaceholder.textContent = 'Cek di Shopee';
      priceRow.appendChild(pricePlaceholder);
    }
    footer.appendChild(priceRow);

    // Tombol CTA Shopee dengan label dinamis
    if (product.shopee_url) {
      const ctaBtn = document.createElement('a');
      ctaBtn.className = 'btn btn-shopee';
      ctaBtn.href = product.shopee_url;
      ctaBtn.target = '_blank';
      ctaBtn.rel = 'noopener noreferrer';
      ctaBtn.setAttribute('aria-label', `${getCtaLabel(product.category)}: ${product.name}`);
      ctaBtn.setAttribute('data-item-id', product.id);
      ctaBtn.setAttribute('data-item-name', product.name);
      
      ctaBtn.innerHTML = `
        <svg class="shopee-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3zm7 17H5V8h2v2c0 .6.4 1 1 1s1-.4 1-1V8h6v2c0 .6.4 1 1 1s1-.4 1-1V8h2v12z"/>
        </svg>
        <span>${getCtaLabel(product.category)}</span>
      `;

      // Integrasi GA4 Click Tracking
      ctaBtn.addEventListener('click', () => {
        if (typeof Analytics !== 'undefined') {
          Analytics.trackAffiliateClick({
            itemId: product.id,
            itemName: product.name,
            itemCategory: product.category,
            placement: 'products_catalog',
            linkType: 'shopee'
          });
        }
      });

      footer.appendChild(ctaBtn);
    }

    body.appendChild(footer);
    card.appendChild(body);

    return card;
  };

  /**
   * Render thumbnail produk untuk galeri di Halaman Utama (Homepage Product Gallery)
   * Desain natural, rapi, menyatu dengan halaman, 1 thumbnail = 1 affiliate link unik.
   * Gambar dan nama dapat diklik. Tanpa CTA besar agresif.
   * @param {Object} product 
   * @param {string} placement
   * @returns {HTMLElement}
   */
  const createGalleryThumbnail = (product, placement = 'homepage_top_gallery') => {
    const card = document.createElement('article');
    card.className = 'affiliate-thumb-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('data-category', product.category);

    // Link pembungkus utama (gambar & info dapat diklik)
    const link = document.createElement('a');
    link.className = 'affiliate-thumb-link';
    link.href = product.shopee_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('data-item-id', product.id);
    link.setAttribute('data-item-name', product.name);
    link.setAttribute('aria-label', `Lihat ${product.name} di Shopee`);

    // Click tracking handler ke GA4
    link.addEventListener('click', () => {
      if (typeof Analytics !== 'undefined') {
        Analytics.trackAffiliateClick({
          itemId: product.id,
          itemName: product.name,
          itemCategory: product.category,
          placement: placement,
          linkType: 'shopee'
        });
      }
    });

    // 1. Image wrapper
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'thumb-img-wrapper';

    const img = document.createElement('img');
    img.className = 'thumb-img';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    img.onerror = () => {
      img.onerror = null;
      img.src = 'assets/images/placeholder-product.svg';
    };
    imgWrapper.appendChild(img);

    // Label badge jika tersedia
    if (product.label) {
      const badge = document.createElement('span');
      badge.className = 'thumb-badge';
      badge.textContent = product.label;
      imgWrapper.appendChild(badge);
    }

    link.appendChild(imgWrapper);

    // 2. Info Content (Compact Square Layout)
    const info = document.createElement('div');
    info.className = 'thumb-info';

    const title = document.createElement('h4');
    title.className = 'thumb-title';
    title.textContent = product.name;
    info.appendChild(title);

    // Meta row (Price + Shopee Tag bersisian agar hemat tinggi kartu)
    const metaRow = document.createElement('div');
    metaRow.className = 'thumb-meta-row';

    // Harga jika ada, atau "Cek Harga" jika tidak tersedia di data
    const priceTag = document.createElement('span');
    priceTag.className = 'thumb-price';
    if (product.price !== null && typeof product.price === 'number' && product.price > 0 && typeof Utils !== 'undefined') {
      priceTag.textContent = Utils.formatRupiah(product.price);
    } else {
      priceTag.textContent = 'Cek Harga';
    }
    metaRow.appendChild(priceTag);

    // Indikator Shopee yang halus dan elegan (bukan tombol promosi raksasa)
    const shopeeTag = document.createElement('span');
    shopeeTag.className = 'thumb-shopee-tag';
    shopeeTag.innerHTML = `
      <svg class="shopee-icon-mini" viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
        <path d="M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3zm7 17H5V8h2v2c0 .6.4 1 1 1s1-.4 1-1V8h6v2c0 .6.4 1 1 1s1-.4 1-1V8h2v12z"/>
      </svg>
      <span>Shopee</span>
    `;
    metaRow.appendChild(shopeeTag);

    info.appendChild(metaRow);
    link.appendChild(info);
    card.appendChild(link);

    return card;
  };

  /**
   * Getter state
   */
  const getProducts = () => [...cachedProducts];
  const getCategories = () => [...availableCategories];
  const getLastUpdated = () => lastUpdatedTime;

  return {
    loadProducts,
    startPolling,
    stopPolling,
    subscribe,
    unsubscribe,
    filterProducts,
    getContextualRecommendations,
    createProductCard,
    createGalleryThumbnail,
    getProducts,
    getCategories,
    getLastUpdated,
    getActiveJsonUrl,
    computeFingerprint
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AffiliateManager;
}
