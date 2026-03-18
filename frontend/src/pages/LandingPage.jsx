import { Link } from 'react-router-dom';

const stats = [
  { label: 'RTI Requests Filed', value: '10,000+', icon: '📋' },
  { label: 'Departments Connected', value: '50+', icon: '🏛️' },
  { label: 'Citizens Registered', value: '5,000+', icon: '👥' },
  { label: 'Avg Response Time', value: '15 Days', icon: '⏱️' },
];

const features = [
  {
    icon: '📝',
    title: 'File RTI Online',
    desc: 'Submit RTI applications from anywhere without visiting government offices. Upload documents and pay fees digitally.',
  },
  {
    icon: '🔍',
    title: 'Smart Department Finder',
    desc: 'Describe your query in plain language and our system will recommend the correct government department.',
  },
  {
    icon: '📄',
    title: 'RTI Templates',
    desc: 'Use ready-made RTI templates for common queries. Just fill your details and generate a properly formatted application.',
  },
  {
    icon: '📡',
    title: 'Real-Time Tracking',
    desc: 'Track your RTI request status in real time. Get email and SMS notifications at every stage.',
  },
  {
    icon: '⚖️',
    title: 'File Appeals',
    desc: 'Not satisfied with the response? File First or Second Appeal directly through the portal.',
  },
  {
    icon: '📊',
    title: 'Transparency Dashboard',
    desc: 'View department performance, resolution rates, and RTI statistics on our public dashboard.',
  },
];

const steps = [
  { step: '01', title: 'Register & Login', desc: 'Create your citizen account with email and Aadhaar verification.' },
  { step: '02', title: 'Select Department', desc: 'Choose the department or use our Smart Finder to identify the right one.' },
  { step: '03', title: 'Submit Application', desc: 'Fill the RTI form or use a template. Attach documents and pay ₹10 fee.' },
  { step: '04', title: 'Track & Receive', desc: 'Track status in real time. PIO must respond within 30 days (48hrs for life/liberty).' },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif" }} className="min-h-screen bg-white">
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');`}</style>

      {/* ── Top Tricolor Bar ───────────────────────────── */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>

      {/* ── Header / Navbar ───────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight">
                RTI Connect
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Right to Information Act, 2005
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-blue-800 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-800 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-blue-800 transition-colors">About RTI</a>
            <Link to="/transparency" className="hover:text-blue-800 transition-colors">Transparency Score</Link>
            <Link to="/impact" className="hover:text-blue-800 transition-colors">Impact Wall</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-bold text-blue-800 border-2 border-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-blue-200 text-sm font-semibold mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Government of India Initiative
              </div>
              <h2
                className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your Right to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-200 to-green-300">
                  Information
                </span>
                Made Digital
              </h2>
              <p className="text-lg text-blue-100/90 mb-8 leading-relaxed max-w-lg">
                File RTI requests online, track responses in real time, and hold public authorities accountable — all from the comfort of your home.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/20 text-base"
                >
                  Get Started — It's Free
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-3.5 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-base"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Hero Right - Key Highlights */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 space-y-5">
                <h3 className="text-white font-bold text-lg mb-4">Under RTI Act 2005, you can:</h3>
                {[
                  'Request any information from any public authority',
                  'Get response within 30 days (48 hours for life/liberty)',
                  'File appeals if not satisfied with the response',
                  'BPL citizens are exempted from application fees',
                  'Penalty of ₹250/day on PIO for delays (max ₹25,000)',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-900">{s.value}</div>
                <div className="text-sm text-gray-500 font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h3 className="text-sm font-bold text-blue-700 tracking-widest uppercase mb-3">Platform Features</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything You Need for RTI
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
                {f.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="bg-blue-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h3 className="text-sm font-bold text-blue-300 tracking-widest uppercase mb-3">How It Works</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              4 Simple Steps to File RTI
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 h-full">
                  <div className="text-4xl font-black text-blue-500/30 mb-3">{s.step}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-sm text-blue-200/70 leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-blue-500/40 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About RTI Section ─────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-sm font-bold text-blue-700 tracking-widest uppercase mb-3">About</h3>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Right to Information Act, 2005
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The RTI Act empowers every citizen of India to question the government and its working. It was enacted on <strong className="text-gray-800">15 June 2005</strong> and came into force on <strong className="text-gray-800">12 October 2005</strong>.
              </p>
              <p>
                Under Section 6, any citizen can request information from a public authority which is required to reply within <strong className="text-gray-800">30 days</strong>. For matters concerning <strong className="text-gray-800">life and liberty</strong>, the response must come within <strong className="text-gray-800">48 hours</strong>.
              </p>
              <p>
                The Act applies to all constitutional authorities, including the <strong className="text-gray-800">Executive, Legislature, and Judiciary</strong>, as well as any institution or body established or constituted by an act of Parliament or state legislature.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8">
            <h4 className="font-bold text-blue-900 text-lg mb-5">Key Sections of RTI Act</h4>
            <div className="space-y-4">
              {[
                { section: 'Section 6', text: 'Any citizen can submit RTI request with ₹10 fee' },
                { section: 'Section 7', text: 'PIO must respond within 30 days of receipt' },
                { section: 'Section 8', text: 'Exemptions — national security, personal privacy, etc.' },
                { section: 'Section 19', text: 'Right to appeal within 30 days of decision' },
                { section: 'Section 20', text: 'Penalty of ₹250/day for PIO non-compliance' },
              ].map((item) => (
                <div key={item.section} className="flex gap-4">
                  <span className="flex-shrink-0 px-3 py-1 bg-blue-800 text-white text-xs font-bold rounded-lg h-fit">
                    {item.section}
                  </span>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1">
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Exercise Your Right?
            </h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              Join thousands of citizens who are holding the government accountable through the power of information.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-colors text-base"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-800 hover:text-blue-800 transition-colors text-base"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-base" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">RTI Connect</h4>
                  <p className="text-xs text-gray-500">Online RTI Management System</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-md">
                A web-based platform to simplify and digitize the Right to Information process under the RTI Act, 2005. Built to enhance transparency between citizens and government.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold text-sm mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About RTI Act</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold text-sm mb-4">Legal References</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="https://rti.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">RTI Portal (rti.gov.in)</a></li>
                <li><a href="https://cic.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Central Info Commission</a></li>
                <li><span>RTI Act, 2005 (Full Text)</span></li>
                <li><span>RTI Rules, 2012</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
            <p>© 2025 RTI Connect — Batch 15, Dept. of CSE, Kamala Institute of Technology & Science</p>
            <p className="mt-2 md:mt-0">Built under RTI Act, 2005 | For Academic Purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
