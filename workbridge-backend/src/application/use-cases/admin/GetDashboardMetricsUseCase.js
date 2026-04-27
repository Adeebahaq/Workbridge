const User          = require("../../../adapters/out/persistence/mongoose/models/User.model");
const WorkerProfile = require("../../../adapters/out/persistence/mongoose/models/WorkerProfile.model");
const Job           = require("../../../adapters/out/persistence/mongoose/models/Job.model");

class GetDashboardMetricsUseCase {
  async execute() {
    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalWorkers,
      totalEmployers,
      activeWorkers,
      pendingVerifications,
      rejectedWorkers,
      suspendedWorkers,
      todayJobStats,
      allJobStats,
    ] = await Promise.all([
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "employer" }),
      WorkerProfile.countDocuments({ status: "Active" }),
      WorkerProfile.countDocuments({ status: "Pending Verification" }),
      WorkerProfile.countDocuments({ status: "Rejected" }),
      WorkerProfile.countDocuments({ status: "Suspended" }),
      Job.aggregate([
        { $match: { createdAt: { $gte: todayStart, $lt: todayEnd } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const buildJobStats = (aggResult) => {
      const stats = { requested:0, accepted:0, inProgress:0, awaitingConfirmation:0, completed:0, rejected:0, cancelled:0, expired:0 };
      const keyMap = {
        "Requested":"requested","Accepted":"accepted","In Progress":"inProgress",
        "Awaiting Confirmation":"awaitingConfirmation","Completed":"completed",
        "Rejected":"rejected","Cancelled":"cancelled","Expired":"expired",
      };
      for (const { _id, count } of aggResult) {
        const key = keyMap[_id];
        if (key) stats[key] = count;
      }
      return stats;
    };

    return {
      totalWorkers,
      totalEmployers,
      activeWorkers,
      pendingVerifications,
      rejectedWorkers,
      suspendedWorkers,
      todayJobActivity:   buildJobStats(todayJobStats),
      allTimeJobActivity: buildJobStats(allJobStats),
    };
  }
}

module.exports = GetDashboardMetricsUseCase;