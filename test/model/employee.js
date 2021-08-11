const mongoose = require("mongoose");

const Employee = mongoose.Schema(
  {
    firstName: { type: mongoose.Schema.Types.String, required: true },
    lastName: { type: mongoose.Schema.Types.String, required: true }
  },
  { timestamps: true }
);

module.exports = Employee;
