require("dotenv").config();
const { connectDB }    = require("../config/database");
const ServiceType      = require("../../adapters/out/persistence/mongoose/models/ServiceType.model");
const User             = require("../../adapters/out/persistence/mongoose/models/User.model");
const { hashPassword } = require("../../shared/utils/hash");

// These match the frontend WorkerRegister.jsx service grid exactly
const services = [
  "Domestic Helpers",
  "Drivers",
  "Gardeners",
  "Babysitters",
  "Cooks",
  "Electricians",
  "Plumbers",
  "Security Guards",
  "House Cleaning",
  "Laundry/Ironing",
  "Car Washing",
  "Elderly Care",
];

async function seedAdmin() {
  const phone = process.env.ADMIN_PHONE || "0300-0000000";
  const exists = await User.findOne({ phone });
  if (exists) {
    console.log("ℹ️  Admin user already exists — skipping.");
    return;
  }
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD || "Admin@1234");
  await User.create({
    role:               "admin",
    fullName:           "Super Admin",
    phone,
    passwordHash,
    isWhatsappVerified: true,
    createdByAdmin:     true,
  });
  console.log(`✅ Admin seeded  →  phone: ${phone}  password: ${process.env.ADMIN_PASSWORD || "Admin@1234"}`);
}

async function seed() {
  await connectDB();

  // ── Service types ──────────────────────────────────────────────────────────
  await ServiceType.deleteMany({});
  await ServiceType.insertMany(services.map((name) => ({ name, isActive: true })));
  console.log(`✅ Seeded ${services.length} service types`);

  // ── Admin user ─────────────────────────────────────────────────────────────
  await seedAdmin();

  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });