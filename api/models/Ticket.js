const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the customer is a user with role "customer"
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming createdBy is a user with role "agent"
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ticket', ticketSchema);
