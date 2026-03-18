import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pioAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge, StatCard } from '../../components/UI';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function PIODashboard() {
  const { data: statsData } = useQuery({ queryKey: ['pioStats'], queryFn: pioAPI.getStats });
  const { data: reqData, isLoading } = useQuery({ queryKey: ['pioRequests'], queryFn: () => pioAPI.getRequests({ limit: 8 }) });

  const stats = statsData?.data?.stats || {};
  const requests = reqData?.data?.requests || [];

  return (
    <PageWrapper title="PIO Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Assigned" value={stats.total} icon={FileText} color="blue" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard title="Responded" value={stats.responded} icon={CheckCircle} color="green" />
          <StatCard title="Overdue ⚠️" value={stats.overdue} icon={AlertTriangle} color="red" />
        </div>

        {stats.overdue > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={20} />
            <p className="text-red-800 text-sm font-medium">
              You have <strong>{stats.overdue}</strong> overdue request(s). Penalty of ₹250/day applies under Section 20, RTI Act.
            </p>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Assigned Requests (sorted by deadline)</h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No requests assigned yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-600">Request ID</th>
                  <th className="pb-3 font-medium text-gray-600">Citizen</th>
                  <th className="pb-3 font-medium text-gray-600">Subject</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Deadline</th>
                  <th className="pb-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req._id} className={`hover:bg-gray-50 ${req.daysRemaining < 0 ? 'bg-red-50' : ''}`}>
                    <td className="py-3 font-mono text-xs text-blue-700">{req.requestId}</td>
                    <td className="py-3 text-gray-700">{req.citizen?.name}</td>
                    <td className="py-3 text-gray-700 max-w-xs truncate">{req.subject}</td>
                    <td className="py-3"><StatusBadge status={req.status} /></td>
                    <td className="py-3"><DeadlineBadge daysRemaining={req.daysRemaining} /></td>
                    <td className="py-3"><Link to={`/pio/requests/${req._id}`} className="text-blue-700 hover:underline text-xs">Respond →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
