const express = require('express');
const router = express.Router();
const {
  addBook,
  getAllBooks,
  issueBook,
  returnBook,
  getAllIssuedBooks,
  getMyIssuedBooks
} = require('../controllers/libraryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/books', protect, getAllBooks);
router.get('/my-books', protect, authorize('STUDENT'), getMyIssuedBooks);

router.post('/books', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ADMIN'), addBook);
router.post('/issue', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ADMIN'), issueBook);
router.put('/return/:issueId', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ADMIN'), returnBook);
router.get('/issued-logs', protect, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ADMIN'), getAllIssuedBooks);

module.exports = router;
