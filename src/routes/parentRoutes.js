const express = require('express');
const router = express.Router();
const { getChildData } = require('../controllers/parentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/child-data', protect, getChildData);

module.exports = router;
