const nodemailer = require('nodemailer');

const port = parseInt(process.env.EMAIL_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplates = {
  requestSubmitted: (name, requestId, department) => ({
    subject: `RTI Request Submitted - ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
        <div style="background:#1A56A0;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">🇮🇳 RTI Portal</h2>
        </div>
        <div style="padding:30px;">
          <h3>Dear ${name},</h3>
          <p>Your RTI request has been successfully submitted.</p>
          <div style="background:#f0f6ff;border-left:4px solid #1A56A0;padding:15px;margin:20px 0;border-radius:4px;">
            <strong>Request ID:</strong> ${requestId}<br/>
            <strong>Department:</strong> ${department}<br/>
            <strong>Expected Response By:</strong> 30 days from submission
          </div>
          <p>You can track your request status by logging into the RTI Portal.</p>
          <p style="color:#666;font-size:13px;">As per RTI Act 2005, Section 7 — the PIO must respond within 30 days.</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          RTI Online Portal | Government of India
        </div>
      </div>
    `,
  }),

  requestAssigned: (pioName, requestId, citizenName, deadline) => ({
    subject: `New RTI Request Assigned - ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#1A56A0;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">🇮🇳 RTI Portal - PIO Notification</h2>
        </div>
        <div style="padding:30px;">
          <h3>Dear ${pioName},</h3>
          <p>A new RTI request has been assigned to you.</p>
          <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px;">
            <strong>Request ID:</strong> ${requestId}<br/>
            <strong>Citizen:</strong> ${citizenName}<br/>
            <strong>Response Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-IN')}
          </div>
          <p>Please log in to your PIO dashboard to view and respond to this request.</p>
          <p style="color:red;font-size:13px;">⚠️ Failure to respond within the deadline may result in penalties under Section 20 of the RTI Act.</p>
        </div>
      </div>
    `,
  }),

  requestResponded: (name, requestId, response) => ({
    subject: `RTI Response Received - ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#1A56A0;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">🇮🇳 RTI Portal</h2>
        </div>
        <div style="padding:30px;">
          <h3>Dear ${name},</h3>
          <p>Your RTI request <strong>${requestId}</strong> has received a response.</p>
          <div style="background:#f0fff4;border-left:4px solid #28a745;padding:15px;margin:20px 0;border-radius:4px;">
            <strong>Response Summary:</strong><br/>
            ${response.substring(0, 300)}${response.length > 300 ? '...' : ''}
          </div>
          <p>Please log in to view the full response and any attached documents.</p>
          <p style="color:#666;font-size:13px;">If unsatisfied, you may file a First Appeal within 30 days under Section 19 of the RTI Act.</p>
        </div>
      </div>
    `,
  }),

  appealFiled: (name, appealId, type) => ({
    subject: `Appeal Filed Successfully - ${appealId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#1A56A0;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">🇮🇳 RTI Portal</h2>
        </div>
        <div style="padding:30px;">
          <h3>Dear ${name},</h3>
          <p>Your ${type} Appeal has been filed successfully.</p>
          <div style="background:#f0f6ff;border-left:4px solid #1A56A0;padding:15px;margin:20px 0;border-radius:4px;">
            <strong>Appeal ID:</strong> ${appealId}<br/>
            <strong>Type:</strong> ${type} Appeal<br/>
            <strong>Expected Decision:</strong> Within 30–45 days
          </div>
        </div>
      </div>
    `,
  }),

  deadlineWarning: (name, requestId, daysLeft) => ({
    subject: `⚠️ Deadline Warning - ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#dc3545;padding:20px;text-align:center;">
          <h2 style="color:white;margin:0;">⚠️ RTI Deadline Warning</h2>
        </div>
        <div style="padding:30px;">
          <p>RTI Request <strong>${requestId}</strong> response deadline is in <strong>${daysLeft} day(s)</strong>.</p>
          <p>Please respond immediately to avoid penalties under Section 20 of the RTI Act.</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, template, data }) => {
  try {
    const { subject, html } = emailTemplates[template](...data);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
  }
};

module.exports = { sendEmail };
