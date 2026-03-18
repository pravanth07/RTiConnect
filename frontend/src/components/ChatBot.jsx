import { useState, useRef, useEffect } from 'react';

const RTI_KNOWLEDGE = [
  { keywords: ['land', 'property', 'mutation', 'survey', 'patta', 'record', 'dharani', 'registration'], department: 'Department of Revenue & Land Records', response: 'For land and property related queries, you should file your RTI with the **Department of Revenue & Land Records**. This covers land records, property registration, mutations, survey numbers, patta details, and encumbrance certificates.' },
  { keywords: ['school', 'college', 'education', 'teacher', 'scholarship', 'exam', 'admission', 'university', 'degree', 'student'], department: 'Department of Education', response: 'Education-related RTI queries go to the **Department of Education**. This includes teacher vacancies, scholarship status, exam results, school infrastructure, mid-day meal programs, and admission processes.' },
  { keywords: ['hospital', 'doctor', 'health', 'medicine', 'medical', 'vaccination', 'ambulance', 'clinic'], department: 'Department of Health & Family Welfare', response: 'Health-related queries should be filed with the **Department of Health & Family Welfare**. This covers hospital facilities, doctor availability, medicine stock, vaccination drives, and health scheme benefits.' },
  { keywords: ['police', 'fir', 'crime', 'theft', 'complaint', 'traffic', 'challan', 'cybercrime', 'missing'], department: 'Department of Police', response: 'Police-related RTI requests go to the **Office of the Superintendent of Police**. This includes FIR status, investigation updates, crime statistics, traffic challans, and complaint tracking.' },
  { keywords: ['road', 'bridge', 'highway', 'construction', 'pothole', 'flyover', 'contractor', 'tender'], department: 'Department of Public Works', response: 'For road and infrastructure queries, file RTI with the **Department of Public Works (PWD)**. This covers road repair status, construction budgets, contractor details, tender information, and project timelines.' },
  { keywords: ['water', 'drainage', 'garbage', 'municipal', 'building', 'permission', 'sanitation', 'streetlight', 'property tax', 'birth', 'death', 'certificate'], department: 'Municipal Administration', response: 'Municipal services RTI goes to your **Municipal Corporation/Municipality**. This covers water supply, drainage, garbage collection, building permissions, birth/death certificates, and property tax.' },
  { keywords: ['pension', 'salary', 'finance', 'budget', 'treasury', 'provident', 'retirement', 'gratuity'], department: 'Department of Finance & Treasury', response: 'Financial queries should be directed to the **Department of Finance & Treasury**. This includes pension status, salary details, GPF balance, gratuity, and government budget information.' },
  { keywords: ['job', 'employment', 'labour', 'worker', 'wage', 'factory', 'recruitment', 'vacancy'], department: 'Department of Employment & Labour', response: 'Employment-related RTI goes to the **Department of Employment & Labour**. This covers job vacancies, minimum wages, factory inspections, ESI benefits, and labor welfare schemes.' },
  { keywords: ['forest', 'environment', 'pollution', 'tree', 'wildlife', 'mining', 'waste', 'climate'], department: 'Department of Environment & Forests', response: 'Environmental queries go to the **Department of Environment & Forests**. This covers pollution levels, forest clearances, wildlife protection, mining permissions, and waste management.' },
  { keywords: ['welfare', 'scheme', 'ration', 'bpl', 'pension', 'widow', 'disability', 'caste', 'reservation', 'sc', 'st', 'obc'], department: 'Department of Social Welfare', response: 'Social welfare RTI goes to the **Department of Social Welfare**. This covers welfare schemes, ration cards, BPL status, caste certificates, disability benefits, and pension for widows/elderly.' },
];

const GENERAL_FAQ = [
  { keywords: ['fee', 'cost', 'charge', 'payment', 'how much'], response: 'The RTI application fee is **₹10** per request. BPL (Below Poverty Line) citizens are **exempted** from this fee under Section 7 of the RTI Act. Additional charges may apply for photocopies (₹2/page).' },
  { keywords: ['time', 'how long', 'days', 'deadline', 'when', 'response time'], response: 'The PIO must respond within **30 days** of receiving your request. For matters concerning **life and liberty**, the response must come within **48 hours**. If no response is received, it is treated as a deemed refusal.' },
  { keywords: ['appeal', 'not satisfied', 'no response', 'rejected', 'complaint'], response: 'You can file a **First Appeal** within 30 days to the Appellate Authority (senior officer in the same department). If still unsatisfied, file a **Second Appeal** to the Central/State Information Commission within 90 days.' },
  { keywords: ['penalty', 'fine', 'punishment', 'pio'], response: 'Under Section 20, if the PIO fails to respond without reasonable cause, the Information Commission can impose a **penalty of ₹250 per day** (maximum ₹25,000). The Commission can also recommend disciplinary action.' },
  { keywords: ['what is rti', 'about rti', 'rti act', 'right to information'], response: 'The **Right to Information (RTI) Act, 2005** empowers every Indian citizen to request information from public authorities. It was enacted to promote **transparency and accountability** in government. Any citizen can file an RTI request to any government department.' },
  { keywords: ['who can file', 'eligible', 'eligibility'], response: 'Any **citizen of India** can file an RTI request. There is no age restriction. You don\'t need to give any reason for seeking information. Even minors can file through their guardians.' },
  { keywords: ['exempt', 'exception', 'cannot ask', 'not allowed', 'section 8'], response: 'Under **Section 8**, certain information is exempt: national security matters, cabinet papers, trade secrets, personal privacy, and information that could endanger someone\'s life. However, if public interest outweighs the harm, disclosure may still be ordered.' },
  { keywords: ['how to file', 'submit', 'process', 'steps', 'guide'], response: 'To file an RTI on our portal:\n1. **Register** with your email and phone\n2. **Find Department** using our Smart Finder\n3. **Choose a Template** or write your own query\n4. **Submit** with ₹10 fee\n5. **Track** your request in real-time\n\nYou can also use our RTI Templates for common queries!' },
  { keywords: ['hello', 'hi', 'hey', 'help', 'start'], response: 'Hello! I\'m your **RTI Assistant**. I can help you with:\n\n• Finding the right department for your query\n• Understanding the RTI process and fees\n• Knowing your rights under RTI Act 2005\n• Filing appeals and complaints\n\nJust describe what information you need, and I\'ll guide you!' },
];

const QUICK_QUESTIONS = [
  'How do I file an RTI?',
  'What is the RTI fee?',
  'How long for a response?',
  'I want land records',
  'Road repair in my area',
  'Hospital doctor info',
  'How to file an appeal?',
  'What is RTI Act?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm your **RTI Assistant**. I can help you find the right department, understand the RTI process, and guide you through filing requests. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findResponse = (query) => {
    const lower = query.toLowerCase();
    const words = lower.split(/\s+/);

    // Check department knowledge
    let bestMatch = null;
    let bestScore = 0;

    for (const item of RTI_KNOWLEDGE) {
      const score = item.keywords.filter((kw) => words.some((w) => w.includes(kw) || kw.includes(w))).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && bestScore >= 1) {
      return {
        text: bestMatch.response,
        department: bestMatch.department,
        showActions: true,
      };
    }

    // Check general FAQ
    for (const faq of GENERAL_FAQ) {
      const score = faq.keywords.filter((kw) => lower.includes(kw)).length;
      if (score >= 1) {
        return { text: faq.response, showActions: false };
      }
    }

    return {
      text: "I'm not sure about that specific query. Could you try describing what information you need from the government? For example:\n\n• \"I need my land records\"\n• \"Road repair status in my area\"\n• \"Hospital doctor availability\"\n\nOr ask me about the RTI process, fees, or how to file an appeal!",
      showActions: false,
    };
  };

  const handleSend = (text) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg = { role: 'user', text: query, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findResponse(query);
      const botMsg = {
        role: 'bot',
        text: response.text,
        department: response.department,
        showActions: response.showActions,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 300); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-800 hover:bg-blue-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '550px', fontFamily: "'Nunito Sans', sans-serif" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">RTI Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-200 text-xs">Online • Ask me anything about RTI</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                  {msg.role === 'bot' && (
                    <span className="text-xs text-gray-400 font-semibold mb-1 block">RTI Assistant</span>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-800 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />

                  {/* Department Action Buttons */}
                  {msg.showActions && msg.department && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/citizen/find-department`}
                        className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        🔍 Find Department
                      </a>
                      <a
                        href={`/citizen/templates`}
                        className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                      >
                        📄 Use Template
                      </a>
                      <a
                        href={`/citizen/submit`}
                        className="px-3 py-1.5 bg-orange-100 text-orange-800 text-xs font-bold rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        📝 File RTI Now
                      </a>
                    </div>
                  )}

                  <span className="text-xs text-gray-400 mt-1 block">
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 font-bold mb-2">Quick Questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border-none rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center hover:bg-blue-900 disabled:bg-gray-300 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
