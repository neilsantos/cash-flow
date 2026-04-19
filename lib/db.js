import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(process.cwd(), "data", "cash-flow.sqlite");

function getConnection() {
  if (!globalThis.cashFlowDb) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    globalThis.cashFlowDb = db;
  }

  ensureSchema(globalThis.cashFlowDb);
  return globalThis.cashFlowDb;
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cash_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      opening_cents INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cash_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cash_day_id INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('in', 'out')),
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      payment_type TEXT NOT NULL CHECK (payment_type IN ('dinheiro', 'credito', 'pix')),
      occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cash_day_id) REFERENCES cash_days(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  ensureColumn(db, "cash_movements", "client_id", "INTEGER");
  ensureColumn(db, "cash_movements", "payment_status", "TEXT NOT NULL DEFAULT 'paid'");
}

function ensureCashDay(date) {
  const db = getConnection();
  db.prepare("INSERT OR IGNORE INTO cash_days (date) VALUES (?)").run(date);
  return plainRow(db.prepare("SELECT * FROM cash_days WHERE date = ?").get(date));
}

export function getCashDay(date) {
  const db = getConnection();
  const day = ensureCashDay(date);
  const movements = db
    .prepare(
      `SELECT
         cm.id,
         cm.mode,
         cm.description,
         cm.amount_cents,
         cm.payment_type,
         cm.payment_status,
         cm.client_id,
         c.name as client_name,
         cm.occurred_at
       FROM cash_movements cm
       LEFT JOIN clients c ON c.id = cm.client_id
       WHERE cm.cash_day_id = ?
       ORDER BY cm.occurred_at DESC, cm.id DESC`
    )
    .all(day.id)
    .map(plainRow);

  return {
    day,
    movements,
    summary: summarize(day.opening_cents, movements),
  };
}

export function setOpeningAmount(date, openingCents) {
  const db = getConnection();
  ensureCashDay(date);
  db.prepare(
    "UPDATE cash_days SET opening_cents = ?, updated_at = CURRENT_TIMESTAMP WHERE date = ?"
  ).run(openingCents, date);
  return getCashDay(date);
}

export function createMovement({
  date,
  mode,
  description,
  amountCents,
  paymentType,
  clientId,
  paymentStatus = "paid",
}) {
  const db = getConnection();
  const day = ensureCashDay(date);
  db.prepare(
    `INSERT INTO cash_movements
      (cash_day_id, mode, description, amount_cents, payment_type, client_id, payment_status, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).run(
    day.id,
    mode,
    description,
    amountCents,
    paymentType,
    clientId || null,
    paymentStatus
  );
  return getCashDay(date);
}

export function updateMovement({
  id,
  mode,
  description,
  amountCents,
  paymentType,
  clientId,
  paymentStatus,
}) {
  const db = getConnection();
  const row = db
    .prepare(
      `SELECT cd.date
       FROM cash_movements cm
       JOIN cash_days cd ON cd.id = cm.cash_day_id
       WHERE cm.id = ?`
    )
    .get(id);

  if (!row) {
    return null;
  }

  db.prepare(
    `UPDATE cash_movements
     SET mode = ?,
         description = ?,
         amount_cents = ?,
         payment_type = ?,
         client_id = ?,
         payment_status = ?
     WHERE id = ?`
  ).run(
    mode,
    description,
    amountCents,
    paymentType,
    clientId || null,
    paymentStatus,
    id
  );

  return getCashDay(row.date);
}

export function updateMovementPaymentStatus(id, paymentStatus) {
  const db = getConnection();
  const row = db
    .prepare(
      `SELECT cd.date
       FROM cash_movements cm
       JOIN cash_days cd ON cd.id = cm.cash_day_id
       WHERE cm.id = ?`
    )
    .get(id);

  if (!row) {
    return null;
  }

  db.prepare("UPDATE cash_movements SET payment_status = ? WHERE id = ?").run(
    paymentStatus,
    id
  );
  return getCashDay(row.date);
}

export function deleteMovement(id) {
  const db = getConnection();
  const row = db
    .prepare(
      `SELECT cd.date
       FROM cash_movements cm
       JOIN cash_days cd ON cd.id = cm.cash_day_id
       WHERE cm.id = ?`
    )
    .get(id);

  if (!row) {
    return null;
  }

  db.prepare("DELETE FROM cash_movements WHERE id = ?").run(id);
  return getCashDay(row.date);
}

export function getDashboard(year) {
  const db = getConnection();
  const rows = db
    .prepare(
      `SELECT
         strftime('%m', cd.date) as month,
         SUM(CASE WHEN cm.mode = 'in' THEN cm.amount_cents ELSE 0 END) as incoming_cents,
         SUM(CASE WHEN cm.mode = 'out' THEN cm.amount_cents ELSE 0 END) as outgoing_cents,
         COUNT(cm.id) as movements
       FROM cash_days cd
       LEFT JOIN cash_movements cm
         ON cm.cash_day_id = cd.id
        AND cm.payment_status = 'paid'
       WHERE strftime('%Y', cd.date) = ?
       GROUP BY month
       ORDER BY month`
    )
    .all(String(year))
    .map(plainRow);

  const months = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = String(index + 1).padStart(2, "0");
    const found = rows.find((row) => row.month === monthNumber);
    const incoming = Number(found?.incoming_cents || 0);
    const outgoing = Number(found?.outgoing_cents || 0);

    return {
      month: monthNumber,
      incomingCents: incoming,
      outgoingCents: outgoing,
      balanceCents: incoming - outgoing,
      movements: Number(found?.movements || 0),
    };
  });

  const totals = months.reduce(
    (acc, month) => ({
      incomingCents: acc.incomingCents + month.incomingCents,
      outgoingCents: acc.outgoingCents + month.outgoingCents,
      balanceCents: acc.balanceCents + month.balanceCents,
      movements: acc.movements + month.movements,
    }),
    { incomingCents: 0, outgoingCents: 0, balanceCents: 0, movements: 0 }
  );

  return { year, months, totals };
}

export function getPendingSummary() {
  const db = getConnection();
  const row = plainRow(
    db
      .prepare(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount_cents), 0) as amount_cents
         FROM cash_movements
         WHERE payment_status = 'pending'`
      )
      .get()
  );

  return {
    count: Number(row?.count || 0),
    amountCents: Number(row?.amount_cents || 0),
  };
}

export function listPendingMovements() {
  return getConnection()
    .prepare(
      `SELECT
         cm.id,
         cd.date,
         cm.mode,
         cm.description,
         cm.amount_cents,
         cm.payment_type,
         cm.payment_status,
         cm.client_id,
         c.name as client_name,
         cm.occurred_at
       FROM cash_movements cm
       JOIN cash_days cd ON cd.id = cm.cash_day_id
       LEFT JOIN clients c ON c.id = cm.client_id
       WHERE cm.payment_status = 'pending'
       ORDER BY cm.occurred_at ASC, cm.id ASC`
    )
    .all()
    .map(plainRow);
}

export function listClients() {
  return getConnection()
    .prepare("SELECT id, name, phone, email, created_at FROM clients ORDER BY name")
    .all()
    .map(plainRow);
}

export function createClient({ name, phone, email }) {
  const db = getConnection();
  db.prepare("INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)").run(
    name,
    phone || null,
    email || null
  );
  return listClients();
}

export function deleteClient(id) {
  const db = getConnection();
  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
  return listClients();
}

function summarize(openingCents, movements) {
  const base = {
    openingCents: Number(openingCents || 0),
    incomingCents: 0,
    outgoingCents: 0,
    cashCents: Number(openingCents || 0),
    byPaymentType: {
      dinheiro: { count: 0, cents: 0 },
      credito: { count: 0, cents: 0 },
      pix: { count: 0, cents: 0 },
    },
  };

  for (const movement of movements) {
    if (movement.payment_status === "pending") {
      continue;
    }

    const cents = Number(movement.amount_cents || 0);
    const bucket = base.byPaymentType[movement.payment_type];
    bucket.count += 1;
    bucket.cents += movement.mode === "in" ? cents : -cents;

    if (movement.mode === "in") {
      base.incomingCents += cents;
      if (movement.payment_type === "dinheiro") {
        base.cashCents += cents;
      }
    } else {
      base.outgoingCents += cents;
      if (movement.payment_type === "dinheiro") {
        base.cashCents -= cents;
      }
    }
  }

  return {
    ...base,
    balanceCents: base.incomingCents - base.outgoingCents,
    totalCents: base.openingCents + base.incomingCents - base.outgoingCents,
  };
}

function plainRow(row) {
  return row ? { ...row } : row;
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}
