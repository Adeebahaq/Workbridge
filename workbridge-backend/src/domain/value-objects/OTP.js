class OTP {
  static EXPIRY_MINUTES   = 2;
  static MAX_ATTEMPTS     = 3;
  static RESEND_SECONDS   = 60;

  static expiresAt()         { return new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000); }
  static resendAvailableAt() { return new Date(Date.now() + OTP.RESEND_SECONDS * 1000); }
  static isExpired(expiresAt){ return new Date() > new Date(expiresAt); }
  static maxAttemptsReached(attempts){ return attempts >= OTP.MAX_ATTEMPTS; }
}
module.exports = OTP;