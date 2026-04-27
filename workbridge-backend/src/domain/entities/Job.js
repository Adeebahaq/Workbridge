class Job {
  constructor({ employerId, workerId, serviceId, hiringType, jobDate, status }) {
    this.employerId = employerId;
    this.workerId   = workerId;
    this.serviceId  = serviceId;
    this.hiringType = hiringType;
    this.jobDate    = jobDate;
    this.status     = status;
  }
  isActive()    { return ["Accepted","In Progress"].includes(this.status); }
  isCompleted() { return this.status === "Completed"; }
}
module.exports = Job;
