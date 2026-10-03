# Aadhis Digital Hub - Business Inventory Management (B2B & B2C)

A full-stack business inventory and device tracking management system tailored for electronics/mobile devices featuring two distinct operational segments: **B2B (Wholesale Procurement)** and **B2C (Retail Sales)** with **IMEI Lifecycle Tracking**.

---

## 🚀 Key Features & Segments

### 1. B2B Segment (Wholesale Inward Procurement)
Tracks all stock purchased in bulk or business lots from distributors:
* **Purchased From**: Vendor, distributor, or wholesaler name & invoice reference.
* **Model**: Brand and device specification (e.g. *iPhone 15 Pro 128GB*, *Samsung S24 Ultra*).
* **IMEI**: Unique 15-digit IMEI or serial number for unit-level tracking.
* **Purchase Date & Cost**: Inward arrival date and purchase cost price.
* **Status**: `In Stock`, `Sold to B2C`, `Returned`.
* **One-Click Transfer**: Sell and dispatch any in-stock item directly to a retail B2C customer with auto-filled device details and live profit margin calculation.

### 2. B2C Segment (Retail Customer Sales)
Tracks outward retail transactions and deliveries to end customers:
* **From (Source)**: Origin or B2B vendor supplier lot.
* **Model**: Device model sold.
* **IMEI**: Serial number matching the physical device.
* **To (Sold To)**: Customer full name, phone number, and optional email.
* **Sale Date & Price**: Sale date, retail price, and payment method (UPI, Card, Cash, Finance).
* **Warranty & Retail Invoice**: Standard warranty period and auto-generated retail invoice number.
* **Printable Invoice**: Instant printable tax invoice / receipt with company details and warranty terms.

### 3. IMEI Lifecycle Tracker
* Type or paste any 15-digit IMEI or serial number.
* Instantly view the device's complete chain of custody:
  1. **Step 1: Procurement (B2B)** - When and from which vendor it was bought, cost price, and invoice ref.
  2. **Step 2: Inventory Status** - Whether it is currently in warehouse stock or dispatched.
  3. **Step 3: Fulfillment (B2C)** - Customer details, sale price, warranty, and realized profit margin (`Sale Price - Purchase Price`).

### 4. Data Export
* One-click CSV export for both B2B and B2C segments for accounting and bookkeeping.

---

## 🛠 Tech Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide React icons
* **Backend**: Node.js, Express.js
* **Database**: SQLite (via `better-sqlite3` with WAL mode for speed and persistence)

---

## 🏃‍♂️ How to Run

### Run both Frontend and Backend concurrently:
```bash
npm run dev
```

* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:5000](http://localhost:5000)

### Or run individually:
```bash
# Start backend server only
npm run server

# Start frontend development client only
npm run client
```

---

## 📁 Project Structure

```
inventary/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation & quick actions
│   │   │   ├── DashboardView.jsx   # Metrics, charts, recent activities
│   │   │   ├── B2BView.jsx         # B2B inventory management & filters
│   │   │   ├── B2CView.jsx         # B2C sales & invoice triggers
│   │   │   ├── ImeiTrackerView.jsx # Device lifecycle & margin tracker
│   │   │   ├── TransferModal.jsx   # 1-click B2B -> B2C transfer modal
│   │   │   ├── InvoiceModal.jsx    # Printable retail tax invoice
│   │   │   ├── B2BModal.jsx        # Add/edit B2B purchase modal
│   │   │   └── B2CModal.jsx        # Add/edit B2C sale modal
│   │   ├── services/
│   │   │   └── api.js              # REST API client
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── server/                     # Express Backend
│   ├── db.js                   # SQLite schema, tables & seed data
│   └── index.js                # API endpoints
├── data/
│   └── inventory.db            # Persistent SQLite database
└── package.json
```
