const mongoose = require("mongoose");

const Field = require("./fieldSchema");

const FieldDefinition = mongoose.Schema(
  {
    code: { type: mongoose.Schema.Types.String, required: true },
    name: { type: mongoose.Schema.Types.String, required: true },
    fields: [{ type: Field, required: true }],
    summaryDisplay: [{ type: mongoose.Schema.Types.String }],
  },
  { timestamps: true }
);

module.exports = FieldDefinition;
