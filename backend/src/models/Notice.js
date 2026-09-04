const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['GENERAL', 'EXAM', 'EVENT', 'HOLIDAY'], default: 'GENERAL' },
  postedBy: { type: String, default: 'Admin Office' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
