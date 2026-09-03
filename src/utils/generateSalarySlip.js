import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSalarySlipPDF = (slip = {}) => {
  try {
    const doc = new jsPDF();

    // Top Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AB PUBLIC SCHOOL', 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 158, 11);
    doc.text(`CONFIDENTIAL SALARY PAYSLIP - ${String(slip.month || 'CURRENT MONTH').toUpperCase()}`, 105, 28, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Affiliated to CBSE | Institutional ERP Generated Slip', 105, 36, { align: 'center' });

    // Faculty Information Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 32, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Faculty Name:', 20, 58);
    doc.text('Email Address:', 20, 68);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(slip.teacherName || 'Faculty Teacher'), 55, 58);
    doc.text(String(slip.teacherEmail || 'teacher@school.com'), 55, 68);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Status:', 120, 58);
    doc.text('Disbursed Date:', 120, 68);

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID (DIRECT DEPOSIT)', 155, 58);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(slip.paymentDate || Date.now()).toLocaleDateString(), 155, 68);

    const base = Number(slip.baseSalary || 45000);
    const allowances = Number(slip.allowances || 5000);
    const deductions = Number(slip.deductions || 2000);
    const net = Number(slip.netSalary || (base + allowances - deductions));

    const tableRows = [
      ['1', 'Basic Core Salary', `INR ${base.toLocaleString()}`],
      ['2', 'Special Allowances / DA / HRA', `+ INR ${allowances.toLocaleString()}`],
      ['3', 'Provident Fund (PF) & Leave Deductions', `- INR ${deductions.toLocaleString()}`],
      ['', 'NET TAKE-HOME SALARY DISBURSED', `INR ${net.toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 88,
      head: [['S.No', 'Salary Earnings & Deductions Breakdown', 'Amount (INR)']],
      body: tableRows,
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 5, fontSize: 10 },
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 160;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Disbursed Net Salary: INR ${net.toLocaleString()} Only`, 20, finalY + 10);

    // Signatures
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.line(25, 240, 75, 240);
    doc.line(130, 240, 185, 240);
    doc.text('Accounts Officer Signature', 30, 246);
    doc.text('Principal Signature & Stamp', 135, 246);

    doc.save(`SalarySlip_${String(slip.teacherName || 'Faculty').replace(/\s+/g, '_')}_${slip.month || 'Month'}.pdf`);
  } catch (err) {
    console.error('Salary Slip PDF Error:', err);
    alert('Failed to generate salary slip PDF.');
  }
};
