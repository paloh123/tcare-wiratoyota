Memindahkan sistem *tracking* dari Excel ke sebuah *web application* adalah langkah yang sangat tepat. Ini akan membuat proses *import* data, kalkulasi otomatis, dan kolaborasi tim menjadi jauh lebih cepat dan minim *error* dibandingkan mengelola banyak *sheet* dengan rumus yang rawan terhapus.

Berikut adalah *vibe coding prompt* komprehensif yang bisa langsung kamu *copy-paste* ke AI *coding assistant* pilihanmu (seperti Cursor, GitHub Copilot, atau Claude). Prompt ini sudah disesuaikan dengan arsitektur modern (Next.js, MySQL, Tailwind) yang sangat cocok untuk sistem *dealer* skala profesional.

---

### 📋 Vibe Coding Prompt: TCare R3 Wira Toyota

**Copy teks di bawah ini ke dalam AI Coding Assistant Anda:**

```text
Act as an Expert Full-Stack Developer. I need you to build a modern web application for a Toyota Dealership called "TCare R3 (Revenue Recovery Radar) Wira Toyota". 

The goal of this application is to migrate a complex Excel-based service tracking system into a seamless web app. 

### TECH STACK
- Frontend: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- Backend: Next.js API Routes (Server Actions)
- Database: MySQL with Prisma ORM
- File Handling: Papaparse / XLSX (for importing CSV/Excel)
- Charts: Recharts (for Dashboard visualization)

### DATABASE SCHEMA (PRISMA MODELS)
Please create the following Prisma schema:

1. `Price`:
   - id, category (Enum: LABOUR, PART), type (String), month_1 (Int), month_6 (Int), month_12 (Int), month_18 (Int), month_24 (Int), month_30 (Int), month_36 (Int).

2. `SalesUnit`:
   - vin (String @id), no_polisi, customer, type, tanggal_delivery (DateTime), outlet_sales, salesman, no_hp, alamat_kota, keterangan.

3. `ServiceHistory`:
   - id (UUID @id), vin (String @relation to SalesUnit), tanggal_service (DateTime), interval (Enum: 1st, 2nd, 3rd, 4th, 5th, 6th, 7th), dealer_service, status_dealer (Enum: WIRA, DEALER_LAIN), labour (Float), part (Float), revenue (Float), sa_outlet, keterangan, type.

### CORE BUSINESS LOGIC (THE "R3" ENGINE)
The core feature is the "Tracking R3" calculation. You must create a server utility/service that dynamically calculates tracking data based on the SalesUnit and related ServiceHistory data:

- Predictive Service Dates (Pred 1 to Pred 7): Calculated based on `tanggal_delivery` from `SalesUnit`.
  - Pred 1 (+1 Month)
  - Pred 2 (+6 Months)
  - Pred 3 (+12 Months)
  - Pred 4 (+18 Months)
  - Pred 5 (+24 Months)
  - Pred 6 (+30 Months)
  - Pred 7 (+36 Months)
- Actual Dates & Status: Match the `ServiceHistory` intervals (1st to 7th) with the VIN. Check `status_dealer` (WIRA or DEALER LAIN).
- Gap Hari: Difference in days between Expected (Pred) and Actual Service date.
- Revenue Calculation: 
  - `Income Wira`: Sum of revenue if `status_dealer` is WIRA.
  - `Lost Dealer Lain`: Sum of revenue if `status_dealer` is DEALER LAIN.
  - `Potensi Revenue`: Estimated revenue based on missing intervals (Expected to service but no actual data yet), fetched from the `Price` table matching the vehicle `Type`.
- Priority Logic:
  - P1 Recovery: Missed service (Overdue) / Lost detected.
  - P2 Reminder: Due soon (<= 30 days).
  - P3 Booking Plan: Normal flow, ready for next interval.
  - Monitoring: Just monitoring next interval.

### MAIN PAGES & FEATURES
1. /dashboard
   - KPI Cards: Total VIN Tracking, Unit Income Wira, Unit Lost Dealer Lain, Revenue Income Wira, Revenue Lost Dealer Lain, Potensi Revenue, Overdue Item, Due <= 30 Hari.
   - Bar Chart: "TCare - R3 Priority" showing counts of P1 Recovery, P2 Reminder, P3 Booking Plan, and Monitoring.

2. /data-import
   - Two drag-and-drop file upload zones.
   - Zone 1: Import Sales Unit data. Map columns to the `SalesUnit` model. Upsert by VIN.
   - Zone 2: Import Service History data. Map columns to the `ServiceHistory` model.

3. /tracking-r3
   - A comprehensive, wide data table utilizing TanStack Table (or similar) with sticky headers and horizontal scrolling.
   - Columns: VIN, Customer, Type, Delivery Date, Pred 1 to 7, Actual 1 to 7, Next Due Date, Next Interval, Priority, Action Plan, Last Follow Up.
   - Include filters for "Priority" and "Status Dealer".

4. /pricing
   - Simple CRUD table to manage the Labour and Part prices per vehicle type and interval.

### INITIALIZATION
Start by initializing the Next.js project with Tailwind and Shadcn. Provide the setup commands, then write the Prisma Schema, and finally guide me through building the `/data-import` component and the "Tracking Engine" logic first, as that is the backbone of the app. Ensure the UI looks professional, utilizing a primary color scheme of dark teal (#0f766e) similar to the original Excel file.

```

---

### 💡 Tips Eksekusi:

* **Fokus pada Backend Dulu:** Pastikan AI membuat skema Prisma dan fungsi kalkulasi bulan (1B, 6B, 12B) dengan benar terlebih dahulu sebelum mendesain tabel visualnya, karena logika perhitungan waktu ini adalah jantung dari aplikasi TCare R3.
* **Library Parsing:** Minta AI menggunakan library seperti `papaparse` atau `xlsx` untuk fitur *import*, karena struktur data Excel dari *dealer* biasanya cukup padat.

Apakah ada aturan khusus dari pihak manajemen terkait format laporan hasil akhir yang perlu ditambahkan ke dalam aplikasi ini nantinya?