const mongoose = require("mongoose");

const Field = require("./fieldSchema");

const FieldDefinition = mongoose.Schema(
  {
    name: { type: mongoose.Schema.Types.String, required: true },
    code: { type: mongoose.Schema.Types.String, required: true },
    inheritedFromCode: { type: mongoose.Schema.Types.String, required: true },
    fields: [{ type: Field, required: true }],
    summaryDisplay: [{ type: mongoose.Schema.Types.String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    org: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

module.exports = FieldDefinition;
