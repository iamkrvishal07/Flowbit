const mongoose = require('mongoose');
const User = require('../models/User.js');
const Ticket = require('../models/Ticket.js');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/flowbit'); // hardcoded for local use
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

async function seed() {
  try {
    await connectDB();

    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared old users and tickets');

    const users = await User.insertMany([
      {
        name: 'Customer One',
        email: 'customer1@example.com',
        password: 'hashed_password', // should be hashed in real use
        role: 'customer',
        tenantId: 'tenant1',
      },
      {
        name: 'Agent One',
        email: 'agent1@example.com',
        password: 'hashed_password',
        role: 'agent',
        tenantId: 'tenant1',
      },
    ]);
    console.log('Seeded users');

    const customer = users.find(u => u.role === 'customer');
    const agent = users.find(u => u.role === 'agent');

    if (!customer || !agent) {
      throw new Error('Customer or Agent user not found after seeding.');
    }

    await Ticket.insertMany([
      {
        title: 'Issue with login',
        description: 'Customer is unable to log in',
        customerId: customer._id,
        createdBy: agent._id,
        status: 'open',
      },
      {
        title: 'Bug in dashboard',
        description: 'Dashboard crash on click',
        customerId: customer._id,
        createdBy: agent._id,
        status: 'in_progress',
      },
    ]);

    console.log('Seeded tickets');
    process.exit(0);
  } catch (err) {
    console.warn(' Seeding failed:', err);
    process.exit(1);
  }
}

seed();
