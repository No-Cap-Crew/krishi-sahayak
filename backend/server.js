import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const app = express();

const PORT = Number(process.env.PORT || 5000);

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Create backend/.env before starting the server.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false
});

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

async function ensureDemoUsers() {
  const demos = [
    { name: "Ramesh Kumar", email: "farmer@example.com", password: "farmer123", role: "farmer", phone: "9876543210", village: "Bishnupur", land: "3.2 acres" },
    { name: "Procurement Admin", email: "admin@example.com", password: "admin123", role: "admin", phone: "9000000000", village: "Bankura", land: "-" }
  ];
  for (const demo of demos) {
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [demo.email]);
    if (!existing.rowCount) {
      const hash = await bcrypt.hash(demo.password, 10);
      await pool.query(
        `INSERT INTO users (name,email,password_hash,role,phone,village,land) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [demo.name, demo.email, hash, demo.role, demo.phone, demo.village, demo.land]
      );
    }
  }
}

const safeUser = ({ password_hash, ...user }) => user;

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Krishi Sahayak API and PostgreSQL are connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "API is running but PostgreSQL is not connected" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email || ""]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ user: safeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone, village, land } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email]);
    if (existing.rowCount) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, village, land)
       VALUES ($1,$2,$3,'farmer',$4,$5,$6)
       RETURNING id, name, email, role, phone, village, land`,
      [name, email, passwordHash, phone || "", village || "", land || ""]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.get("/api/centers", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM centers ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load procurement centres" });
  }
});

app.get("/api/slots", async (req, res) => {
  try {
    const values = [];
    const filters = [];
    if (req.query.centerId) {
      values.push(Number(req.query.centerId));
      filters.push(`s.center_id = $${values.length}`);
    }
    if (req.query.crop) {
      values.push(String(req.query.crop));
      filters.push(`LOWER(s.crop) = LOWER($${values.length})`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT s.id, s.center_id AS "centerId", s.date, s.time, s.capacity, s.booked, s.crop,
              json_build_object('id', c.id, 'name', c.name, 'location', c.location,
                                'address', c.address, 'crops', c.crops, 'hours', c.hours) AS center
       FROM slots s JOIN centers c ON c.id=s.center_id
       ${where} ORDER BY s.date, s.time`,
      values
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load slots" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const { rows } = await pool.query(
      `SELECT b.id, b.user_id AS "userId", b.slot_id AS "slotId", b.crop, b.quantity,
              b.status, b.created_at AS "createdAt",
              json_build_object('id', s.id, 'centerId', s.center_id, 'date', s.date,
                                'time', s.time, 'capacity', s.capacity, 'booked', s.booked,
                                'crop', s.crop) AS slot,
              json_build_object('id', c.id, 'name', c.name, 'location', c.location,
                                'address', c.address, 'crops', c.crops, 'hours', c.hours) AS center
       FROM bookings b
       JOIN slots s ON s.id=b.slot_id
       JOIN centers c ON c.id=s.center_id
       WHERE b.user_id=$1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load bookings" });
  }
});

app.get("/api/admin/stats", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='farmer')::int AS farmers,
        (SELECT COUNT(*) FROM centers)::int AS centers,
        (SELECT COUNT(*) FROM slots)::int AS slots,
        (SELECT COUNT(*) FROM bookings)::int AS bookings,
        (SELECT COALESCE(SUM(capacity),0) FROM slots)::int AS "totalCapacity",
        (SELECT COALESCE(SUM(booked),0) FROM slots)::int AS "totalBooked",
        (SELECT COALESCE(SUM(quantity),0) FROM bookings WHERE status <> 'Cancelled')::int AS "totalQuantity"
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load admin statistics" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, slotId, crop, quantity } = req.body;
    const qty = Number(quantity);
    await client.query("BEGIN");

    const userResult = await client.query("SELECT id, role FROM users WHERE id=$1", [Number(userId)]);
    const slotResult = await client.query("SELECT * FROM slots WHERE id=$1 FOR UPDATE", [Number(slotId)]);
    const user = userResult.rows[0];
    const slot = slotResult.rows[0];

    if (!user || user.role !== "farmer") {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Only farmer accounts can book slots" });
    }
    if (!slot) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Slot not found" });
    }
    if (!crop || !qty || qty <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Enter a valid crop and quantity" });
    }
    if (slot.booked >= slot.capacity) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "This slot is already full" });
    }

    const duplicate = await client.query(
      "SELECT id FROM bookings WHERE user_id=$1 AND slot_id=$2 AND status <> 'Cancelled' LIMIT 1",
      [user.id, slot.id]
    );
    if (duplicate.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "You already have a booking for this slot" });
    }

    await client.query("UPDATE slots SET booked=booked+1 WHERE id=$1", [slot.id]);
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, slot_id, crop, quantity, status)
       VALUES ($1,$2,$3,$4,'Confirmed')
       RETURNING id, user_id AS "userId", slot_id AS "slotId", crop, quantity, status, created_at AS "createdAt"`,
      [user.id, slot.id, crop, qty]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Slot booked successfully", booking: bookingResult.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  } finally {
    client.release();
  }
});

app.patch("/api/bookings/:id/cancel", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT * FROM bookings WHERE id=$1 FOR UPDATE", [Number(req.params.id)]);
    const booking = result.rows[0];
    if (!booking) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status === "Cancelled") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    await client.query("UPDATE bookings SET status='Cancelled' WHERE id=$1", [booking.id]);
    await client.query("UPDATE slots SET booked=GREATEST(0, booked-1) WHERE id=$1", [booking.slot_id]);
    await client.query("COMMIT");
    res.json({ message: "Booking cancelled", booking: { ...booking, status: "Cancelled" } });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Cancellation failed" });
  } finally {
    client.release();
  }
});

async function start() {
  try {
    await pool.query("SELECT 1");
    await ensureDemoUsers();
    console.log("PostgreSQL connected and demo accounts ready.");
    app.listen(PORT, () => {
      console.log(`Krishi Sahayak API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start Krishi Sahayak:", error.message);
    process.exit(1);
  }
}

start();
