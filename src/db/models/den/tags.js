const mongoose = require("mongoose");

const Tag = mongoose.Schema(
  {
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    origin: { type: mongoose.Schema.Types.String, required: true },
    tags: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  },
 //{ timestamps: true }
);

module.exports = Tag;
