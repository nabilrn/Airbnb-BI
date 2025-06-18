# Analisis BI & Prediksi Harga Airbnb di New York City

Sebuah proyek *Business Intelligence* komprehensif yang menganalisis pasar Airbnb di New York City, dilengkapi dengan *dashboard* interaktif dan model *Machine Learning* untuk prediksi harga.

[](https://opensource.org/licenses/MIT)
[](https://www.python.org/)
[](https://flask.palletsprojects.com/)
[](https://nextjs.org/)
[](https://www.postgresql.org/)
[](https://supabase.io/)

-----

### 🚀 [Lihat Live Demo](https://airbnb-bi-dashboard-i1ai.vercel.app/)

## ✨ Latar Belakang

Proyek ini dirancang untuk mengubah data mentah Airbnb NYC menjadi wawasan bisnis yang dapat ditindaklanjuti. Dengan lebih dari 48.000 listing, pasar NYC sangat kompleks. Solusi ini membantu para *host* dan analis untuk memahami dinamika harga, popularitas lokasi, dan tren pasar melalui visualisasi data yang kaya dan interaktif.

## 📸 Pratinjau Dashboard

*(Ganti URL di atas dengan URL screenshot dashboard Anda, misalnya dari unggahan ke Imgur)*

## 🌟 Fitur Utama

  - **Dashboard Analitik Interaktif**: Dibangun dengan Next.js, menyediakan visualisasi yang cepat dan responsif.
  - **Analisis Multi-dimensi**:
      - **Harga & Lokasi**: Peta geografis sebaran harga dan perbandingan antar *borough*.
      - **Ketersediaan & Performa**: Grafik tren ketersediaan dan peringkat listing teratas.
      - **Review & Tren Pelanggan**: Analisis tren ulasan dari waktu ke waktu dan korelasinya dengan harga.
      - **Host & Listing**: Wawasan mendalam tentang distribusi properti per host.
  - **Prediksi Harga dengan Machine Learning**:
      - Prediksi harga properti secara *real-time* berdasarkan fitur yang diinput.
      - Menyediakan "Tips Optimasi" dan "Strategi Harga" yang dihasilkan oleh model.
      - Transparansi model dengan informasi tentang fitur dan algoritma yang digunakan (Random Forest, Neural Network, dll).
  - **Filter Dinamis**: Filter data secara global berdasarkan lokasi, tipe kamar, dan rentang harga.
  - **Arsitektur Modern**: Backend API terpisah (Flask) untuk performa optimal.

## 🛠️ Tumpukan Teknologi & Arsitektur

Arsitektur sistem ini dirancang untuk memisahkan proses data, layanan API, dan antarmuka pengguna, memastikan skalabilitas dan kemudahan pemeliharaan.

*(Ganti URL di atas dengan URL diagram arsitektur Anda, jika ada)*

1.  **ETL (Extract, Transform, Load)**:
      - `Python` & `Pandas`: Untuk membersihkan dan mentransformasi data mentah dari file `.csv`.
      - `SQLAlchemy`: Untuk memuat data yang telah diolah ke dalam *data warehouse*.
2.  **Data Warehouse**:
      - `PostgreSQL`: Sebagai basis data relasional.
      - `Supabase`: Platform *cloud* yang menyediakan dan mengelola instance PostgreSQL.
3.  **Backend API**:
      - `Flask`: Kerangka kerja Python untuk membangun RESTful API yang melayani data ke *frontend*.
4.  **Frontend**:
      - `Next.js` / `React`: Untuk membangun *dashboard* yang interaktif dan modern.
      - `PlotyJs` : Pustaka untuk membuat visualisasi data.

## 🚀 Memulai Proyek

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

### Prasyarat

  - Python 3.10+
  - Node.js v16+ & npm
  - Akun [Supabase](https://supabase.io/) (untuk database PostgreSQL)

### 1\. Kloning Repositori

```bash
git clone https://github.com/mfarzz/nama-repositori-anda.git
cd nama-repositori-anda
```

### 2\. Pengaturan Backend & ETL

  - **Buat & Konfigurasi Database**:

    1.  Buat proyek baru di Supabase.
    2.  Dapatkan URL koneksi PostgreSQL dari pengaturan database Anda.
    3.  Buat file `.env` di dalam folder `etl_script/`, lalu isikan URL koneksi Anda.
        ```
        DATABASE_URL="postgresql://user:password@host:port/database"
        ```

  - **Jalankan Skrip ETL**:

    ```bash
    cd etl_script & model
    pip install -r requirements.txt
    python etl_main.py  # Ganti dengan nama skrip utama Anda
    ```

    Ini akan mengisi database Supabase Anda dengan data yang bersih.

  - **Jalankan Model**:

    ```bash
    cd ../backend
    pip install -r requirements.txt
    deploy app.py
    ```

    Server API akan berjalan di `http://127.0.0.1:5000`.

### 3\. Pengaturan Frontend

```bash
cd ../dashboard
npm install
npm run dev
```

Aplikasi Next.js akan berjalan di `http://localhost:3000`. Buka di browser Anda untuk melihat dashboard.

## 📂 Struktur Proyek

```

├── frontend/           # Kode sumber Dashboard Next.js
│   ├── pages/
│   ├── components/
│   └── package.json
├── etl_script & model/         # Skrip Python untuk proses ETL
│   ├── deploy.py
│   └── requirements.txt
├── dataset/            # Dataset mentah .csv
└── README.md
```

## 👥 Kontributor

Proyek ini dikembangkan dan dikelola oleh Tim 7:

| Nama             | NIM        |
| ---------------- | ---------- |
| **NABIL RIZKI** | 2211522018 |
| **NAVISA NAUFAL**| 2211522020 |
| **MUHAMMAD FARIZ**| 2211523034 |


