import React, { useEffect, useState, useCallback } from 'react';
import {
  School, LogOut, DollarSign, BookOpen,
  Award, Download, CreditCard, History, Calendar, Megaphone, Search, ArrowUpDown, IdCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { generateReceiptPDF } from '../utils/generateReceipt';
import { generateReportCardPDF } from '../utils/generateReportCard';
import { generateStudentIDCardPDF } from '../utils/generateIDCard';
import AIQuizBotWidget from '../components/AIQuizBotWidget';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notices');
  const [fees, setFees] = useState([]);
  const [registrationFee, setRegistrationFee] = useState(null);
  const [homework, setHomework] = useState([]);
  const [results, setResults] = useState([]);
  const [notices, setNotices] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loadingPay, setLoadingPay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  const fetchStudentData = useCallback(async () => {
    try {
      const [feeRes, hwRes, resRes, noticeRes, booksRes] = await Promise.allSettled([
        API.get('/fees/my-fees'),
        API.get('/academic/homework'),
        API.get('/exams/my-results'),
        API.get('/academic/notices'),
        API.get('/library/my-books')
      ]);

      if (feeRes.status === 'fulfilled') {
        setFees(feeRes.value.data.data || []);
        setRegistrationFee(feeRes.value.data.registrationFee || null);
      }
      if (hwRes.status === 'fulfilled') setHomework(hwRes.value.data.data || []);
      if (resRes.status === 'fulfilled') setResults(resRes.value.data.data || []);
      if (noticeRes.status === 'fulfilled') {
        setNotices(noticeRes.value.data.data || []);
      } else {
        setNotices([
          { _id: '1', title: 'Annual Sports Meet 2026', content: 'Registrations open for all athletic events.', date: '2026-08-20', category: 'EVENT' },
          { _id: '2', title: 'Mid-Term Exam Schedule', content: 'Exams starting from next month. Check syllabus.', date: '2026-08-15', category: 'ACADEMIC' },
          { _id: '3', title: 'Independence Day Assembly', content: 'Assembly timings: 8:00 AM sharp in school uniform.', date: '2026-08-14', category: 'IMPORTANT' }
        ]);
      }
      if (booksRes.status === 'fulfilled') setMyBooks(booksRes.value.data.data || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    setUser(parsed);
    fetchStudentData();
  }, [navigate, fetchStudentData]);

  const handlePayFee = async (fee) => {
    try {
      setLoadingPay(true);
      const res = await API.post('/fees/create-order', { feeId: fee._id });
      const { order, razorpayKeyId } = res.data;

      const options = {
        key: razorpayKeyId || 'rzp_test_TM0CNZaCzNldin',
        amount: order.amount,
        currency: order.currency,
        name: 'AB PUBLIC SCHOOL',
        description: `Payment for ${fee.title}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await API.post('/fees/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fee._id
            });
            alert('🎉 Payment Successful! Your receipt is ready.');
            await fetchStudentData();
          } catch (err) {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '9999999999'
        },
        theme: { color: '#1d4ed8' }
      };

      const razor = new window.Razorpay(options);
      razor.open();
      setLoadingPay(false);
    } catch (err) {
      setLoadingPay(false);
      alert(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredNotices = notices
    .filter((n) => (n.title + ' ' + n.content).toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.date || 0) - new Date(a.date || 0) : new Date(a.date || 0) - new Date(b.date || 0));

  const filteredPendingFees = fees
    .filter((fee) => fee.status === 'PENDING')
    .filter((fee) => (fee.title + ' ' + fee.dueDate).toLowerCase().includes(searchQuery.toLowerCase()));

  const paidTransactions = [
    ...(registrationFee ? [registrationFee] : []),
    ...fees.filter((f) => f.status === 'PAID')
  ]
    .filter((t) => (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc' ? (b.amount || 0) - (a.amount || 0) : (a.amount || 0) - (b.amount || 0));

  const filteredHomework = homework
    .filter((hw) => (hw.title + ' ' + hw.subject + ' ' + hw.description).toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredResults = results
    .filter((res) => (res.examType + ' ' + res.grade + ' ' + res.subject).toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredBooks = myBooks
    .filter((b) => (b.bookTitle + ' ' + b.status + ' ' + b.author).toLowerCase().includes(searchQuery.toLowerCase()));

  const pendingFeesCount = fees.filter((fee) => fee.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-blue-900/30 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-amber-400 shadow-lg shadow-blue-600/30">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">AB PUBLIC SCHOOL - Student Portal</h1>
            <p className="text-xs text-slate-400">Scholar: {user?.name} | ID: <strong className="text-amber-400 font-mono">{user?.admissionNumber || 'ADM-2026'}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-white text-sm">{user?.name}</div>
            <div className="text-xs text-blue-400 font-mono font-bold">STUDENT</div>
          </div>
          <button
            onClick={() => generateStudentIDCardPDF({
              fullName: user?.name,
              admissionNumber: user?.admissionNumber,
              className: user?.className || 'Class 10',
              phone: user?.phone,
              parentPhone: user?.phone
            })}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <IdCard className="w-4 h-4" /> ID Card
          </button>
          <button onClick={handleLogout} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto w-full md:w-auto">
            <TabBtn active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} label={`Notice Board (${notices.length})`} icon={<Megaphone className="w-4 h-4" />} />
            <TabBtn active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} label={`Pending Fees (${pendingFeesCount})`} icon={<CreditCard className="w-4 h-4" />} />
            <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Payment History" icon={<History className="w-4 h-4" />} />
            <TabBtn active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Report Cards" icon={<Award className="w-4 h-4" />} />
            <TabBtn active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} label="Homework" icon={<BookOpen className="w-4 h-4" />} />
            <TabBtn active={activeTab === 'library'} onClick={() => setActiveTab('library')} label={`Library Books (${myBooks.filter((b) => b.status === 'ISSUED').length})`} icon={<BookOpen className="w-4 h-4" />} />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl text-slate-300 text-xs font-semibold flex items-center gap-1"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4 text-blue-400" />
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {activeTab === 'notices' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Megaphone className="text-blue-400" /> Official Circulars & Updates</h3>
            <div className="grid grid-cols-1 gap-4">
              {filteredNotices.map((notice) => (
                <div key={notice._id} className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-blue-500/40 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-blue-500/10 text-amber-400 border border-blue-500/20">{notice.category || 'CIRCULAR'}</span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(notice.date || notice.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-white text-base">{notice.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{notice.content || notice.description}</p>
                </div>
              ))}
              {filteredNotices.length === 0 && <p className="text-center py-8 text-slate-500 text-sm">No notices matching search query.</p>}
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="text-blue-400" /> Pending Tuition Dues</h3>
            <div className="space-y-4">
              {filteredPendingFees.length > 0 ? filteredPendingFees.map((fee) => (
                <div key={fee._id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono">PENDING</span>
                    <h4 className="text-lg font-bold text-white mt-2">{fee.title}</h4>
                    <p className="text-xs text-slate-400">Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold font-mono text-emerald-400">₹ {fee.amount.toLocaleString()}</p>
                    <button onClick={() => handlePayFee(fee)} disabled={loadingPay} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow">Pay Online</button>
                  </div>
                </div>
              )) : <div className="text-center py-10 text-slate-500 text-sm">No pending dues match the current search.</div>}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><History className="text-emerald-400" /> Payment History & Receipts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Particulars</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Download Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paidTransactions.map((txn, idx) => (
                    <tr key={txn._id || idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-xs text-slate-300">{new Date(txn.paymentDate || txn.updatedAt || Date.now()).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-white">{txn.title}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹ {txn.amount.toLocaleString()}</td>
                      <td className="py-3 px-4"><span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400">PAID</span></td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => generateReceiptPDF({ receiptNo: txn._id ? String(txn._id).slice(-6).toUpperCase() : `RCP-${idx + 1}`, paymentDate: txn.paymentDate || txn.updatedAt, studentName: user?.name, admissionNumber: user?.admissionNumber, className: user?.className || 'Class 10', feeTitle: txn.title, amount: txn.amount, paymentMode: txn.paymentMode || 'Online Gateway' })} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" /> PDF Receipt</button>
                      </td>
                    </tr>
                  ))}
                  {paidTransactions.length === 0 && <tr><td colSpan="5" className="text-center py-6 text-slate-500">No payment records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Award className="text-amber-400" /> Exam Results</h3>
            {filteredResults.map((res) => (
              <div key={res._id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="px-2.5 py-1 bg-blue-500/10 text-amber-400 text-xs font-bold rounded-lg font-mono">{res.examType ? res.examType.replace('_', ' ') : 'EXAM'}</span>
                  <h4 className="text-base font-bold text-white mt-1">Grade: {res.grade} ({res.percentage}%) - Score: {res.totalMarksObtained}/{res.totalMaxMarks}</h4>
                </div>
                <button onClick={() => generateReportCardPDF(res)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"><Download className="w-4 h-4" /> Download PDF</button>
              </div>
            ))}
            {filteredResults.length === 0 && <p className="text-slate-500 text-sm">No results match the current search.</p>}
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen className="text-blue-400" /> Class Homework</h3>
            {filteredHomework.map((hw) => (
              <div key={hw._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-400">{hw.subject}</span>
                <h5 className="font-semibold text-white text-sm">{hw.title}</h5>
                <p className="text-xs text-slate-400">{hw.description}</p>
              </div>
            ))}
            {filteredHomework.length === 0 && <p className="text-slate-500 text-sm">No homework matches the current search.</p>}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen className="text-blue-400" /> Library Books</h3>
            <div className="space-y-3">
              {filteredBooks.map((b) => (
                <div key={b._id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${b.status === 'ISSUED' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>{b.status}</span>
                    <h4 className="font-bold text-white text-base mt-2">{b.bookTitle}</h4>
                    <p className="text-xs text-slate-400 mt-1">Due Date: <strong className="text-white font-mono">{new Date(b.dueDate).toLocaleDateString()}</strong></p>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No books match your search.</p>}
            </div>
          </div>
        )}
      </main>

      <AIQuizBotWidget defaultClass={user?.className || 'Class 10'} />
    </div>
  );
}

function TabBtn({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}
