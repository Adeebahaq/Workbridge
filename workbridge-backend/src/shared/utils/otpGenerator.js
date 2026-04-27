const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOtp(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };
