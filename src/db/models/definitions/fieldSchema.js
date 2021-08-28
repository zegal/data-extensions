const mongoose = require("mongoose");

const Field = mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.String, required: true },
    name: { type: mongoose.Schema.Types.String, required: true },
    fieldType: { type: mongoose.Schema.Types.String, required: true },
    config: { type: mongoose.Schema.Types.Mixed },
    order: { type: mongoose.Schema.Types.String },
  },
  { timestamps: true, strict: false }
);

module.exports = Field;
