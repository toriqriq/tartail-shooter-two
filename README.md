# Pesawat Tembak - Shooting Plane Game

Game pesawat tembak sederhana yang dibuat dengan HTML5, CSS3, dan JavaScript.

## Fitur Utama

### 🎮 Menu Pemilihan Karakter

Sebelum bermain, Anda dapat memilih:

#### Senjata (Weapon)

- **Dual Shot**: 2 tembakan sekaligus dengan damage normal
- **Heavy Shot**: 1 tembakan dengan damage 2x lipat

#### Armor

- **Tank Armor**: HP tetap 100 (tidak ada pemulihan otomatis)
- **Regen Armor**: HP berkurang otomatis +1 setiap kali menembak

#### Energy Boost

- **Damage Boost**: Meningkatkan damage pesawat pemain +1
- **Defense Boost**: Meningkatkan pertahanan pemain +1 (mengurangi damage musuh)

### 🎯 Mekanik Game

- **Total HP Pemain**: 100
- **Kontrol Pesawat**: Gerakkan mouse atau sentuh layar (mobile)
- **Menembak**: Otomatis dengan fire rate lebih terkontrol
- **Musuh Normal** 🔴: Pesawat musuh biasa yang cepat dan ringan (1 HP)
  - Dapatkan 10 poin per musuh
- **Musuh Berat** 🔴🔴: Pesawat musuh yang lebih besar dan tebal (5 HP)
  - Gerakannya lambat dan jarang menembak
  - Dapatkan 50 poin per musuh
- **Scoring**: Kumpulkan poin dengan menghancurkan musuh

## Cara Bermain

1. Buka file `index.html` di browser Anda
2. Pilih konfigurasi senjata, armor, dan energy
3. Klik tombol "Mulai Game"
4. Gerakkan mouse atau sentuh layar untuk menggerakkan pesawat Anda
5. Hindari serangan musuh (tembakan otomatis akan mengenai musuh)
6. Pertahankan HP Anda agar tidak mencapai 0
7. Tingkatkan score dengan mengalahkan musuh biasa (10 poin) dan musuh berat (50 poin)

### Tips Bermain

- 💡 Fokus pada musuh berat (merah terang) untuk score lebih tinggi
- 💡 Tembakan Heavy Shot lebih efisien untuk musuh berat (5 damage = 1 shot dengan heavy)
- 💡 Defense boost berguna untuk menghadapi musuh berat yang menembak jarang tapi banyak damage
- 💡 Regen armor membantu survival jangka panjang

## Kontrol

| Kontrol         | Aksi                                       |
| --------------- | ------------------------------------------ |
| 🖱️ Mouse Move   | Gerakkan pesawat sesuai posisi kursor      |
| 📱 Touch/Sentuh | Gerakkan pesawat sesuai jari Anda (mobile) |
| 🔫 Auto-Shoot   | Tembakan otomatis tanpa tombol apapun      |

## File Struktur

```
tartail-shooter-two/
├── index.html     # Struktur HTML dan UI game
├── style.css      # Styling dan desain visual
├── game.js        # Logic game, physics, dan gameplay
└── README.md      # Dokumentasi
```

## Teknologi yang Digunakan

- **HTML5**: Struktur dan Canvas API untuk rendering
- **CSS3**: Styling dan animasi
- **JavaScript (Vanilla)**: Game logic tanpa framework eksternal

## Browser Support

Game ini kompatibel dengan semua browser modern yang mendukung HTML5 Canvas:

- Chrome/Chromium
- Firefox
- Safari
- Edge

## Fitur Tambahan untuk Pengembangan

Anda dapat menambahkan fitur-fitur berikut:

- [x] Mobile touch controls ✅
- [ ] Sound Effects
- [ ] Background Music
- [ ] Leaderboard / High Score
- [ ] Power-ups
- [ ] Berbagai jenis musuh
- [ ] Level progression
- [ ] Particle effects untuk tembakan

## Lisensi

Gratis untuk digunakan dan dimodifikasi.

---

Enjoy the game! 🎮✈️
