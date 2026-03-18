import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { citizenAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge, StatCard } from '../../components/UI';
import { FileText, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CitizenDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['myRequests'], queryFn: () => citizenAPI.getMyRequests({ limit: 5 }) });
  const requests = data?.data?.requests || [];

  const stats = {
    total: data?.data?.total || 0,
    responded: requests.filter(r => r.status === 'RESPONDED').length,
    pending: requests.filter(r => ['SUBMITTED','ASSIGNED','IN_PROGRESS'].includes(r.status)).length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <PageWrapper title="My Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Requests" value={stats.total} icon={FileText} color="blue" />
          <StatCard title="Responded" value={stats.responded} icon={CheckCircle} color="green" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="red" />
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-3">
            <Link to="/citizen/submit" className="btn-primary flex items-center gap-2">
              <Send size={16} /> File New RTI Request
            </Link>
          </div>
        </div>

        {/* Recent requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Requests</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>No RTI requests yet.</p>
              <Link to="/citizen/submit" className="text-blue-700 hover:underline text-sm mt-1 block">File your first request →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">Request ID</th>
                    <th className="pb-3 font-medium text-gray-600">Department</th>
                    <th className="pb-3 font-medium text-gray-600">Subject</th>
                    <th className="pb-3 font-medium text-gray-600">Status</th>
                    <th className="pb-3 font-medium text-gray-600">Deadline</th>
                    <th className="pb-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-blue-700">{req.requestId}</td>
                      <td className="py-3 text-gray-700">{req.department}</td>
                      <td className="py-3 text-gray-700 max-w-xs truncate">{req.subject}</td>
                      <td className="py-3"><StatusBadge status={req.status} /></td>
                      <td className="py-3"><DeadlineBadge daysRemaining={req.daysRemaining} /></td>
                      <td className="py-3">
                        <Link to={`/citizen/track/${req._id}`} className="text-blue-700 hover:underline text-xs">Track →</Link>
                        {['RESPONDED','REJECTED','DEEMED_REFUSED'].includes(req.status) && (
                          <Link to={`/citizen/appeal/${req._id}`} className="text-orange-600 hover:underline text-xs ml-3">Appeal</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
