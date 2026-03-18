import { useState } from 'react';
import VoiceInput from '../../components/VoiceInput';
import { useNavigate } from 'react-router-dom';
import { citizenAPI } from '../../api';
import { PageWrapper } from '../../components/UI';
import toast from 'react-hot-toast';
import { Upload, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

const DEPARTMENTS = ['Agriculture','Civil Aviation','Commerce & Industry','Consumer Affairs','Defence','Education','Environment','Finance','Food & Public Distribution','Health & Family Welfare','Home Affairs','Housing & Urban Affairs','Information & Broadcasting','Jal Shakti','Labour & Employment','Law & Justice','MSME','Petroleum & Natural Gas','Power','Railways','Road Transport','Rural Development','Science & Technology','Shipping','Social Justice','Steel','Telecommunications','Tourism','Tribal Affairs','Women & Child Development','Youth Affairs'];

// Keyword mapping for Auto-Routing
const DEPT_KEYWORDS = {
  'Education': ['school', 'college', 'student', 'teacher', 'exam', 'syllabus', 'mid-day meal', 'university'],
  'Health & Family Welfare': ['hospital', 'doctor', 'medicine', 'vaccine', 'clinic', 'disease', 'patient'],
  'Home Affairs': ['police', 'fir', 'security', 'law and order', 'crime', 'station'],
  'Road Transport': ['road', 'highway', 'toll', 'traffic', 'rto', 'driving license', 'vehicle'],
  'Environment': ['tree', 'forest', 'pollution', 'wildlife', 'mining', 'lake', 'river'],
  'Labour & Employment': ['job', 'pf', 'epfo', 'salary', 'worker', 'wages', 'employment exchange']
};

export default function SubmitRTI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ department: '', subject: '', description: '', isLifeOrLiberty: false });

  // Auto-Routing State
  const [suggestedDept, setSuggestedDept] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Auto-Routing Logic
  useEffect(() => {
    if (form.description.length > 20) {
      const text = form.description.toLowerCase();
      let bestMatch = null;
      let maxMatches = 0;

      for (const [dept, keywords] of Object.entries(DEPT_KEYWORDS)) {
        const matches = keywords.filter(kw => text.includes(kw));
        if (matches.length > maxMatches) {
          maxMatches = matches.length;
          bestMatch = dept;
        }
      }

      // Only suggest if we have strong confidence (e.g., at least 1 keyword match)
      setSuggestedDept(maxMatches > 0 ? bestMatch : null);
    } else {
      setSuggestedDept(null);
    }
  }, [form.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user selected a department that contradicts the AI suggestion
    if (suggestedDept && form.department !== suggestedDept && !showWarningModal) {
      setShowWarningModal(true);
      return; // Stop submission to show the warning
    }

    setShowWarningModal(false);
    setLoading(true);

    try {
      // 1. Create Razorpay Order securely from backend
      const { data: orderData } = await citizenAPI.createPaymentOrder();

      if (!orderData.success) {
        toast.error("Could not initiate payment. Try again.");
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay Checkout Options
      const options = {
        key: 'rzp_test_SRnseYVCVsrM77', // Safe to put test keys in frontend, but ideally from process.env
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RTI Connect",
        description: "RTI Application Fee (₹10)",
        order_id: orderData.order.id, // The order ID created by our backend
        handler: async function (response) {
          // 3. Payment Successful Callback
          try {
            toast.success(`Payment successful! TxId: ${response.razorpay_payment_id}`);
            
            // Now proceed with submitting the actual RTI application to our DB
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            files.forEach(f => formData.append('attachments', f));

            const { data } = await citizenAPI.submitRTI(formData);
            toast.success(`RTI submitted! ID: ${data.request.requestId}`);
            
            // Navigate to receipt page
            navigate('/citizen/receipt', {
              state: {
                paymentId: response.razorpay_payment_id,
                orderId: orderData.order.id,
                amount: orderData.order.amount / 100, // Converting from paise to INR
                requestId: data.request.requestId,
                department: form.department,
                subject: form.subject,
                date: new Date().toISOString(),
              }
            });
          } catch (err) {
            console.error("RTI Submission Error after payment:", err);
            toast.error(err.response?.data?.message || 'Submission failed after payment.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Citizen User",
          email: "citizen@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0C1B33" // Matches our Deep Navy CSS variable
        },
        modal: {
          ondismiss: function() {
             setLoading(false);
             toast.error('Payment cancelled');
          }
        }
      };

      // 4. Open the Razorpay Popup
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error("Payment Order Error:", err);
      toast.error('Failed to connect to payment gateway.');
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Submit RTI Request">
      <div className="max-w-2xl">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">RTI Act 2005 — Section 6</p>
            <p>You may request any information held by a public authority. The PIO must respond within <strong>30 days</strong> (48 hours for life/liberty matters).</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department / Ministry *</label>
              <select required className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* AI Suggestion Banner */}
            {suggestedDept && form.department !== suggestedDept && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <Sparkles size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-semibold mb-1">AI Recommendation</p>
                  <p className="text-sm text-gray-600">Based on your description, this query seems to belong to the <strong>{suggestedDept}</strong>.</p>
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, department: suggestedDept})} 
                    className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Change department to {suggestedDept}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" required className="input-field" placeholder="Brief subject of your RTI request" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Information Sought *
                <span className="text-gray-400 font-normal ml-2">(max 3000 characters)</span>
              </label>

              {/* Voice Input */}
              <div className="mb-3">
                <VoiceInput
                  onTranscript={(text) => setForm((prev) => ({ ...prev, description: text }))}
                  language="en-IN"
                />
              </div>

              <textarea
                required
                rows={6}
                maxLength={3000}
                className="input-field resize-none"
                placeholder="Clearly describe the information you are seeking..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/3000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                  onChange={e => setFiles(Array.from(e.target.files))}
                />
                <label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-700 hover:underline">
                  Click to upload files
                </label>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB each (max 5 files)</p>
                {files.length > 0 && (
                  <div className="mt-2 text-left space-y-1">
                    {files.map((f, i) => <p key={i} className="text-xs text-gray-600">📎 {f.name}</p>)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <input type="checkbox" id="lol" checked={form.isLifeOrLiberty} onChange={e => setForm({...form, isLifeOrLiberty: e.target.checked})} className="mt-0.5 w-4 h-4" />
              <label htmlFor="lol" className="text-sm text-red-800">
                <strong>Life or Liberty Matter</strong> — Check if this concerns the life or liberty of a person.
                Response required within <strong>48 hours</strong> (Section 7, RTI Act 2005).
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                {loading ? 'Submitting...' : '📤 Submit RTI Request (₹10 fee)'}
              </button>
              <button type="button" onClick={() => navigate('/citizen')} className="btn-secondary px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Warning Modal for incorrect department */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-orange-50 p-6 flex flex-col items-center text-center border-b border-orange-100">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wait, is this the right department?</h3>
              <p className="text-sm text-gray-600">
                You selected <strong>{form.department}</strong>, but our AI engine detected this request is likely for <strong>{suggestedDept}</strong>.
              </p>
              <p className="text-xs text-orange-700 mt-3 font-medium">
                Sending an RTI to the wrong department can delay your response by 5+ days (under Section 6(3) transfer rules).
              </p>
            </div>
            <div className="p-4 flex gap-3 bg-gray-50">
              <button
                type="button"
                className="flex-1 btn-secondary"
                onClick={() => {
                  setForm({ ...form, department: suggestedDept });
                  setShowWarningModal(false);
                }}
              >
                Change to {suggestedDept}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
                onClick={(e) => {
                  // User insists on keeping the current department
                  setShowWarningModal(false);
                  handleSubmit(e); // Trigger submission again, bypassing the check
                }}
              >
                Keep {form.department}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
