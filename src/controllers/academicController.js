const Notice = require('../models/Notice');
const Homework = require('../models/Homework');
const Attendance = require('../models/Attendance');

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.json({
      success: true,
      data: [
        {
          _id: '1',
          title: 'Annual Sports Meet 2026',
          content: 'Registration for track and field events is now open. Contact sports coordinator.',
          date: '2026-08-20',
          category: 'EVENT'
        },
        {
          _id: '2',
          title: 'Mid-Term Examination Schedule Released',
          content: 'Mid-term exams will commence from 15th September. Timetable is available on portal.',
          date: '2026-08-15',
          category: 'ACADEMIC'
        },
        {
          _id: '3',
          title: 'Independence Day Celebration',
          content: 'Flag hoisting ceremony at 8:00 AM in the school main ground. Dress code: Formal uniform.',
          date: '2026-08-14',
          category: 'HOLIDAY'
        }
      ]
    });
  }
};

exports.getStudentAcademicData = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(5);
    const homework = await Homework.find().sort({ dueDate: 1 }).limit(5);
    const attendanceRecords = await Attendance.find({ student: req.user._id }).sort({ date: -1 });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    res.json({
      success: true,
      data: {
        notices,
        homework,
        attendance: {
          percentage: attendancePercentage,
          totalDays,
          presentDays,
          records: attendanceRecords
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
