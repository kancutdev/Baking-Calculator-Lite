# Baking Calculator Lite 🍰

> **"Hitung Modal. Tentukan Harga. Maksimalkan Profit."**

Aplikasi web modern, ringan, responsif, dan offline-first (PWA) yang dirancang khusus untuk membantu pemilik usaha kue rumahan dan UMKM bakery menghitung Harga Pokok Produksi (HPP) dengan akurat, menentukan harga jual berbasis target margin keuntungan, serta terintegrasi dengan etalase rekomendasi peralatan baking melalui Affiliate Shopee.

---

## 🌟 Fitur Utama

1. **Kalkulator HPP Akurat & Lengkap**:
   - Informasi produk kue & jumlah hasil produksi per batch (Pcs, Slice, Box, Jar, Pack, Loyang, Custom).
   - Manajemen daftar bahan baku: Tambah, edit, gandakan (*duplicate*), dan hapus baris.
   - Konversi satuan otomatis sejenis: Gram (g) &harr; Kilogram (kg), Mililiter (ml) &harr; Liter (L).
   - Deteksi dan peringatan jika satuan pemakaian dan pembelian berbeda dimensi (massa vs volume) untuk menghindari salah hitung.
   - Perhitungan biaya operasional tambahan: Kemasan, gas oven, listrik, air, dan tenaga kerja.
   - Perhitungan target margin keuntungan murni (bukan sekadar markup biasa):  
     $$\text{Harga Jual} = \frac{\text{HPP per Unit}}{1 - \text{Target Margin}}$$
   - Evaluasi harga jual manual untuk mengetahui margin keuntungan aktual.
   - Pilihan pembulatan harga jual ke atas (Ceil Rp100, Rp500, Rp1.000) yang menjamin nominal tidak turun di bawah target margin.

2. **Ringkasan Hasil & Ekspor Praktis**:
   - Kartu metrik visual: Total HPP Batch, HPP per Unit, Rekomendasi Harga Jual, Estimasi Untung per Unit, dan Total Estimasi Untung per Batch.
   - Tombol **Simpan** perhitungan ke riwayat browser.
   - Tombol **Salin** teks ringkasan rapi ke clipboard.
   - Tombol **Bagikan** langsung melalui Web Share API ponsel.
   - Tombol **Cetak / Simpan PDF** dengan stylesheet cetak bersih (*print media query*).

3. **Penyimpanan Lokal & Privasi Penuh**:
   - 100% *Client-Side*: Tidak membutuhkan backend, server, maupun database online.
   - Menyimpan otomatis draft pengerjaan aktif.
   - Menyimpan hingga 10 riwayat perhitungan terakhir di `LocalStorage` perangkat pengguna.
   - Kerahasiaan formula resep terjamin aman di perangkat pengguna.

4. **Galeri Produk & Etalase Affiliate Shopee**:
   - **Galeri Thumbnail Halaman Utama ("Perlengkapan Baking Pilihan")**: Desain thumbnail natural dan elegan di bawah kalkulator, tanpa banner iklan agresif. Setiap thumbnail terhubung ke 1 link affiliate Shopee independen. Dilengkapi *horizontal scrolling with scroll-snap* di mobile dan grid 4–5 kartu di desktop.
   - **Halaman Khusus `products.html`**: Katalog etalase perlengkapan baking lengkap dengan filter 11+ kategori dan pencarian instan *real-time*.
   - **Rekomendasi Kontekstual Cerdas**: Memprioritaskan timbangan presisi untuk takaran mikro $\le 10$g, loyang untuk resep loyang/slice, dan mixer/oven untuk kapasitas batch besar $\ge 24$.
   - **Pelacakan Klik Terintegrasi (GA4)**: Setiap klik pada thumbnail produk (gambar maupun nama) dicatat secara spesifik per item ID.
   - **Validasi Ketat**: Wajib HTTPS dan domain resmi Shopee. Produk dengan `active: false` atau link kosong tidak ditampilkan.
   - **Banner Transparansi Afiliasi**: *Affiliate Disclosure* terpampang jelas sesuai etika keterbukaan.

5. **Google Analytics 4 (GA4) & Pelacakan Performa**:
   - Terintegrasi secara *client-side* murni melalui `analytics-config.js` dan `js/analytics.js`.
   - Menggunakan konfigurasi terpusat `GA_MEASUREMENT_ID`.
   - Otomatis nonaktif tanpa error jika Measurement ID belum diisi.
   - Menghormati privasi penuh: DILARANG KERAS mengirim data resep, isi bahan, harga modal, HPP, atau keuntungan pengguna.
   - Event khusus `calculator_used` (frekuensi kalkulasi) dan `affiliate_click` (klik per produk Shopee).

6. **PWA & Offline First**:
   - Dilengkapi `manifest.webmanifest` dan `service-worker.js`.
   - Aplikasi dapat diinstal ke layar utama Android / Desktop (PWA installable).
   - Tetap dapat melakukan perhitungan HPP saat koneksi internet terputus (offline).

7. **SEO & Kesiapan Publikasi**:
   - Meta tag lengkap (Open Graph, Twitter Card, Schema.org JSON-LD).
   - File `sitemap.xml` dan `robots.txt` siap indeks Google.
   - Kompatibel 100% dengan hosting gratis **GitHub Pages**.

---

## 📁 Struktur Direktori

```text
baking-calculator-lite/
│
├── index.html                  # Halaman utama (Hero, Kalkulator HPP, Hasil, Rekomendasi, Riwayat)
├── products.html               # Halaman katalog etalase affiliate Shopee
├── about.html                  # Halaman edukasi HPP vs Margin, privasi, dan transparansi afiliasi
├── 404.html                    # Halaman 404 ramah pengguna
├── style.css                   # Core design system & modern bakery styling
├── responsive.css              # Breakpoints mobile-first (360px - 1440px)
├── affiliate-config.js         # Konfigurasi terpusat URL JSON affiliate dan URL Pro
├── analytics-config.js         # Konfigurasi Google Analytics 4 (GA_MEASUREMENT_ID)
├── manifest.webmanifest        # Manifest Progressive Web App (PWA)
├── service-worker.js           # Service worker untuk caching dan offline-mode
├── sitemap.xml                 # Peta situs SEO
├── robots.txt                  # Aturan perayapan mesin pencari
├── tests.html                  # Automated unit test runner
├── README.md                   # Dokumentasi lengkap proyek
│
├── js/
│   ├── app.js                  # Controller halaman utama dan kalkulator
│   ├── products-page.js        # Controller halaman etalase produk affiliate
│   ├── calculator.js           # Logika matematika HPP, margin, dan pembulatan
│   ├── affiliate.js            # Fetch JSON produk, cache, filter, dan render thumbnail
│   ├── analytics.js            # Modul Google Analytics 4 & outbound click tracking
│   ├── storage.js              # Abstraksi LocalStorage (draft, history, cache)
│   ├── validation.js           # Validasi input numerik dan URL Shopee
│   └── utils.js                # Formatter Rupiah, konversi satuan, toast, copy & share
│
├── data/
│   └── affiliate-products.json # Database JSON produk affiliate Shopee khusus Lite
│
└── assets/
    ├── icons/                  # Favicon SVG, PWA icon 192px, 512px, apple-touch-icon
    ├── images/                 # Ilustrasi SVG hero banner dan placeholder produk
    └── logo/                   # Master logo SVG & logo horizontal
```

---

## 🚀 Panduan Menjalankan Secara Lokal

Karena proyek ini menggunakan Vanilla JavaScript murni tanpa dependensi berat:

### Opsi 1: Menggunakan Ekstensi VS Code (Live Server)
1. Buka folder `baking-calculator-lite` di VS Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan pada file `index.html` &rarr; pilih **"Open with Live Server"**.
4. Browser akan otomatis terbuka di `http://127.0.0.1:5500/`.

### Opsi 2: Menggunakan Node.js `serve` / `http-server`
```bash
npx serve .
# atau
npx http-server -p 8080 .
```

---

## 🌐 Panduan Deployment ke GitHub Pages (Gratis)

Proyek ini dirancang menggunakan relative path sehingga bekerja mulus di GitHub Pages tanpa biaya domain.

### Langkah 1: Buat Repository Baru di GitHub
1. Buka [GitHub](https://github.com) dan login ke akun Anda.
2. Klik tombol **New** untuk membuat repository baru.
3. Beri nama repository: `baking-calculator-lite`.
4. Pilih opsi **Public**.
5. Jangan centang "Initialize this repository with a README" (karena file sudah tersedia).
6. Klik **Create repository**.

### Langkah 2: Upload Project ke GitHub
Buka terminal / Git Bash di folder proyek Anda:
```bash
git init
git add .
git commit -m "Initial release: Baking Calculator Lite v1.0.0"
git branch -M main
git remote add origin https://github.com/USERNAME/baking-calculator-lite.git
git push -u origin main
```
*(Ganti `USERNAME` dengan nama akun GitHub Anda).*

### Langkah 3: Mengaktifkan GitHub Pages
1. Di halaman repository GitHub Anda, klik menu **Settings** (ikon gerigi).
2. Di bilah samping kiri, pilih menu **Pages**.
3. Pada bagian **Build and deployment** &rarr; **Source**:
   - Pilih **Deploy from a branch**.
   - Pilih Branch: **main** dan folder: **/(root)**.
   - Klik **Save**.
4. Tunggu sekitar 1-2 menit. GitHub Pages akan memberikan URL aktif aplikasi Anda:
   `https://USERNAME.github.io/baking-calculator-lite/`

---

## 🛒 Panduan Pengelolaan Produk Affiliate Shopee

Salah satu keunggulan Baking Calculator Lite adalah pembaruan data produk affiliate dapat dilakukan **hanya dengan mengedit file JSON**, tanpa perlu mengutak-atik kode JavaScript atau melakukan build ulang.

### File Penting:
1. `data/affiliate-products.json`: Tempat daftar produk, harga, foto, kategori, dan tautan Shopee.
2. `affiliate-config.js`: Tempat mengatur endpoint file JSON dan tautan eksternal.

---

### Cara Mengaktifkan Produk & Mengisi Tautan Shopee
Buka file `data/affiliate-products.json`. Cari produk yang ingin Anda tampilkan:

```json
{
  "id": "bcl-001",
  "name": "Timbangan Digital Dapur Presisi 0.1g",
  "description": "Timbangan akurat dengan akurasi tinggi untuk menimbang ragi dan garam.",
  "category": "Timbangan digital",
  "image": "assets/images/placeholder-product.svg",
  "price": 65000,
  "shopee_url": "https://shope.ee/CONTOH_KODE_AFFILIATE_ANDA",
  "label": "Wajib Punya",
  "featured": true,
  "active": true
}
```

**Aturan Penting:**
* Ubah `"active": false` menjadi `"active": true` agar produk tampil kepada pengunjung.
* Masukkan URL affiliate Shopee resmi Anda pada `"shopee_url"`. Wajib menggunakan protokol `https://` dan domain resmi Shopee (`shopee.co.id`, `shope.ee`, atau `shp.ee`).
* Jika tautan Shopee kosong atau tidak valid, tombol pembelian **tidak akan ditampilkan**.

---

### Cara Menambah Produk Baru
Tambahkan objek produk baru ke dalam array `"products"` di file `data/affiliate-products.json`:

```json
{
  "id": "bcl-011",
  "name": "Nama Produk Baru Anda",
  "description": "Deskripsi singkat manfaat produk bagi pengusaha kue.",
  "category": "Mixer",
  "image": "https://domain-gambar-anda.com/foto-produk.jpg",
  "price": 120000,
  "shopee_url": "https://shope.ee/LINK_AFFILIATE_ANDA",
  "label": "Pilihan Baking",
  "featured": true,
  "active": true
}
```

**Kategori yang Didukung:**
* `Mixer`
* `Oven`
* `Loyang`
* `Timbangan digital`
* `Alat ukur`
* `Spatula dan whisk`
* `Baking tools`
* `Bahan kue`
* `Dekorasi kue`
* `Packaging`
* `Peralatan usaha baking`

**Label Rekomendasi yang Didukung:**
* `Pilihan Baking`
* `Wajib Punya`
* `Cocok untuk Pemula`
* `Favorit Baking`
* `Peralatan Usaha`
* `Rekomendasi`

---

### Cara Menonaktifkan Produk
Cukup ubah status produk menjadi `"active": false`. Produk tersebut otomatis hilang dari katalog pengunjung.

---

### Cara Mengganti Foto Produk
1. **Menggunakan URL Gambar Eksternal**: Masukkan URL langsung berprotokol HTTPS, contoh:  
   `"image": "https://images.unsplash.com/.../photo.jpg"`
2. **Menggunakan Gambar Lokal**: Simpan file gambar di folder `assets/images/` lalu masukkan path relatifnya:  
   `"image": "assets/images/nama-foto.jpg"`
3. **Fallback Otomatis**: Jika nilai `"image"` dikosongkan `""` atau gambar gagal dimuat, sistem secara otomatis menampilkan ilustrasi fallback elegan `assets/images/placeholder-product.svg`. Tampilan kartu tidak akan pernah terlihat rusak.

---

### Mengatur Produk Unggulan (*Featured*)
Ubah `"featured": true`. Produk dengan tanda ini akan diprioritaskan tampil pada section kontekstual di halaman kalkulator HPP setelah pengguna melakukan perhitungan.

---

### Cara Mengubah URL Affiliate JSON ke Remote GitHub Raw URL
Jika Anda ingin memperbarui produk langsung dari GitHub tanpa mengubah file lokal, Anda dapat mengatur `affiliate-config.js`:

```javascript
const AFFILIATE_CONFIG = {
  localJsonUrl: 'data/affiliate-products.json',
  
  // Masukkan URL raw GitHub dari file JSON Anda:
  remoteJsonUrl: 'https://raw.githubusercontent.com/USERNAME/baking-calculator-lite/main/data/affiliate-products.json',

  proAppUrl: '',
  tiktokUrl: 'https://www.tiktok.com/@bang_doned'
};
```

---

### Mengatasi Cache Jika Perubahan JSON Belum Terlihat
1. Pengunjung dapat mengeklik tombol **"Perbarui Produk"** di halaman `products.html`. Tombol ini otomatis menjalankan *cache-busting* (`?_t=timestamp`) untuk meminta data terbaru.
2. File JSON disimpan di `LocalStorage` selama 30 menit. Tombol *refresh* akan langsung memperbarui cache lokal tersebut.
3. Di browser, tekan `Ctrl + F5` (Windows) atau `Cmd + Shift + R` (Mac) untuk melakukan *hard reload*.

---

## 📊 Panduan Integrasi & Laporan Google Analytics 4 (GA4)

Baking Calculator Lite dilengkapi integrasi Google Analytics 4 terpusat, ringan, dan zero-dependency untuk memantau pengunjung, keaktifan kalkulator, dan performa klik affiliate Shopee.

### 1. Cara Memasang GA Measurement ID
1. Buka akun Google Analytics Anda di [https://analytics.google.com/](https://analytics.google.com/).
2. Masuk ke menu **Admin** (ikon roda gigi di kiri bawah).
3. Pilih **Data Streams** (Aliran Data) &rarr; klik stream Web situs Anda.
4. Salin kode **Measurement ID** Anda (berformat `G-XXXXXXXXXX`).
5. Buka file `analytics-config.js` di root folder proyek:
   ```javascript
   const ANALYTICS_CONFIG = {
     // Tempelkan Measurement ID Anda di sini:
     GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',

     debugMode: false,
     appName: 'Baking Calculator Lite'
   };
   ```
6. Simpan file. Integrasi Google Analytics otomatis aktif!

> **PENTING (KEAMANAN & PRIVASI):**  
> - Jika `GA_MEASUREMENT_ID` dibiarkan kosong `''`, skrip eksternal GA4 **sama sekali tidak dimuat** ke browser pengunjung.
> - Aplikasi 100% offline-ready dan tidak akan menghasilkan pesan error apa pun saat GA4 nonaktif.
> - Kami menjamin **tidak ada data resep, rincian bahan, harga modal, HPP, atau keuntungan** yang dikirimkan ke GA4.

---

### 2. Event yang Dicatat
Aplikasi mencatat tiga jenis event esensial:

| Nama Event | Pemicu (*Trigger*) | Parameter yang Dikirim | Catatan Privasi |
| :--- | :--- | :--- | :--- |
| **`page_view`** | Pengunjung membuka halaman | `page_title`, `page_location`, `page_path` | Standar GA4 otomatis |
| **`calculator_used`** | Pengguna berhasil menghitung HPP | `calculator_type`, `product_category` | **Tanpa nominal HPP / bahan / harga** |
| **`affiliate_click`** | Pengguna mengeklik thumbnail produk | `item_id`, `item_name`, `item_category`, `placement`, `link_type` | Dicatat per produk spesifik via beacon |

---

### 3. Cara Membaca & Mengonfigurasi Laporan di GA4

Untuk melihat statistik mendalam per produk affiliate di Google Analytics:

#### Langkah A: Daftarkan Custom Dimensions di GA4 (Wajib untuk breakdown produk)
1. Di dashboard GA4, buka **Admin** &rarr; **Custom Definitions** &rarr; **Custom Dimensions**.
2. Klik tombol **Create Custom Dimension**:
   - **Dimension Name**: `Item ID` | **Scope**: `Event` | **Event Parameter**: `item_id`
   - **Dimension Name**: `Item Name` | **Scope**: `Event` | **Event Parameter**: `item_name`
   - **Dimension Name**: `Placement` | **Scope**: `Event` | **Event Parameter**: `placement`
3. Klik **Save**. (Data custom dimension akan mulai terkumpul dalam 24 jam).

#### Langkah B: Melihat Laporan Penggunaan
1. **Total Pengunjung, Sesi, dan Perangkat (Mobile vs Desktop)**:
   - Masuk ke menu **Reports** &rarr; **Tech** &rarr; **Tech details** (pilih dimensi *Device category*).
2. **Frekuensi Penggunaan Kalkulator**:
   - Masuk ke **Reports** &rarr; **Engagement** &rarr; **Events**.
   - Cari baris event `calculator_used` untuk melihat total frekuensi penghitungan HPP.
3. **Produk dengan Klik Affiliate Tertinggi**:
   - Masuk ke menu **Explore** (Eksplorasi) &rarr; Buat **Free-form exploration**.
   - Pada baris (*Rows*), tambahkan dimensi `Item Name` dan `Item ID`.
   - Pada metrik (*Values*), masukkan `Event count`.
   - Pada filter (*Filters*), atur: `Event name` persis cocok dengan `affiliate_click`.
   - Anda akan mendapatkan tabel peringkat produk yang paling sering diklik oleh pengguna!

> ⚠️ **Catatan Penting Perbedaan Klik vs Penjualan:**  
> - Metrik `affiliate_click` di GA4 adalah jumlah **klik keluar (*outbound traffic*)** dari website menuju Shopee.
> - GA4 **bukan** dashboard pencatat transaksi/pesanan final.
> - Data pesanan aktual, tingkat konversi, dan komisi Rupiah yang Anda peroleh **tetap harus diperiksa secara resmi melalui Dashboard Shopee Affiliate Program**.

---

## 🧪 Hasil Pengujian Sistem

Pengujian otomatis komprehensif dijalankan melalui file `tests.html` dengan hasil **54/54 Test Cases Lulus (100% Pass, 0 Failure)**:

| Modul | Kategori Pengujian | Hasil |
| :--- | :--- | :---: |
| **Kalkulator** | Uji satu bahan baku | **LULUS** |
| **Kalkulator** | Uji banyak bahan baku & akumulasi total | **LULUS** |
| **Kalkulator** | Uji biaya operasional (kemasan, gas, listrik, tenaga kerja) | **LULUS** |
| **Kalkulator** | Uji hasil produksi berbeda (yield 1, 10, 16, 50, 100) | **LULUS** |
| **Kalkulator** | Uji rumus margin keuntungan (20%, 30%, 40%, 50%) | **LULUS** |
| **Kalkulator** | Uji harga jual manual (profit & margin aktual) | **LULUS** |
| **Kalkulator** | Uji pembulatan harga jual (Ceil Rp100, Rp500, Rp1.000) | **LULUS** |
| **Kalkulator** | Uji pembagian dengan nol (pembelian 0 & produksi 0) | **LULUS** |
| **Kalkulator** | Uji input kosong dan input negatif | **LULUS** |
| **Kalkulator** | Uji konversi satuan kompatibel (kg &harr; g, L &harr; ml) | **LULUS** |
| **Kalkulator** | Uji satuan tidak kompatibel (peringatan konversi dimensi) | **LULUS** |
| **Kalkulator** | Uji kalkulasi angka besar (miliaran Rupiah) | **LULUS** |
| **Affiliate** | Validasi protokol HTTPS dan domain resmi Shopee | **LULUS** |
| **Affiliate** | Penolakan URL marketplace non-Shopee | **LULUS** |
| **Affiliate** | Filter `active=false` (tidak ditampilkan ke user) | **LULUS** |
| **Affiliate** | Penanganan URL kosong (tombol beli disembunyikan) | **LULUS** |
| **Gallery** | Thumbnail card menghasilkan elemen valid dengan link `_blank` | **LULUS** |
| **Gallery** | Setiap thumbnail memiliki link Shopee unik (Link A &ne; Link B) | **LULUS** |
| **Gallery** | Gambar thumbnail dan nama produk keduanya dapat diklik | **LULUS** |
| **Gallery** | Format harga Rupiah dan label pilihan ter-render dengan rapi | **LULUS** |
| **Gallery** | Indikator Shopee bernuansa natural tanpa banner agresif | **LULUS** |
| **Analytics** | Validasi Measurement ID GA4 format `G-XXXXXXXXXX` | **LULUS** |
| **Analytics** | Penolakan string kosong dan placeholder `G-XXXXXXXXXX` | **LULUS** |
| **Analytics** | Skrip pihak ketiga dinonaktifkan jika ID belum diisi | **LULUS** |
| **Analytics** | Panggilan `trackCalculatorUsed` & `trackAffiliateClick` aman tanpa throw | **LULUS** |
| **Storage** | Batas maksimal 10 riwayat kalkulasi terbaru | **LULUS** |
| **Storage** | Simpan dan muat kembali draft pengerjaan | **LULUS** |

---

## 📌 Checklist Tindakan Manual untuk Pemilik Proyek

Untuk mempublikasikan dan mulai menghasilkan komisi affiliate dari aplikasi ini:

1. [ ] **Siapkan Akun Shopee Affiliate**: Dapatkan tautan affiliate Anda dari portal Shopee Affiliate Program.
2. [ ] **Update Tautan Produk**: Buka `data/affiliate-products.json`, masukkan link affiliate Anda pada atribut `"shopee_url"` dan ubah `"active": true` pada produk yang ingin ditampilkan.
3. [ ] **Pasang Foto Produk Asli**: Masukkan URL foto produk Shopee yang relevan pada atribut `"image"`.
4. [ ] **Konfigurasi GA4**: Buka `analytics-config.js`, masukkan Measurement ID Anda pada `GA_MEASUREMENT_ID`.
5. [ ] **Konfigurasi GitHub Pages**: Ikuti panduan deployment di atas dan ganti `USERNAME` pada `sitemap.xml` dan `robots.txt` dengan username GitHub Anda.
6. [ ] **Hubungkan Baking Calculator Pro**: Jika versi Pro sudah siap diluncurkan, masukkan URL-nya pada variabel `proAppUrl` di `affiliate-config.js`.

---

## 📜 Lisensi & Atribusi

Dibuat untuk memajukan ekosistem UMKM kue dan bakery di Indonesia.  
Media Sosial Resmi: [TikTok @bang_doned](https://www.tiktok.com/@bang_doned).
