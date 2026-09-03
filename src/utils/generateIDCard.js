import jsPDF from 'jspdf';

export const generateStudentIDCardPDF = (student = {}) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 54]
    });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(2, 2, 81.6, 50, 3, 3, 'FD');

    doc.setFillColor(30, 58, 138);
    doc.roundedRect(2, 2, 81.6, 14, 3, 3, 'F');
    doc.rect(2, 10, 81.6, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('AB PUBLIC SCHOOL', 42.8, 7, { align: 'center' });

    doc.setFontSize(5);
    doc.setTextColor(245, 158, 11);
    doc.text('STUDENT IDENTITY CARD • 2026-27', 42.8, 11, { align: 'center' });

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(6, 19, 20, 24, 1.5, 1.5, 'FD');

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6);
    doc.text('PHOTO', 16, 32, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');

    doc.text('Name:', 30, 22);
    doc.text('Adm No:', 30, 27);
    doc.text('Class:', 30, 32);
    doc.text('Phone:', 30, 37);
    doc.text('Valid Till:', 30, 42);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');

    doc.text(String(student.fullName || student.name || 'Student Name'), 43, 22);
    doc.setTextColor(30, 58, 138);
    doc.text(String(student.admissionNumber || 'ADM-2026-0001'), 43, 27);
    doc.setTextColor(15, 23, 42);
    doc.text(String(student.className || student.classApplyingFor || 'Class 10'), 43, 32);
    doc.text(String(student.phone || student.parentPhone || '+91 9876543210'), 43, 37);
    doc.text('March 2027', 43, 42);

    doc.setFillColor(248, 250, 252);
    doc.rect(2, 46, 81.6, 6, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(4.5);
    doc.text('www.abpublicschool.edu | +91 11 2345 6789', 5, 50);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Principal Signature', 78, 50, { align: 'right' });

    doc.save(`IDCard_${(student.fullName || student.name || 'Student').replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('ID Card Generation Error:', error);
    alert('Failed to generate Student ID Card.');
  }
};
