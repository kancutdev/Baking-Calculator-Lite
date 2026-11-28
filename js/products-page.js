/**
 * Baking Calculator Lite - Products Page Controller
 * Mengatur filter kategori, pencarian produk, tombol perbarui data (cache busting),
 * dan rendering katalog produk affiliate Shopee.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // Elements
  const el = {
    productsGrid: document.getElementById('affiliate-products-grid'),
    chipsContainer: document.getElementById('category-chips-list'),
    searchInput: document.getElementById('search-products'),
    btnRefresh: document.getElementById('btn-refresh-products'),
    lastUpdatedText: document.getElementById('last-updated-text'),
    networkStatus: document.getElementById('network-status'),
    productCountText: document.getElementById('product-count-text')
  };

  // State
  let activeCategory = 'Semua';
  let searchQuery = '';

  // Parse URL query parameter (misal: ?cat=Mixer)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get('cat');
  if (initialCat) {
    activeCategory = initialCat;
  }

  // --- NETWORK STATUS ---
  const updateNetworkStatus = () => {
    if (!el.networkStatus) return;
    const isOnline = navigator.onLine;
    el.networkStatus.className = `status-pill ${isOnline ? 'online' : 'offline'}`;
    el.networkStatus.textContent = isOnline ? 'Online' : 'Offline (Cache Lokal)';
  };
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // --- RENDER CATEGORY CHIPS ---
  const renderCategoryChips = (categories) => {
    if (!el.chipsContainer) return;
    el.chipsContainer.innerHTML = '';

    const allCategories = ['Semua', ...(categories.filter(c => c !== 'Semua'))];

    allCategories.forEach(cat => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `category-chip ${cat === activeCategory ? 'active' : ''}`;
      chip.textContent = cat;
      chip.setAttribute('data-category', cat);

      chip.addEventListener('click', () => {
        activeCategory = cat;
        // Update URL tanpa reload
        const newUrl = new URL(window.location);
        if (cat === 'Semua') {
          newUrl.searchParams.delete('cat');
        } else {
          newUrl.searchParams.set('cat', cat);
        }
        window.history.replaceState({}, '', newUrl);

        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderProductList();
      });

      el.chipsContainer.appendChild(chip);
    });
  };

  // --- RENDER PRODUCTS GRID ---
  const renderProductList = () => {
    if (!el.productsGrid) return;
    el.productsGrid.innerHTML = '';

    const filtered = AffiliateManager.filterProducts({
      category: activeCategory,
      query: searchQuery
    });

    if (el.productCountText) {
      el.productCountText.textContent = `${filtered.length} Produk Ditampilkan`;
    }

    if (filtered.length === 0) {
      el.productsGrid.innerHTML = `
        <div class="empty-rows-message" style="grid-column: 1 / -1; padding: 3rem 1.5rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--color-coffee); margin-bottom: 0.5rem;">
            Tidak Ada Produk yang Cocok
          </h4>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem;">
            ${searchQuery 
              ? `Tidak ditemukan produk dengan kata kunci "<strong>${Utils.escapeHTML(searchQuery)}</strong>" pada kategori ${Utils.escapeHTML(activeCategory)}.` 
              : `Belum ada produk aktif untuk kategori ini. Produk baru akan segera dikurasi.`}
          </p>
          <button type="button" class="btn btn-secondary" id="btn-reset-filter">
            Lihat Semua Produk
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('btn-reset-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'Semua';
          searchQuery = '';
          if (el.searchInput) el.searchInput.value = '';
          document.querySelectorAll('.category-chip').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-category') === 'Semua');
          });
          renderProductList();
        });
      }
      return;
    }

    filtered.forEach(product => {
      const card = AffiliateManager.createProductCard(product);
      el.productsGrid.appendChild(card);
    });
  };

  // --- UPDATE TIMESTAMP UI ---
  const updateTimestampUI = () => {
    if (!el.lastUpdatedText) return;
    const time = AffiliateManager.getLastUpdated();
    if (time) {
      el.lastUpdatedText.textContent = `Terakhir dicek: ${Utils.formatDateIndo(time)}`;
    } else {
      el.lastUpdatedText.textContent = 'Data tersimpan di perangkat';
    }
  };

  // --- FETCH & REFRESH HANDLER ---
  const handleLoadData = async (forceRefresh = false) => {
    if (el.btnRefresh) {
      el.btnRefresh.disabled = true;
      el.btnRefresh.innerHTML = '<span>Memperbarui...</span>';
    }

    const res = await AffiliateManager.loadProducts(forceRefresh);

    renderCategoryChips(AffiliateManager.getCategories());
    renderProductList();
    updateTimestampUI();

    if (el.btnRefresh) {
      el.btnRefresh.disabled = false;
      el.btnRefresh.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        <span>Perbarui Produk</span>
      `;
    }

    if (forceRefresh) {
      Utils.showToast(res.message, res.success ? 'success' : 'warning', 3000);
    }
  };

  // --- EVENT LISTENERS ---
  if (el.searchInput) {
    el.searchInput.addEventListener('input', Utils.debounce((e) => {
      searchQuery = e.target.value.trim();
      renderProductList();
    }, 250));
  }

  if (el.btnRefresh) {
    el.btnRefresh.addEventListener('click', () => {
      handleLoadData(true);
    });
  }

  // Initial Data Load & Polling Realtime
  await handleLoadData(false);

  if (typeof AffiliateManager !== 'undefined') {
    AffiliateManager.subscribe(() => {
      renderCategoryChips(AffiliateManager.getCategories());
      renderProductList();
      updateTimestampUI();
    });
    AffiliateManager.startPolling();
  }
});
