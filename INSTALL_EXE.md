# EduControl LAN - Windows (.exe) tayyorlash bo'yicha yo'riqnoma

Ushbu dasturni (.exe) formatida o'z kompyuteringizga o'rnatish uchun quyidagi qadamlarni bajaring:

### 1. Loyihani yuklab olish
Loyihaning barcha fayllarini (ZIP formatida) o'zingizning Windows kompyuteringizga yuklab oling va arxivdan chiqaring.

### 2. Node.js o'rnatish
Agar kompyuteringizda Node.js bo'lmasa, [nodejs.org](https://nodejs.org/) saytidan **LTS** versiyasini yuklab oling va o'rnating.

### 3. Kutubxonalarni o'rnatish
Terminal (CMD yoki PowerShell) orqali loyiha papkasiga kiring va quyidagi buyruqni bering:
```bash
npm install
```

### 4. .EXE (YUKLANUVCHI FAYL) YARATISH
Dasturni Windows uchun tayyorlash uchun quyidagi buyruqni bering:
```bash
npm run electron:build:win
```

### 5. Natija
Buyruq tugagandan so'ng, loyiha ichida **`release/`** nomli yangi papka paydo bo'ladi. Uning ichida:
- **`EduControl Setup ... .exe`** - O'rnatish fayli (Instalator)
- **`EduControl ... .exe`** (Portable) - O'rnatmasdan ishlaydigan fayl

Tayyor! Endi siz ushbu fayllarni boshqa kompyuterlarga tarqatishingiz mumkin.
