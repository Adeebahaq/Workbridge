const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  { jobId:      { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars:    { type: Number, required: true, min: [1, "Min 1"], max: [5, "Max 5"] },
    feedback: { type: String, maxlength: 300 } },
  { timestamps: { createdAt: "submittedAt", updatedAt: false }, collection: "ratings" }
);

RatingSchema.index({ jobId: 1, employerId: 1 }, { unique: true, name: "idx_ratings_job_employer_unique" });
RatingSchema.index({ workerId: 1, submittedAt: -1 },            { name: "idx_ratings_worker_time"       });

module.exports = mongoose.model("Rating", RatingSchema);
