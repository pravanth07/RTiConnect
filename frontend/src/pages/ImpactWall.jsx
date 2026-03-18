import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BADGES = [
  { id: 'first_rti', icon: '🎯', name: 'First RTI', desc: 'Filed your first RTI request', color: 'from-blue-500 to-blue-700' },
  { id: 'quick_filer', icon: '⚡', name: 'Quick Filer', desc: 'Filed 5 RTIs in one month', color: 'from-yellow-500 to-orange-500' },
  { id: 'appeal_warrior', icon: '⚖️', name: 'Appeal Warrior', desc: 'Successfully filed an appeal', color: 'from-red-500 to-pink-600' },
  { id: 'transparency_champ', icon: '🏆', name: 'Transparency Champion', desc: 'Filed 10+ RTIs with responses', color: 'from-green-500 to-emerald-600' },
  { id: 'multi_dept', icon: '🌐', name: 'Multi-Department', desc: 'Filed RTIs to 3+ departments', color: 'from-purple-500 to-indigo-600' },
  { id: 'voice_user', icon: '🎤', name: 'Voice Pioneer', desc: 'Used voice input to file RTI', color: 'from-teal-500 to-cyan-600' },
  { id: 'template_master', icon: '📄', name: 'Template Master', desc: 'Used 3+ different templates', color: 'from-pink-500 to-rose-600' },
  { id: 'penalty_trigger', icon: '🔥', name: 'Accountability Hero', desc: 'PIO penalized on your RTI', color: 'from-orange-600 to-red-700' },
];

const IMPACT_STORIES = [
  { city: 'Karimnagar', dept: 'Public Works', result: 'Road repair completed in Ward 15 after RTI revealed unused budget', days: 12, icon: '🛣️' },
  { city: 'Hyderabad', dept: 'Health', result: 'Hospital got 3 new doctors after RTI exposed vacancies', days: 18, icon: '🏥' },
  { city: 'Warangal', dept: 'Education', result: 'Mid-day meal quality improved after RTI showed fund misuse', days: 22, icon: '🏫' },
  { city: 'Nizamabad', dept: 'Municipal', result: 'Clean water supply restored after RTI to municipality', days: 8, icon: '💧' },
  { city: 'Adilabad', dept: 'Revenue', result: 'Land record correction done within 15 days of RTI', days: 15, icon: '📋' },
  { city: 'Khammam', dept: 'Police', result: 'Missing FIR registered after RTI to SP office', days: 5, icon: '🚔' },
  { city: 'Siddipet', dept: 'Social Welfare', result: 'Pension backlog cleared for 200+ senior citizens', days: 25, icon: '👴' },
  { city: 'Mancherial', dept: 'Environment', result: 'Illegal mining stopped after RTI exposed permissions', days: 30, icon: '🌿' },
];

const LIVE_STATS = [
  { label: 'RTIs Filed Today', value: 23, icon: '📝', trend: '+12%' },
  { label: 'Responses Received', value: 156, icon: '✅', trend: '+8%' },
  { label: 'Appeals Filed', value: 12, icon: '⚖️', trend: '-3%' },
  { label: 'Penalties Imposed', value: 4, icon: '🔥', trend: '+25%' },
  { label: 'Citizens Active', value: 1247, icon: '👥', trend: '+15%' },
  { label: 'Avg Response Time', value: '14d', icon: '⏱️', trend: '-5%' },
];

export default function ImpactWall() {
  const [activeStory, setActiveStory] = useState(0);
  const [counters, setCounters] = useState(LIVE_STATS.map(() => 0));

  // Auto-rotate stories
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStory(prev => (prev + 1) % IMPACT_STORIES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Animate counters
  useEffect(() => {
    const targets = LIVE_STATS.map(s => typeof s.value === 'number' ? s.value : parseInt(s.value) || 0);
    const duration = 2000;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounters(targets.map(t => Math.floor(eased * t)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }} className="min-h-screen bg-gray-950 text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');`}</style>

      {/* Tricolor */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-base" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">RTI Connect</h1>
              <p className="text-xs text-gray-400">Impact Wall</p>
            </div>
          </Link>
          <Link to="/home" className="text-sm text-blue-400 font-semibold hover:underline">← Back to Home</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">
              Citizens Making a Difference
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every RTI filed is a step towards transparent governance. See the real impact citizens are making across Telangana.
          </p>
        </div>

        {/* Live Stats Ticker */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-12">
          {LIVE_STATS.map((stat, i) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-extrabold text-white mt-1">
                {typeof stat.value === 'number' ? counters[i] : stat.value}
              </p>
              <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
              <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend} this week
              </span>
            </div>
          ))}
        </div>

        {/* Impact Stories Carousel */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🌟</span> Real Impact Stories
          </h3>

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 overflow-hidden min-h-[200px]">
            {IMPACT_STORIES.map((story, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  i === activeStory ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 p-8'
                }`}
              >
                {i === activeStory && (
                  <>
                    <div className="flex items-start gap-4">
                      <span className="text-5xl">{story.icon}</span>
                      <div>
                        <p className="text-lg font-bold text-white mb-2">{story.result}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>📍 {story.city}</span>
                          <span>🏛️ {story.dept}</span>
                          <span>⏱️ {story.days} days</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">
                      "This is the power of RTI. One request from a citizen led to real change." — Anonymous Citizen
                    </p>
                  </>
                )}
              </div>
            ))}

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {IMPACT_STORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStory(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeStory ? 'bg-blue-500 w-6' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🏅</span> Citizen Achievement Badges
          </h3>
          <p className="text-gray-400 text-sm mb-6">Earn badges as you exercise your right to information. Every badge represents a milestone in your journey as an informed citizen.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-gray-600 hover:scale-105 transition-all duration-300 cursor-default"
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl mb-3 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-shadow`}>
                  {badge.icon}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Top Transparency Champions This Month
          </h3>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {[
              { rank: 1, name: 'Citizen from Karimnagar', rtis: 12, badges: 5, score: 950 },
              { rank: 2, name: 'Citizen from Hyderabad', rtis: 9, badges: 4, score: 780 },
              { rank: 3, name: 'Citizen from Warangal', rtis: 8, badges: 3, score: 720 },
              { rank: 4, name: 'Citizen from Nizamabad', rtis: 6, badges: 3, score: 580 },
              { rank: 5, name: 'Citizen from Adilabad', rtis: 5, badges: 2, score: 450 },
            ].map((user) => (
              <div key={user.rank} className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <span className="text-xl w-8 text-center">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.rtis} RTIs filed • {user.badges} badges earned</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-blue-400">{user.score}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-10">
          <h3 className="text-2xl font-extrabold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Make Your Impact?
          </h3>
          <p className="text-gray-400 mb-6">Join thousands of citizens holding the government accountable.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all">
              Start Filing RTIs
            </Link>
            <Link to="/transparency" className="px-8 py-3.5 border-2 border-gray-700 text-gray-300 font-bold rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all">
              View Scoreboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
