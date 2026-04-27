const AppError = require("../../shared/errors/AppError");

class CNIC {
  constructor(value) {
    if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(value))
      throw new AppError("CNIC must be in format XXXXX-XXXXXXX-X");
    this.value = value;
  }
  toString() { return this.value; }
}
module.exports = CNIC;
