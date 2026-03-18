import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pioAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge } from '../../components/UI';

const STATUSES = ['', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_FEES', 'RESPONDED', 'REJECTED'];

export default function PendingRequests() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['pioRequests', status], queryFn: () => pioAPI.getRequests({ status }) });
  const requests = data?.data?.requests || [];

  return (
    <PageWrapper title="All Assigned Requests">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${status === s ? 'bg-blue-700 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="card">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-600">ID</th>
                  <th className="pb-3 font-medium text-gray-600">Citizen</th>
                  <th className="pb-3 font-medium text-gray-600">Department</th>
                  <th className="pb-3 font-medium text-gray-600">Subject</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Deadline</th>
                  <th className="pb-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req._id} className={`hover:bg-gray-50 ${req.daysRemaining < 0 ? 'bg-red-50' : ''}`}>
                    <td className="py-3 font-mono text-xs text-blue-700">{req.requestId}</td>
                    <td className="py-3">{req.citizen?.name}</td>
                    <td className="py-3 text-gray-500">{req.department}</td>
                    <td className="py-3 max-w-xs truncate">{req.subject}</td>
                    <td className="py-3"><StatusBadge status={req.status} /></td>
                    <td className="py-3"><DeadlineBadge daysRemaining={req.daysRemaining} /></td>
                    <td className="py-3"><Link to={`/pio/requests/${req._id}`} className="text-blue-700 hover:underline text-xs font-medium">Open →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && requests.length === 0 && <p className="text-center text-gray-400 py-8">No requests found.</p>}
        </div>
      </div>
    </PageWrapper>
  );
}
