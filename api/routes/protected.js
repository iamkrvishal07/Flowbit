const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth.js');
const Ticket = require('../models/Ticket.js');
const axios = require('axios');

// You can set this via .env → N8N_WEBHOOK_URL=http://n8n:5678/webhook/flowbit-ticket-start
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook/flowbit-ticket-start';

/**
 * Route only accessible by admin users
 */
router.get('/admin/dashboard', authenticate, authorizeRoles('admin'), (req, res) => {
  res.json({
    message: `Hello Admin ${req.user.email}, welcome to ${req.user.tenant}'s dashboard.`,
  });
});

/**
 * Route accessible by both regular users and admins
 */
router.get('/user/dashboard', authenticate, authorizeRoles('user', 'admin'), (req, res) => {
  res.json({
    message: `Hello ${req.user.role} ${req.user.email}, viewing dashboard for ${req.user.tenant}`,
  });
});

/**
 * Tenant-Isolated Ticket Fetch
 */
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user.customerId });
    res.json(tickets);
  } catch (err) {
    console.error('Ticket fetch error:', err);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

/**
 * Ticket Create + Notify n8n
 */
router.post('/tickets', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;

    const newTicket = new Ticket({
      title,
      description,
      status: 'open',
      customerId: req.user.customerId,
    });

    const savedTicket = await newTicket.save();

    // Notify n8n webhook
    try {
      await axios.post(N8N_WEBHOOK_URL, {
        ticketId: savedTicket._id,
        customerId: req.user.customerId,
      });
    } catch (err) {
      console.error('Failed to notify n8n:', err.message);
    }

    res.status(201).json(savedTicket);
  } catch (err) {
    console.error('Ticket creation error:', err);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

module.exports = router;
