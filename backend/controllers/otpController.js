const crypto = require('crypto');
const { Resend } = require('resend');

const otpStore = new Map();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (req, res) => {
  try {
    const { email, type = 'register' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const User = require('../models/User');
    const existing = await User.findOne({ email });

    if (type === 'register' && existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    if (type === 'forgot' && !existing) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });

    for (const [key, val] of otpStore.entries()) {
      if (val.expiresAt < Date.now()) otpStore.delete(key);
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'RTI Connect <onboarding@resend.dev>',
      to: email,
      subject: 'RTI Connect - Email Verification OTP',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <div style="display:flex;height:6px;"><div style="flex:1;background:#f97316;"></div><div style="flex:1;background:#fff;"></div><div style="flex:1;background:#16a34a;"></div></div>
          <div style="background:linear-gradient(135deg,#1e3a5f,#1e40af);padding:30px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">RTI Connect</h1>
            <p style="color:#93c5fd;margin:5px 0 0;font-size:13px;">Right to Information Act, 2005</p>
          </div>
          <div style="padding:30px;">
            <h2 style="color:#1e3a5f;margin:0 0 10px;font-size:20px;">Verify Your Email</h2>
            <p style="color:#6b7280;font-size:14px;">Use the OTP below to verify your email address:</p>
            <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:12px;padding:20px;text-align:center;margin:25px 0;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
              <h1 style="color:#1e40af;font-size:36px;letter-spacing:8px;margin:0;font-family:monospace;">${otp}</h1>
            </div>
            <p style="color:#ef4444;font-size:13px;font-weight:600;">This OTP expires in 5 minutes.</p>
          </div>
          <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">RTI Connect — Kamala Institute of Technology & Science</p>
          </div>
        </div>
      `,
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Check email config.' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    if (stored.expiresAt < Date.now()) { otpStore.delete(email); return res.status(400).json({ success: false, message: 'OTP expired' }); }
    if (stored.attempts >= 5) { otpStore.delete(email); return res.status(400).json({ success: false, message: 'Too many attempts. Request new OTP.' }); }

    if (stored.otp !== otp.toString()) {
      stored.attempts += 1;
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - stored.attempts} attempts left.` });
    }

    otpStore.delete(email);
    res.status(200).json({ success: true, message: 'Email verified', verified: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

const createTransporter = () => {
  return { sendMail: async (opts) => await resend.emails.send({ from: opts.from, to: opts.to, subject: opts.subject, html: opts.html || opts.text }) };
};

module.exports = { sendOTP, verifyOTP, createTransporter, otpStore };
