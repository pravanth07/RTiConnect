import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      if (res.data.success) {
        localStorage.setItem('rti_token', res.data.token);
        localStorage.setItem('rti_user', JSON.stringify(res.data.user));
        const routes = { citizen: '/citizen', pio: '/pio', cio: '/cio', appellate: '/appellate' };
        window.location.href = routes[res.data.user.role] || '/citizen';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotSendOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email: forgotEmail, type: 'forgot' });
      setForgotStep(2);
      setForgotMessage('OTP sent to your email.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword
      });
      setForgotMessage(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setForgotMessage('');
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password.');
    }
    setForgotLoading(false);
  };

  const fillDemo = (role) => {
    const creds = {
      citizen: { email: 'citizen@demo.com', pass: 'demo123' },
      pio: { email: 'pio@demo.com', pass: 'demo123' },
      cio: { email: 'cio@demo.com', pass: 'demo123' },
      appellate: { email: 'appellate@demo.com', pass: 'demo123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div style={{ fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif" }} className="min-h-screen flex">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');`}</style>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link to="/home" className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
              </div>
              <div>
                <h1 className="text-white font-extrabold text-lg leading-tight">RTI Connect</h1>
                <p className="text-blue-300 text-xs">Right to Information Act, 2005</p>
              </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Empowering Citizens<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-green-300">
                Through Transparency
              </span>
            </h2>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-md">
              Access your RTI portal to file requests, track applications, respond to queries, and manage the entire RTI lifecycle digitally.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '🔒', text: 'Secure & encrypted data handling' },
              { icon: '⚡', text: 'Real-time status tracking & notifications' },
              { icon: '📋', text: 'Compliant with RTI Act, 2005 guidelines' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-blue-100/90 font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex h-1.5 lg:hidden">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-green-600" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <Link to="/home" className="inline-flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-extrabold text-gray-900">RTI Connect</h1>
                  <p className="text-xs text-gray-500">Right to Information Act, 2005</p>
                </div>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to access your RTI portal</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-blue-700 font-semibold hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-all text-base">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New citizen? <Link to="/register" className="text-blue-700 font-bold hover:underline">Register here</Link>
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'citizen', label: 'Citizen', emoji: '👤', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                  { role: 'pio', label: 'PIO', emoji: '🏛️', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
                  { role: 'cio', label: 'CIO', emoji: '🔧', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
                  { role: 'appellate', label: 'Appellate', emoji: '⚖️', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                ].map((d) => (
                  <button key={d.role} onClick={() => fillDemo(d.role)} className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold border rounded-lg transition-colors ${d.color}`}>
                    <span>{d.emoji}</span> {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              {forgotError && <div className="mb-4 px-3 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200">{forgotError}</div>}
              {forgotMessage && <div className="mb-4 px-3 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg border border-green-200">{forgotMessage}</div>}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSendOTP}>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Registered Email</label>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-70">
                    {forgotLoading ? 'Sending...' : 'Send Recovery OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" maxLength={6} value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none text-center tracking-[0.5em] font-mono text-lg" placeholder="123456" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                    <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Enter new password" />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-70">
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
