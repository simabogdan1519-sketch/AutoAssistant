# AutoAssistant

Aplicație Android pentru gestionarea mașinilor conform legislației rutiere din România.

**Funcții:** multi-mașini cu poze profil · documente (RCA, ITP, Rovinietă, extinctor ISCIR, trusă medicală Ord. 2290) · calculator consum plin-la-plin · tracker cheltuieli + grafice · amenzi & puncte penalizare (OUG 195/2002 cu reset automat la 6 luni) · export PDF · stocare locală (AsyncStorage).

Stack: **Expo SDK 55** · **React Native 0.83** · **Expo Router** · **Zustand** · **TypeScript**.

Build: **GitHub Actions** (direct în runner, fără servicii externe) — la fel ca la Luna.

---

## ✅ Play Store Compliance 2026 — Status

| Cerință | Status | Notă |
|---|---|---|
| Target SDK 35 (Android 15) — obligatoriu pentru apps noi | ✅ | Setat explicit via `expo-build-properties` |
| Compile SDK 36 | ✅ | Setat explicit |
| Min SDK 24 (Android 7.0+) | ✅ | Acoperă ~99% din device-urile active |
| **16 KB page size** (obligatoriu din Nov 2025) | ✅ | RN 0.83 + `useLegacyPackaging: false` |
| AAB format (Play Store nu mai acceptă APK) | ✅ | Workflow generează `app-release.aab` |
| Permissions minime & justificate | ✅ | Doar CAMERA + READ_MEDIA_IMAGES, via plugin |
| Runtime permission rationales (RO) | ✅ | Mesaje pentru utilizator în română |
| Keystore semnat cu RSA 2048+ | ✅ | Workflow generează RSA 2048 / 10000 zile |
| Package name valid | ✅ | `com.autoassistant.app` |

---

## ⚠️ Ce trebuie să faci TU pentru a publica (independent developer)

Google are reguli specifice pentru dezvoltatori **individuali** (personal account, creat după noiembrie 2023). Nu le poate face nimeni pentru tine:

### 1. Cont Play Console — $25 taxă unică
- https://play.google.com/console
- **Alegi "Personal account"** (NU organization — costă D-U-N-S number $299/an)
- Plătești $25 (o singură dată pentru totdeauna)

### 2. Verificare identitate
- Act de identitate valid (CI sau pașaport românesc)
- Adresa va fi **publică pe Play Store** lângă app-ul tău (o cerință obligatorie din 2024)
- **Telefon & email** pentru verificare via OTP
- Durează 2-7 zile pentru aprobare

### 3. Verificare "ai acces la un device Android real"
- Instalezi aplicația **Play Console** pe telefonul tău Android
- Te loghezi — asta confirmă pentru Google că ești dezvoltator real, nu bot

### 4. Closed Testing obligatoriu (cea mai grea parte) ⚠️

**Pentru conturile personale noi**, Google cere OBLIGATORIU:
- **Minimum 12 testeri** înscriși
- **14 zile consecutive** cu testing activ
- **Apoi** poți aplica pentru production access

**În practică** înseamnă:
1. Upload AAB în Play Console → `Testing → Closed testing → Create new release`
2. Creezi o "tester list" cu minim 12 emailuri Google (poți ruda, prieteni, colegi)
3. **Fiecare** trebuie să acceseze link-ul de opt-in și să instaleze app-ul
4. **Trebuie să rămână opted-in 14 zile consecutive** (dacă unul dă uninstall, resetează counter-ul)
5. După 14 zile, aplici pentru "Production access" cu un chestionar
6. Google revizuiește 7 zile, apoi ai voie să publici production

**Strategii practice pentru 12 testeri:**
- Grupuri Telegram/Discord românești de dezvoltatori Android
- Reddit: r/androiddev, r/startups, postezi cerere
- Servicii plătite precum PrimeTestLab, TestersCommunity (~$15-25)
- Colegi, familie — minim 12, dar recomandat 15-20 ca backup

### 5. Privacy Policy URL (obligatoriu)
- Creezi o pagină simplă cu politica de confidențialitate
- Opțiuni gratuite: GitHub Pages, Notion publică, pagină pe Carrd
- **Mențiune importantă**: aplicația ta nu trimite date la servere externe — asta simplifică mult privacy policy
- Template: https://app-privacy-policy-generator.firebaseapp.com/

### 6. Data Safety form în Play Console
Trebuie să declari ce date colectezi. Pentru AutoAssistant:
- **Nu colectezi nimic** — datele stau local pe telefon prin AsyncStorage
- Declari: `No data collected`, `No data shared`
- Asta e cel mai ușor de trecut pentru că nu trimiți nimic

### 7. Store Listing (assets pregătite)
- ✅ Icon 512×512 (folosește `assets/images/icon.png`)
- ✅ Feature graphic 1024×500 (ai `assets/images/feature-graphic.png`)
- ⚠️ Screenshot-uri — **MINIMUM 2, max 8**, phone portrait (ai nevoie să faci tu după ce rulezi app-ul)
- ⚠️ Short description (80 caractere)
- ⚠️ Full description (4000 caractere)
- ⚠️ Categorie: `Auto & Vehicles`
- ⚠️ Content rating: completezi chestionarul (5 min) — probabil "Everyone"

---

## 🛠️ Pașii tehnici (setup + build)

### Pasul 1 — Setup local (opțional)

```bash
unzip autoassistant.zip
cd autoassistant
npm install
npx expo start
```

Scanează QR cu Expo Go pe telefon.

### Pasul 2 — Push pe GitHub

```bash
git init
git add .
git commit -m "feat: initial AutoAssistant setup"
git branch -M main
git remote add origin https://github.com/USERNAME/autoassistant.git
git push -u origin main
```

GitHub Actions va rula automat și va genera APK + AAB în tab-ul Actions → Artifacts.

### Pasul 3 — Keystore permanent (IMPORTANT)

La primul build, workflow-ul generează keystore temporar. Pentru Play Store trebuie unul permanent:

```bash
keytool -genkey -v \
  -keystore autoassistant.keystore \
  -alias autoassistant \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Salvează parolele într-un password manager. Apoi encode-l:

```bash
base64 -w 0 autoassistant.keystore > keystore.base64.txt
```

În GitHub → `Settings → Secrets and variables → Actions`:
- `KEYSTORE_BASE64` — conținutul fișierului
- `STORE_PASS` — parola keystore
- `KEY_PASS` — parola key (de obicei aceeași)
- `KEY_ALIAS` — `autoassistant`

⚠️ **BACKUP keystore-ul într-un loc sigur.** Dacă îl pierzi, NU mai poți publica update-uri — va trebui să refaci toată aplicația sub alt package name.

### Pasul 4 — Upload primul release

1. Build nou via GitHub (push pe main)
2. Descarcă `autoassistant-aab` din Artifacts
3. Dezarhivează (GitHub îl pune într-un zip)
4. În Play Console: `Testing → Internal testing → Create new release`
5. Upload `.aab`, completezi release notes
6. Adaugi tu ca tester, verifici că merge
7. Apoi mergi la `Closed testing` pentru cele 14 zile obligatorii

---

## 📦 Structura proiectului

```
autoassistant/
├─ app/                       # Expo Router
│  ├─ _layout.tsx             # Root layout + fonturi
│  ├─ (tabs)/                 # Bottom tabs
│  │  ├─ index.tsx            # Home
│  │  ├─ garaj.tsx            # Listă mașini
│  │  ├─ docs.tsx             # Documente
│  │  └─ eu.tsx               # Profil
│  ├─ car/new.tsx + [id].tsx  # Mașini
│  ├─ fuel.tsx                # Calculator consum
│  ├─ fines.tsx + fine/new    # Amenzi & puncte
│  ├─ document/new.tsx        # Adaugă document
│  └─ expense/new.tsx         # Cheltuieli
├─ components/                # UI primitives
├─ constants/theme.ts         # Design tokens
├─ lib/store.ts               # Zustand + AsyncStorage
├─ types/index.ts
├─ assets/images/             # Icon-uri din logo-ul tău
├─ app.json                   # Config Expo + target SDK 35
├─ babel.config.js            # Babel preset + reanimated
├─ metro.config.js            # Metro default
├─ eas.json (nu există)       # Nu folosim EAS, folosim GitHub Actions
└─ .github/workflows/build-android.yml
```

---

## 🐞 Troubleshooting

| Problemă | Soluție |
|---|---|
| `npm ci` eșuează "missing package-lock.json" | Rulează `npm install` local, commit `package-lock.json` |
| "SDK license not accepted" | Puțin probabil cu `android-actions/setup-android@v3` |
| Play Console: "You're using a 4 KB page size" | Ar trebui să fie rezolvat cu config-ul din app.json, dacă nu rulezi `npx expo prebuild --clean` |
| Play Console: "Privacy policy required" | Creezi una simplă pe GitHub Pages (vezi punctul 5) |
| Play Console: "Upload signed AAB" | Verifici că KEYSTORE_BASE64 e în secrets și workflow-ul a rulat cu succes |

---

## 📅 Timeline realist pentru publicare

- **Ziua 0**: Push pe GitHub, primul build AAB reușit — 1-2 ore
- **Ziua 1**: Creezi cont Play Console, plătești $25 — 30 min
- **Ziua 2-4**: Verificare identitate Google — 2-7 zile
- **Ziua 5**: Upload internal testing, configurezi Store Listing — 1-2 ore
- **Ziua 6-20**: Closed testing cu 12 testeri, 14 zile consecutive — 2 săptămâni
- **Ziua 21**: Aplici pentru Production access — review 7 zile
- **Ziua 28**: App-ul e LIVE pe Play Store 🚀

**Total: ~1 lună** pentru primul release dacă urmezi toți pașii.

---

## Licență

Cod privat — nu redistribui fără permisiune.
