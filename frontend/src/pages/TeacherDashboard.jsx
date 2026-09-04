import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  LogOut,
  CheckCircle,
  XCircle,
  BookOpen,
  Save,
  PlusCircle,
  Users,
  Award,
  Coins,
  CalendarClock,
  Download,
  FileText,
  CalendarRange,
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { generateSalarySlipPDF } from '../utils/generateSalarySlip';

const statusColors = {
  PENDING: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  APPROVED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-300 border border-red-500/30'
};

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('marks');
  const [salarySlips, setSalarySlips] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [hwForm, setHwForm] = useState({ subject: 'Mathematics', title: '', description: '', dueDate: '' });
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [marksForm, setMarksForm] = useState({
    studentId: '',
    examType: 'MID_TERM',
    math: 85,
    science: 90,
    english: 78,
    computer: 95,
    remarks: 'Excellent performance and consistent effort!'
  });

  const navigate = useNavigate();

  const fetchStudents = async (className) => {
    try {
      const res = await API.get(`/teacher/students/${className}`);
      const list = res.data.data || [];
      setStudents(list);

      const initialAtt = {};
      list.forEach((s) => {
        initialAtt[s._id] = 'PRESENT';
      });
      setAttendance(initialAtt);

      if (list.length > 0) {
        setMarksForm((prev) => ({ ...prev, studentId: list[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await API.get('/teacher/leave/my');
      setLeaveRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchSalarySlips = async () => {
    try {
      const res = await API.get('/teacher/salary/my');
      setSalarySlips(res.data.data || []);
    } catch (err) {
      console.error('Error fetching salary slips:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchStudents(selectedClass);
    fetchLeaveRequests();
    fetchSalarySlips();
  }, [navigate, selectedClass]);

  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const payload = Object.keys(attendance).map((id) => ({
        studentId: id,
        status: attendance[id]
      }));

      await API.post('/teacher/attendance', {
        date: attendanceDate,
        attendanceData: payload
      });

      alert('🎉 Attendance marked successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/teacher/homework', {
        ...hwForm,
        className: selectedClass
      });
      alert('🎉 Homework published to student portal!');
      setHwForm({ subject: 'Mathematics', title: '', description: '', dueDate: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish homework');
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    if (!marksForm.studentId) {
      alert('Please select a student first');
      return;
    }

    try {
      const subjects = [
        { subjectName: 'Mathematics', marksObtained: Number(marksForm.math), maxMarks: 100 },
        { subjectName: 'Science', marksObtained: Number(marksForm.science), maxMarks: 100 },
        { subjectName: 'English', marksObtained: Number(marksForm.english), maxMarks: 100 },
        { subjectName: 'Computer Science', marksObtained: Number(marksForm.computer), maxMarks: 100 }
      ];

      await API.post('/exams/submit-marks', {
        studentId: marksForm.studentId,
        examType: marksForm.examType,
        className: selectedClass,
        subjects,
        remarks: marksForm.remarks
      });

      alert('🎉 Marks submitted successfully! Sent to Admin for final review & approval.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit marks');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/teacher/leave/apply', leaveForm);
      alert('✅ Leave request sent successfully!');
      setLeaveForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaveRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleDownloadSlip = (slip) => {
    generateSalarySlipPDF(slip);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const totalSalaryPaid = salarySlips.reduce((sum, slip) => sum + Number(slip.netSalary || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">EduAdmin Faculty Portal</h1>
            <p className="text-xs text-slate-400">Teacher: {user?.name || 'Faculty Member'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-white text-sm">{user?.name}</div>
            <div className="text-xs text-emerald-400 font-mono">FACULTY TEACHER</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase">Selected Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('marks')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'marks' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>
              <Award className="w-4 h-4" /> Exam Marks
            </button>
            <button onClick={() => setActiveTab('attendance')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>
              <Users className="w-4 h-4" /> Attendance
            </button>
            <button onClick={() => setActiveTab('homework')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'homework' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>
              <BookOpen className="w-4 h-4" /> Homework
            </button>
            <button onClick={() => setActiveTab('salary')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'salary' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>
              <Coins className="w-4 h-4" /> Payroll
            </button>
            <button onClick={() => setActiveTab('leave')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'leave' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>
              <CalendarRange className="w-4 h-4" /> Leave
            </button>
          </div>
        </div>

        {activeTab === 'marks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-emerald-400 w-6 h-6" /> Student Exam Marks Entry ({selectedClass})
              </h3>
              <p className="text-xs text-slate-400 mt-1">Marks will be submitted to the School Admin/Principal for review before being published.</p>
            </div>

            <form onSubmit={handleMarksSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Select Student</label>
                  <select value={marksForm.studentId} onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none" required>
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>{s.fullName} ({s.admissionNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Exam Type</label>
                  <select value={marksForm.examType} onChange={(e) => setMarksForm({ ...marksForm, examType: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none">
                    <option value="MID_TERM">Mid-Term Examination</option>
                    <option value="FINAL_EXAM">Final Annual Examination</option>
                    <option value="UNIT_TEST_1">Unit Test 1</option>
                    <option value="UNIT_TEST_2">Unit Test 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Mathematics</label>
                  <input type="number" max="100" min="0" value={marksForm.math} onChange={(e) => setMarksForm({ ...marksForm, math: e.target.value })} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Science</label>
                  <input type="number" max="100" min="0" value={marksForm.science} onChange={(e) => setMarksForm({ ...marksForm, science: e.target.value })} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">English</label>
                  <input type="number" max="100" min="0" value={marksForm.english} onChange={(e) => setMarksForm({ ...marksForm, english: e.target.value })} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Computer Science</label>
                  <input type="number" max="100" min="0" value={marksForm.computer} onChange={(e) => setMarksForm({ ...marksForm, computer: e.target.value })} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Teacher Remarks</label>
                <input type="text" value={marksForm.remarks} onChange={(e) => setMarksForm({ ...marksForm, remarks: e.target.value })} placeholder="e.g. Excellent work, keep it up!" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30">
                Submit Marks for Admin Approval
              </button>
            </form>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Daily Attendance Entry ({selectedClass})</h3>
                <p className="text-xs text-slate-400">Click student status button to toggle Present / Absent</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2" />
                <button onClick={handleSaveAttendance} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg inline-flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Attendance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-indigo-400">{student.admissionNumber}</td>
                        <td className="py-3 px-4 font-semibold text-white">{student.fullName}</td>
                        <td className="py-3 px-4 text-slate-400">{student.email}</td>
                        <td className="py-3 px-4 text-center">
                          <button type="button" onClick={() => toggleStatus(student._id)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 ${attendance[student._id] === 'PRESENT' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {attendance[student._id] === 'PRESENT' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {attendance[student._id]}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No approved students found in {selectedClass}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="text-emerald-400" /> Assign New Homework ({selectedClass})
            </h3>

            <form onSubmit={handleHomeworkSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Subject</label>
                <input type="text" placeholder="e.g. Mathematics / Science" value={hwForm.subject} onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" required />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Assignment Title</label>
                <input type="text" placeholder="e.g. Exercise 3.1 Trigonometry" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" required />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Due Date</label>
                <input type="date" value={hwForm.dueDate} onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-emerald-500" required />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Instructions / Description</label>
                <textarea rows="4" placeholder="Provide detailed instructions for the homework..." value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" required ></textarea>
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm transition-all shadow-lg">
                Publish Assignment
              </button>
            </form>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-slate-400"><Coins className="w-5 h-5 text-emerald-400" /> Total Salary Received</div>
                <div className="mt-4 text-3xl font-bold text-white">₹{totalSalaryPaid.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-slate-400"><CalendarClock className="w-5 h-5 text-blue-400" /> Pay Cycles</div>
                <div className="mt-4 text-3xl font-bold text-white">{salarySlips.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-slate-400"><BadgeCheck className="w-5 h-5 text-violet-400" /> Latest Status</div>
                <div className="mt-4 text-xl font-bold text-white">{salarySlips[0]?.paymentStatus || 'PENDING'}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="text-emerald-400" /> Salary Slip History</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Base Salary</th>
                      <th className="py-3 px-4">Allowances</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4">Net Salary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {salarySlips.length > 0 ? (
                      salarySlips.map((slip) => (
                        <tr key={slip._id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-white font-medium">{slip.month}</td>
                          <td className="py-3 px-4">₹{Number(slip.baseSalary || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-emerald-400">₹{Number(slip.allowances || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-red-400">₹{Number(slip.deductions || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-white font-bold">₹{Number(slip.netSalary || 0).toLocaleString()}</td>
                          <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[slip.paymentStatus] || 'bg-slate-700 text-slate-300'}`}>{slip.paymentStatus}</span></td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => handleDownloadSlip(slip)} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold">
                              <Download className="w-4 h-4" /> Download PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">No salary slips have been generated yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CalendarRange className="text-emerald-400" /> Apply for Leave</h3>

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Leave Type</label>
                  <select value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none">
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="EMERGENCY">Emergency Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Start Date</label>
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:border-emerald-500 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">End Date</label>
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:border-emerald-500 focus:outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Reason</label>
                  <textarea rows="4" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Explain your leave requirement..." className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none" required />
                </div>

                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm transition-all shadow-lg">
                  Submit Leave Request
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CalendarClock className="text-blue-400" /> Leave Request Status</h3>

              <div className="space-y-3">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave) => (
                    <div key={leave._id} className="border border-slate-800 bg-slate-950/60 rounded-2xl p-4">
                      <div className="flex justify-between items-center gap-3 mb-2">
                        <div>
                          <div className="text-white font-semibold">{leave.leaveType}</div>
                          <div className="text-xs text-slate-400">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[leave.status] || 'bg-slate-700 text-slate-300'}`}>{leave.status}</span>
                      </div>
                      <p className="text-sm text-slate-300">{leave.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-sm py-8 text-center">No leave requests found.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
