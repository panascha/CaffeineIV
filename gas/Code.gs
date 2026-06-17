// ============================================================
// Caffeine._.iv — Google Apps Script Backend
// Script ID:  1xAUiKqj3sejFtcwkd-Ombpr02jTIa7_IRiu9s2ojXrqVVyMHKsZq9ysA
// Sheet ID:   1gBqSZdbe8GQ3aOv5i_7nar6VJQ6U35dcjTdqlXHGjmc
// Drive folder: 1GyKfyWg2pJXf_HcMlMyN6C_i89ZgcU0S
// Deploy as: Web App — Execute as Me, Anyone can access
// ============================================================

const SHEET_ID        = '1gBqSZdbe8GQ3aOv5i_7nar6VJQ6U35dcjTdqlXHGjmc';
const DRIVE_FOLDER_ID = '1GyKfyWg2pJXf_HcMlMyN6C_i89ZgcU0S';

// Script Properties required (set in Apps Script → Project Settings → Script Properties):
//   GAS_SECRET          — random secret, must match VITE_GAS_SECRET
//   ADMIN_EMAIL         — receives new-order notification emails
//   SLIP_VERIFY_API_KEY — EasySlip API key (optional; leave empty to skip)

const SECRET           = PropertiesService.getScriptProperties().getProperty('GAS_SECRET');
const ADMIN_EMAIL      = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
const SLIP_VERIFY_KEY  = PropertiesService.getScriptProperties().getProperty('SLIP_VERIFY_API_KEY');

const SS = SpreadsheetApp.openById(SHEET_ID);

// ── Helpers ──────────────────────────────────────────────────

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) { return SS.getSheetByName(name); }

function hashPassword(password) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function tryParse(val, fallback) {
  try { return JSON.parse(val); } catch (_) { return fallback; }
}

// ── Entry Points ─────────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // login does not require secret (credentials are the proof)
    if (body.action === 'login')            return login(body.data);
    // setAdminPassword only works when admins sheet is empty; no secret needed
    if (body.action === 'setAdminPassword') return setAdminPassword(body.data);

    if (body.secret !== SECRET) return err('UNAUTHORIZED');

    switch (body.action) {
      case 'submitOrder':        return submitOrder(body.data);
      case 'updateStatus':       return updateStatus(body.data);
      case 'uploadDropoffPhoto': return uploadDropoffPhoto(body.data);
      case 'saveMenuItem':       return saveMenuItem(body.data);
      case 'updateConfig':       return updateConfig(body.data);
      case 'updateStock':        return updateStock(body.data);
      case 'submitFeedback':     return submitFeedback(body.data);
      case 'topUpWallet':        return topUpWallet(body.data);
      case 'changePassword':     return changePassword(body.data);
      default:                   return err('UNKNOWN_ACTION');
    }
  } catch (ex) {
    return err(ex.message);
  }
}

function doGet(e) {
  try {
    const p = e.parameter;
    switch (p.action) {
      case 'getMenu':          return ok(getMenu());
      case 'getOrders':        return ok(getOrders(p.date));
      case 'getOrderStatus':   return ok(getOrderStatus(p.order_id));
      case 'getConfig':        return ok(getConfig());
      case 'getDeliverySlots': return ok(getDeliverySlots(p.from));
      case 'getCustomer':      return ok(getCustomer(p.phone));
      case 'getIngredients':   return ok(getIngredients());
      case 'getBatchSummary':  return ok(getBatchSummary(p.date));
      case 'getWardGrouping':  return ok(getWardGrouping(p.date));
      default:                 return err('UNKNOWN_ACTION');
    }
  } catch (ex) {
    return err(ex.message);
  }
}

// ── Auth ──────────────────────────────────────────────────────

function login(data) {
  if (!data.username || !data.password) return err('MISSING_FIELDS');
  const hash = hashPassword(data.password);
  const rows = sheet('admins').getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username && rows[i][1] === hash) {
      const exp = Date.now() + 8 * 60 * 60 * 1000; // 8-hour session
      return ok({ admin_name: rows[i][2] || rows[i][0], exp });
    }
  }
  return err('INVALID_CREDENTIALS');
}

// First-time setup only — blocked once any admin exists
function setAdminPassword(data) {
  if (!data.username || !data.password) return err('MISSING_FIELDS');
  const s = sheet('admins');
  const rows = s.getDataRange().getValues();
  const existing = rows.slice(1).filter(r => r[0]);
  if (existing.length > 0) return err('ADMIN_ALREADY_EXISTS');
  s.appendRow([data.username, hashPassword(data.password), data.display_name || data.username]);
  return ok({});
}

// Requires secret — called from admin UI
function changePassword(data) {
  if (!data.username || !data.new_password) return err('MISSING_FIELDS');
  const s = sheet('admins');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      s.getRange(i + 1, 2).setValue(hashPassword(data.new_password));
      return ok({});
    }
  }
  return err('ADMIN_NOT_FOUND');
}

// ── POST Handlers ─────────────────────────────────────────────

function submitOrder(data) {
  if (data.slip_hash && checkDuplicateSlip(data.slip_hash)) return err('DUPLICATE_SLIP');

  if (SLIP_VERIFY_KEY && data.slip_base64) {
    if (!verifySlipExternal(data.slip_base64)) {
      if (ADMIN_EMAIL) MailApp.sendEmail(ADMIN_EMAIL, '[CaffeineIV] Slip rejected', `Order ${data.order_id} — slip failed external verification.`);
      return err('SLIP_INVALID');
    }
  }

  let slip_url = '';
  if (data.slip_base64) slip_url = saveToDrive(data.slip_base64, `slip_${data.order_id}.jpg`);

  sheet('orders').appendRow([
    data.order_id,
    data.created_at || new Date().toISOString().replace('T', ' ').slice(0, 19),
    data.delivery_date,
    data.delivery_slot,
    data.delivery_location,
    data.customer_name,
    data.customer_phone,
    data.alt_contact || '',
    JSON.stringify(data.items),
    data.total_thb,
    data.note || '',
    data.is_gift || false,
    data.gift_message || '',
    data.is_beta_tester || false,
    data.is_fast_pass || false,
    data.is_gacha || false,
    slip_url,
    data.slip_hash || '',
    'pending',
    '',
    data.wallet_used_thb || 0,
  ]);

  if (data.slip_hash) sheet('slip_hashes').appendRow([data.slip_hash, data.order_id, new Date().toISOString()]);
  if (data.wallet_used_thb > 0) deductWallet(data.customer_phone, data.wallet_used_thb);
  updateCustomer_(data);
  incrementSlotBooked_(data.delivery_date, data.delivery_slot);
  if (ADMIN_EMAIL) sendOrderNotification(data);

  return ok({ order_id: data.order_id });
}

function updateStatus(data) {
  const s = sheet('orders');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.order_id) {
      s.getRange(i + 1, 19).setValue(data.status);
      if (data.status === 'delivered') {
        const phone = rows[i][6];
        if (phone) updateCustomerStamps(phone, 1);
      }
      return ok({ order_id: data.order_id, status: data.status });
    }
  }
  return err('ORDER_NOT_FOUND');
}

function uploadDropoffPhoto(data) {
  const url = saveToDrive(data.photo_base64, `dropoff_${data.order_id}.jpg`);
  const s = sheet('orders');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.order_id) {
      s.getRange(i + 1, 20).setValue(url);
      return ok({ url });
    }
  }
  return err('ORDER_NOT_FOUND');
}

function saveMenuItem(data) {
  const s = sheet('menu');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.item_id) {
      s.getRange(i + 1, 1, 1, 12).setValues([[
        data.item_id, data.name, data.name_th, data.base_price_thb,
        data.category, data.description || '', data.image_url || '',
        data.available !== false, data.is_specialty_week || false,
        JSON.stringify(data.bean_options || []),
        JSON.stringify(data.milk_options || []),
        data.oat_surcharge_thb || 0,
      ]]);
      return ok({ item_id: data.item_id });
    }
  }
  sheet('menu').appendRow([
    data.item_id, data.name, data.name_th, data.base_price_thb,
    data.category, data.description || '', data.image_url || '',
    data.available !== false, data.is_specialty_week || false,
    JSON.stringify(data.bean_options || []),
    JSON.stringify(data.milk_options || []),
    data.oat_surcharge_thb || 0,
  ]);
  return ok({ item_id: data.item_id });
}

function updateConfig(data) {
  const s = sheet('config');
  const rows = s.getDataRange().getValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === data.key) {
      s.getRange(i + 1, 2).setValue(data.value);
      return ok({ key: data.key });
    }
  }
  s.appendRow([data.key, data.value]);
  return ok({ key: data.key });
}

function updateStock(data) {
  const s = sheet('ingredients');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.ingredient_id) {
      const current = Number(rows[i][3]);
      s.getRange(i + 1, 4).setValue(current + data.delta);
      return ok({ ingredient_id: data.ingredient_id, new_qty: current + data.delta });
    }
  }
  return err('INGREDIENT_NOT_FOUND');
}

function submitFeedback(data) {
  sheet('feedback').appendRow([data.message, data.created_at || new Date().toISOString()]);
  return ok({});
}

function topUpWallet(data) {
  const s = sheet('customers');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.phone) {
      s.getRange(i + 1, 4).setValue(Number(rows[i][3]) + data.amount_thb);
      return ok({ phone: data.phone, wallet_thb: Number(rows[i][3]) + data.amount_thb });
    }
  }
  return err('CUSTOMER_NOT_FOUND');
}

// ── GET Handlers ──────────────────────────────────────────────

function getMenu() {
  const rows = sheet('menu').getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const item = {};
    headers.forEach((h, i) => item[h] = row[i]);
    item.bean_options = tryParse(item.bean_options, []);
    item.milk_options = tryParse(item.milk_options, []);
    return item;
  });
}

function getOrders(date) {
  const rows = sheet('orders').getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1)
    .filter(row => row[2] === date)
    .map(row => {
      const o = {};
      headers.forEach((h, i) => o[h] = row[i]);
      o.items = tryParse(o.items, []);
      return o;
    });
}

function getOrderStatus(order_id) {
  const rows = sheet('orders').getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === order_id) {
      const o = {};
      headers.forEach((h, j) => o[h] = rows[i][j]);
      o.items = tryParse(o.items, []);
      return o;
    }
  }
  return null;
}

function getConfig() {
  const rows = sheet('config').getDataRange().getValues();
  const cfg = {};
  rows.forEach(row => { if (row[0]) cfg[row[0]] = row[1]; });
  return cfg;
}

function getDeliverySlots(from) {
  const rows = sheet('delivery_slots').getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1)
    .filter(row => row[0] >= from && (row[6] === true || row[6] === 'TRUE'))
    .map(row => {
      const s = {};
      headers.forEach((h, i) => s[h] = row[i]);
      return s;
    });
}

function getCustomer(phone) {
  const rows = sheet('customers').getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === phone) {
      const c = {};
      headers.forEach((h, j) => c[h] = rows[i][j]);
      c.usual_order = tryParse(c.usual_order, null);
      return c;
    }
  }
  return null;
}

function getIngredients() {
  const rows = sheet('ingredients').getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const ing = {};
    headers.forEach((h, i) => ing[h] = row[i]);
    return ing;
  });
}

function getBatchSummary(date) {
  const orders = getOrders(date);
  const byLocation = {};
  orders.forEach(o => {
    const loc = o.delivery_location || 'Unknown';
    if (!byLocation[loc]) byLocation[loc] = [];
    byLocation[loc].push(o);
  });
  return byLocation;
}

function getWardGrouping(date) {
  const orders = getOrders(date).filter(o => o.status !== 'rejected');
  const counts = {};
  orders.forEach(o => {
    const loc = o.delivery_location || 'Unknown';
    counts[loc] = (counts[loc] || 0) + 1;
  });
  return counts;
}

// ── Drive ─────────────────────────────────────────────────────

function saveToDrive(base64, filename) {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const data = match ? match[2] : base64;
  const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, filename);
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// ── Slip Verification ─────────────────────────────────────────

function checkDuplicateSlip(hash) {
  return sheet('slip_hashes').getDataRange().getValues().some(row => row[0] === hash);
}

function verifySlipExternal(base64) {
  try {
    const response = UrlFetchApp.fetch('https://api.easyslip.com/api/v1/verify', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Bearer ${SLIP_VERIFY_KEY}` },
      payload: JSON.stringify({ image: base64 }),
      muteHttpExceptions: true,
    });
    return JSON.parse(response.getContentText()).success === true;
  } catch (_) {
    return true; // fail open — don't block orders on API error
  }
}

// ── Notifications ─────────────────────────────────────────────

function sendOrderNotification(order) {
  MailApp.sendEmail(
    ADMIN_EMAIL,
    `[CaffeineIV] New order ${order.order_id}`,
    `Order: ${order.order_id}\nCustomer: ${order.customer_name} (${order.customer_phone})\nDelivery: ${order.delivery_date} ${order.delivery_slot}\nTotal: ${order.total_thb} THB`
  );
}

// ── Customer helpers ──────────────────────────────────────────

function updateCustomerStamps(phone, delta) {
  const s = sheet('customers');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === phone) {
      s.getRange(i + 1, 3).setValue(Math.max(0, Number(rows[i][2]) + delta));
      return;
    }
  }
}

function deductWallet(phone, amount) {
  const s = sheet('customers');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === phone) {
      s.getRange(i + 1, 4).setValue(Math.max(0, Number(rows[i][3]) - amount));
      return;
    }
  }
}

function calcBatchVolumes(date) {
  const orders = getOrders(date);
  const ingredients = getIngredients();
  const ingMap = {};
  ingredients.forEach(ing => ingMap[ing.ingredient_id] = ing);
  const volumes = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      if (item.milk) {
        const key = `${item.milk}_milk`;
        volumes[key] = (volumes[key] || 0) + (ingMap[key]?.per_drink_qty || 0) * item.qty;
      }
    });
  });
  return volumes;
}

function updateCustomer_(data) {
  const s = sheet('customers');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.customer_phone) {
      s.getRange(i + 1, 2).setValue(data.customer_name);
      s.getRange(i + 1, 6).setValue(data.delivery_location);
      s.getRange(i + 1, 7).setValue(Number(rows[i][6]) + 1);
      return;
    }
  }
  sheet('customers').appendRow([
    data.customer_phone, data.customer_name, 0, 0, '',
    data.delivery_location, 1, new Date().toISOString().slice(0, 10),
  ]);
}

function incrementSlotBooked_(date, slot_id) {
  const s = sheet('delivery_slots');
  const rows = s.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === date && rows[i][1] === slot_id) {
      s.getRange(i + 1, 6).setValue(Number(rows[i][5]) + 1);
      return;
    }
  }
}
