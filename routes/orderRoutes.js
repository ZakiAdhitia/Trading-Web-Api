const express = require('express');
const router = express.Router();
const { handleWebhook, getOrders } = require('../controllers/webhookController');

router.post('/', handleWebhook);
router.get('/', getOrders);

module.exports = router;
