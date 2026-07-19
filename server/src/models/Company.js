const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
