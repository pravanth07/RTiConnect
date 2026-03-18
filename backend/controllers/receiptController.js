const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');

// @desc    Generate PDF receipt for RTI request
// @route   GET /api/citizen/rti/:id/receipt
// @access  Private (Citizen)
const generateReceipt = async (req, res) => {
  try {
    const rtiRequest = await RTIRequest.findById(req.params.id).populate('citizenId', 'name email phone aadhaar');

    if (!rtiRequest) {
      return res.status(404).json({ success: false, message: 'RTI Request not found' });
    }

    // Verify ownership
    if (rtiRequest.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate QR code as data URL
    const trackingURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/citizen/track/${rtiRequest._id}`;
    const qrDataURL = await QRCode.toDataURL(trackingURL, { width: 120, margin: 1 });
    const qrBuffer = Buffer.from(qrDataURL.split(',')[1], 'base64');

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=RTI_Receipt_${rtiRequest.requestId || rtiRequest._id}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width - 100; // 50 margin each side

    // ── Tricolor top bar ──────────────────────────
    doc.rect(50, 40, pageWidth / 3, 6).fill('#f97316');
    doc.rect(50 + pageWidth / 3, 40, pageWidth / 3, 6).fill('#ffffff').stroke('#e5e7eb');
    doc.rect(50 + (2 * pageWidth) / 3, 40, pageWidth / 3, 6).fill('#16a34a');

    // ── Header ────────────────────────────────────
    doc.moveDown(1);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e3a5f').text('RTI Connect', 50, 60, { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('Online Right to Information Management System', { align: 'center' });
    doc.fontSize(9).fillColor('#9ca3af').text('Under RTI Act, 2005 | Government of India', { align: 'center' });

    // Line separator
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();

    // ── Title ──────────────────────────────────────
    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f').text('RTI Application Receipt', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('This is a computer-generated receipt. No signature required.', { align: 'center' });

    // ── Request Details Box ────────────────────────
    doc.moveDown(1);
    const boxTop = doc.y;
    doc.rect(50, boxTop, pageWidth, 30).fill('#eff6ff');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('Request Details', 65, boxTop + 8);

    let yPos = boxTop + 40;
    const leftCol = 65;
    const rightCol = 220;

    const addRow = (label, value) => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b7280').text(label, leftCol, yPos);
      doc.fontSize(10).font('Helvetica').fillColor('#111827').text(value || 'N/A', rightCol, yPos);
      yPos += 22;
    };

    addRow('Request ID:', rtiRequest.requestId || rtiRequest._id.toString().slice(-10).toUpperCase());
    addRow('Date Filed:', new Date(rtiRequest.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }));
    addRow('Department:', rtiRequest.department || 'Not Assigned');
    addRow('Subject:', rtiRequest.subject || 'N/A');
    addRow('Status:', rtiRequest.status || 'SUBMITTED');
    addRow('Fee Paid:', '₹10.00');

    const deadlineDate = new Date(rtiRequest.createdAt);
    deadlineDate.setDate(deadlineDate.getDate() + 30);
    addRow('Response Deadline:', deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }));

    // ── Applicant Details ──────────────────────────
    doc.moveDown(0.5);
    yPos = doc.y + 10;
    doc.rect(50, yPos, pageWidth, 30).fill('#f0fdf4');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#166534').text('Applicant Details', 65, yPos + 8);
    yPos += 40;

    addRow('Name:', rtiRequest.citizenId?.name || 'N/A');
    addRow('Email:', rtiRequest.citizenId?.email || 'N/A');
    addRow('Phone:', rtiRequest.citizenId?.phone || 'N/A');

    // ── Description ───────────────────────────────
    if (rtiRequest.description) {
      doc.moveDown(0.5);
      yPos = doc.y + 10;
      doc.rect(50, yPos, pageWidth, 30).fill('#fefce8');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#854d0e').text('Information Sought', 65, yPos + 8);
      yPos += 40;
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text(
        rtiRequest.description.substring(0, 500) + (rtiRequest.description.length > 500 ? '...' : ''),
        leftCol, yPos, { width: pageWidth - 30, lineGap: 4 }
      );
    }

    // ── QR Code ────────────────────────────────────
    doc.moveDown(3);
    const qrY = doc.y + 10;
    doc.image(qrBuffer, (doc.page.width - 100) / 2, qrY, { width: 100, height: 100 });
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text('Scan to track your RTI request', 50, qrY + 105, { align: 'center' });
    doc.fontSize(7).fillColor('#d1d5db').text(trackingURL, { align: 'center' });

    // ── Footer ─────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(50 + pageWidth, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
      .text('RTI Connect — Dept. of CSE, Kamala Institute of Technology & Science, Karimnagar', 50, footerY + 10, { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString('en-IN')} | This receipt is valid for tracking purposes.`, { align: 'center' });

    // Tricolor bottom bar
    doc.rect(50, doc.page.height - 46, pageWidth / 3, 4).fill('#f97316');
    doc.rect(50 + pageWidth / 3, doc.page.height - 46, pageWidth / 3, 4).fill('#ffffff');
    doc.rect(50 + (2 * pageWidth) / 3, doc.page.height - 46, pageWidth / 3, 4).fill('#16a34a');

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating receipt' });
  }
};

module.exports = { generateReceipt };
