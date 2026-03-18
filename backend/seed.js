const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hardcoded local MongoDB - no .env needed
const MONGO_URI = 'mongodb://localhost:27017/rti_db';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['citizen', 'pio', 'cio', 'appellate'], default: 'citizen' },
  phone: String,
  department: String,
  designation: String,
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isBPL: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to local MongoDB');

    await User.deleteMany({ email: { $regex: '@demo.com' } });
    console.log('🗑️  Cleared old demo accounts');

    const password = await bcrypt.hash('demo123', 12);

    await User.insertMany([
      {
        name: 'Rajesh Kumar',
        email: 'citizen@demo.com',
        password,
        role: 'citizen',
        phone: '9876543210',
        isBPL: false,
      },
      {
        name: 'Priya Sharma',
        email: 'pio@demo.com',
        password,
        role: 'pio',
        phone: '9876543211',
        department: 'Education',
        designation: 'Public Information Officer',
      },
      {
        name: 'Arun Mehta',
        email: 'cio@demo.com',
        password,
        role: 'cio',
        phone: '9876543212',
        department: 'Education',
        designation: 'Chief Information Officer',
      },
      {
        name: 'Justice Verma',
        email: 'appellate@demo.com',
        password,
        role: 'appellate',
        phone: '9876543213',
        designation: 'Additional Secretary',
      },
    ]);

    console.log('\n🌱 Demo accounts created successfully!\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│              RTI PORTAL - DEMO ACCOUNTS             │');
    console.log('├──────────────┬──────────────────────┬───────────────┤');
    console.log('│ Role         │ Email                │ Password      │');
    console.log('├──────────────┼──────────────────────┼───────────────┤');
    console.log('│ Citizen      │ citizen@demo.com     │ demo123       │');
    console.log('│ PIO Officer  │ pio@demo.com         │ demo123       │');
    console.log('│ CIO          │ cio@demo.com         │ demo123       │');
    console.log('│ Appellate    │ appellate@demo.com   │ demo123       │');
    console.log('└──────────────┴──────────────────────┴───────────────┘');
    console.log('\n✅ Ready! Run: npm run dev');
    console.log('   Then open:  http://localhost:5173\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error('\n💡 Make sure MongoDB is running locally.');
    console.error('   Open MongoDB Compass — if it connects, you are good.\n');
    process.exit(1);
  }
};

seed();
