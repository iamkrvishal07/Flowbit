// tests/tenantIsolation.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index.js'); // adjust if your app is exported differently
const Ticket = require('../models/Ticket.js');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let server;

describe('Tenant Data Isolation', () => {
  let tokenA, tokenB, customerA, customerB;

  beforeAll(async () => {
    server = app.listen(4001); // test server

    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create two tenants
    customerA = 'logisticsco';
    customerB = 'retailgmbh';

    const passwordHash = await bcrypt.hash('password123', 10);

    const userA = await User.create({
      email: 'adminA@example.com',
      password: passwordHash,
      role: 'admin',
      customerId: customerA,
    });

    const userB = await User.create({
      email: 'adminB@example.com',
      password: passwordHash,
      role: 'admin',
      customerId: customerB,
    });

    tokenA = jwt.sign(
      { id: userA._id, role: userA.role, customerId: customerA },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    tokenB = jwt.sign(
      { id: userB._id, role: userB.role, customerId: customerB },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Insert one ticket per tenant
    await Ticket.create([
      { title: 'Ticket A', customerId: customerA, status: 'open' },
      { title: 'Ticket B', customerId: customerB, status: 'open' },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    server.close();
  });

  it('should return only Tenant A tickets for user from Tenant A', async () => {
    const res = await request(server)
      .get('/api/protected/tickets')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Ticket A');
  });

  it('should return only Tenant B tickets for user from Tenant B', async () => {
    const res = await request(server)
      .get('/api/protected/tickets')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Ticket B');
  });
});
