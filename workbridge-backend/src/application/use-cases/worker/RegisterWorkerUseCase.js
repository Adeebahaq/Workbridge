const { hashPassword }         = require("../../../shared/utils/hash");
const { generateOtp, hashOtp } = require("../../../shared/utils/otpGenerator");
const OTP                      = require("../../../domain/value-objects/OTP");
const CNIC                     = require("../../../domain/value-objects/CNIC");
const AppError                 = require("../../../shared/errors/AppError");
const ServiceType              = require("../../../adapters/out/persistence/mongoose/models/ServiceType.model");
const mongoose                 = require("mongoose");

class RegisterWorkerUseCase {
  constructor(userRepository, workerRepository, otpRepository, whatsAppOtpService) {
    this.userRepository     = userRepository;
    this.workerRepository   = workerRepository;
    this.otpRepository      = otpRepository;
    this.whatsAppOtpService = whatsAppOtpService;
  }

  normalizeArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return val.split(",").map(v => v.trim()).filter(Boolean);
      }
    }
    return [];
  }

  async execute(data) {
    // 1. Trim all strings
    const trimmed = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );

    // 2. Normalize arrays
    ["services", "daysAvailable", "preferredAreas", "preferredWorkingHours"].forEach(field => {
      trimmed[field] = this.normalizeArray(trimmed[field]);
    });

    // 3. Require CNIC image
    // WorkerController passes cnicFrontImage as a ready-made object:
    //   { url, fileSize, mimeType, uploadedAt }
    // We accept it directly instead of rebuilding it from string fields.
    if (!trimmed.cnicFrontImage || !trimmed.cnicFrontImage.url) {
      throw new AppError("CNIC front image is required", 400);
    }

    const cnicFrontImage = {
      url:        trimmed.cnicFrontImage.url.replace(/\\/g, "/"),
      fileSize:   trimmed.cnicFrontImage.fileSize   || undefined,
      mimeType:   trimmed.cnicFrontImage.mimeType   || undefined,
      uploadedAt: trimmed.cnicFrontImage.uploadedAt || new Date(),
    };

    // 4. Resolve service IDs
    const allServices = await ServiceType.find({ isActive: true }).lean();
    const resolvedServiceIds = trimmed.services
      .map(val => {
        const str = String(val).trim();
        if (mongoose.Types.ObjectId.isValid(str)) return new mongoose.Types.ObjectId(str);
        const match = allServices.find(s => s.name.toLowerCase() === str.toLowerCase());
        return match ? match._id : null;
      })
      .filter(Boolean);

    if (resolvedServiceIds.length === 0) {
      throw new AppError("Please select at least one valid service.", 400);
    }
    trimmed.services = resolvedServiceIds;

    // 5. Validate CNIC format
    new CNIC(trimmed.cnicNumber);

    // 6. Check duplicates
    const exists = await this.userRepository.findByPhone(trimmed.phone);
    if (exists) throw new AppError("Phone already registered", 409);

    const cnicExists = await this.workerRepository.findByCnic(trimmed.cnicNumber);
    if (cnicExists) throw new AppError("CNIC already registered", 409);

    // 7. Create User
    const passwordHash = await hashPassword(trimmed.password);
    const user = await this.userRepository.save({
      role: "worker",
      fullName: trimmed.fullName,
      phone:    trimmed.phone,
      passwordHash,
    });

    // 8. Create WorkerProfile
    await this.workerRepository.save({
      userId:           user._id,
      fatherSpouseName: trimmed.fatherSpouseName,
      dateOfBirth:      trimmed.dateOfBirth,
      gender:           trimmed.gender        || "Male",
      maritalStatus:    trimmed.maritalStatus || "Single",
      cnicNumber:       trimmed.cnicNumber,
      currentAddress:   trimmed.currentAddress,
      cnicFrontImage,
      services:              trimmed.services,
      preferredWorkingHours: trimmed.preferredWorkingHours,
      daysAvailable:         trimmed.daysAvailable,
      employmentType:        trimmed.employmentType || "Full-time",
      preferredCity:         trimmed.preferredCity,
      preferredAreas:        trimmed.preferredAreas,
      maxTravelDistance:     Number(trimmed.maxTravelDistance) || 20,
      status:      "Pending Verification",
      submittedAt: new Date(),
    });

    // 9. Send OTP (non-fatal if it fails)
    try {
      await this.otpRepository.deleteByPhone(trimmed.phone);
      const otp     = generateOtp();
      const otpHash = await hashOtp(otp);
      await this.otpRepository.save({
        phone:             trimmed.phone,
        otpHash,
        expiresAt:         OTP.expiresAt(),
        resendAvailableAt: OTP.resendAvailableAt(),
      });
      await this.whatsAppOtpService.sendOtp(trimmed.phone, otp);
    } catch (err) {
      console.error("[OTP] Failed to send OTP after registration:", err.message);
    }

    return { message: "Registration submitted. OTP sent via WhatsApp.", userId: user._id };
  }
}

module.exports = RegisterWorkerUseCase;