/**
 * Standalone WhatsApp OTP test
 * Run: node test-whatsapp.js
 * Place this file in your workbridge-backend folder
 */

require("dotenv").config();

const sid         = process.env.TWILIO_ACCOUNT_SID;
const token       = process.env.TWILIO_AUTH_TOKEN;
const from        = process.env.TWILIO_WHATSAPP_NUMBER;
const templateSid = process.env.TWILIO_OTP_TEMPLATE_SID;

// ── Change this to YOUR WhatsApp number ──────────────────────────────────────
const TO_PHONE = "03261884328"; // e.g. "03001234567"
// ─────────────────────────────────────────────────────────────────────────────

const normalized = "+92" + TO_PHONE.replace(/^0/, "").replace(/[-\s]/g, "");
const testOtp    = "123456";

console.log("\n🔍 Twilio Config Check:");
console.log("  ACCOUNT_SID  :", sid   ? sid.slice(0,10)   + "..." : "❌ MISSING");
console.log("  AUTH_TOKEN   :", token ? token.slice(0,6)   + "..." : "❌ MISSING");
console.log("  FROM NUMBER  :", from  || "❌ MISSING");
console.log("  TEMPLATE_SID :", templateSid || "⚠️  not set (will use plain text)");
console.log("  TO           :", normalized);
console.log("");

if (!sid || !token || !from) {
  console.error("❌ Missing Twilio credentials in .env — aborting.");
  process.exit(1);
}

async function test() {
  try {
    const twilio = require("twilio")(sid, token);

    let msg;

    if (templateSid) {
      console.log("📤 Sending via Content Template...");
      msg = await twilio.messages.create({
        from:             `whatsapp:${from}`,
        to:               `whatsapp:${normalized}`,
        contentSid:       templateSid,
        contentVariables: JSON.stringify({ "1": testOtp }),
      });
    } else {
      console.log("📤 Sending plain text (sandbox mode)...");
      msg = await twilio.messages.create({
        from: `whatsapp:${from}`,
        to:   `whatsapp:${normalized}`,
        body: `WorkBridge test OTP: *${testOtp}*`,
      });
    }

    console.log("✅ Message sent!");
    console.log("  SID    :", msg.sid);
    console.log("  Status :", msg.status);
    console.log("  To     :", msg.to);
    console.log("\n👉 Check your WhatsApp. If nothing arrives in 30s, check:");
    console.log("   https://console.twilio.com → Monitor → Logs → Messaging\n");

  } catch (err) {
    console.error("❌ Twilio error:", err.message);
    console.error("   Code   :", err.code);
    console.error("   Status :", err.status);
    console.log("\n💡 Common fixes:");
    console.log("   Error 63016 → Your number hasn't joined the sandbox.");
    console.log("                 Send 'join <word>' to +14155238886 on WhatsApp first.");
    console.log("   Error 21608 → Number not whatsapp-enabled.");
    console.log("   Error 20003 → Wrong credentials in .env");
    console.log("   Error 63007 → Template not approved yet, remove TWILIO_OTP_TEMPLATE_SID from .env to use plain text.\n");
  }
}

test();