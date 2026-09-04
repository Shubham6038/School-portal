import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceiptPDF = (data = {}) => {
  try {
    const doc = new jsPDF();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUADMIN INTERNATIONAL SCHOOL', 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL TUITION & TERM FEE PAYMENT RECEIPT', 105, 27, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Affiliated to CBSE | ISO 9001:2026 Certified Institution', 105, 34, { align: 'center' });

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 34, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Receipt No:', 20, 58);
    doc.text('Payment Date:', 20, 67);
    doc.text('Payment Mode:', 20, 76);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.receiptNo || 'RCP-2026-001'), 55, 58);
    doc.text(new Date(data.paymentDate || Date.now()).toLocaleDateString(), 55, 67);
    doc.text(String(data.paymentMode || 'Online Gateway / Razorpay'), 55, 76);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Scholar Name:', 115, 58);
    doc.text('Admission ID:', 115, 67);
    doc.text('Class / Grade:', 115, 76);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.studentName || 'Student'), 150, 58);
    doc.text(String(data.admissionNumber || 'ADM-2026'), 150, 67);
    doc.text(String(data.className || 'Class 10'), 150, 76);

    const tableRows = [
      ['1', data.feeTitle || 'Academic Term Tuition Fee', `INR ${(data.amount || 0).toLocaleString()}`],
      ['', 'Total Amount Paid (Inclusive of Taxes)', `INR ${(data.amount || 0).toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 90,
      head: [['S.No', 'Fee Particulars & Descriptions', 'Amount Paid']],
      body: tableRows,
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 5, fontSize: 10 },
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable.finalY + 12;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, finalY, 182, 20, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS: PAYMENT VERIFIED & SETTLED SUCCESSFULLY', 20, finalY + 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Student / Guardian Signature', 25, 240);
    doc.text('Authorized Accounts Officer Signature & Stamp', 125, 240);
    doc.line(20, 235, 75, 235);
    doc.line(120, 235, 190, 235);

    doc.save(`Fee_Receipt_${data.admissionNumber || 'Student'}_${data.receiptNo || 'RCP'}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Failed to generate PDF. Check console for error details.');
  }
};

export const generateFeeReceipt = (args) => generateReceiptPDF(args);

