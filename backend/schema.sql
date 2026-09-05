-- Krishi Sahayak PostgreSQL schema + starter data
-- Run this entire file in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','admin')),
  phone VARCHAR(30) DEFAULT '',
  village VARCHAR(120) DEFAULT '',
  land VARCHAR(80) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  location VARCHAR(160) NOT NULL,
  address VARCHAR(255) NOT NULL,
  crops TEXT[] NOT NULL DEFAULT '{}',
  hours VARCHAR(100) NOT NULL DEFAULT '8:00 AM - 5:00 PM'
);

CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  center_id INTEGER NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(30) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  booked INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0),
  crop VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  crop VARCHAR(80) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(30) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed','Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_center_id ON slots(center_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);

-- Demo users are created automatically by server.js with bcrypt hashes.

INSERT INTO centers (name,location,address,crops,hours)
SELECT * FROM (VALUES
('Bankura Central Procurement Centre','Bankura Town','Near Bus Stand, Bankura',ARRAY['Paddy','Wheat','Maize']::TEXT[],'8:00 AM - 5:00 PM'),
('Bishnupur Farmers Collection Centre','Bishnupur','College Road, Bishnupur',ARRAY['Paddy','Potato']::TEXT[],'8:00 AM - 5:00 PM'),
('Sonamukhi Agro Procurement Centre','Sonamukhi','Main Market Road, Sonamukhi',ARRAY['Paddy','Maize']::TEXT[],'8:00 AM - 5:00 PM')
) AS v(name,location,address,crops,hours)
WHERE NOT EXISTS (SELECT 1 FROM centers);

INSERT INTO slots (center_id,date,time,capacity,booked,crop)
SELECT c.id, v.date::DATE, v.time, v.capacity, v.booked, v.crop
FROM (VALUES
('Bankura Central Procurement Centre','2026-09-10','09:00 AM',20,8,'Paddy'),
('Bankura Central Procurement Centre','2026-09-10','11:00 AM',20,12,'Paddy'),
('Bishnupur Farmers Collection Centre','2026-09-11','10:00 AM',15,5,'Potato'),
('Bishnupur Farmers Collection Centre','2026-09-12','02:00 PM',15,11,'Paddy'),
('Sonamukhi Agro Procurement Centre','2026-09-13','09:30 AM',18,7,'Maize'),
('Sonamukhi Agro Procurement Centre','2026-09-14','12:00 PM',18,18,'Paddy')
) AS v(center_name,date,time,capacity,booked,crop)
JOIN centers c ON c.name=v.center_name
WHERE NOT EXISTS (SELECT 1 FROM slots);
