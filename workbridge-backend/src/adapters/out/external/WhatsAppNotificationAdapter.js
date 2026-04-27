const IWhatsAppNotificationService = require("../../../ports/external/IWhatsAppNotificationService");

class WhatsAppNotificationAdapter extends IWhatsAppNotificationService {
  async send(phone, message) {
    // TODO: Replace with real WhatsApp Business API call
    console.log(`[WhatsApp Notify] >>> To ${phone}: ${message}`);
  }
}

module.exports = WhatsAppNotificationAdapter;