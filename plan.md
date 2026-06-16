# Caffeine._.iv — Coffee & Matcha Order Web App
## Project Plan

---

## Overview

Coffee **and matcha** ordering web app for a medical student seller. Brand name: **Caffeine._.iv** (used exactly as written, dots and underscores included). Drinks delivered in **sealed liquid bags** (no cups/ice). Orders compiled daily for **next-day delivery**. Payment via bank transfer + slip upload. Seller brews independently around study/ward schedule.

## Brand Assets

| File | Use |
|---|---|
| `icon.jpg` | Full logo (mascot dog + "Caffeine._.iv" text) — navbar, PWA icon, favicon, splash |
| `banner.jpg` | Mascot only (no text) — hero banners, empty states, loading screen |

Mascot: sleepy pug hooked to a coffee IV drip with "zzz". Hand-drawn line art, cream/brown palette. Appears on white or `--color-bg` backgrounds only — never on dark or colored fills.

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Tailwind CSS |
| Routing | React Router v6 |
| State | React Context (cart, shop, auth) + useState |
| Auth | Google Identity Services (Google Sign-In) |
| Real-time | Polling via GAS every 15s (with request guard) |
| Persistence | Google Apps Script → Google Sheets |
| File Storage | Google Apps Script → Google Drive |
| Charts | Chart.js + react-chartjs-2 |
| QR Code | `qrcode.react` (PromptPay QR generation) |
| Hosting | Vercel (static export) |
| Build | Vite |

---

## Design System

### Colors

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#7C3A1E` | CTA buttons, active states |
| `--color-primary-light` | `#A0522D` | Hover, secondary buttons |
| `--color-bg` | `#FAF6F0` | Page background (warm off-white) |
| `--color-surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--color-surface-muted` | `#F5EDE3` | Muted card backgrounds, chips |
| `--color-text` | `#2C1A0E` | Primary text |
| `--color-text-muted` | `#8C6A52` | Secondary text, placeholders |
| `--color-border` | `#E8D5C0` | Dividers, input borders |
| `--color-destructive` | `#C0392B` | Error, reject |
| `--color-success` | `#2E7D32` | Confirmed, delivered |

### Typography

Single font stack — **Plus Jakarta Sans** for all text (Latin + fallback), **Sarabun** for Thai.

```
font-family: 'Plus Jakarta Sans', 'Sarabun', sans-serif;
```

| Role | Size | Weight |
|---|---|---|
| Page title | 22–24px | 700 |
| Section heading | 17–18px | 600 |
| Body | 15px | 400 |
| Caption / label | 13px | 400–500 |
| Button | 15px | 600 |

### Shape & Spacing

| Token | Value |
|---|---|
| Card radius | `1.25rem` (20px) |
| Button radius | `9999px` (pill) |
| Input radius | `0.875rem` (14px) |
| Chip radius | `9999px` |
| Page horizontal padding | `1rem` (16px) |
| Card padding | `1rem` (16px) |
| Section gap | `1.5rem` (24px) |
| Transition | `150ms ease-out` |

### Elevation (shadows)

```css
--shadow-card: 0 2px 12px rgba(44, 26, 14, 0.07);
--shadow-sheet: 0 -4px 24px rgba(44, 26, 14, 0.10);
--shadow-button: 0 2px 8px rgba(124, 58, 30, 0.25);
```

### Component Patterns (from reference)

- **Bottom tab bar** — fixed, 4 tabs (Menu / Orders / Stamps / Profile), icon + label, active tab uses `--color-primary`
- **Cards** — white surface, `shadow-card`, `1.25rem` radius, image left or full-width top
- **Primary button** — pill, `--color-primary` fill, white text, `shadow-button`, full-width on mobile
- **Secondary button** — pill, `--color-surface-muted` fill, `--color-primary` text, no shadow
- **Category chips** — horizontal scroll row, circular or pill, icon + label, active = `--color-primary` fill
- **Section header** — left-aligned label (600 weight) + "View all" link right-aligned
- **Input fields** — `--color-surface` background, `--color-border` border, `0.875rem` radius, 48px height
- **Page structure** — `--color-bg` background, content max-width `480px` centered on desktop, full-width on mobile

## UI Guidelines

- **Responsive-first:** every page works on mobile (≥320px), tablet, desktop. Use Tailwind responsive prefixes (`sm:` / `md:` / `lg:`). No fixed-width layouts. Touch targets ≥44px.
- **Color:** warm brown palette above. `--color-bg` (#FAF6F0) for pages, white for cards. No cold grays or pure white backgrounds.
- **Typography:** Plus Jakarta Sans + Sarabun only. Weight and size carry hierarchy — no decorative treatment.
- **No AI slop:** zero emojis in UI text, labels, buttons, or messages. No filler microcopy. Error and status messages plain and direct.
- **Icons:** `lucide-react` only. Use with text label on all nav and primary actions. Icon-only only for universally understood symbols (close, back).
- **Density:** airy. Content never touches screen edges. Cards have room to breathe. Match the spaciousness of the reference.

---

## Features

### 1. Core Ordering & Customization

| Feature | Notes |
|---|---|
| Drink customization | Bean type, sweetness (0/25/50/100%), milk type (fresh/oat/etc.) |
| Cut-off time display + delivery slot selection | Show daily cut-off, let customer pick slot |
| PromptPay QR display | Auto-generate from `VITE_PROMPTPAY_NUMBER` |
| Slip upload + contact form | Image upload, name, phone, delivery note |
| Order tracking page | Pending → Preparing → Delivering → Delivered |
| Preset delivery locations dropdown | Predefined ward/building list |
| Pre-order date selection | Pick future delivery date |
| Dynamic price modifiers | Extra cost for oat milk, specialty beans, etc. |
| Weekly specialty beans highlight | Featured bean section on menu |

### 2. Customer Convenience

| Feature | Notes |
|---|---|
| Local order history (localStorage) | Auto-fill name, phone, last location |
| Loyalty stamps (phone number key) | No login — stamps tied to phone number |
| Coffee gifting + custom message | Buy for friend, attach personalized note |
| Multi-pack / stock-up bundles | Special bundle pricing configs |
| Alternative contact / ward extension field | Extra contact input in checkout |
| "Order My Usual" one-click shortcut | Saves favorite config to localStorage |
| Quick stamp checker widget | Check stamp balance by phone number |
| Recent orders + tracking history box | Show past orders from localStorage |
| Anonymous feedback box | Submit suggestions without identity |
| Beta-tester opt-in checkbox | Receive experimental menu creations |
| Medical encouragement note | Generate/write themed encouraging notes |
| English / Thai UI toggle | Language switch |
| Prepaid wallet / credit tracker | Track pre-deposited funds by phone |
| Dynamic cut-off countdown timer | Live countdown to next cut-off |
| Ward grouping incentive banner | "3 orders in OPD Building — join now!" |
| 1-tap prepaid fast pass | Instant order for wallet + usual menu users |

### 3. Seller / Admin

| Feature | Notes |
|---|---|
| Emergency shop close toggle | Master switch — stop all new orders instantly |
| Quick slip verification | Split-screen: slip image vs expected total, approve/reject |
| Simple menu management | Update prices, add items, hide out-of-stock |
| Duplicate slip detection | Hash slip image → check against Sheet |
| Slip verification API | Auto-verify via external API (EasySlip or similar) |
| Group status broadcast | Push status update to all orders in a group |
| Ingredient stock control | Track raw ingredient quantities |
| Emergency announcement banner | Prominent homepage banner for urgent notices |
| Monthly operating calendar | Show open/closed dates + exam/leave blocks |
| Batch packing & delivery sorter | Group orders by delivery location |
| Phone number as primary key | Sync stamps + history via phone in Sheets |
| Phone number normalization | Standardize format on input |
| Simple reward security check | Prevent stamp fraud on free coffee redemption |
| Auto cost & profit calculator | GAS formula in Sheet — no manual calc needed |
| Drop-off photo confirmation | Seller uploads photo to Drive → visible on tracking page |
| Study/exam leave display | Show blocked dates on calendar |
| Caffeine Gacha / Brewer's Choice | Randomized drink by seller |
| Batch prep & volume calculator | Aggregate ingredient volumes for day's orders |

---

## Pages

### Customer Flow (Public)

```
/ (menu)  →  /checkout  →  /payment  →  /confirm/:orderId
                                              ↑
/history  (past orders from localStorage)     |
/stamps   (loyalty stamp checker)             |
/wallet   (prepaid wallet view)               |
/feedback (anonymous feedback)                |
```

| Page | File | Purpose |
|---|---|---|
| Menu | `MenuPage.jsx` | Browse menu, weekly beans, customization, bundle, gacha, cart |
| Checkout | `CheckoutPage.jsx` | Delivery date/slot, location, name, phone, gift, note, beta opt-in |
| Payment | `PaymentPage.jsx` | PromptPay QR, slip upload, fast pass button |
| Confirmation | `ConfirmPage.jsx` | Order # + live status + drop-off photo |
| Order History | `HistoryPage.jsx` | Past orders from localStorage |
| Stamps | `StampsPage.jsx` | Enter phone → see stamp count + quick checker |
| Wallet | `WalletPage.jsx` | Prepaid balance view by phone number |
| Feedback | `FeedbackPage.jsx` | Anonymous feedback form |

### Admin Flow (Protected — Google Sign-In)

```
/admin/login  →  /admin/dashboard
                      ├── /admin/orders/:id
                      ├── /admin/menu
                      ├── /admin/calendar
                      ├── /admin/stock
                      └── /admin/batch
```

| Page | File | Purpose |
|---|---|---|
| Login | `admin/LoginPage.jsx` | Google Sign-In (restricted to owner email) |
| Dashboard | `admin/DashboardPage.jsx` | Stats, revenue chart, ward grouping, emergency close |
| Order Detail | `admin/OrderDetailPage.jsx` | Split-screen slip verify, status control, drop-off photo upload |
| Menu Manager | `admin/MenuManagerPage.jsx` | Add/edit/hide items, prices, bean highlights |
| Calendar | `admin/CalendarPage.jsx` | Monthly open/close, exam/leave dates |
| Stock | `admin/StockPage.jsx` | Ingredient inventory tracking |
| Batch | `admin/BatchPage.jsx` | Packing sorter by location + prep volume calculator |

---

## File Structure

```
CaffeineIV/
├── src/
│   ├── pages/
│   │   ├── MenuPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── PaymentPage.jsx
│   │   ├── ConfirmPage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── StampsPage.jsx
│   │   ├── WalletPage.jsx
│   │   ├── FeedbackPage.jsx
│   │   └── admin/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── OrderDetailPage.jsx
│   │       ├── MenuManagerPage.jsx
│   │       ├── CalendarPage.jsx
│   │       ├── StockPage.jsx
│   │       └── BatchPage.jsx
│   ├── services/
│   │   ├── auth.service.js     → googleSignIn(), signOut(), getAdminUser()
│   │   └── gas.service.js      → gasPost(), gasGet()
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── AnnouncementBanner.jsx
│   │   ├── menu/
│   │   │   ├── DrinkCard.jsx
│   │   │   ├── DrinkCustomizer.jsx   → bean/sweetness/milk selector
│   │   │   └── SpecialtyHighlight.jsx → weekly beans feature
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx
│   │   ├── order/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── OrderCard.jsx
│   │   │   └── DropoffPhoto.jsx
│   │   ├── loyalty/
│   │   │   ├── StampCard.jsx
│   │   │   └── WardGroupingBanner.jsx
│   │   ├── admin/
│   │   │   ├── SlipVerifier.jsx      → split-screen slip vs total
│   │   │   └── BatchSorter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PromptPayQR.jsx
│   │   ├── CountdownTimer.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   ├── CartContext.jsx     → cart items, totals, add/remove
│   │   ├── ShopContext.jsx     → shop open/closed, announcement, cut-off times
│   │   └── AuthContext.jsx     → admin auth state
│   ├── utils/
│   │   ├── helpers.js          → formatPrice, formatDate, generateOrderId, compressImage
│   │   ├── promptpay.js        → generate PromptPay QR payload string
│   │   ├── slipHash.js         → hash slip image for duplicate detection
│   │   └── phoneNorm.js        → normalize + validate Thai phone numbers
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx                 → all route definitions
│   └── main.jsx
├── gas/
│   └── Code.gs
├── public/
│   └── favicon.ico
├── .env.example
├── vite.config.js
├── tailwind.config.js
├── DATABASE.md
└── plan.md
```

---

## Data Architecture

### Google Sheets — All Sheets

| Sheet | Purpose |
|---|---|
| `orders` | All orders — primary records |
| `customers` | Phone as PK — stamps, wallet, usual order |
| `menu` | Drink items + customization options |
| `delivery_slots` | Available dates + slots + cut-off times |
| `ingredients` | Raw ingredient stock tracking |
| `feedback` | Anonymous customer feedback |
| `config` | Shop open toggle, announcement text, PromptPay |
| `slip_hashes` | Hashed slip fingerprints for duplicate detection |

---

### Sheet: `orders`

| Col | Key | Type | Example |
|---|---|---|---|
| A | order_id | string | `CIV-1718530200-X7K2` |
| B | created_at | string | `2024-06-16 14:30:00` |
| C | delivery_date | string | `2024-06-17` |
| D | delivery_slot | string | `morning` |
| E | delivery_location | string | `OPD Building — Ward Counter` |
| F | customer_name | string | `สมใจ ใจดี` |
| G | customer_phone | string | `0812345678` |
| H | alt_contact | string | `ext. 1234` |
| I | items | JSON string | `[{"id":"latte","qty":1,"bean":"Ethiopia","sweet":50,"milk":"oat"}]` |
| J | total_thb | number | `95` |
| K | note | string | `ไม่ใส่น้ำตาล` |
| L | is_gift | boolean | `FALSE` |
| M | gift_message | string | `` |
| N | is_beta_tester | boolean | `FALSE` |
| O | is_fast_pass | boolean | `FALSE` |
| P | is_gacha | boolean | `FALSE` |
| Q | slip_url | string | Drive URL |
| R | slip_hash | string | SHA-256 of slip base64 |
| S | status | string | `pending` |
| T | dropoff_photo_url | string | Drive URL |
| U | wallet_used_thb | number | `0` |

### Sheet: `customers`

| Col | Key | Type | Example |
|---|---|---|---|
| A | phone | string | `0812345678` (PK) |
| B | name | string | `สมใจ ใจดี` |
| C | stamps | number | `4` |
| D | wallet_thb | number | `200` |
| E | usual_order | JSON string | `{"id":"latte","bean":"Ethiopia","sweet":50,"milk":"oat"}` |
| F | last_location | string | `OPD Building` |
| G | total_orders | number | `12` |
| H | registered_at | string | `2024-06-01` |

### Sheet: `menu`

| Col | Key | Type | Example |
|---|---|---|---|
| A | item_id | string | `latte` |
| B | name | string | `Caffè Latte` |
| C | name_th | string | `คาเฟ่ลาเต้` |
| D | base_price_thb | number | `75` |
| E | category | string | `espresso` / `matcha` / `other` |
| F | description | string | `...` |
| G | image_url | string | Drive URL |
| H | available | boolean | `TRUE` |
| I | is_specialty_week | boolean | `FALSE` |
| J | bean_options | JSON string | `["Ethiopia","Colombia","House Blend"]` |
| K | milk_options | JSON string | `["fresh","oat","none"]` |
| L | oat_surcharge_thb | number | `15` |

### Sheet: `delivery_slots`

| Col | Key | Type | Example |
|---|---|---|---|
| A | date | string | `2024-06-17` |
| B | slot_id | string | `morning` |
| C | slot_label | string | `Morning (07:00–09:00)` |
| D | cut_off_datetime | string | `2024-06-16 21:00:00` |
| E | capacity | number | `20` |
| F | booked | number | `7` |
| G | active | boolean | `TRUE` |

### Sheet: `config`

| Col | Key | Value |
|---|---|---|
| A | shop_open | `TRUE` / `FALSE` |
| B | announcement | `"Closed Mon–Tue for exams"` |
| C | promptpay_number | `0812345678` |
| D | stamp_threshold | `10` (stamps for free drink) |
| E | gacha_active | `TRUE` / `FALSE` |

### Sheet: `slip_hashes`

| Col | Key | Type |
|---|---|---|
| A | hash | string (SHA-256) |
| B | order_id | string |
| C | created_at | string |

---

### GAS Payload Contract

All POST requests include `"secret": "VITE_GAS_SECRET_VALUE"`. GAS rejects mismatched token.

**submitOrder**
```json
{
  "action": "submitOrder",
  "secret": "...",
  "data": {
    "order_id": "CIV-1718530200-X7K2",
    "delivery_date": "2024-06-17",
    "delivery_slot": "morning",
    "delivery_location": "OPD Building",
    "customer_name": "สมใจ ใจดี",
    "customer_phone": "0812345678",
    "alt_contact": "",
    "items": [{ "id": "latte", "qty": 1, "bean": "Ethiopia", "sweet": 50, "milk": "oat" }],
    "total_thb": 90,
    "note": "",
    "is_gift": false,
    "gift_message": "",
    "is_beta_tester": false,
    "is_fast_pass": false,
    "is_gacha": false,
    "wallet_used_thb": 0,
    "slip_base64": "data:image/jpeg;base64,...",  // compressed <500KB
    "slip_hash": "sha256hex..."
  }
}
```

**updateStatus**
```json
{ "action": "updateStatus", "secret": "...", "data": { "order_id": "...", "status": "confirmed" } }
```

**uploadDropoffPhoto**
```json
{ "action": "uploadDropoffPhoto", "secret": "...", "data": { "order_id": "...", "photo_base64": "..." } }
```

**saveMenuItem**
```json
{ "action": "saveMenuItem", "secret": "...", "data": { ...menu fields... } }
```

**updateConfig**
```json
{ "action": "updateConfig", "secret": "...", "data": { "key": "shop_open", "value": "FALSE" } }
```

**updateStock**
```json
{ "action": "updateStock", "secret": "...", "data": { "ingredient_id": "oat_milk", "delta": -2 } }
```

**submitFeedback**
```json
{ "action": "submitFeedback", "secret": "...", "data": { "message": "...", "created_at": "..." } }
```

**topUpWallet**
```json
{ "action": "topUpWallet", "secret": "...", "data": { "phone": "0812345678", "amount_thb": 200 } }
```

**GET endpoints**
```
?action=getMenu
?action=getOrders&date=2024-06-17
?action=getOrderStatus&order_id=CIV-...
?action=getConfig
?action=getDeliverySlots&from=2024-06-17
?action=getCustomer&phone=0812345678
?action=getIngredients
?action=getBatchSummary&date=2024-06-17
?action=getWardGrouping&date=2024-06-17
```

**GAS Response**
```json
{ "status": "success", "data": { ... } }
{ "status": "error",   "message": "Reason" }
{ "status": "error",   "message": "DUPLICATE_SLIP" }
```

---

## Order Status Flow

```
pending  →  confirmed  →  preparing  →  delivering  →  delivered
                ↓
            rejected
```

| Status | Meaning | Color |
|---|---|---|
| `pending` | Slip uploaded, awaiting review | Amber |
| `confirmed` | Slip approved | Blue |
| `preparing` | Brewing / packing | Purple |
| `delivering` | In transit | Orange |
| `delivered` | Drop-off photo uploaded | Green |
| `rejected` | Slip rejected | Red |

---

## Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=        # OAuth 2.0 Client ID from Google Cloud Console
VITE_ADMIN_EMAIL=             # Owner's Google email — only this can access /admin
VITE_GAS_WEBAPP_URL=          # Deployed GAS web app URL
VITE_GAS_SECRET=              # Secret token — GAS checks on every request
VITE_PROMPTPAY_NUMBER=        # PromptPay phone or tax ID for QR generation
VITE_SLIP_VERIFY_API_KEY=     # External slip verification API key (EasySlip or similar)
```

---

## Google Apps Script (gas/Code.gs)

| Function | Purpose |
|---|---|
| `doPost(e)` | Validate secret → route to action handler |
| `doGet(e)` | Route GET actions, return JSON |
| `saveToDrive(base64, filename)` | Save image, set `ANYONE_WITH_LINK VIEW`, return URL |
| `checkDuplicateSlip(hash)` | Check `slip_hashes` sheet, return boolean |
| `sendOrderNotification(order)` | `MailApp.sendEmail()` to admin on new order |
| `getWardGrouping(date)` | Aggregate active orders by location |
| `getBatchSummary(date)` | Group orders by location for packing |
| `calcBatchVolumes(date)` | Sum ingredient requirements from day's orders |
| `updateCustomerStamps(phone, delta)` | Increment/decrement stamps in `customers` sheet |
| `deductWallet(phone, amount)` | Deduct from customer wallet balance |

---

## Build Order

### Phase 1 — Foundation
- [ ] Init Vite + React + Tailwind + React Router
- [ ] Create `DATABASE.md`
- [ ] Create `.env.example`
- [ ] Add PWA assets: `public/manifest.json`, `public/apple-touch-icon.png` (180×180)
- [ ] Google Cloud Console → OAuth 2.0 Client ID + generate `GAS_SECRET`
- [ ] Set up Google Sheet (8 sheets: `orders`, `customers`, `menu`, `delivery_slots`, `ingredients`, `feedback`, `config`, `slip_hashes`)
- [ ] Set up Google Drive folder for slips + drop-off photos
- [ ] Write and deploy `gas/Code.gs`

### Phase 2 — Services, Context & Utils
- [ ] `src/services/auth.service.js`
- [ ] `src/services/gas.service.js`
- [ ] `src/context/CartContext.jsx`
- [ ] `src/context/ShopContext.jsx` — shop_open, announcement, cut-off
- [ ] `src/context/AuthContext.jsx`
- [ ] `src/utils/helpers.js`
- [ ] `src/utils/promptpay.js`
- [ ] `src/utils/slipHash.js`
- [ ] `src/utils/phoneNorm.js`

### Phase 3 — Shared Components
- [ ] `Toast.jsx`
- [ ] `ProtectedRoute.jsx`
- [ ] `PromptPayQR.jsx`
- [ ] `CountdownTimer.jsx`
- [ ] `AnnouncementBanner.jsx`
- [ ] `StatusBadge.jsx`
- [ ] `WardGroupingBanner.jsx`
- [ ] `DrinkCustomizer.jsx`
- [ ] `CartDrawer.jsx`
- [ ] `SlipVerifier.jsx`
- [ ] `StampCard.jsx`
- [ ] `App.jsx` — route definitions

### Phase 4 — Customer Pages
- [ ] `MenuPage.jsx` — menu, specialty beans, customizer, gacha, cart
- [ ] `CheckoutPage.jsx` — date/slot, location, form, gift, beta opt-in, fast pass
- [ ] `PaymentPage.jsx` — PromptPay QR, slip upload + compress + hash, duplicate check
- [ ] `ConfirmPage.jsx` — status polling (15s, request guard, 2h hard stop), drop-off photo
- [ ] `HistoryPage.jsx` — orders from localStorage
- [ ] `StampsPage.jsx` — phone input → stamp balance
- [ ] `WalletPage.jsx` — phone input → wallet balance
- [ ] `FeedbackPage.jsx` — anonymous form

### Phase 5 — Admin Pages
- [ ] `admin/LoginPage.jsx`
- [ ] `admin/DashboardPage.jsx` — stats, Chart.js revenue, emergency close, announcement editor
- [ ] `admin/OrderDetailPage.jsx` — SlipVerifier, status buttons, drop-off photo upload
- [ ] `admin/MenuManagerPage.jsx` — CRUD, specialty toggle, bean/milk options
- [ ] `admin/CalendarPage.jsx` — open/close, exam leave dates
- [ ] `admin/StockPage.jsx` — ingredient inventory
- [ ] `admin/BatchPage.jsx` — packing sorter + volume calculator

### Phase 6 — Deploy
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Set all 6 env vars in Vercel dashboard
- [ ] Add Vercel domain to Google OAuth authorized origins
- [ ] Verify PWA: open on iOS Safari → Share → "Add to Home Screen" → confirm icon + standalone launch
- [ ] Transfer: share Google Sheet + Drive folder to friend's email
- [ ] Friend opens `/admin/login` → Sign in with Google → done

---

## Transfer Checklist (for friend)

1. Receive Google Sheet share → bookmark on phone
2. Receive Google Drive folder share → bookmark on phone
3. Open admin URL → click "Sign in with Google" → auto-authorized
4. Done — manage orders in Google Sheets, view slips in Drive, use admin dashboard for daily ops

---

## PWA (Add to Home Screen — iOS)

No service worker — GAS polling requires network anyway. Minimal PWA only.

**`public/manifest.json`**
```json
{
  "name": "CaffeineIV",
  "short_name": "CaffeineIV",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FEF3C7",
  "theme_color": "#92400E",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

**`index.html` meta tags**
```html
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="CaffeineIV" />
<meta name="theme-color" content="#92400E" />
```

**iOS limits:** no install prompt (user taps Share → "Add to Home Screen" manually). No push notifications below iOS 16.4.

---

## Notes

- **Slip upload:** compress via Canvas API (<500KB) → SHA-256 hash for duplicate check → base64 → GAS → save to Drive (public link) → store URL + hash in Sheet
- **PromptPay QR:** generated client-side from `VITE_PROMPTPAY_NUMBER` using `promptpay.js` util → rendered by `qrcode.react`
- **Duplicate slip:** hash compared against `slip_hashes` sheet in GAS before writing order — return `DUPLICATE_SLIP` error if match found
- **Loyalty stamps:** phone number = PK in `customers` sheet — no login required — basic security: GAS checks order count before allowing redemption
- **Fast pass:** only active when `localStorage` has both valid `usual_order` + customer has sufficient wallet balance — bypasses form + slip upload
- **Wallet:** top-up by admin only (seller deposits manually) — deducted via GAS on order submit
- **Ward grouping banner:** GAS `getWardGrouping` returns count per location for current date — polled every 60s on menu page
- **Emergency close:** `ShopContext` polls `?action=getConfig` on mount — if `shop_open=FALSE`, show overlay blocking all ordering
- **Shop calendar:** open/close dates stored in `delivery_slots` sheet — admin sets `active=FALSE` for closed dates
- **Gacha:** if `is_gacha=TRUE`, seller fills in actual drink before changing status to `confirmed`
- **Batch prep calculator:** GAS `calcBatchVolumes` parses all `items` JSON for a date, cross-references `ingredients` sheet for volumes per unit
- **Slip verification API:** called in GAS `doPost` during `submitOrder` — if API returns invalid, auto-reject and notify admin
- **Thai text:** `font-family: 'Sarabun', 'Karla', sans-serif` globally — Sarabun handles Thai, Karla handles Latin
- **Auth:** Google credential stored in `localStorage` — `exp` field checked on each admin page load via `ProtectedRoute`
- **Cart:** React Context backed to `localStorage` — survives page refresh, cleared after order confirmed
- **Order ID:** `CIV-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
- **Encouraging notes:** pre-written medical-themed messages array in client, random pick or custom input — attached as `note` field
- **Language toggle:** `i18n` object in `localStorage` — simple key lookup, no library needed for this scale
