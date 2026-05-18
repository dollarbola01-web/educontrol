# EduControl LAN - Windows (.exe) Tayyorlash Qo'llanmasi

Siz yuklab olgan ZIP fayl bu dasturning **KODLARI** xolos. Uni `.exe` faylga aylantirish uchun quyidagi 4 ta qadamni bajaring:

### 1-QADAM: Node.js o'rnatish
Kompyuteringizda Node.js bo'lishi shart.
1. [https://nodejs.org/](https://nodejs.org/) saytiga kiring.
2. **"LTS"** tugmasini bosib yuklab oling va o'rnating.

### 2-QADAM: Terminalni ochish
1. Yangi yuklab olgan ZIP faylni arxivdan chiqaring (Extract).
2. O'sha papka ichiga kiring.
3. Papkaning yuqorisidagi manzil satriga (Address bar) `cmd` deb yozing va ENTER bosing. (Qora oyna ochiladi).

### 3-QADAM: Kerakli narsalarni yuklash
Ochilgan qora oynaga quyidagi buyruqni yozing va ENTER bosing:
```bash
npm install
```
*(Biroz vaqt oladi, kutib turing).*

### 4-QADAM: .EXE faylni yaratish
Hammasi tayyor bo'lgach, terminalga mana bu buyruqni yozing:
```bash
npm run build && npx electron-builder --win
```

### AGAR XATO CHIQSA:
Agar qandaydir xato chiqsa (masalan, `rm` yoki `rimraf` xatosi), ushbu buyruqni sinab ko'ring:
```bash
npx rimraf dist release && npm run build && npx electron-builder --win
```

### NATIJA:
Buyruq tugagach, papkangiz ichida **`release`** degan papka paydo bo'ladi. Uning ichida **EduControl Setup.exe** (o'rnatish fayli) tayyor bo'ladi.
