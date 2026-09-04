const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  className: { type: String, required: true },
  dueDate: { type: Date, required: true },
  assignedBy: { type: String, default: 'Class Teacher' }
}, { timestamps: true });

module.exports = mongoose.model('Homework', homeworkSchema);
