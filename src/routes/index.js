const express = require('express');
const trips = require('./trips');

const router = express.Router();

router.use(trips);

module.exports = router;
