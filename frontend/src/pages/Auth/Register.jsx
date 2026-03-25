import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = '/api';

export default function Register() {
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=done
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', aadhaar: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // CAPTCHA State
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    drawCaptcha(text);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.5)`;
        ctx.stroke();
    }

    // Add text
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Slight rotation for each character
    for(let i=0; i<text.length; i++) {
        ctx.save();
        ctx.translate(20 + i * 20, canvas.height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }
  };

  useEffect(() => {
    if (step === 1) {
        generateCaptcha();
    }
  }, [step]);



  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1: Validate form, check CAPTCHA & send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!agreed) { setError('Please agree to the terms'); return; }
    
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
        setError('Incorrect CAPTCHA. Please try again.');
        generateCaptcha();
        setCaptchaInput('');
        return;
    }

    setOtpSending(true);
    try {
      const res = await axios.post(`${API}/auth/send-otp`, { email: formData.email });
      setStep(2);
      setOtpTimer(300); // 5 minutes
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      generateCaptcha();
      setCaptchaInput('');
    }
    setOtpSending(false);
  };

  // OTP input handler
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs[5].current?.focus();
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyAndRegister = async () => {
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { setError('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      // Verify OTP first
      const verifyRes = await axios.post(`${API}/auth/verify-otp`, { email: formData.email, otp: otpCode });

      if (verifyRes.data.verified) {
        // Now register
        const regRes = await axios.post(`${API}/auth/register`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          aadhaar: formData.aadhaar,
          password: formData.password,
          role: 'citizen',
          isBPL: false,
        });

        if (regRes.data.success) {
          localStorage.setItem('rti_token', regRes.data.token);
          localStorage.setItem('rti_user', JSON.stringify(regRes.data.user));
          setStep(3);
          setTimeout(() => { window.location.href = '/citizen'; }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    setError('');
    setOtpSending(true);
    try {
      const res = await axios.post(`${API}/auth/send-otp`, { email: formData.email });
      setOtpTimer(300);
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
    setOtpSending(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;


  return (
    <div style={{ fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif" }} className="min-h-screen flex">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');`}</style>

      {/* ── Left Panel ─── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
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
              Join the Movement for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-green-300">Government Accountability</span>
            </h2>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-md">Register as a citizen to file RTI requests, track responses, and exercise your right to information.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider">After Registration</h4>
            {[
              { icon: '📝', text: 'File unlimited RTI requests to any department' },
              { icon: '📄', text: 'Use ready-made RTI templates for quick filing' },
              { icon: '🔍', text: 'Smart department finder for correct submissions' },
              { icon: '📡', text: 'Get email & SMS alerts on every status update' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-lg px-4 py-3 border border-white/10">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-blue-100/90 font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ─── */}
      <div className="flex-1 flex flex-col">
        <div className="flex h-1.5 lg:hidden">
          <div className="flex-1 bg-orange-500" /><div className="flex-1 bg-white" /><div className="flex-1 bg-green-600" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg">

            {/* Mobile Logo */}
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

            {/* ══════ STEP 1: Registration Form ══════ */}
            {step === 1 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Create your account</h2>
                  <p className="text-gray-500 mt-1">Register as a citizen to start filing RTI requests</p>
                </div>

                {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold">{error}</div>}

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                    <p className="text-xs text-gray-400 mt-1">An OTP will be sent to this email for verification</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Aadhaar Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} placeholder="1234 5678 9012" maxLength={14} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">{showPassword ? '🙈' : '👁️'}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password *</label>
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <label className="text-sm text-gray-600">I agree to the <span className="text-blue-700 font-semibold">Terms of Service</span> and <span className="text-blue-700 font-semibold">Privacy Policy</span>.</label>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 bg-white p-3 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-bold text-gray-700">Security Verification *</label>
                    <div className="flex items-center gap-3">
                        <canvas 
                            ref={canvasRef} 
                            width="140" 
                            height="40" 
                            className="border border-gray-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={generateCaptcha}
                            title="Click to refresh CAPTCHA"
                        />
                        <button type="button" onClick={generateCaptcha} className="text-gray-400 hover:text-blue-600 p-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                        <input 
                            type="text" 
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            placeholder="Enter code" 
                            required 
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                            maxLength={6}
                        />
                    </div>
                  </div>

                  <button type="submit" disabled={otpSending || !agreed || !captchaInput} className="w-full py-3.5 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-all text-base mt-2">
                    {otpSending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Verifying CAPTCHA & Sending...
                      </span>
                    ) : '📧 Send OTP & Verify Email'}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">Already registered? <Link to="/login" className="text-blue-700 font-bold hover:underline">Sign in here</Link></p>
              </>
            )}


            {/* ══════ STEP 2: OTP Verification ══════ */}
            {step === 2 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📧</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Verify Your Email</h2>
                <p className="text-gray-500 mb-1">We've sent a 6-digit OTP to</p>
                <p className="text-blue-800 font-bold mb-6">{formData.email}</p>

                {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold">{error}</div>}

                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-gray-50"
                    />
                  ))}
                </div>

                {/* Timer */}
                {otpTimer > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    OTP expires in <span className="font-bold text-blue-800">{formatTime(otpTimer)}</span>
                  </p>
                )}

                {/* Verify Button */}
                <button
                  onClick={handleVerifyAndRegister}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3.5 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 transition-all text-base mb-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Verifying...
                    </span>
                  ) : '✓ Verify & Create Account'}
                </button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-500">Didn't receive the OTP?</span>
                  <button
                    onClick={handleResend}
                    disabled={otpSending || otpTimer > 240}
                    className="text-blue-700 font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    {otpSending ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>

                {/* Back */}
                <button onClick={() => { setStep(1); setError(''); generateCaptcha(); setCaptchaInput(''); }} className="mt-6 text-sm text-gray-500 hover:text-gray-700">
                  ← Back to form
                </button>
              </div>
            )}

            {/* ══════ STEP 3: Success ══════ */}
            {step === 3 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Registration Successful!</h2>
                <p className="text-gray-500 mb-2">Welcome to RTI Connect, <strong>{formData.name}</strong>!</p>
                <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
                <div className="mt-4">
                  <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-semibold">💡 Registration is free. RTI fee is ₹10/request. BPL citizens exempted under Section 7.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
