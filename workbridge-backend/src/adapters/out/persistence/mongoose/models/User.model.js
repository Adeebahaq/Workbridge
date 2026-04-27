const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    role:      { type: String, required: true, enum: ["worker", "employer", "admin"] },
    fullName:  { type: String, required: true, trim: true },
    email:     { type: String, trim: true, lowercase: true,
                 match: [/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, "Invalid email"] },
    // Pakistani format 03XX-XXXXXXX
    phone:     { type: String, required: true,
                 match: [/^03[0-9]{2}-[0-9]{7}$/, "Phone must be 03XX-XXXXXXX"] },
    passwordHash:       { type: String, required: true },
    isWhatsappVerified: { type: Boolean, default: false },
    createdByAdmin:     { type: Boolean, default: false },
    sessionExpiresAt:   { type: Date },
    lastLoginAt:        { type: Date },
  },
  { timestamps: true, collection: "users" }
);

UserSchema.index({ phone: 1 }, { unique: true,               name: "idx_users_phone_unique" });
UserSchema.index({ email: 1 }, { unique: true, sparse: true, name: "idx_users_email_unique" });
UserSchema.index({ role: 1 },                              { name: "idx_users_role"         });

module.exports = mongoose.model("User", UserSchema);
