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
  let isFetching = false;

  /**
   * Mengambil URL endpoint yang aktif (remote jika ada, fallback ke local)
   */
  const getActiveJsonUrl = (forceRefresh = false) => {
    let url = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.remoteJsonUrl) 
      ? AFFILIATE_CONFIG.remoteJsonUrl 
      : (typeof AFFILIATE_CONFIG !== 'undefined' ? AFFILIATE_CONFIG.localJsonUrl : 'data/affiliate-products.json');

    // Hindari cache-busting berlebih, gunakan hanya saat forceRefresh
    if (forceRefresh) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}_t=${Date.now()}`;
    }
    return url;
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
        if (!item.shopee_url || !item.shopee_url.startsWith('https://')) return false;
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
   * Fetch produk dari JSON terpusat dengan timeout dan fallback cache
   * @param {boolean} forceRefresh 
   * @returns {Promise<{success: boolean, products: Array, source: 'network'|'cache'|'empty', message: string}>}
   */
  const loadProducts = async (forceRefresh = false) => {
    if (isFetching) {
      return {
        success: true,
        products: cachedProducts,
        source: 'cache',
        message: 'Sedang memuat data...'
      };
    }

    isFetching = true;
    const url = getActiveJsonUrl(forceRefresh);

    // Periksa cache lokal jika bukan forceRefresh
    if (!forceRefresh && typeof Storage !== 'undefined') {
      const cached = Storage.getAffiliateCache();
      if (cached && Array.isArray(cached.products) && cached.products.length > 0) {
        cachedProducts = cached.products;
        lastUpdatedTime = cached.timestamp || Date.now();
        isFetching = false;
        return {
          success: true,
          products: cachedProducts,
          source: 'cache',
          message: 'Data dimuat dari memori lokal (offline-ready)'
        };
      }
    }

    try {
      const timeoutMs = (typeof AFFILIATE_CONFIG !== 'undefined' && AFFILIATE_CONFIG.fetchTimeoutMs) || 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
        cache: forceRefresh ? 'no-cache' : 'default'
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

      cachedProducts = validProducts;
      lastUpdatedTime = Date.now();

      // Simpan ke storage cache
      if (typeof Storage !== 'undefined') {
        Storage.setAffiliateCache(validProducts, lastUpdatedTime);
      }

      isFetching = false;
      return {
        success: true,
        products: validProducts,
        source: 'network',
        message: 'Data produk berhasil diperbarui dari katalog Shopee'
      };
    } catch (err) {
      console.warn('Gagal fetch remote affiliate JSON:', err.message);
      isFetching = false;

      // Fallback ke cache jika ada
      if (typeof Storage !== 'undefined') {
        const cached = Storage.getAffiliateCache();
        if (cached && Array.isArray(cached.products)) {
          cachedProducts = cached.products;
          lastUpdatedTime = cached.timestamp;
          return {
            success: true,
            products: cachedProducts,
            source: 'cache',
            message: 'Menggunakan data tersimpan terakhir (koneksi offline/terbatas)'
          };
        }
      }

      return {
        success: false,
        products: [],
        source: 'empty',
        message: 'Tidak dapat memuat data produk dan belum ada data tersimpan di perangkat.'
      };
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

    // Harga hanya jika valid dalam data
    if (product.price !== null && typeof product.price === 'number' && product.price > 0 && typeof Utils !== 'undefined') {
      const priceTag = document.createElement('span');
      priceTag.className = 'thumb-price';
      priceTag.textContent = Utils.formatRupiah(product.price);
      metaRow.appendChild(priceTag);
    }

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
    filterProducts,
    getContextualRecommendations,
    createProductCard,
    createGalleryThumbnail,
    getProducts,
    getCategories,
    getLastUpdated,
    getActiveJsonUrl
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AffiliateManager;
}
