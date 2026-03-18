import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { citizenAPI } from '../../api';
import { PageWrapper } from '../../components/UI';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function FileAppeal() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'FIRST', reason: '' });
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rtiRequestId', requestId);
      formData.append('type', form.type);
      formData.append('reason', form.reason);
      files.forEach(f => formData.append('attachments', f));

      const { data } = await citizenAPI.fileAppeal(formData);
      toast.success(`${form.type} Appeal filed! ID: ${data.appeal.appealId}`);
      navigate('/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Appeal filing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="File an Appeal">
      <div className="max-w-2xl">
        <Link to="/citizen" className="flex items-center gap-2 text-blue-700 hover:underline text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-orange-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800">
            <p className="font-semibold mb-1">RTI Act 2005 — Section 19</p>
            <p><strong>First Appeal:</strong> To senior officer in same department. Must be filed within 30 days.</p>
            <p className="mt-1"><strong>Second Appeal:</strong> To Central/State Information Commission. Must be filed within 90 days of First Appeal decision.</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appeal Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {['FIRST', 'SECOND'].map(t => (
                  <label key={t} className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${form.type === t ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={e => setForm({...form, type: e.target.value})} className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-sm">{t} Appeal</p>
                      <p className="text-xs text-gray-500">{t === 'FIRST' ? 'To Senior Officer' : 'To Info Commission'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grounds for Appeal *</label>
              <textarea
                required
                rows={5}
                maxLength={2000}
                className="input-field resize-none"
                placeholder="Clearly state the reasons for your appeal (e.g., no response received, incomplete information, denied access, unsatisfactory response...)"
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.reason.length}/2000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents (optional)</label>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="input-field" onChange={e => setFiles(Array.from(e.target.files))} />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                {loading ? 'Filing...' : `📋 File ${form.type} Appeal`}
              </button>
              <button type="button" onClick={() => navigate('/citizen')} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
