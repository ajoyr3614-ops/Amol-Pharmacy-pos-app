# Amol Pharmacy Management — Native Android Project

A complete, production-grade native Android application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **Room Database** (offline-first local storage), **WorkManager**, and **CameraX / ML Kit**.

---

## 📱 Architecture & Technology Stack

- **UI Framework:** Jetpack Compose (100% Native Android UI, no WebViews)
- **Design System:** Material 3 with a customized Teal (`#0D9488`) and Emerald Green (`#059669`) gradient palette
- **Local Database:** Room Database with multi-batch inventory, transactional ACID updates, and foreign keys
- **Background Tasks:** Android WorkManager (daily business summaries, low stock warnings, expiry checks)
- **Hardware Integration:** CameraX & ML Kit for barcode scanning, Bluetooth/USB ESC-POS & Android PrintManager for 58mm/80mm/A4 thermal printing
- **File Management:** Android Storage Access Framework (SAF) for local JSON/database backup and restore
- **Language & Localization:** English and Bengali (বাংলা) support, BDT (`৳`) default currency

---

## 🛠️ How to Open and Build in Android Studio

### Prerequisites
1. **Android Studio:** Ladybug (2024.2+) or Koala / Jellyfish recommended
2. **Java Development Kit:** JDK 17 or JDK 21 (configured as Gradle JDK in Android Studio)
3. **Android SDK:** API 34 (Android 14) platform and Build-Tools 34.0.0 installed

### Step-by-Step Instructions

1. **Open the Project:**
   - Launch Android Studio.
   - Click **File > Open...** (or **Open an Existing Project** on the welcome screen).
   - Select the `android/` directory inside this repository.

2. **Sync Gradle:**
   - Android Studio will automatically recognize the Gradle project and trigger a sync.
   - If prompted, click **Sync Project with Gradle Files**.

3. **Build the Debug APK:**
   - From the top menu, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Alternatively, open the terminal in Android Studio and run:
     ```bash
     ./gradlew assembleDebug
     ```

4. **Locate the Debug APK:**
   - Once the build succeeds, your installable APK will be at:
     ```
     app/build/outputs/apk/debug/app-debug.apk
     ```

5. **Run on a Device or Emulator:**
   - Connect your Android phone via USB with USB Debugging enabled, or launch an Android Virtual Device (AVD).
   - Click the green **Run (▶)** button in Android Studio.

---

## 📦 Features Implemented

1. **Dashboard:**
   - Teal-green gradient header with dynamic pharmacy name (from settings)
   - Professional medical banner
   - 11 real-time summary cards always visible
   - 17 colorful rounded action buttons

2. **POS / Billing:**
   - Barcode scanning with instant product popup (Piece/Strip/Box selection)
   - Dynamic cart display with live piece and pack conversions
   - Subtotal, single whole-memo discount (percentage/fixed/adjustment)
   - Multi-payment: Cash, Online, and Due
   - 58mm, 80mm, and A4 thermal receipt printing & PDF export
   - Memo footer note in Bengali: *"বিশেষ দ্রষ্টব্য: বিক্রিত ওষুধ ফেরত নেওয়া হয় না।"*

3. **Multi-Batch Medicine Management:**
   - Optional batch number, expiry date, purchase and sale price per piece
   - Configurable piece-to-strip and piece-to-box conversions per medicine
   - Negative stock support enabled by default

4. **Purchase & Supplier Ledger:**
   - Purchase invoices automatically increment batch and product stocks
   - Transactional supplier ledger without arbitrary plus/minus balance buttons

5. **Customer Ledger & Outstanding Dues:**
   - Optional customer attachment during POS sales
   - Outstanding due tracking, payment collection records, and statements

6. **Expiry Delivery:**
   - Organized by Company Name folders
   - Return amounts, supplier delivery routing, and payments received

7. **Medicine Orders:**
   - Order tracking with statuses: Pending, Due Today, Overdue, Received, Cancelled
   - Notification reminders

8. **Expenses & Reports:**
   - Categories: Rent, Electricity, Salary, Travel, Other + custom categories
   - Daily, weekly, monthly, yearly, and custom date range financial and stock reports

9. **Backup & Restore:**
   - Local JSON backup and restore with replacement confirmation safeguards

---

## 🔒 Offline & Security Note

- Opens directly to the Dashboard.
- No mandatory login, password, or subscription.
- 100% offline functionality.
