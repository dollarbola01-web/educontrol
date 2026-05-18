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
Yangi (debug imkoniyati bor) versiyani yaratish uchun mana bu buyruqni yozing:
```bash
npm run build && npx electron-builder --win
```

### AGAR OQ EKRAN (WHITE SCREEN) CHIQSA:
Dasturni ochganingizda o'ng tomonda **"Developer Tools"** oynasi ochiladi. 
1. Yuqoridagi **"Console"** bo'limiga o'ting.
2. Agar u yerda qizil yozuvlar bo'lsa (masalan: `ERR_CONNECTION_REFUSED`), rasmga olib menga tashlang.
3. Bu bizga server ishlayaptimi yoki yo'qligini aniqlashga yordam beradi.

### NATIJA:
Buyruq tugagach, papkangiz ichida **`release`** degan papka paydo bo'ladi. Uning ichida **EduControl Setup.exe** tayyor bo'ladi.
