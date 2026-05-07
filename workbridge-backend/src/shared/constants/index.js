const WORKER_REJECTION_REASONS = [
  "Already have a worker for this job",
  "Job location is too far",
  "Job date does not match my availability",
  "Hiring type does not suit me",
  "I am already booked on that date",
  "Job duration is too short",
  "Job duration is too long",
  "Other",
];

const WORKING_HOURS = [
  "Morning (6 AM - 2 PM)",
  "Afternoon (12 PM - 6 PM)",
  "Evening (4 PM - 10 PM)",
  "Night Shift",
  "Flexible",
];

const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "On-call/Daily Basis"];

const HIRING_TYPES = ["Hourly", "Daily", "Weekly", "Monthly"];

const TRAVEL_DISTANCES = [5, 10, 20, 30, 50];

const WORKER_STATUSES = ["Pending Verification","Active","Rejected","Suspended","Inactive"];

const JOB_STATUSES = [
  "Requested","Accepted","In Progress","Awaiting Confirmation",
  "Completed","Rejected","Cancelled","Expired",
];

const NOTIFICATION_TYPES = [
  "job_request_received","job_accepted","job_rejected","job_cancelled",
  "job_expired","job_marked_done","job_confirmed","admin_approved",
  "admin_rejected","otp_success","maintenance_scheduled",
  "rating_received",   // ← NEW
];

const ADMIN_ACTIONS = ["approve_worker","reject_worker","create_worker","suspend_worker"];

module.exports = {
  WORKER_REJECTION_REASONS, WORKING_HOURS, DAYS_OF_WEEK, EMPLOYMENT_TYPES,
  HIRING_TYPES, TRAVEL_DISTANCES, WORKER_STATUSES, JOB_STATUSES,
  NOTIFICATION_TYPES, ADMIN_ACTIONS,
};