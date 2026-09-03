import React, { useEffect, useState } from 'react';
import {
  GraduationCap, LogOut, CheckCircle, XCircle, Award,
  Users, PlusCircle, FileCheck, Calendar, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function PrincipalDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('admissions'); 
  const [applications, setApplications] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [books, setBooks] = useState([]);
  const [issuedList, setIssuedList] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({ title: 'Term 1 Tuition Fee', amount: 2500, dueDate: '2026-09-30' });
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: 'Science', totalCopies: 5, rackNumber: 'Rack-A1' });
  const [issueForm, setIssueForm] = useState({ admissionNumber: '', returnDays: 14 });
  const navigate = useNavigate();

  const fetchAdmissions = async () => {
    try {
      const res = await API.get('/admissions/applications');
      setApplications(res.data.data);
    } catch (err) {
      console.error('Error fetching admissions:', err);
    }
  };

  const fetchMarks = async () => {
    try {
      const res = await API.get('/exams/pending-admin');
      setMarksList(res.data.data);
    } catch (err) {
      console.error('Error fetching marks:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/teacher/leaves/all');
      setLeavesList(res.data.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchLibraryData = async () => {
    try {
      const [bookRes, issueRes] = await Promise.all([
        API.get(`/library/books?search=${bookSearch}`),
        API.get('/library/issued-logs')
      ]);
      setBooks(bookRes.data.data || []);
      setIssuedList(issueRes.data.data || []);
    } catch (err) {
      console.error('Error fetching library data:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'SCHOOL_ADMIN' && parsedUser.role !== 'PRINCIPAL') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);
    fetchAdmissions();
    fetchMarks();
    fetchLeaves();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'library') {
      fetchLibraryData();
    }
  }, [activeTab, bookSearch]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/admissions/status/${id}`, { status: newStatus });
      fetchAdmissions();
      alert(`Application ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admission status');
    }
  };

  const handleMarkApproval = async (id, status) => {
    try {
      await API.put(`/exams/status/${id}`, { status });
      fetchMarks();
      alert(`Marks ${status.toLowerCase()} and student report cards updated!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update mark status');
    }
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await API.put(`/teacher/leaves/status/${id}`, { status });
      alert(`Leave application ${status.toLowerCase()} successfully!`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const handleAssignFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/fees/assign', {
        studentId: selectedStudent._id,
        admissionNumber: selectedStudent.admissionNumber,
        title: feeForm.title,
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate
      });
      alert(`✅ Fee assigned successfully to ${selectedStudent.fullName}!`);
      setSelectedStudent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign fee');
    }
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/library/books', newBook);
      alert('🎉 Book added to catalog!');
      setShowAddBook(false);
      setNewBook({ title: '', author: '', isbn: '', category: 'Science', totalCopies: 5, rackNumber: 'Rack-A1' });
      fetchLibraryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add book');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/library/issue', {
        bookId: selectedBookForIssue._id,
        admissionNumber: issueForm.admissionNumber,
        returnDays: issueForm.returnDays
      });
      alert('🎉 Book issued successfully!');
      setShowIssueModal(false);
      setIssueForm({ admissionNumber: '', returnDays: 14 });
      fetchLibraryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue book');
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      const res = await API.put(`/library/return/${issueId}`);
      alert(res.data.message);
      fetchLibraryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">School Operations Portal</h1>
            <p className="text-xs text-slate-400">Principal / Branch Admin Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-white text-sm">{user?.name}</div>
            <div className="text-xs text-blue-400 font-mono font-medium">BRANCH PRINCIPAL</div>
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
        <div className="flex gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'admissions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Admission Approvals & Fee Assigning
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'marks' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Teacher Marks Review & Publishing
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'leaves' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Faculty Leave Applications
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'library' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Library Management
          </button>
        </div>

        {activeTab === 'admissions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Student Admission Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Applicant Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">₹1000 Reg Fee</th>
                    <th className="py-3 px-4">Admission Status</th>
                    <th className="py-3 px-4 text-center">Approve / Reject</th>
                    <th className="py-3 px-4 text-center">Assign Tuition Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-blue-400 font-mono font-medium">{app.admissionNumber}</td>
                        <td className="py-3 px-4 font-medium text-white">{app.fullName}</td>
                        <td className="py-3 px-4 text-slate-300">{app.classApplyingFor}</td>
                        <td className="py-3 px-4">
                          {app.registrationFee?.paymentStatus === 'PAID' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ PAID (₹1000)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              ✕ UNPAID
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'APPROVED')}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg"
                              title="Approve Admission"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'REJECTED')}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg"
                              title="Reject Admission"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {app.status === 'APPROVED' ? (
                            <button
                              onClick={() => setSelectedStudent(app)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Assign Fee
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600">Approve First</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-500">
                        No admission applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Faculty Leave Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {leavesList.length > 0 ? (
                    leavesList.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-white">{leave.teacherName}</td>
                        <td className="py-3 px-4 text-blue-400 font-mono text-xs">{leave.leaveType}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs font-mono">
                          {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{leave.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            leave.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleLeaveStatus(leave._id, 'APPROVED')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveStatus(leave._id, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-500">
                        No faculty leave applications pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Faculty Marks Review & Publishing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Exam Type</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {marksList.length > 0 ? (
                    marksList.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-white">{m.studentName}</td>
                        <td className="py-3 px-4 text-slate-300">{m.className}</td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-400">{m.examType.replace('_', ' ')}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">{m.totalMarksObtained} / {m.totalMaxMarks} ({m.percentage}%)</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{m.grade}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">{m.submittedBy}</td>
                        <td className="py-3 px-4">
                          {m.approvalStatus === 'APPROVED' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PUBLISHED</span>
                          ) : m.approvalStatus === 'REJECTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">REJECTED</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleMarkApproval(m._id, 'APPROVED')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Approve & Publish
                            </button>
                            <button
                              onClick={() => handleMarkApproval(m._id, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-slate-500">
                        No marks submitted for review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search by Title, Author, ISBN..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 w-72 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddBook(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add New Book
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {books.map((b) => (
                <div key={b._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">
                      {b.category}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${b.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {b.availableCopies} / {b.totalCopies} Available
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{b.title}</h4>
                    <p className="text-xs text-slate-400">By {b.author}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">ISBN: {b.isbn} • Rack: {b.rackNumber}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedBookForIssue(b); setShowIssueModal(true); }}
                    disabled={b.availableCopies < 1}
                    className="w-full py-2 bg-slate-950 hover:bg-blue-600 border border-slate-800 hover:border-transparent text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Issue to Student
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Book Issue & Return Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="p-3">Book Title</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Admission No</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Fine (₹5/Day)</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {issuedList.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{log.bookTitle}</td>
                        <td className="p-3">{log.studentName}</td>
                        <td className="p-3 font-mono text-blue-400">{log.admissionNumber}</td>
                        <td className="p-3 font-mono">{new Date(log.dueDate).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            log.status === 'RETURNED' ? 'bg-slate-800 text-slate-400' :
                            log.isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {log.isOverdue ? 'OVERDUE' : log.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          ₹ {log.liveFine || log.fineAmount || 0}
                        </td>
                        <td className="p-3 text-center">
                          {log.status !== 'RETURNED' && (
                            <button
                              onClick={() => handleReturnBook(log._id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                            >
                              Receive & Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showAddBook && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold text-white mb-4">Add Book to Library Catalog</h3>
                  <form onSubmit={handleAddBookSubmit} className="space-y-3">
                    <input type="text" placeholder="Book Title" value={newBook.title} onChange={e=>setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" required />
                    <input type="text" placeholder="Author Name" value={newBook.author} onChange={e=>setNewBook({...newBook, author: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" required />
                    <input type="text" placeholder="ISBN Number" value={newBook.isbn} onChange={e=>setNewBook({...newBook, isbn: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-mono" required />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Category" value={newBook.category} onChange={e=>setNewBook({...newBook, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" required />
                      <input type="number" placeholder="Total Copies" value={newBook.totalCopies} onChange={e=>setNewBook({...newBook, totalCopies: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" required />
                    </div>
                    <input type="text" placeholder="Rack / Shelf Location" value={newBook.rackNumber} onChange={e=>setNewBook({...newBook, rackNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" />
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={()=>setShowAddBook(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                      <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">Add Book</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showIssueModal && selectedBookForIssue && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold text-white mb-2">Issue Book</h3>
                  <p className="text-xs text-blue-400 font-semibold mb-4">{selectedBookForIssue.title} (By {selectedBookForIssue.author})</p>
                  <form onSubmit={handleIssueSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Student Admission No / Email</label>
                      <input type="text" placeholder="e.g. ADM-2026-0001 or email" value={issueForm.admissionNumber} onChange={e=>setIssueForm({...issueForm, admissionNumber: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-mono" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Return Duration (Days)</label>
                      <input type="number" value={issueForm.returnDays} onChange={e=>setIssueForm({...issueForm, returnDays: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs" required />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={()=>setShowIssueModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                      <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">Confirm Issue</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-2">Assign Fee to {selectedStudent.fullName}</h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">Admission ID: {selectedStudent.admissionNumber}</p>

              <form onSubmit={handleAssignFeeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Fee Title</label>
                  <input
                    type="text"
                    value={feeForm.title}
                    onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Amount (₹)</label>
                  <input
                    type="number"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold"
                  >
                    Confirm & Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'APPROVED') {
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVED</span>;
  }
  if (status === 'REJECTED') {
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">REJECTED</span>;
  }
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>;
}
