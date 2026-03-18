const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { createTransporter, otpStore } = require('./otpController');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, department, aadhaar, isBPL } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Only allow citizen self-registration; other roles created by admin/CIO
    const allowedSelfRoles = ['citizen'];
    const userRole = allowedSelfRoles.includes(role) ? role : 'citizen';

    const user = await User.create({
      name, email, password, phone, role: userRole,
      department, aadhaar, isBPL: isBPL || false,
    });

    const token = generateToken(user._id);

    // Send successful registration email
    try {
      const emailUser = process.env.EMAIL_USER;
      if (emailUser && emailUser !== 'your_email@gmail.com' && emailUser !== 'sharathchandraprasad17@gmail.com') {
        const transporter = createTransporter();
        transporter.sendMail({
          from: process.env.EMAIL_FROM || `"RTI Connect" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Welcome to RTI Connect - Registration Successful',
          text: `Hello ${name},\n\nYou have successfully registered on RTI Connect. You can now start filing RTI requests!\n\nBest Regards,\nRTI Connect Team`,
        }).catch(err => console.error('Failed to send welcome email:', err));
      }
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        isBPL: user.isBPL,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password required' });
    }

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ success: false, message: 'OTP expired or not sent. Request a new one.' });
    if (stored.expiresAt < Date.now()) { 
      otpStore.delete(email); 
      return res.status(400).json({ success: false, message: 'OTP expired' }); 
    }
    if (stored.attempts >= 5) { 
      otpStore.delete(email); 
      return res.status(400).json({ success: false, message: 'Too many attempts. Request new OTP.' }); 
    }

    if (stored.otp !== otp.toString()) {
      stored.attempts += 1;
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - stored.attempts} attempts left.` });
    }

    // OTP Verified, find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it

    otpStore.delete(email);

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, resetPassword };
