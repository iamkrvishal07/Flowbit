// const express = require('express');
// const router = express.Router();

// router.get('/test', (req, res) => {
//   res.json({ message: `Hello Admin from ${req.user.customerId}` });
// });

// module.exports = router;
// routes/admin.js
const express = require('express');
const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: `Hello Admin for tenant: ${req.user.tenant}` });
});

module.exports = router;
