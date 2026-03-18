import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appellateAPI } from '../../api';
import { PageWrapper, StatusBadge } from '../../components/UI';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

export function HearingRoom() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['appellateAppeals', 'UNDER_REVIEW'], queryFn: () => appellateAPI.getAppeals({ status: 'UNDER_REVIEW' }) });
  const appeals = data?.data?.appeals || [];
  const [form, setForm] = useState({ appealId: '', hearingDate: '', hearingNotes: '' });

  const mutation = useMutation({
    mutationFn: () => appellateAPI.scheduleHearing(form),
    onSuccess: () => { toast.success('Hearing scheduled!'); setForm({ appealId: '', hearingDate: '', hearingNotes: '' }); qc.invalidateQueries(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <PageWrapper title="Schedule Hearings">
      <div className="max-w-2xl space-y-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar size={18} /> Schedule Hearing</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Appeal</label>
              <select className="input-field" value={form.appealId} onChange={e => setForm({...form, appealId: e.target.value})}>
                <option value="">Choose appeal...</option>
                {appeals.map(a => <option key={a._id} value={a._id}>{a.appealId} — {a.citizen?.name} ({a.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hearing Date & Time</label>
              <input type="datetime-local" className="input-field" value={form.hearingDate} onChange={e => setForm({...form, hearingDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hearing Notes / Instructions</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Any instructions for the citizen..." value={form.hearingNotes} onChange={e => setForm({...form, hearingNotes: e.target.value})} />
            </div>
            <button onClick={() => mutation.mutate()} disabled={!form.appealId || !form.hearingDate || mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Scheduling...' : '📅 Schedule Hearing'}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default HearingRoom;
