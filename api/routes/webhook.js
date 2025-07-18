// flowbit/api/routes/webhook.js

const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket.js');

const N8N_SHARED_SECRET = process.env.N8N_SHARED_SECRET || 'secret123'; // define in .env

/**
 * POST /webhook/ticket-done
 * This is called by n8n when the ticket is processed
 */
router.post('/webhook/ticket-done', async (req, res) => {
  const secret = req.headers['x-n8n-secret'];
  const { ticketId } = req.body;

  if (secret !== N8N_SHARED_SECRET) {
    return res.status(403).json({ message: 'Invalid webhook secret' });
  }

  if (!ticketId) {
    return res.status(400).json({ message: 'ticketId missing' });
  }

  try {
    const updated = await Ticket.findByIdAndUpdate(ticketId, { status: 'processed' }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log(` Ticket ${ticketId} marked as processed`);
    res.json({ message: 'Ticket status updated', ticket: updated });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

module.exports = router;
