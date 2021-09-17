const mongoose = require("mongoose");

const Metadata = mongoose.Schema(
  {
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    origin: { type: mongoose.Schema.Types.String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, required: true },
    flattened: { type: mongoose.Schema.Types.Mixed, required: true },
    fieldDefinitionCode: { type: mongoose.Schema.Types.String },
  },
  { collection: "metadata" }
);

module.exports = Metadata;
