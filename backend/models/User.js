const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'pio', 'cio', 'appellate'],
    default: 'citizen',
  },
  phone: {
    type: String,
    trim: true,
  },
  aadhaar: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  isBPL: {
    type: Boolean,
    default: false, // Below Poverty Line - exempt from fees (Section 7)
  },
  lastLogin: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
