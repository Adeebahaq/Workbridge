class IRatingRepository {
  async save(data)                     { throw new Error("Not implemented"); }
  async findByWorker(workerId)         { throw new Error("Not implemented"); }
  async findByJob(jobId)               { throw new Error("Not implemented"); }
  async existsForJob(jobId, employerId){ throw new Error("Not implemented"); }
}
module.exports = IRatingRepository;
