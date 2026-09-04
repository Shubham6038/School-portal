import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReportCardPDF = (report = {}) => {
  try {
    const doc = new jsPDF();

    // Top Banner Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUADMIN INTERNATIONAL SCHOOL', 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL ACADEMIC EVALUATION REPORT CARD', 105, 28, { align: 'center' });

    // Student Info Card Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 46, 182, 36, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Student Name:', 20, 56);
    doc.text('Examination:', 20, 66);
    doc.text('Class / Grade:', 20, 75);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(report.studentName || 'Student'), 55, 56);
    doc.text(String(report.examType ? report.examType.replace(/_/g, ' ') : 'Examination'), 55, 66);
    doc.text(String(report.className || 'Class 10'), 55, 75);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Admission ID:', 120, 56);
    doc.text('Overall Grade:', 120, 66);
    doc.text('Percentage:', 120, 75);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(report.admissionNumber || 'ADM-2026'), 155, 56);
    doc.setTextColor(16, 185, 129);
    doc.text(String(report.grade || 'A'), 155, 66);
    doc.setTextColor(15, 23, 42);
    doc.text(`${report.percentage || 0}%`, 155, 75);

    // Subject Rows
    const rows = (report.subjects || []).map((sub, idx) => [
      String(idx + 1),
      sub.subjectName || 'Subject',
      String(sub.maxMarks || 100),
      String(sub.marksObtained || 0),
      `${Math.round(((sub.marksObtained || 0) / (sub.maxMarks || 100)) * 100)}%`
    ]);

    if (rows.length === 0) {
      rows.push(['1', 'General Performance', '100', String(report.totalMarksObtained || 0), `${report.percentage || 0}%`]);
    }

    autoTable(doc, {
      startY: 90,
      head: [['S.No', 'Subject Name', 'Max Marks', 'Marks Obtained', 'Percentage']],
      body: rows,
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 150;

    // Total Score & Remarks Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, finalY, 182, 28, 2, 2, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Score: ${report.totalMarksObtained || 0} / ${report.totalMaxMarks || 400}`, 20, finalY + 10);
    doc.text(`Result Status: PASSED`, 130, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Faculty Remarks: "${report.remarks || 'Consistent effort and good performance.'}"`, 20, finalY + 20);

    // Signatures
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.line(25, 250, 75, 250);
    doc.line(135, 250, 185, 250);
    doc.text('Class Teacher Signature', 30, 256);
    doc.text('Principal Signature & Seal', 140, 256);

    doc.save(`ReportCard_${(report.studentName || 'Student').replace(/\s+/g, '_')}_${report.examType || 'Term'}.pdf`);
  } catch (error) {
    console.error('Report Card PDF Error:', error);
    alert('Failed to generate report card PDF. Check console for details.');
  }
};