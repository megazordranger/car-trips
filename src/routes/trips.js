const express = require('express');
const { store, show } = require('../controllers/trips');

const router = express.Router();

router.get('/api/trips/v1', show);
router.post('/api/trips/v1', store);

module.exports = router;
