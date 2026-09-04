import jsPDF from 'jspdf';

export const generateTransferCertificatePDF = (student = {}) => {
  try {
    const doc = new jsPDF();

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AB PUBLIC SCHOOL', 105, 26, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Affiliated to CBSE Board | School Code: 54102 | Affiliation No: 2130894', 105, 33, { align: 'center' });
    doc.text('Institutional Area, Sector 12, New Delhi - 110075', 105, 38, { align: 'center' });

    doc.setFillColor(30, 58, 138);
    doc.roundedRect(65, 46, 80, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSFER CERTIFICATE', 105, 53, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`TC No: TC/2026/${Math.floor(1000 + Math.random() * 9000)}`, 18, 68);
    doc.text(`Admission No: ${student.admissionNumber || 'ADM-2026-001'}`, 130, 68);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 18, 75);
    doc.text('Board Reg No: CBSE-REG-2026', 130, 75);

    doc.setDrawColor(226, 232, 240);
    doc.line(18, 80, 192, 80);

    const fields = [
      ['1. Name of the Pupil:', String(student.fullName || student.name || 'Student Name')],
      ["2. Father's / Guardian's Name:", String(student.parentFullName || student.fatherName || 'Guardian Name')],
      ['3. Nationality / Religion:', 'Indian'],
      ['4. Date of First Admission to School:', new Date().toLocaleDateString()],
      ['5. Date of Birth (in figures & words):', String(student.dateOfBirth || '2010-05-15')],
      ['6. Class in which pupil last studied:', String(student.className || student.classApplyingFor || 'Class 10')],
      ['7. School / Board Annual Examination Taken:', 'Passed and Promoted'],
      ['8. Whether failed, if so once/twice:', 'No'],
      ['9. Subjects Studied:', 'English, Mathematics, Science, Social Science, Computer Science'],
      ['10. Whether qualified for promotion to higher class:', 'Yes, Qualified'],
      ['11. Month up to which school dues paid:', 'All Dues Fully Cleared'],
      ['12. Total Working Days in Session:', '220 Days'],
      ['13. Total Pupil Attendance Recorded:', '208 Days (94.5%)'],
      ['14. General Conduct & Discipline:', 'Exemplary and Good'],
      ['15. Reason for Leaving the School:', 'Parent Relocation / Higher Studies']
    ];

    let startY = 92;
    fields.forEach(([label, val]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, startY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, 105, startY);

      doc.setDrawColor(241, 245, 249);
      doc.line(20, startY + 2.5, 190, startY + 2.5);
      startY += 10.5;
    });

    const sigY = 260;
    doc.setDrawColor(148, 163, 184);
    doc.line(25, sigY, 65, sigY);
    doc.line(85, sigY, 125, sigY);
    doc.line(145, sigY, 185, sigY);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Class Teacher', 45, sigY + 5, { align: 'center' });
    doc.text('Checked by (Clerk)', 105, sigY + 5, { align: 'center' });
    doc.text('Principal & Official Seal', 165, sigY + 5, { align: 'center' });

    doc.save(`TransferCertificate_${(student.fullName || 'Student').replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error(err);
    alert('Failed to generate Transfer Certificate.');
  }
};
