require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Book, BookIssue } = require('./src/models/Library');
const User = require('./src/models/User');

const seedLibrary = async () => {
  try {
    console.log('🔌 Connecting to DB for library seed...');

    let mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

    if (!mongoUri) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB for seeding');
    }

    await mongoose.connect(mongoUri);

    const demoBooks = [
      {
        title: 'The Physics of Everyday Life',
        author: 'Dr. Sarah Patel',
        isbn: '978-1-23456-789-0',
        category: 'Science',
        totalCopies: 5,
        rackNumber: 'Rack-A1'
      },
      {
        title: 'Modern Algebra Essentials',
        author: 'Prof. R. Sharma',
        isbn: '978-1-23456-789-1',
        category: 'Mathematics',
        totalCopies: 4,
        rackNumber: 'Rack-B2'
      },
      {
        title: 'World Literature Collection',
        author: 'N. Reed',
        isbn: '978-1-23456-789-2',
        category: 'Literature',
        totalCopies: 3,
        rackNumber: 'Rack-C3'
      },
      {
        title: 'Biology Fundamentals',
        author: 'Dr. Meera Iyer',
        isbn: '978-1-23456-789-3',
        category: 'Science',
        totalCopies: 6,
        rackNumber: 'Rack-A4'
      }
    ];

    const createdBooks = [];

    for (const bookData of demoBooks) {
      const existing = await Book.findOne({ isbn: bookData.isbn });
      if (existing) {
        existing.title = bookData.title;
        existing.author = bookData.author;
        existing.category = bookData.category;
        existing.totalCopies = bookData.totalCopies;
        existing.rackNumber = bookData.rackNumber;
        existing.availableCopies = Math.max(existing.availableCopies || 1, 1);
        await existing.save();
        createdBooks.push(existing);
      } else {
        const book = await Book.create({
          ...bookData,
          availableCopies: bookData.totalCopies
        });
        createdBooks.push(book);
      }
    }

    const student = await User.findOne({ role: 'STUDENT' });

    if (student) {
      const firstBook = createdBooks[0];
      const existingIssue = await BookIssue.findOne({ book: firstBook._id, student: student._id, status: 'ISSUED' });
      if (!existingIssue) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        await BookIssue.create({
          book: firstBook._id,
          bookTitle: firstBook.title,
          student: student._id,
          studentName: student.name,
          admissionNumber: student.admissionNumber || 'ADM-0001',
          dueDate,
          status: 'ISSUED',
          fineAmount: 0
        });

        if (firstBook.availableCopies > 0) {
          firstBook.availableCopies -= 1;
          await firstBook.save();
        }
      }
    }

    console.log('\n--------------------------------------------------');
    console.log('📚 Library seeded successfully');
    console.log('Books created/updated:', createdBooks.length);
    if (student) {
      console.log('Sample student used for issue record:', student.name, student.email);
    }
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding library:', error.message);
    process.exit(1);
  }
};

seedLibrary();
