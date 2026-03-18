import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pioAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge } from '../../components/UI';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Section 8(1) exemption categories
const EXEMPTIONS = ['(a) Sovereignty/Security', '(b) Court-forbidden', '(c) Parliament privilege', '(d) Commercial secrets', '(e) Fiduciary relationship', '(f) Foreign govt info', '(g) Endangers life/safety', '(h) Impedes investigation', '(i) Cabinet papers', '(j) Personal privacy'];

// Mock up of past RTIs for the AI Copilot to match against
const PAST_RTIS = [
  {
    keywords: ['school', 'teacher', 'education', 'mid-day', 'meal'],
    snippet: 'Information regarding the Mid-Day Meal scheme for the academic year 2023-2024 is attached herewith. The budget allocated was Rs. 45 Crores. For detailed expenditure per school, please find the annexed PDF document.',
  },
  {
    keywords: ['hospital', 'doctor', 'vacancy', 'health', 'medicine'],
    snippet: 'As per the records available, there are currently 12 vacancies for Senior Resident Doctors in the district hospital. The recruitment process is underway and expected to complete by next month.',
  },
  {
    keywords: ['road', 'pothole', 'repair', 'construction', 'contract', 'pwd'],
    snippet: 'The road repair work for the specified stretch was awarded to M/s ABC Constructions under contract no. 452/2023. The total sanctioned amount is Rs. 1.2 Crores. The work is scheduled to begin in the first week of next month.',
  }
];

export default function RespondRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('respond');
  const [responseText, setResponseText] = useState('');
  const [files, setFiles] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [exemption, setExemption] = useState('');
  const [transferDept, setTransferDept] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [feeAmount, setFeeAmount] = useState(0);

  // Copilot State
  const [similarRTI, setSimilarRTI] = useState(null);
  const [showCopilot, setShowCopilot] = useState(true);

  const { data, isLoading } = useQuery({ queryKey: ['pioReq', id], queryFn: () => pioAPI.getRequest(id) });
  const req = data?.data?.request;

  const respondMut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('response', responseText);
      files.forEach(f => fd.append('responseDocuments', f));
      return pioAPI.respond(id, fd);
    },
    onSuccess: () => { toast.success('Response submitted!'); qc.invalidateQueries(['pioRequests']); navigate('/pio'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMut = useMutation({
    mutationFn: () => pioAPI.reject(id, { rejectionReason: rejectReason, exemptionSection: exemption }),
    onSuccess: () => { toast.success('Request rejected.'); navigate('/pio'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const transferMut = useMutation({
    mutationFn: () => pioAPI.transfer(id, { transferredTo: transferDept, transferReason }),
    onSuccess: () => { toast.success('Request transferred.'); navigate('/pio'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  // Copilot Logic: Simulate finding a similar past response
  useEffect(() => {
    if (req?.description) {
      const text = (req.subject + ' ' + req.description).toLowerCase();
      
      // Find the first past RTI that has at least 2 matching keywords
      const match = PAST_RTIS.find(past => {
        const matches = past.keywords.filter(kw => text.includes(kw));
        return matches.length >= 2;
      });

      if (match) {
        setSimilarRTI({
          snippet: match.snippet,
          confidence: Math.floor(Math.random() * 15) + 80 // Random 80-95%
        });
      }
    }
  }, [req]);

  if (isLoading) return <PageWrapper title="Loading..."><div className="animate-pulse space-y-4"><div className="h-40 bg-gray-100 rounded-xl" /></div></PageWrapper>;
  if (!req) return <PageWrapper title="Not Found"><p>Request not found.</p></PageWrapper>;

  const tabs = [
    { id: 'respond', label: '✅ Respond' },
    { id: 'reject', label: '❌ Reject' },
    { id: 'transfer', label: '↗️ Transfer' },
    { id: 'fee', label: '💰 Request Fee' },
  ];

  return (
    <PageWrapper title={`Respond to ${req.requestId}`}>
      <div className="max-w-3xl space-y-6">
        <Link to="/pio/requests" className="flex items-center gap-2 text-blue-700 hover:underline text-sm"><ArrowLeft size={16} /> Back</Link>

        {/* Request info */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-mono text-blue-700 text-sm font-semibold">{req.requestId}</span>
              <h2 className="text-xl font-bold mt-1">{req.subject}</h2>
              <p className="text-gray-500 text-sm">{req.department}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={req.status} />
              <DeadlineBadge daysRemaining={req.daysRemaining} />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Citizen's Request:</p>
            <p className="text-gray-700 whitespace-pre-wrap">{req.description}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Citizen</p><p className="font-medium">{req.citizen?.name} {req.citizen?.isBPL && <span className="text-xs text-green-700">(BPL)</span>}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-medium">{req.citizen?.phone || '—'}</p></div>
            <div><p className="text-gray-500">Submitted</p><p className="font-medium">{format(new Date(req.createdAt), 'dd MMM yyyy')}</p></div>
          </div>
        </div>

        {/* Action tabs */}
        <div className="card">
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.id ? 'bg-blue-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'respond' && (
            <div className="space-y-4">
              {/* AI Copilot Panel */}
              {similarRTI && showCopilot && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                      <Sparkles size={18} className="text-indigo-600" />
                      AI Copilot Found Similar Request
                    </div>
                    <span className="bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-black shadow-sm border border-indigo-100">
                      {similarRTI.confidence}% Match
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 bg-white/60 p-3 rounded-lg border border-white relative z-10 italic">
                    "{similarRTI.snippet}"
                  </p>
                  
                  <div className="flex gap-3 relative z-10">
                    <button 
                      onClick={() => {
                        setResponseText(similarRTI.snippet);
                        setShowCopilot(false);
                        toast.success('Response applied!');
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle size={16} /> Use This Response
                    </button>
                    <button 
                      onClick={() => setShowCopilot(false)}
                      className="px-4 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response *</label>
                <textarea rows={6} className="input-field resize-none" placeholder="Provide the information requested..." value={responseText} onChange={e => setResponseText(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Documents (optional)</label>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="input-field" onChange={e => setFiles(Array.from(e.target.files))} />
              </div>
              <button onClick={() => respondMut.mutate()} disabled={!responseText || respondMut.isPending} className="btn-primary">
                {respondMut.isPending ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          )}

          {activeTab === 'reject' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                Rejection must cite a specific exemption under Section 8(1) of the RTI Act.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exemption Section *</label>
                <select className="input-field" value={exemption} onChange={e => setExemption(e.target.value)}>
                  <option value="">Select exemption...</option>
                  {EXEMPTIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Reason *</label>
                <textarea rows={4} className="input-field resize-none" placeholder="Explain why this request is being rejected..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <button onClick={() => rejectMut.mutate()} disabled={!rejectReason || rejectMut.isPending} className="btn-danger">
                {rejectMut.isPending ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                Transfer is only allowed within 5 days of receipt (Section 6(3), RTI Act).
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer to Department *</label>
                <input type="text" className="input-field" placeholder="Department name" value={transferDept} onChange={e => setTransferDept(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transfer *</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Why is this being transferred?" value={transferReason} onChange={e => setTransferReason(e.target.value)} />
              </div>
              <button onClick={() => transferMut.mutate()} disabled={!transferDept || transferMut.isPending} className="btn-secondary border-blue-300">
                {transferMut.isPending ? 'Transferring...' : 'Transfer Request'}
              </button>
            </div>
          )}

          {activeTab === 'fee' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fee Required (₹)</label>
                <input type="number" min={0} className="input-field" placeholder="Amount in rupees" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">Fee must be reasonable and justified under the rules.</p>
              </div>
              <button onClick={() => pioAPI.requestFee(id, { additionalFeeRequired: feeAmount }).then(() => { toast.success('Fee request sent.'); navigate('/pio'); })} disabled={!feeAmount} className="btn-primary">
                Send Fee Request to Citizen
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
