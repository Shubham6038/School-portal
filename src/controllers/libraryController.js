const { Book, BookIssue } = require('../models/Library');
const User = require('../models/User');

exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, rackNumber } = req.body;
    const existing = await Book.findOne({ isbn });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      rackNumber
    });

    res.status(201).json({ success: true, message: 'Book added to library successfully!', data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const books = await Book.find(query).sort({ title: 1 });
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, admissionNumber, returnDays = 14 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available for issue!' });
    }

    const student = await User.findOne({
      $or: [{ admissionNumber }, { email: admissionNumber }]
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student with this Admission No not found' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(returnDays));

    const issueRecord = await BookIssue.create({
      book: book._id,
      bookTitle: book.title,
      student: student._id,
      studentName: student.name,
      admissionNumber: student.admissionNumber || admissionNumber,
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ success: true, message: `Book issued to ${student.name} successfully!`, data: issueRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { issueId } = req.params;
    const issueRecord = await BookIssue.findById(issueId);
    if (!issueRecord) return res.status(404).json({ success: false, message: 'Issue record not found' });
    if (issueRecord.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'Book is already returned!' });
    }

    const today = new Date();
    let fine = 0;

    if (today > new Date(issueRecord.dueDate)) {
      const diffTime = Math.abs(today - new Date(issueRecord.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 5;
    }

    issueRecord.returnDate = today;
    issueRecord.status = 'RETURNED';
    issueRecord.fineAmount = fine;
    await issueRecord.save();

    await Book.findByIdAndUpdate(issueRecord.book, { $inc: { availableCopies: 1 } });

    res.json({
      success: true,
      message: `Book returned successfully! ${fine > 0 ? `Late Fine: ₹${fine}` : 'No late fine.'}`,
      fineAmount: fine,
      data: issueRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllIssuedBooks = async (req, res) => {
  try {
    const issues = await BookIssue.find().sort({ createdAt: -1 });

    const updated = issues.map(item => {
      const isOverdue = item.status === 'ISSUED' && new Date() > new Date(item.dueDate);
      let calculatedFine = item.fineAmount;
      if (isOverdue) {
        const diffTime = Math.abs(new Date() - new Date(item.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        calculatedFine = diffDays * 5;
      }
      return {
        ...item._doc,
        isOverdue,
        liveFine: calculatedFine
      };
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyIssuedBooks = async (req, res) => {
  try {
    const issues = await BookIssue.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
