import React, { useEffect, useState } from 'react';
import {
  Users, Award, Calendar, DollarSign, BookOpen,
  Download, LogOut, CheckCircle, ShieldCheck, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { generateReceiptPDF } from '../utils/generateReceipt';
import { generateReportCardPDF } from '../utils/generateReportCard';
import { generateStudentIDCardPDF } from '../utils/generateIDCard';
import ClassTimetable from '../components/ClassTimetable';
import ParentTeacherQueryBox from '../components/ParentTeacherQueryBox';

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const fetchChildInfo = async () => {
    try {
      const res = await API.get('/parent/child-data');
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    fetchChildInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Child Academic Records...
      </div>
    );
  }

  if (!data?.child) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <p>No active student found mapped to this parent profile.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs">Logout</button>
      </div>
    );
  }

  const { child, analytics, attendanceRecords, homework, fees, reportCards } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-pink-600 p-2.5 rounded-xl text-white shadow-lg shadow-pink-600/30">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Parent Portal & Child Monitoring</h1>
            <p className="text-xs text-slate-400">Scholar: <strong className="text-white">{child.fullName}</strong> ({child.className})</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-white text-sm">Parent of {child.fullName}</div>
            <div className="text-xs text-pink-400 font-mono">GUARDIAN PROFILE</div>
          </div>
          <button
            onClick={() => generateStudentIDCardPDF({
              fullName: child.fullName,
              admissionNumber: child.admissionNumber,
              className: child.className,
              phone: child.phone,
              parentPhone: child.parentPhone
            })}
            className="px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl"
          >
            Download ID Card
          </button>
          <button onClick={handleLogout} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-600/30">
              {child.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{child.fullName}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Admission ID: <strong className="text-indigo-400 font-mono">{child.admissionNumber}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-white">{child.className}</strong></span>
                <span>•</span>
                <span>Father: {child.fatherName || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-slate-950/70 border border-slate-800 px-5 py-3 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance</p>
              <h4 className="text-xl font-mono font-bold text-emerald-400 mt-1">{analytics.attendancePercentage}%</h4>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 px-5 py-3 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Fees</p>
              <h4 className="text-xl font-mono font-bold text-amber-400 mt-1">
                ₹ {fees.filter((f) => f.status === 'PENDING').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Child Overview" icon={<Users className="w-4 h-4" />} />
          <TabBtn active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} label="Attendance Log" icon={<Calendar className="w-4 h-4" />} />
          <TabBtn active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} label="School Fees" icon={<DollarSign className="w-4 h-4" />} />
          <TabBtn active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} label="Homework & Tasks" icon={<BookOpen className="w-4 h-4" />} />
          <TabBtn active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Report Cards" icon={<Award className="w-4 h-4" />} />
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400" /> Recent Attendance History
                </h3>
                <div className="space-y-2">
                  {attendanceRecords.slice(0, 5).map((att) => (
                    <div key={att._id} className="bg-slate-950 border border-slate-800/60 p-3 rounded-xl flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-300">{new Date(att.date).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                  {attendanceRecords.length === 0 && <p className="text-xs text-slate-500">No attendance marked yet.</p>}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="text-indigo-400" /> Active Subject Homework
                </h3>
                <div className="space-y-2">
                  {homework.slice(0, 3).map((hw) => (
                    <div key={hw._id} className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded">{hw.subject}</span>
                        <span className="text-[11px] text-slate-500">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                      <h5 className="font-semibold text-white text-sm mt-1">{hw.title}</h5>
                    </div>
                  ))}
                  {homework.length === 0 && <p className="text-xs text-slate-500">No pending assignments.</p>}
                </div>
              </div>
            </div>

            <ClassTimetable selectedClass={child.className || 'Class 10'} />
            <ParentTeacherQueryBox studentName={child.fullName} />
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Tuition & Term Fee Ledger</h3>
            <div className="space-y-3">
              {fees.map((fee) => (
                <div key={fee._id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono ${
                      fee.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {fee.status}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-2">{fee.title}</h4>
                    <p className="text-xs text-slate-400">Amount: <strong className="text-white font-mono">₹ {fee.amount.toLocaleString()}</strong> • Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>

                  {fee.status === 'PAID' && (
                    <button
                      onClick={() => generateReceiptPDF({
                        receiptNo: fee._id.slice(-6).toUpperCase(),
                        paymentDate: fee.paymentDate || fee.updatedAt,
                        studentName: child.fullName,
                        admissionNumber: child.admissionNumber,
                        className: child.className,
                        feeTitle: fee.title,
                        amount: fee.amount,
                        paymentMode: 'Online Gateway'
                      })}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
                    >
                      <Download className="w-4 h-4" /> Download Official Receipt (PDF)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Published Academic Report Cards</h3>
            <div className="space-y-3">
              {reportCards.map((res) => (
                <div key={res._id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-lg font-mono">
                      {res.examType.replace('_', ' ')}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-2">Overall Grade: {res.grade} ({res.percentage}%)</h4>
                    <p className="text-xs text-slate-400">Score: {res.totalMarksObtained} / {res.totalMaxMarks} • Teacher Note: "{res.remarks}"</p>
                  </div>
                  <button
                    onClick={() => generateReportCardPDF(res)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" /> Download Report Card (PDF)
                  </button>
                </div>
              ))}
              {reportCards.length === 0 && <p className="text-center py-8 text-slate-500 text-sm">No exam report cards published yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
        active ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}
