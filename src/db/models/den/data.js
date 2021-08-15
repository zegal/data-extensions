const mongoose = require("mongoose");

const Data = mongoose.Schema(
  {
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    origin: { type: mongoose.Schema.Types.String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { collection: "data" }
  //{ timestamps: true, collection: "data" }
);

module.exports = Data;
