import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  School,
  DollarSign,
  UserCheck,
  LogOut,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  PlusCircle,
  Coins,
  Search,
  ArrowUpDown,
  Filter,
  CreditCard,
  Landmark,
  Eye,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { generateTransferCertificatePDF } from '../utils/generateTC';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Student Detail View Modal State
  const [viewStudentModal, setViewStudentModal] = useState(null);

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('admissions');

  // Refund Modal States
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStudent, setRefundStudent] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc');

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: 'Teacher@123',
    phone: '',
    subject: 'Mathematics',
    assignedClass: 'Class 10'
  });

  const [salaryForm, setSalaryForm] = useState({
    teacherId: '',
    month: 'August 2026',
    baseSalary: 45000,
    allowances: 5000,
    deductions: 1500
  });

  const [feeForm, setFeeForm] = useState({
    title: 'Term 1 Tuition Fee',
    amount: 5000,
    dueDate: '2026-09-30',
  });

  const navigate = useNavigate();

  const fetchAdminData = useCallback(async () => {
    try {
      const [appRes, marksRes, teacherRes] = await Promise.allSettled([
        API.get('/admissions/applications'),
        API.get('/exams/pending-admin'),
        API.get('/teacher/all-teachers')
      ]);

      if (appRes.status === 'fulfilled') {
        const apps = (appRes.value.data?.data || []).map(a => ({
          ...a,
          // Ensure refundAccountDetails exists to avoid runtime property reads on undefined
          refundAccountDetails: a.refundAccountDetails || { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '' }
        }));
        setApplications(apps);
      }
      if (marksRes.status === 'fulfilled') setMarksList(marksRes.value.data?.data || []);
      if (teacherRes.status === 'fulfilled') {
        const teacherData = teacherRes.value.data?.data || [];
        setTeachers(teacherData);
        if (teacherData.length > 0) {
          setSalaryForm(prev => ({ ...prev, teacherId: teacherData[0]._id }));
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch Error:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'SUPER_ADMIN') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchAdminData();
  }, [navigate, fetchAdminData]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/admissions/status/${id}`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Process Refund Submission
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter bank reference / UTR number');
      return;
    }

    setProcessingRefund(true);
    try {
      await API.put(`/admissions/refund-complete/${refundStudent._id}`, {
        transactionReference: utrNumber,
        refundAmount: refundStudent.registrationFee?.amount || 1000
      });

      alert(`✅ Refund processed successfully for ${refundStudent.fullName}!`);
      setShowRefundModal(false);
      setRefundStudent(null);
      setUtrNumber('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete refund');
    } finally {
      setProcessingRefund(false);
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
        dueDate: feeForm.dueDate,
      });
      alert(`✅ Fee assigned successfully to ${selectedStudent.fullName}!`);
      setSelectedStudent(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign fee');
    }
  };

  const handleDisburseSalary = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/teacher/salary/disburse', salaryForm);
      alert(res.data?.message || '🎉 Salary disbursed successfully to teacher!');
      setShowSalaryModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disburse salary');
    }
  };

  const handleMarkApproval = async (id, status) => {
    try {
      await API.put(`/exams/status/${id}`, { status });
      alert(`Marks ${status.toLowerCase()} successfully!`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register-teacher', teacherForm);
      alert(`🎉 Teacher Created! Email: ${teacherForm.email}`);
      setShowTeacherModal(false);
      setTeacherForm({
        name: '',
        email: '',
        password: 'Teacher@123',
        phone: '',
        subject: 'Mathematics',
        assignedClass: 'Class 10'
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create teacher');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const totalApprovedStudents = applications.filter((app) => app.status === 'APPROVED').length;
  const totalPendingApplications = applications.filter((app) => app.status === 'PENDING').length;
  const totalRegFeeCollected = applications.filter((app) => app.registrationFee?.paymentStatus === 'PAID').length * 1000;

  const filteredApplications = applications
    .filter((app) => {
      const matchText = `${app.fullName || ''} ${app.admissionNumber || ''} ${app.classApplyingFor || ''}`.toLowerCase();
      const matchesSearch = matchText.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return (a.fullName || '').localeCompare(b.fullName || '');
      return (b.fullName || '').localeCompare(a.fullName || '');
    });

  const filteredTeachers = teachers
    .filter((t) => {
      const matchText = `${t.name || ''} ${t.email || ''} ${t.subject || ''} ${t.phone || ''}`.toLowerCase();
      return matchText.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return (a.name || '').localeCompare(b.name || '');
      return (b.name || '').localeCompare(a.name || '');
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <aside className="w-64 bg-slate-900 border-r border-blue-900/30 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl text-amber-400">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wider uppercase block">AB PUBLIC SCHOOL</span>
              <span className="text-[10px] text-amber-400 font-mono">SUPER ADMIN</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 border border-blue-500/20 text-amber-400 rounded-xl font-medium text-sm">
              <LayoutDashboard className="w-5 h-5" /> Overview
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-sm transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">AB PUBLIC SCHOOL - Administration</h1>
            <p className="text-slate-400 text-xs mt-1">Super Admin: <strong>{user?.name || 'Administrator'}</strong></p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSalaryModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Coins className="w-4 h-4 text-amber-300" /> Disburse Salary
            </button>
            <button
              type="button"
              onClick={() => setShowTeacherModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Teacher
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={totalApprovedStudents.toLocaleString()} icon={<School />} color="text-blue-400" />
          <StatCard title="Active Applications" value={totalPendingApplications} icon={<Users />} color="text-amber-400" />
          <StatCard title="Teachers Count" value={teachers.length} icon={<UserCheck />} color="text-emerald-400" />
          <StatCard title="Fee Collected" value={`₹ ${totalRegFeeCollected.toLocaleString()}`} icon={<DollarSign />} color="text-emerald-400" />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setActiveAdminTab('admissions'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'admissions' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Admission Applications ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveAdminTab('marks'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'marks' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Marks Approvals ({marksList.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveAdminTab('payroll'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'payroll' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Faculty Payroll & Salaries ({teachers.length})
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={activeAdminTab === 'payroll' ? 'Search teacher by name, email, subject...' : 'Search student by name, admission no, class...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg">
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeAdminTab === 'admissions' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="REJECTED">Rejected Only</option>
                </select>
              </div>
            )}

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              Sort: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
            </button>
          </div>
        </div>

        {activeAdminTab === 'admissions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Student Admission Applications ({filteredApplications.length})
            </h2>
            <p className="text-xs text-slate-400 mb-4">Click on any student row or name to view full details and documents.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Applicant Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">₹1,000 Reg Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                    <th className="py-3 px-4 text-center">Assign Fee</th>
                    <th className="py-3 px-4 text-center">TC / Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredApplications.map((app) => (
                    <tr 
                      key={app._id} 
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td 
                        onClick={() => setViewStudentModal(app)} 
                        className="py-3 px-4 text-amber-400 font-mono font-medium cursor-pointer"
                      >
                        {app.admissionNumber}
                      </td>
                      <td 
                        onClick={() => setViewStudentModal(app)} 
                        className="py-3 px-4 font-medium text-white cursor-pointer hover:underline decoration-blue-500"
                      >
                        {app.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{app.classApplyingFor}</td>
                      <td className="py-3 px-4">
                        {app.registrationFee?.paymentStatus === 'PAID' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ PAID</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">✕ UNPAID</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={app.status} /></td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handleStatusUpdate(app._id, 'APPROVED')} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer" title="Approve Student">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleStatusUpdate(app._id, 'REJECTED')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer" title="Reject Student">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {app.status === 'APPROVED' ? (
                          <button type="button" onClick={() => setSelectedStudent(app)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer">
                            <PlusCircle className="w-3.5 h-3.5" /> Assign Fee
                          </button>
                        ) : <span className="text-xs text-slate-600">—</span>}
                      </td>

                      {/* TC / Refund Column */}
                      <td className="py-3 px-4 text-center">
                        {app.status === 'APPROVED' && (
                          <button type="button" onClick={() => generateTransferCertificatePDF(app)} className="px-3 py-1 bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 rounded-lg text-xs font-bold cursor-pointer">
                            Issue TC
                          </button>
                        )}

                        {app.status === 'REJECTED' && (
                          app.refund?.status === 'COMPLETED' ? (
                            <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold font-mono" title={`UTR: ${app.refund?.transactionReference}`}>
                              ✓ Refund Done
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRefundStudent(app);
                                setShowRefundModal(true);
                              }}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" /> Issue Refund
                            </button>
                          )
                        )}

                        {app.status === 'PENDING' && (
                          <button 
                            type="button" 
                            onClick={() => setViewStudentModal(app)} 
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Info
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr><td colSpan="8" className="text-center py-6 text-slate-500">No matching applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeAdminTab === 'marks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Teacher Marks Review & Publishing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Exam</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {marksList.map((m) => (
                    <tr key={m._id}>
                      <td className="py-3 px-4 font-semibold text-white">{m.studentName}</td>
                      <td className="py-3 px-4">{m.className}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">{m.examType}</td>
                      <td className="py-3 px-4">{m.totalMarksObtained} / {m.totalMaxMarks}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{m.grade}</td>
                      <td className="py-3 px-4 text-center">
                        <button type="button" onClick={() => handleMarkApproval(m._id, 'APPROVED')} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer">
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {marksList.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-slate-500">No marks pending approval.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeAdminTab === 'payroll' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Faculty Members & Payroll Ledger ({filteredTeachers.length})</h2>
                <p className="text-xs text-slate-400">Disburse monthly salary packages directly to teacher accounts</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSalaryModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Coins className="w-4 h-4" /> Disburse Salary
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredTeachers.map((t) => (
                    <tr key={t._id}>
                      <td className="py-3 px-4 font-bold text-white">{t.name}</td>
                      <td className="py-3 px-4 text-slate-400">{t.email}</td>
                      <td className="py-3 px-4 font-mono">{t.phone || '9876543210'}</td>
                      <td className="py-3 px-4 text-amber-400 font-semibold">{t.subject || 'Faculty'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSalaryForm(prev => ({ ...prev, teacherId: t._id }));
                            setShowSalaryModal(true);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Disburse Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && <tr><td colSpan="5" className="text-center py-6 text-slate-500">No matching teachers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* STUDENT FULL DETAILS & DOCUMENTS MODAL */}
      {viewStudentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Application Overview</span>
                <h3 className="text-lg font-bold text-white">{viewStudentModal.fullName} ({viewStudentModal.admissionNumber})</h3>
              </div>
              <button onClick={() => setViewStudentModal(null)} className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 px-3 py-1 rounded-xl cursor-pointer">✕ Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Passport Photo Preview */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center mb-2 shadow-inner">
                  {viewStudentModal.documents?.passportPhoto ? (
                    <img src={viewStudentModal.documents.passportPhoto} alt="Student Passport" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">No Photo</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Passport Photo</span>
              </div>

              {/* Personal Info Grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block font-semibold">Applying For:</span>
                  <span className="font-bold text-amber-400">{viewStudentModal.classApplyingFor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Application Status:</span>
                  <StatusBadge status={viewStudentModal.status} />
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Email Address:</span>
                  <span className="text-white">{viewStudentModal.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Phone Number:</span>
                  <span className="text-white">{viewStudentModal.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Date of Birth:</span>
                  <span className="text-white">{viewStudentModal.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Gender:</span>
                  <span className="text-white">{viewStudentModal.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Parent / Guardian:</span>
                  <span className="text-white">{viewStudentModal.parentFullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Parent Contact:</span>
                  <span className="text-white">{viewStudentModal.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* Refund Bank/UPI Details */}
            <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <h4 className="text-amber-400 font-bold flex items-center gap-1.5 mb-2">
                <Landmark className="w-4 h-4" /> Refund Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                <p><span className="text-slate-500">Account Holder:</span> <strong>{viewStudentModal.refundAccountDetails?.accountHolderName || 'N/A'}</strong></p>
                <p><span className="text-slate-500">Bank Name:</span> {viewStudentModal.refundAccountDetails?.bankName || 'N/A'}</p>
                <p><span className="text-slate-500">Account Number:</span> <span className="font-mono text-white font-bold">{viewStudentModal.refundAccountDetails?.accountNumber || 'N/A'}</span></p>
                <p><span className="text-slate-500">IFSC Code:</span> <span className="font-mono uppercase text-white font-bold">{viewStudentModal.refundAccountDetails?.ifscCode || 'N/A'}</span></p>
                {viewStudentModal.refundAccountDetails?.upiId && (
                  <p className="col-span-2"><span className="text-slate-500">UPI ID:</span> <span className="font-mono text-amber-300 font-bold">{viewStudentModal.refundAccountDetails?.upiId}</span></p>
                )}
              </div>
            </div>

            {/* Aadhar Card Download/View Section */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-300">Aadhar Card Document</span>
              </div>
              {viewStudentModal.documents?.aadharCard ? (
                <a 
                  href={viewStudentModal.documents.aadharCard} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow"
                >
                  View / Download Document
                </a>
              ) : (
                <span className="text-xs text-red-400 font-semibold">Document Not Uploaded</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN FEE MODAL */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-blue-400">
              <DollarSign /> Assign Fee to Student
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Student: <strong>{selectedStudent.fullName}</strong> ({selectedStudent.admissionNumber})
            </p>

            <form onSubmit={handleAssignFeeSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Fee Title</label>
                <input
                  type="text"
                  value={feeForm.title}
                  onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Amount (₹)</label>
                <input
                  type="number"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Due Date</label>
                <input
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none text-slate-300"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedStudent(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer">
                  Assign Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE REFUND MODAL FOR REJECTED STUDENTS */}
      {showRefundModal && refundStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-red-400">
              <CreditCard /> Issue Registration Fee Refund
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Processing ₹{refundStudent.registrationFee?.amount || 1000} payout for <strong>{refundStudent.fullName}</strong>.
            </p>

            {/* Bank/UPI Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 mb-4 text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2">
                <Landmark className="w-3.5 h-3.5" />
                <span>Beneficiary Account Details</span>
              </div>
              <p><span className="text-slate-500 font-semibold">Account Holder:</span> {refundStudent.refundAccountDetails?.accountHolderName || refundStudent.parentFullName || refundStudent.fullName}</p>
              
              {refundStudent.refundAccountDetails?.upiId ? (
                <p><span className="text-slate-500 font-semibold">UPI ID:</span> <span className="text-amber-300 font-mono font-bold">{refundStudent.refundAccountDetails?.upiId}</span></p>
              ) : (
                <>
                  <p><span className="text-slate-500 font-semibold">Bank:</span> {refundStudent.refundAccountDetails?.bankName || 'N/A'}</p>
                  <p><span className="text-slate-500 font-semibold">Account No:</span> <span className="text-white font-mono font-bold">{refundStudent.refundAccountDetails?.accountNumber || 'N/A'}</span></p>
                  <p><span className="text-slate-500 font-semibold">IFSC Code:</span> <span className="text-white font-mono uppercase font-bold">{refundStudent.refundAccountDetails?.ifscCode || 'N/A'}</span></p>
                </>
              )}
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Bank Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR1234567890"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundStudent(null);
                    setUtrNumber('');
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer transition-all disabled:opacity-50"
                >
                  {processingRefund ? 'Updating...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISBURSE SALARY MODAL */}
      {showSalaryModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Coins className="text-amber-400" /> Disburse Faculty Salary
            </h3>
            <p className="text-xs text-slate-400 mb-4">Generate and credit salary slip to teacher's portal</p>

            <form onSubmit={handleDisburseSalary} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Select Faculty Member</label>
                <select
                  value={salaryForm.teacherId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, teacherId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Pay Month</label>
                <input
                  type="text"
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Base Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.baseSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Allowances (₹)</label>
                  <input
                    type="number"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Deductions (₹)</label>
                <input
                  type="number"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-red-400 text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center font-bold">
                <span>Net Disbursed Pay:</span>
                <span className="text-amber-400 font-mono text-sm">
                  ₹ {(Number(salaryForm.baseSalary || 0) + Number(salaryForm.allowances || 0) - Number(salaryForm.deductions || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer">
                  Confirm & Credit Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEACHER MODAL */}
      {showTeacherModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-4">Add Faculty to AB PUBLIC SCHOOL</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <input
                type="text"
                placeholder="Teacher Full Name"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm"
                required
              />
              <input
                type="email"
                placeholder="Teacher Email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={teacherForm.phone}
                onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Subject (e.g. Physics)"
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
                <select
                  value={teacherForm.assignedClass}
                  onChange={(e) => setTeacherForm({ ...teacherForm, assignedClass: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="Class 1">Class 1</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>
              <input
                type="text"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-amber-400 font-mono text-sm"
                required
              />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTeacherModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm cursor-pointer font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold cursor-pointer">
                  Create Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'APPROVED') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVED</span>;
  if (status === 'REJECTED') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">REJECTED</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>;
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className={`${color} p-2 bg-slate-950 rounded-xl border border-slate-800`}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}