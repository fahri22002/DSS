
# Sistem Pendukung Keputusan (DSS)

Proyek ini berisi implementasi beberapa metode **Sistem Pendukung Keputusan (DSS)** seperti **SAW** (Simple Additive Weighting) dan **AHP** (Analytic Hierarchy Process). Proyek ini menggunakan antarmuka berbasis HTML yang memungkinkan pengguna untuk menginput kriteria dan alternatif, kemudian menghitung ranking terbaik.

## Daftar Isi

- [Pengantar](#pengantar)
- [Fitur](#fitur)
- [Cara Penggunaan](#cara-penggunaan)
  - [index.html](#indexhtml)
  - [SAW.html](#sawhtml)
  - [AHP.html](#ahphtml)
- [Struktur Proyek](#struktur-proyek)
- [Lisensi](#lisensi)

## Pengantar

Proyek ini adalah aplikasi berbasis web yang mendukung pengambilan keputusan dengan menggunakan metode **SAW** dan **AHP**. Anda dapat memasukkan kriteria dan alternatif, kemudian aplikasi akan menghitung dan menampilkan hasil perbandingan serta peringkat berdasarkan metode yang dipilih.

## Fitur

- Pilihan metode **SAW** dan **AHP** untuk mendukung pengambilan keputusan.
- Input kriteria dan alternatif secara dinamis.
- Penghitungan dan tampilan hasil dalam bentuk tabel.
- Penggunaan antarmuka berbasis **HTML** dan **Bootstrap** untuk tampilan yang responsif dan modern.

## Cara Penggunaan

### index.html

1. Buka file `index.html` di browser Anda.
2. Halaman ini adalah halaman utama yang berisi pilihan metode yang bisa digunakan:
   - **SAW** (Simple Additive Weighting)
   - **AHP** (Analytic Hierarchy Process)
3. Klik salah satu metode yang ingin digunakan, maka Anda akan diarahkan ke halaman yang sesuai untuk memasukkan data dan melakukan perhitungan.

### SAW.html

1. Setelah memilih metode **SAW** dari halaman utama, Anda akan diarahkan ke halaman `SAW.html`.
2. Masukkan jumlah kriteria dan alternatif di kolom yang tersedia.
3. Klik tombol **Generate Matrix** untuk membuat tabel input.
4. Isi matriks input yang sesuai dengan nilai kriteria dan alternatif.
5. Klik **Calculate** untuk melakukan perhitungan.
6. Tabel hasil akan ditampilkan di bagian **Output Matrix**, dan kesimpulan mengenai alternatif terbaik akan ditampilkan.

### AHP.html

1. Jika memilih metode **AHP**, Anda akan diarahkan ke halaman `AHP.html`.
2. Masukkan kriteria dan alternatif di kolom input yang tersedia, dipisahkan dengan koma.
   - Contoh input kriteria: `Jarak, Biaya, Kualitas`
   - Contoh input alternatif: `Lokasi 1, Lokasi 2, Lokasi 3`
3. Klik tombol **Buat Tabel** untuk membuat tabel input perbandingan berpasangan.
4. Setelah tabel muncul, masukkan nilai perbandingan antara kriteria dan alternatif.
5. Klik tombol **Hitung** untuk memulai perhitungan. Hasil perhitungan bobot dan kesimpulan mengenai alternatif terbaik akan muncul.

## Struktur Proyek

```
.
├── index.html            # Halaman utama yang menampilkan pilihan metode
├── SAW.html              # Halaman untuk metode SAW
├── AHP.html              # Halaman untuk metode AHP
├── style/                # Folder berisi file CSS
└── script/               # Folder berisi file JavaScript untuk kalkulasi
```

## Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Silakan lihat file `LICENSE` untuk informasi lebih lanjut.
