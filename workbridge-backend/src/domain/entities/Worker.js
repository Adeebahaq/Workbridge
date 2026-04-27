class Worker {
  constructor({ userId, fullName, phone, cnicNumber, services, status }) {
    this.userId     = userId;
    this.fullName   = fullName;
    this.phone      = phone;
    this.cnicNumber = cnicNumber;
    this.services   = services;
    this.status     = status;
  }
  isActive()            { return this.status === "Active"; }
  isPendingVerification(){ return this.status === "Pending Verification"; }
}
module.exports = Worker;
