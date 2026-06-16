# DATABASE.md — Google Sheets Schema

9 sheets required. Create them in order.

---

## Sheet: `admins`

| Col | Key | Type | Notes |
|---|---|---|---|
| A | username | string | Login username |
| B | password_hash | string | SHA-256 hex of password |
| C | display_name | string | Shown in admin UI |

Populated via `setAdminPassword` GAS action on first run (only works when sheet is empty).

---

## Sheet: `orders`

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
| M | gift_message | string | |
| N | is_beta_tester | boolean | `FALSE` |
| O | is_fast_pass | boolean | `FALSE` |
| P | is_gacha | boolean | `FALSE` |
| Q | slip_url | string | Drive URL |
| R | slip_hash | string | SHA-256 hex |
| S | status | string | `pending` |
| T | dropoff_photo_url | string | Drive URL |
| U | wallet_used_thb | number | `0` |

---

## Sheet: `customers`

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

---

## Sheet: `menu`

| Col | Key | Type | Example |
|---|---|---|---|
| A | item_id | string | `latte` |
| B | name | string | `Caffè Latte` |
| C | name_th | string | `คาเฟ่ลาเต้` |
| D | base_price_thb | number | `75` |
| E | category | string | `espresso` / `matcha` / `other` |
| F | description | string | |
| G | image_url | string | Drive URL |
| H | available | boolean | `TRUE` |
| I | is_specialty_week | boolean | `FALSE` |
| J | bean_options | JSON string | `["Ethiopia","Colombia","House Blend"]` |
| K | milk_options | JSON string | `["fresh","oat","none"]` |
| L | oat_surcharge_thb | number | `15` |

---

## Sheet: `delivery_slots`

| Col | Key | Type | Example |
|---|---|---|---|
| A | date | string | `2024-06-17` |
| B | slot_id | string | `morning` |
| C | slot_label | string | `Morning (07:00–09:00)` |
| D | cut_off_datetime | string | `2024-06-16 21:00:00` |
| E | capacity | number | `20` |
| F | booked | number | `7` |
| G | active | boolean | `TRUE` |

---

## Sheet: `ingredients`

| Col | Key | Type | Example |
|---|---|---|---|
| A | ingredient_id | string | `oat_milk` |
| B | name | string | `Oat Milk` |
| C | unit | string | `ml` |
| D | stock_qty | number | `2000` |
| E | per_drink_qty | number | `180` |

---

## Sheet: `feedback`

| Col | Key | Type |
|---|---|---|
| A | message | string |
| B | created_at | string |

---

## Sheet: `config`

Row-based key-value store (Col A = key, Col B = value).

| Key | Value |
|---|---|
| `shop_open` | `TRUE` / `FALSE` |
| `announcement` | string (empty = no banner) |
| `promptpay_number` | phone or tax ID string |
| `stamp_threshold` | number (e.g. `10`) |
| `gacha_active` | `TRUE` / `FALSE` |

---

## Sheet: `slip_hashes`

| Col | Key | Type |
|---|---|---|
| A | hash | SHA-256 hex string |
| B | order_id | string |
| C | created_at | string |
