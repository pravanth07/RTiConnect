import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appellateAPI } from '../../api';
import { PageWrapper, StatusBadge } from '../../components/UI';
import toast from 'react-hot-toast';
import { Gavel } from 'lucide-react';

export default function Decisions() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['appellateHearing'], queryFn: () => appellateAPI.getAppeals({ status: 'HEARING_SCHEDULED' }) });
  const appeals = data?.data?.appeals || [];

  const [selectedAppeal, setSelectedAppeal] = useState('');
  const [form, setForm] = useState({ decision: '', decisionDetails: '', penaltyAmount: 0, disciplinaryActionRecommended: false });

  const mutation = useMutation({
    mutationFn: () => appellateAPI.issueDecision(selectedAppeal, form),
    onSuccess: () => { toast.success('Decision issued successfully!'); setSelectedAppeal(''); setForm({ decision: '', decisionDetails: '', penaltyAmount: 0, disciplinaryActionRecommended: false }); qc.invalidateQueries(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <PageWrapper title="Issue Decisions">
      <div className="max-w-2xl space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Section 19 & 20 — RTI Act 2005</p>
          <p>Decision must be issued within 30 days (max 45 days). Penalty: ₹250/day, maximum ₹25,000 (Section 20).</p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Gavel size={18} /> Issue Decision on Appeal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Appeal</label>
              <select className="input-field" value={selectedAppeal} onChange={e => setSelectedAppeal(e.target.value)}>
                <option value="">Choose appeal with hearing scheduled...</option>
                {appeals.map(a => <option key={a._id} value={a._id}>{a.appealId} — {a.citizen?.name} — Hearing: {a.hearingDate ? new Date(a.hearingDate).toLocaleDateString('en-IN') : 'TBD'}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'UPHELD', label: '✅ Upheld', desc: 'Appeal granted; PIO to provide info', color: 'green' },
                  { value: 'REJECTED', label: '❌ Rejected', desc: 'PIO decision was correct', color: 'red' },
                  { value: 'REMANDED', label: '↩️ Remanded', desc: 'Sent back for fresh consideration', color: 'yellow' },
                  { value: 'PENALTY_IMPOSED', label: '⚠️ Penalty', desc: 'Penalty imposed on PIO', color: 'orange' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${form.decision === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="decision" value={opt.value} checked={form.decision === opt.value} onChange={e => setForm({...form, decision: e.target.value})} className="mt-0.5 w-4 h-4" />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision Details / Order *</label>
              <textarea rows={5} className="input-field resize-none" placeholder="Write the detailed decision/order..." value={form.decisionDetails} onChange={e => setForm({...form, decisionDetails: e.target.value})} />
            </div>

            {(form.decision === 'PENALTY_IMPOSED' || form.decision === 'UPHELD') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount (₹) — Max ₹25,000</label>
                <input type="number" min={0} max={25000} className="input-field" value={form.penaltyAmount} onChange={e => setForm({...form, penaltyAmount: Number(e.target.value)})} />
                <p className="text-xs text-gray-500 mt-1">Section 20: ₹250 per day of delay, maximum ₹25,000</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input type="checkbox" id="disc" checked={form.disciplinaryActionRecommended} onChange={e => setForm({...form, disciplinaryActionRecommended: e.target.checked})} className="w-4 h-4" />
              <label htmlFor="disc" className="text-sm text-gray-700">Recommend disciplinary action against PIO (Section 20(2))</label>
            </div>

            <button onClick={() => mutation.mutate()} disabled={!selectedAppeal || !form.decision || !form.decisionDetails || mutation.isPending} className="btn-primary w-full py-3">
              {mutation.isPending ? 'Issuing...' : '⚖️ Issue Decision'}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
