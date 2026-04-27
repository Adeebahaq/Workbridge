class IJobRepository {
  async findById(jobId)                       { throw new Error("Not implemented"); }
  async findByWorker(workerId, status)        { throw new Error("Not implemented"); }
  async findByEmployer(employerId, status)    { throw new Error("Not implemented"); }
  async save(jobData)                         { throw new Error("Not implemented"); }
  async update(jobId, updates)               { throw new Error("Not implemented"); }
  async findExpiredRequests()                { throw new Error("Not implemented"); }
  async findAwaitingAutoConfirm()            { throw new Error("Not implemented"); }
}
module.exports = IJobRepository;

// Extended method for status transitions with history tracking
// async updateJobStatus(jobId, status, changedBy, extraFields) {}
