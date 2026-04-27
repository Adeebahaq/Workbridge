class WhatsAppOtpAdapter {
  async sendOtp(phone, otp) {
    // OTP always printed to console so you can use it in dev
    console.log(`\n📱 [OTP] Phone: ${phone}  Code: ${otp}\n`);

    const sid  = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!sid || !token || !from) return; // dev mode — done

    try {
      const twilio = require("twilio")(sid, token);
      await twilio.messages.create({
        from: `whatsapp:${from}`,
        to:   `whatsapp:+92${phone.replace(/^0/, "").replace(/-/g, "")}`,
        body: `Your WorkBridge verification code is: ${otp}. Valid for 2 minutes.`,
      });
    } catch (err) {
      console.error("[WhatsApp OTP] Twilio send failed:", err.message);
    }
  }
}

module.exports = WhatsAppOtpAdapter;